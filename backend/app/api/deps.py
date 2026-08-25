import uuid
from collections.abc import Callable

import jwt
from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.errors import (
    AuthenticationError,
    NotFoundError,
    PermissionDeniedError,
    TenantIsolationError,
)
from app.core.security import decode_token
from app.infrastructure.models.identity import Membership, User

security = HTTPBearer(auto_error=False)


async def get_current_user_token(
    token_creds: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict:
    """Verify and return current user token payload."""
    if not token_creds:
        raise AuthenticationError("Authorization token required.")

    try:
        payload = decode_token(token_creds.credentials)
        if payload.get("type") != "access":
            raise AuthenticationError("Invalid token type.")
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token has expired.") from None
    except jwt.PyJWTError:
        raise AuthenticationError("Invalid token.") from None


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token_payload: dict = Depends(get_current_user_token),
) -> User:
    """Fetch current authenticated User model from database."""
    user_id_str = token_payload.get("sub")
    if not user_id_str:
        raise AuthenticationError("Invalid token payload.")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise AuthenticationError("Invalid user ID format in token.") from None

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User", user_id)
    if not user.is_active:
        raise PermissionDeniedError(message="User account is deactivated.")
    return user


async def get_current_tenant_id(
    db: AsyncSession = Depends(get_db),
    token_payload: dict = Depends(get_current_user_token),
    x_organization_id: str | None = Header(None, alias="X-Organization-ID"),
) -> uuid.UUID:
    """Extract and validate active tenant ID, enforcing strict tenant isolation."""
    target_tenant_str = x_organization_id or token_payload.get("tenant_id")

    if not target_tenant_str:
        raise TenantIsolationError("Active organization context is missing.")

    try:
        target_tenant_id = uuid.UUID(str(target_tenant_str))
    except ValueError:
        raise TenantIsolationError("Invalid organization ID format.") from None

    token_tenant_str = token_payload.get("tenant_id")
    user_id_str = token_payload.get("sub")

    # If header matches token tenant, accept
    if token_tenant_str and str(target_tenant_id) == str(token_tenant_str):
        return target_tenant_id

    # If header differs from token, verify user is an active member of target org
    if user_id_str:
        try:
            user_id = uuid.UUID(user_id_str)
            res = await db.execute(
                select(Membership).where(
                    Membership.tenant_id == target_tenant_id,
                    Membership.user_id == user_id,
                    Membership.status == "active",
                )
            )
            if res.scalar_one_or_none():
                return target_tenant_id
        except Exception:
            pass

    raise TenantIsolationError("You do not have access to this organization's data.")


def require_permission(permission_code: str) -> Callable:
    """FastAPI dependency to enforce specific granular permissions within the active tenant."""

    async def permission_checker(
        tenant_id: uuid.UUID = Depends(get_current_tenant_id),
        token_payload: dict = Depends(get_current_user_token),
    ) -> bool:
        token_tenant_str = token_payload.get("tenant_id")
        if token_tenant_str and str(tenant_id) != str(token_tenant_str):
            raise TenantIsolationError("Token is not valid for this organization.")

        permissions = token_payload.get("permissions", [])
        roles = token_payload.get("roles", [])
        if "Owner" in roles or permission_code in permissions:
            return True
        raise PermissionDeniedError(permission=permission_code)

    return permission_checker
