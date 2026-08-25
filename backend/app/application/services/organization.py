import secrets
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.identity import (
    MemberInviteRequest,
    MembershipResponse,
    OrganizationCreateRequest,
    OrganizationResponse,
    WorkspaceCreateRequest,
    WorkspaceResponse,
)
from app.application.services.audit import AuditService
from app.application.services.auth import slugify
from app.application.services.rbac import RBACService
from app.core.errors import ConflictError, NotFoundError
from app.core.security import get_password_hash
from app.infrastructure.models.identity import (
    AuditLog,
    Membership,
    Organization,
    Role,
    User,
    Workspace,
)


class OrganizationService:
    @staticmethod
    async def create_organization(
        db: AsyncSession, user_id: uuid.UUID, data: OrganizationCreateRequest
    ) -> OrganizationResponse:
        base_slug = slugify(data.name)
        org_slug = f"{base_slug}-{secrets.token_hex(3)}"

        organization = Organization(
            name=data.name.strip(),
            slug=org_slug,
            domain=data.domain,
            plan_tier="enterprise_trial",
            is_active=True,
        )
        db.add(organization)
        await db.flush()

        # Create default workspace
        workspace = Workspace(
            tenant_id=organization.id,
            name="Default Workspace",
            slug="default",
            is_default=True,
        )
        db.add(workspace)

        # Seed roles & make user Owner
        roles = await RBACService.create_default_roles_for_tenant(db, organization.id)
        owner_role = roles["Owner"]

        membership = Membership(
            tenant_id=organization.id,
            user_id=user_id,
            role_id=owner_role.id,
            status="active",
        )
        db.add(membership)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=organization.id,
            user_id=user_id,
            action="org:created",
            entity_type="Organization",
            entity_id=str(organization.id),
            new_values={"name": organization.name, "slug": organization.slug},
        )

        return OrganizationResponse.model_validate(organization)

    @staticmethod
    async def get_user_organizations(
        db: AsyncSession, user_id: uuid.UUID
    ) -> list[OrganizationResponse]:
        query = (
            select(Organization)
            .join(Membership, Membership.tenant_id == Organization.id)
            .where(Membership.user_id == user_id, Membership.status == "active")
        )
        result = await db.execute(query)
        return [OrganizationResponse.model_validate(org) for org in result.scalars().all()]

    @staticmethod
    async def get_organization(db: AsyncSession, tenant_id: uuid.UUID) -> OrganizationResponse:
        res = await db.execute(select(Organization).where(Organization.id == tenant_id))
        org = res.scalar_one_or_none()
        if not org:
            raise NotFoundError("Organization", tenant_id)
        return OrganizationResponse.model_validate(org)

    @staticmethod
    async def list_members(db: AsyncSession, tenant_id: uuid.UUID) -> list[MembershipResponse]:
        query = (
            select(Membership)
            .where(Membership.tenant_id == tenant_id)
            .join(User, Membership.user_id == User.id)
            .join(Role, Membership.role_id == Role.id)
        )
        result = await db.execute(query)
        memberships = result.scalars().all()

        return [
            MembershipResponse(
                id=m.id,
                tenant_id=m.tenant_id,
                user_id=m.user_id,
                user_email=m.user.email,
                user_full_name=f"{m.user.first_name} {m.user.last_name}",
                role_name=m.role.name,
                status=m.status,
                created_at=m.created_at,
            )
            for m in memberships
        ]

    @staticmethod
    async def invite_member(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID,
        data: MemberInviteRequest,
    ) -> MembershipResponse:
        # Check if role exists in tenant or is system role
        role_res = await db.execute(select(Role).where(Role.id == data.role_id))
        role = role_res.scalar_one_or_none()
        if not role:
            raise NotFoundError("Role", data.role_id)

        # Check if user already exists or create invited placeholder
        user_res = await db.execute(select(User).where(User.email == data.email.lower()))
        user = user_res.scalar_one_or_none()

        if not user:
            user = User(
                email=data.email.lower(),
                hashed_password=get_password_hash(secrets.token_urlsafe(16)),
                first_name="Invited",
                last_name="Member",
                is_active=True,
                is_verified=False,
            )
            db.add(user)
            await db.flush()

        # Check if membership already exists in this tenant
        mem_res = await db.execute(
            select(Membership).where(
                Membership.tenant_id == tenant_id, Membership.user_id == user.id
            )
        )
        if mem_res.scalar_one_or_none():
            raise ConflictError(f"User {data.email} is already a member of this organization.")

        membership = Membership(
            tenant_id=tenant_id,
            user_id=user.id,
            role_id=role.id,
            status="active",
        )
        db.add(membership)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="member:invited",
            entity_type="Membership",
            entity_id=str(membership.id),
            new_values={"email": data.email, "role_id": str(role.id)},
        )

        return MembershipResponse(
            id=membership.id,
            tenant_id=membership.tenant_id,
            user_id=user.id,
            user_email=user.email,
            user_full_name=f"{user.first_name} {user.last_name}",
            role_name=role.name,
            status=membership.status,
            created_at=membership.created_at,
        )

    @staticmethod
    async def create_workspace(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID,
        data: WorkspaceCreateRequest,
    ) -> WorkspaceResponse:
        base_slug = slugify(data.name)
        workspace = Workspace(
            tenant_id=tenant_id,
            name=data.name.strip(),
            slug=f"{base_slug}-{secrets.token_hex(2)}",
            description=data.description,
            is_default=False,
        )
        db.add(workspace)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="workspace:created",
            entity_type="Workspace",
            entity_id=str(workspace.id),
            new_values={"name": workspace.name},
        )

        return WorkspaceResponse.model_validate(workspace)

    @staticmethod
    async def list_workspaces(db: AsyncSession, tenant_id: uuid.UUID) -> list[WorkspaceResponse]:
        query = select(Workspace).where(Workspace.tenant_id == tenant_id)
        res = await db.execute(query)
        return [WorkspaceResponse.model_validate(w) for w in res.scalars().all()]

    @staticmethod
    async def list_audit_logs(
        db: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
    ) -> list[AuditLog]:
        query = (
            select(AuditLog)
            .where(AuditLog.tenant_id == tenant_id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        res = await db.execute(query)
        return list(res.scalars().all())
