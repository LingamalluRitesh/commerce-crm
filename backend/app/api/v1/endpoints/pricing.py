import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.pricing import (
    CalculateTieredPriceRequest,
    CalculateTieredPriceResponse,
    PriceListCreateRequest,
    PriceListResponse,
)
from app.application.services.pricing import PricingService
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


@router.post(
    "/price-lists",
    response_model=PriceListResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_price_list(
    data: PriceListCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> PriceListResponse:
    """Create a B2B commercial price list with quantity threshold tiers."""
    return await PricingService.create_price_list(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post(
    "/calculate",
    response_model=CalculateTieredPriceResponse,
)
async def calculate_tiered_price(
    data: CalculateTieredPriceRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:read")),
) -> CalculateTieredPriceResponse:
    """Calculate effective unit price and total based on volume quantity discount rules."""
    return await PricingService.calculate_tiered_price(
        db=db,
        tenant_id=tenant_id,
        data=data,
    )
