import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# Category & Product DTOs
# -------------------------------------------------------------
class CategoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    description: str | None = None
    parent_id: uuid.UUID | None = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    slug: str
    description: str | None
    parent_id: uuid.UUID | None
    is_active: bool
    created_at: datetime


class ProductVariantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    sku: str = Field(..., min_length=1, max_length=100)
    price_override: Decimal | None = None
    attributes: dict | None = None


class ProductVariantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    name: str
    sku: str
    price_override: Decimal | None
    attributes: dict | None
    is_active: bool


class ProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    sku: str = Field(..., min_length=2, max_length=100)
    base_price: Decimal = Field(..., ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    category_id: uuid.UUID | None = None
    description: str | None = None
    track_inventory: bool = True
    is_digital: bool = False
    variants: list[ProductVariantCreate] = Field(default_factory=list)


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    category_id: uuid.UUID | None
    name: str
    slug: str
    sku: str
    description: str | None
    base_price: Decimal
    currency: str
    status: str
    track_inventory: bool
    is_digital: bool
    variants: list[ProductVariantResponse] = Field(default_factory=list)
    created_at: datetime


# -------------------------------------------------------------
# Cart DTOs
# -------------------------------------------------------------
class CartItemAddRequest(BaseModel):
    product_id: uuid.UUID
    variant_id: uuid.UUID | None = None
    quantity: int = Field(default=1, ge=1)


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    variant_id: uuid.UUID | None
    product_name: str
    sku: str
    unit_price: Decimal
    quantity: int
    total_price: Decimal


class CartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID | None
    currency: str
    subtotal: Decimal
    items: list[CartItemResponse] = Field(default_factory=list)


# -------------------------------------------------------------
# Order & Payment DTOs
# -------------------------------------------------------------
class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    variant_id: uuid.UUID | None
    title: str
    sku: str
    unit_price: Decimal
    quantity: int
    total_price: Decimal


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    order_id: uuid.UUID
    provider: str
    provider_transaction_id: str | None
    amount: Decimal
    currency: str
    status: str
    created_at: datetime


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID
    order_number: str
    status: str
    payment_status: str
    currency: str
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    total_amount: Decimal
    shipping_address_id: uuid.UUID | None
    billing_address_id: uuid.UUID | None
    items: list[OrderItemResponse] = Field(default_factory=list)
    payments: list[PaymentResponse] = Field(default_factory=list)
    created_at: datetime


class CheckoutRequest(BaseModel):
    customer_id: uuid.UUID
    cart_id: uuid.UUID | None = None
    direct_items: list[CartItemAddRequest] | None = None
    discount_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    shipping_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    tax_rate_percent: Decimal = Field(default=Decimal("0.00"), ge=0, le=100)
    shipping_address_id: uuid.UUID | None = None
    billing_address_id: uuid.UUID | None = None


class PayOrderRequest(BaseModel):
    provider: str = Field(default="manual", description="stripe, manual, mock")
    provider_transaction_id: str | None = None


class RefundOrderRequest(BaseModel):
    amount: Decimal | None = None
    reason: str = Field(..., min_length=2, max_length=255)
