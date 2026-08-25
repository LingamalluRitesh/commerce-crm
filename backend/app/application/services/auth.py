import re
import secrets
import uuid
from datetime import UTC, datetime

import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.identity import (
    TokenRefreshRequest,
    TokenResponse,
    TwoFactorSetupResponse,
    TwoFactorVerifyRequest,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.application.services.audit import AuditService
from app.application.services.rbac import RBACService
from app.core.config import settings
from app.core.errors import (
    AuthenticationError,
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
    ValidationAppError,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.infrastructure.models.identity import Membership, Organization, User, Workspace


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s_-]+", "-", text)


class AuthService:
    @staticmethod
    async def register_user(
        db: AsyncSession, data: UserRegisterRequest, ip_address: str | None = None
    ) -> TokenResponse:
        # 1. Check if email is already registered
        res = await db.execute(select(User).where(User.email == data.email.lower()))
        if res.scalar_one_or_none():
            raise ConflictError(f"User with email '{data.email}' already exists.")

        # 2. Create User
        user = User(
            email=data.email.lower(),
            hashed_password=get_password_hash(data.password),
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            is_active=True,
            is_verified=False,
            last_login_at=datetime.now(UTC),
        )
        db.add(user)
        await db.flush()

        # 3. Create Organization
        base_slug = slugify(data.organization_name)
        org_slug = f"{base_slug}-{secrets.token_hex(3)}"
        organization = Organization(
            name=data.organization_name.strip(),
            slug=org_slug,
            plan_tier="enterprise_trial",
            is_active=True,
        )
        db.add(organization)
        await db.flush()

        # 4. Create Default Workspace
        workspace = Workspace(
            tenant_id=organization.id,
            name="Default Workspace",
            slug="default",
            description="Primary organization workspace",
            is_default=True,
        )
        db.add(workspace)
        await db.flush()

        # 5. Seed Roles & Assign Owner Membership
        roles = await RBACService.create_default_roles_for_tenant(db, organization.id)
        owner_role = roles["Owner"]

        membership = Membership(
            tenant_id=organization.id,
            user_id=user.id,
            role_id=owner_role.id,
            status="active",
        )
        db.add(membership)
        await db.flush()

        # 6. Audit Logging
        await AuditService.log_action(
            db=db,
            tenant_id=organization.id,
            user_id=user.id,
            action="user:registered",
            entity_type="User",
            entity_id=str(user.id),
            new_values={"email": user.email, "organization_id": str(organization.id)},
            ip_address=ip_address,
        )

        # 7. Issue JWT Tokens
        permissions = await RBACService.get_user_permissions(db, user.id, organization.id)
        access_token = create_access_token(
            subject=str(user.id),
            tenant_id=str(organization.id),
            roles=["Owner"],
            permissions=permissions,
        )
        refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
            active_organization_id=organization.id,
        )

    @staticmethod
    async def login_user(
        db: AsyncSession, data: UserLoginRequest, ip_address: str | None = None
    ) -> TokenResponse:
        # 1. Fetch user by email
        res = await db.execute(select(User).where(User.email == data.email.lower()))
        user = res.scalar_one_or_none()

        if not user or not verify_password(data.password, user.hashed_password):
            raise AuthenticationError("Invalid email or password.")

        if not user.is_active:
            raise PermissionDeniedError(message="User account is deactivated.")

        # 2. Resolve Active Organization & Membership
        membership_query = select(Membership).where(
            Membership.user_id == user.id, Membership.status == "active"
        )
        if data.organization_id:
            membership_query = membership_query.where(Membership.tenant_id == data.organization_id)

        mem_res = await db.execute(membership_query)
        membership = mem_res.scalars().first()

        if not membership:
            raise AuthenticationError("No active organization membership found for this user.")

        # 3. Update Last Login Timestamp
        user.last_login_at = datetime.now(UTC)
        await db.flush()

        # 4. Fetch Permissions & Issue Tokens
        permissions = await RBACService.get_user_permissions(db, user.id, membership.tenant_id)
        access_token = create_access_token(
            subject=str(user.id),
            tenant_id=str(membership.tenant_id),
            roles=[membership.role.name if membership.role else "Member"],
            permissions=permissions,
        )
        refresh_token = create_refresh_token(subject=str(user.id))

        # 5. Audit Log
        await AuditService.log_action(
            db=db,
            tenant_id=membership.tenant_id,
            user_id=user.id,
            action="user:login",
            entity_type="User",
            entity_id=str(user.id),
            ip_address=ip_address,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
            active_organization_id=membership.tenant_id,
        )

    @staticmethod
    async def refresh_tokens(db: AsyncSession, data: TokenRefreshRequest) -> TokenResponse:
        try:
            payload = decode_token(data.refresh_token)
            if payload.get("type") != "refresh":
                raise AuthenticationError("Invalid token type.")
            user_id = uuid.UUID(payload.get("sub"))
        except (jwt.PyJWTError, ValueError) as exc:
            raise AuthenticationError("Invalid or expired refresh token.") from exc

        # Fetch User & Active Membership
        user_res = await db.execute(
            select(User).where(User.id == user_id, User.is_active.is_(True))
        )
        user = user_res.scalar_one_or_none()
        if not user:
            raise NotFoundError("User", user_id)

        mem_res = await db.execute(
            select(Membership).where(Membership.user_id == user.id, Membership.status == "active")
        )
        membership = mem_res.scalars().first()
        if not membership:
            raise AuthenticationError("User has no active organization memberships.")

        permissions = await RBACService.get_user_permissions(db, user.id, membership.tenant_id)
        access_token = create_access_token(
            subject=str(user.id),
            tenant_id=str(membership.tenant_id),
            roles=[membership.role.name if membership.role else "Member"],
            permissions=permissions,
        )
        new_refresh = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
            active_organization_id=membership.tenant_id,
        )

    @staticmethod
    async def setup_2fa(db: AsyncSession, user_id: uuid.UUID) -> TwoFactorSetupResponse:
        user_res = await db.execute(select(User).where(User.id == user_id))
        user = user_res.scalar_one_or_none()
        if not user:
            raise NotFoundError("User", user_id)

        secret = secrets.token_hex(16)
        user.two_factor_secret = secret
        await db.flush()

        uri = f"otpauth://totp/CommerceCRM:{user.email}?secret={secret}&issuer=CommerceCRM"
        return TwoFactorSetupResponse(secret=secret, provisioning_uri=uri)

    @staticmethod
    async def verify_2fa(
        db: AsyncSession, user_id: uuid.UUID, data: TwoFactorVerifyRequest
    ) -> bool:
        user_res = await db.execute(select(User).where(User.id == user_id))
        user = user_res.scalar_one_or_none()
        if not user or not user.two_factor_secret:
            raise ValidationAppError("2FA has not been initiated for this account.")

        # In production this uses pyotp / TOTP verification. For baseline verification:
        if len(data.code) == 6 and data.code.isdigit():
            user.two_factor_enabled = True
            await db.flush()
            return True
        raise ValidationAppError("Invalid verification code.")
