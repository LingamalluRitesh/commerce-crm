import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.application.dtos.customer import CustomerResponse


# -------------------------------------------------------------
# Lead DTOs
# -------------------------------------------------------------
class LeadCreateRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = None
    company_name: str | None = None
    source: str = Field(default="web", description="web, referral, outbound, ads")
    score: int | None = Field(default=None, ge=0, le=100)
    assigned_to_user_id: uuid.UUID | None = None


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None
    company_name: str | None
    source: str
    status: str
    score: int
    assigned_to_user_id: uuid.UUID | None
    converted_customer_id: uuid.UUID | None
    converted_at: datetime | None
    created_at: datetime


class LeadConvertRequest(BaseModel):
    create_deal: bool = True
    deal_name: str | None = None
    deal_value: Decimal = Field(default=Decimal("0.00"), ge=0)
    pipeline_id: uuid.UUID | None = None


class LeadConvertResponse(BaseModel):
    customer: CustomerResponse
    deal_id: uuid.UUID | None = None
    message: str


# -------------------------------------------------------------
# Pipeline & Stage DTOs
# -------------------------------------------------------------
class PipelineStageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pipeline_id: uuid.UUID
    name: str
    order_index: int
    probability: int
    is_won_stage: bool
    is_lost_stage: bool


class PipelineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    is_default: bool
    is_active: bool
    stages: list[PipelineStageResponse] = Field(default_factory=list)
    created_at: datetime


class PipelineCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    is_default: bool = False


# -------------------------------------------------------------
# Deal / Opportunity DTOs
# -------------------------------------------------------------
class DealCreateRequest(BaseModel):
    customer_id: uuid.UUID
    name: str = Field(..., min_length=2, max_length=200)
    value: Decimal = Field(..., ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    pipeline_id: uuid.UUID | None = None
    stage_id: uuid.UUID | None = None
    expected_close_date: datetime | None = None
    assigned_to_user_id: uuid.UUID | None = None


class DealUpdateStageRequest(BaseModel):
    stage_id: uuid.UUID
    lost_reason: str | None = None


class DealResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    pipeline_id: uuid.UUID
    stage_id: uuid.UUID
    customer_id: uuid.UUID
    name: str
    value: Decimal
    currency: str
    probability: int
    expected_close_date: datetime | None
    status: str
    lost_reason: str | None
    assigned_to_user_id: uuid.UUID | None
    created_at: datetime


# -------------------------------------------------------------
# Quote DTOs
# -------------------------------------------------------------
class QuoteItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    unit_price: Decimal = Field(..., ge=0)
    quantity: int = Field(default=1, ge=1)


class QuoteItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quote_id: uuid.UUID
    title: str
    description: str | None
    unit_price: Decimal
    quantity: int
    total_price: Decimal


class QuoteCreateRequest(BaseModel):
    deal_id: uuid.UUID
    items: list[QuoteItemCreate] = Field(..., min_length=1)
    discount_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    tax_rate_percent: Decimal = Field(default=Decimal("0.00"), ge=0, le=100)
    valid_until: datetime | None = None


class QuoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    deal_id: uuid.UUID
    customer_id: uuid.UUID
    quote_number: str
    status: str
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    currency: str
    valid_until: datetime | None
    items: list[QuoteItemResponse] = Field(default_factory=list)
    created_at: datetime
