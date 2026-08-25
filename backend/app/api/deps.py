import uuid

import jwt
from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.errors import AuthenticationError, TenantIsolationError
from app.core.security import decode_token

security = HTTPBearer(auto_error=False)


async def get_current_tenant_id(
    x_organization_id: str | None = Header(None, alias="X-Organization-ID"),
    token_creds: HTTPAuthorizationCredentials | None = Depends(security),
) -> uuid.UUID:
    """Extract and validate active tenant ID from request header or JWT claims."""
    tenant_str = x_organization_id

    if not tenant_str and token_creds:
        try:
            payload = decode_token(token_creds.credentials)
            tenant_str = payload.get("tenant_id")
        except jwt.PyJWTError:
            pass

    if not tenant_str:
        raise TenantIsolationError("Active organization context is missing.")

    try:
        return uuid.UUID(tenant_str)
    except ValueError:
        raise TenantIsolationError("Invalid organization ID format.") from None


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
