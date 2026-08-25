import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# -------------------------------------------------------------
# Warehouse DTOs
# -------------------------------------------------------------
class WarehouseCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    code: str = Field(..., min_length=2, max_length=50)
    address_line1: str = Field(..., min_length=2, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str | None = None
    postal_code: str = Field(..., min_length=2, max_length=20)
    country: str = Field(default="USA", min_length=2, max_length=3)
    is_primary: bool = False


class WarehouseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    code: str
    address_line1: str
    city: str
    state: str | None
    postal_code: str
    country: str
    is_primary: bool
    is_active: bool
    created_at: datetime


# -------------------------------------------------------------
# Stock DTOs
# -------------------------------------------------------------
class StockItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    warehouse_id: uuid.UUID
    product_id: uuid.UUID
    variant_id: uuid.UUID | None
    quantity_on_hand: int
    quantity_reserved: int
    quantity_available: int
    reorder_threshold: int
    reorder_quantity: int


class StockAdjustRequest(BaseModel):
    warehouse_id: uuid.UUID
    product_id: uuid.UUID
    variant_id: uuid.UUID | None = None
    quantity_delta: int = Field(..., description="Positive for addition, negative for deduction")
    movement_type: str = Field(
        default="adjustment", description="inbound, outbound, adjustment, manual"
    )
    reference_type: str = Field(default="manual")
    reference_id: str = Field(default="MANUAL_ADJ")
    note: str | None = None


class StockMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    warehouse_id: uuid.UUID
    product_id: uuid.UUID
    variant_id: uuid.UUID | None
    quantity_delta: int
    movement_type: str
    reference_type: str
    reference_id: str
    note: str | None
    created_at: datetime


# -------------------------------------------------------------
# Transfer DTOs
# -------------------------------------------------------------
class StockTransferItemCreate(BaseModel):
    product_id: uuid.UUID
    variant_id: uuid.UUID | None = None
    quantity: int = Field(..., ge=1)


class StockTransferItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    variant_id: uuid.UUID | None
    quantity: int


class StockTransferCreateRequest(BaseModel):
    source_warehouse_id: uuid.UUID
    target_warehouse_id: uuid.UUID
    items: list[StockTransferItemCreate] = Field(..., min_length=1)


class StockTransferResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    source_warehouse_id: uuid.UUID
    target_warehouse_id: uuid.UUID
    transfer_number: str
    status: str
    shipped_at: datetime | None
    received_at: datetime | None
    items: list[StockTransferItemResponse] = Field(default_factory=list)
    created_at: datetime


# -------------------------------------------------------------
# Supplier & Purchase Order DTOs
# -------------------------------------------------------------
class SupplierCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    contact_name: str | None = None
    email: EmailStr
    phone: str | None = None
    payment_terms: str | None = "Net 30"
    currency: str = "USD"


class SupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    contact_name: str | None
    email: EmailStr
    phone: str | None
    payment_terms: str | None
    currency: str
    is_active: bool
    created_at: datetime


class PurchaseOrderItemCreate(BaseModel):
    product_id: uuid.UUID
    variant_id: uuid.UUID | None = None
    quantity_ordered: int = Field(..., ge=1)
    unit_cost: Decimal = Field(..., ge=0)


class PurchaseOrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    variant_id: uuid.UUID | None
    quantity_ordered: int
    quantity_received: int
    unit_cost: Decimal
    total_cost: Decimal


class PurchaseOrderCreateRequest(BaseModel):
    supplier_id: uuid.UUID
    warehouse_id: uuid.UUID
    items: list[PurchaseOrderItemCreate] = Field(..., min_length=1)
    expected_delivery_date: datetime | None = None


class PurchaseOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    supplier_id: uuid.UUID
    warehouse_id: uuid.UUID
    po_number: str
    status: str
    total_amount: Decimal
    currency: str
    expected_delivery_date: datetime | None
    items: list[PurchaseOrderItemResponse] = Field(default_factory=list)
    created_at: datetime


# -------------------------------------------------------------
# Fulfillment DTOs
# -------------------------------------------------------------
class FulfillmentCreateRequest(BaseModel):
    order_id: uuid.UUID
    warehouse_id: uuid.UUID
    carrier: str | None = "fedex"
    tracking_number: str | None = None


class FulfillmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    order_id: uuid.UUID
    warehouse_id: uuid.UUID
    carrier: str | None
    tracking_number: str | None
    status: str
    shipped_at: datetime | None
    delivered_at: datetime | None
    created_at: datetime
