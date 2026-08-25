import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.customer import (
    AddressCreateRequest,
    AddressResponse,
    Customer360Response,
    CustomerCreateRequest,
    CustomerResponse,
    CustomerUpdateRequest,
    InteractionCreateRequest,
    InteractionResponse,
)
from app.application.services.customer import CustomerService
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


@router.get("", response_model=dict)
async def list_customers(
    q: str | None = Query(None, description="Search term for name/email/phone"),
    status: str | None = Query(None, description="Filter by status (lead, active, churned)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:read")),
) -> dict:
    """List and filter customers with pagination."""
    items, total = await CustomerService.list_customers(
        db=db,
        tenant_id=tenant_id,
        query_str=q,
        status_filter=status,
        page=page,
        page_size=page_size,
    )
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    return {
        "items": [c.model_dump() for c in items],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    data: CustomerCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:write")),
) -> CustomerResponse:
    """Create a new customer profile within the active tenant."""
    return await CustomerService.create_customer(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.get("/{customer_id}", response_model=Customer360Response)
async def get_customer_360(
    customer_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:read")),
) -> Customer360Response:
    """Retrieve full Customer 360 aggregated profile."""
    return await CustomerService.get_customer_360(
        db=db, tenant_id=tenant_id, customer_id=customer_id
    )


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: uuid.UUID,
    data: CustomerUpdateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:write")),
) -> CustomerResponse:
    """Update customer demographic or status fields."""
    return await CustomerService.update_customer(
        db=db,
        tenant_id=tenant_id,
        customer_id=customer_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post(
    "/{customer_id}/interactions",
    response_model=InteractionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def log_interaction(
    customer_id: uuid.UUID,
    data: InteractionCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:write")),
) -> InteractionResponse:
    """Record an interaction (note, call, email, meeting) on the customer timeline."""
    return await CustomerService.add_interaction(
        db=db,
        tenant_id=tenant_id,
        customer_id=customer_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post(
    "/{customer_id}/addresses",
    response_model=AddressResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_address(
    customer_id: uuid.UUID,
    data: AddressCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:write")),
) -> AddressResponse:
    """Add a billing or shipping address to customer profile."""
    return await CustomerService.add_address(
        db=db, tenant_id=tenant_id, customer_id=customer_id, data=data
    )
