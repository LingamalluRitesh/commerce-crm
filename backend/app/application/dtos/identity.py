import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# -------------------------------------------------------------
# User Schemas
# -------------------------------------------------------------
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    organization_name: str = Field(
        ..., min_length=2, max_length=200, description="Initial organization name"
    )


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str
    organization_id: uuid.UUID | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool
    is_verified: bool
    two_factor_enabled: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
    active_organization_id: uuid.UUID


class TokenRefreshRequest(BaseModel):
    refresh_token: str


# -------------------------------------------------------------
# Organization & Workspace Schemas
# -------------------------------------------------------------
class OrganizationCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    domain: str | None = None


class OrganizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    domain: str | None
    plan_tier: str
    is_active: bool
    created_at: datetime


class WorkspaceCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str | None = None


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    slug: str
    description: str | None
    is_default: bool
    created_at: datetime


class MemberInviteRequest(BaseModel):
    email: EmailStr
    role_id: uuid.UUID


class MembershipResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    user_email: str
    user_full_name: str
    role_name: str
    status: str
    created_at: datetime


# -------------------------------------------------------------
# RBAC Schemas
# -------------------------------------------------------------
class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    module: str
    description: str


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID | None
    name: str
    description: str | None
    is_system: bool
    permissions: list[PermissionResponse]


class RoleCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str | None = None
    permission_codes: list[str] = Field(default_factory=list)


# -------------------------------------------------------------
# 2FA & Audit Schemas
# -------------------------------------------------------------
class TwoFactorSetupResponse(BaseModel):
    secret: str
    provisioning_uri: str


class TwoFactorVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID | None
    action: str
    entity_type: str
    entity_id: str
    old_values: dict | None
    new_values: dict | None
    ip_address: str | None
    created_at: datetime
