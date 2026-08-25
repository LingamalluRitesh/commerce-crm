import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.identity import (
    AuditLogResponse,
    MemberInviteRequest,
    MembershipResponse,
    OrganizationCreateRequest,
    OrganizationResponse,
    WorkspaceCreateRequest,
    WorkspaceResponse,
)
from app.application.services.organization import OrganizationService
from app.core.database import get_db
from app.core.errors import TenantIsolationError
from app.infrastructure.models.identity import User

router = APIRouter()


def _verify_tenant_match(target_id: uuid.UUID, active_tenant_id: uuid.UUID) -> None:
    if target_id != active_tenant_id:
        raise TenantIsolationError("You do not have access to this organization.")


@router.get("", response_model=list[OrganizationResponse])
async def list_user_organizations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[OrganizationResponse]:
    """List all organizations the authenticated user belongs to."""
    return await OrganizationService.get_user_organizations(db=db, user_id=current_user.id)


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    data: OrganizationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrganizationResponse:
    """Create a new tenant organization and assign the creator as Owner."""
    return await OrganizationService.create_organization(db=db, user_id=current_user.id, data=data)


@router.get("/{organization_id}", response_model=OrganizationResponse)
async def get_organization(
    organization_id: uuid.UUID,
    active_tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("org:read")),
) -> OrganizationResponse:
    """Retrieve organization settings and metadata."""
    _verify_tenant_match(organization_id, active_tenant_id)
    return await OrganizationService.get_organization(db=db, tenant_id=organization_id)


@router.get("/{organization_id}/members", response_model=list[MembershipResponse])
async def list_members(
    organization_id: uuid.UUID,
    active_tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:read")),
) -> list[MembershipResponse]:
    """List all members and their roles for the given organization."""
    _verify_tenant_match(organization_id, active_tenant_id)
    return await OrganizationService.list_members(db=db, tenant_id=organization_id)


@router.post(
    "/{organization_id}/members",
    response_model=MembershipResponse,
    status_code=status.HTTP_201_CREATED,
)
async def invite_member(
    organization_id: uuid.UUID,
    data: MemberInviteRequest,
    active_tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:invite")),
) -> MembershipResponse:
    """Invite a new team member to the organization."""
    _verify_tenant_match(organization_id, active_tenant_id)
    return await OrganizationService.invite_member(
        db=db,
        tenant_id=organization_id,
        actor_id=current_user.id,
        data=data,
    )


@router.get("/{organization_id}/workspaces", response_model=list[WorkspaceResponse])
async def list_workspaces(
    organization_id: uuid.UUID,
    active_tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("org:read")),
) -> list[WorkspaceResponse]:
    """List all workspaces within the organization."""
    _verify_tenant_match(organization_id, active_tenant_id)
    return await OrganizationService.list_workspaces(db=db, tenant_id=organization_id)


@router.post(
    "/{organization_id}/workspaces",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_workspace(
    organization_id: uuid.UUID,
    data: WorkspaceCreateRequest,
    active_tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("org:write")),
) -> WorkspaceResponse:
    """Create a new workspace within the organization."""
    _verify_tenant_match(organization_id, active_tenant_id)
    return await OrganizationService.create_workspace(
        db=db,
        tenant_id=organization_id,
        actor_id=current_user.id,
        data=data,
    )


@router.get("/{organization_id}/audit-logs", response_model=list[AuditLogResponse])
async def list_audit_logs(
    organization_id: uuid.UUID,
    active_tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("audit:read")),
) -> list[AuditLogResponse]:
    """Retrieve audit logs for compliance, security, and traceability."""
    _verify_tenant_match(organization_id, active_tenant_id)
    logs = await OrganizationService.list_audit_logs(db=db, tenant_id=organization_id)
    return [AuditLogResponse.model_validate(log) for log in logs]
