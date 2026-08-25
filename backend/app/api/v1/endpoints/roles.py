import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_tenant_id, require_permission
from app.application.dtos.identity import PermissionResponse, RoleResponse
from app.core.database import get_db
from app.infrastructure.models.identity import Permission, Role

router = APIRouter()


@router.get("", response_model=list[RoleResponse])
async def list_roles(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("role:manage")),
) -> list[RoleResponse]:
    """List all available roles for the active organization."""
    query = select(Role).where((Role.tenant_id == tenant_id) | (Role.tenant_id.is_(None)))
    result = await db.execute(query)
    roles = result.scalars().unique().all()
    return [RoleResponse.model_validate(r) for r in roles]


@router.get("/permissions", response_model=list[PermissionResponse])
async def list_permissions(
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("role:manage")),
) -> list[PermissionResponse]:
    """List all canonical permissions across the system."""
    query = select(Permission).order_by(Permission.module, Permission.code)
    result = await db.execute(query)
    return [PermissionResponse.model_validate(p) for p in result.scalars().all()]
