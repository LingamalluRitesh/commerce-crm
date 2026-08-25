import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.customer import CompanyCreateRequest, CompanyResponse
from app.application.services.customer import CustomerService
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


@router.get("", response_model=list[CompanyResponse])
async def list_companies(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:read")),
) -> list[CompanyResponse]:
    """List all accounts/companies within the organization."""
    return await CustomerService.list_companies(db=db, tenant_id=tenant_id)


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    data: CompanyCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:write")),
) -> CompanyResponse:
    """Create a new company account."""
    return await CustomerService.create_company(
        db=db, tenant_id=tenant_id, actor_id=current_user.id, data=data
    )
