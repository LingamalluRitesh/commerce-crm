import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PriceTierCreateRequest(BaseModel):
    product_id: uuid.UUID
    min_quantity: int = Field(default=1, ge=1)
    max_quantity: int | None = Field(default=None, ge=1)
    unit_price: Decimal = Field(..., gt=0)
    discount_percentage: Decimal = Field(default=Decimal("0.00"), ge=0, le=100)


class PriceTierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    price_list_id: uuid.UUID
    product_id: uuid.UUID
    min_quantity: int
    max_quantity: int | None
    unit_price: Decimal
    discount_percentage: Decimal


class PriceListCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=50)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    description: str | None = None
    is_default: bool = False
    tiers: list[PriceTierCreateRequest] = Field(default_factory=list)


class PriceListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    code: str
    currency: str
    description: str | None
    is_default: bool
    tiers: list[PriceTierResponse] = Field(default_factory=list)


class CalculateTieredPriceRequest(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., ge=1)
    price_list_id: uuid.UUID | None = None


class CalculateTieredPriceResponse(BaseModel):
    product_id: uuid.UUID
    quantity: int
    base_unit_price: Decimal
    effective_unit_price: Decimal
    discount_percentage: Decimal
    total_net_price: Decimal
