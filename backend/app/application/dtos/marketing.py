import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# Segment DTOs
# -------------------------------------------------------------
class SegmentCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    type: str = Field(default="dynamic", description="dynamic, static")
    criteria: dict = Field(
        ...,
        description="Filter rules: e.g. {'health_score_gte': 80, 'status': 'active'}",
    )


class SegmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    type: str
    criteria: dict | None
    is_active: bool
    created_at: datetime


# -------------------------------------------------------------
# Template DTOs
# -------------------------------------------------------------
class MessageTemplateCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    channel: str = Field(default="email", description="email, sms")
    subject: str | None = None
    body: str = Field(..., min_length=1)
    variables: list[str] | None = None


class MessageTemplateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    channel: str
    subject: str | None
    body: str
    variables: list[str] | None
    is_active: bool
    created_at: datetime


# -------------------------------------------------------------
# Campaign DTOs
# -------------------------------------------------------------
class CampaignCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    channel: str = Field(default="email", description="email, sms")
    segment_id: uuid.UUID | None = None
    template_id: uuid.UUID | None = None
    subject: str | None = None
    content: str = Field(..., min_length=1)
    scheduled_at: datetime | None = None


class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    segment_id: uuid.UUID | None
    template_id: uuid.UUID | None
    name: str
    channel: str
    status: str
    subject: str | None
    content: str
    scheduled_at: datetime | None
    sent_at: datetime | None
    total_recipients: int
    delivered_count: int
    opened_count: int
    clicked_count: int
    bounced_count: int
    created_at: datetime


class CampaignSendResponse(BaseModel):
    campaign_id: uuid.UUID
    status: str
    recipients_count: int
    message: str


# -------------------------------------------------------------
# Discount Code DTOs
# -------------------------------------------------------------
class DiscountCodeCreateRequest(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    discount_type: str = Field(default="percentage", description="percentage, fixed_amount")
    value: Decimal = Field(..., ge=0)
    min_order_value: Decimal | None = None
    max_uses: int | None = None
    expires_at: datetime | None = None


class DiscountCodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    code: str
    discount_type: str
    value: Decimal
    min_order_value: Decimal | None
    max_uses: int | None
    used_count: int
    expires_at: datetime | None
    is_active: bool
    created_at: datetime


class DiscountValidateRequest(BaseModel):
    code: str
    order_subtotal: Decimal = Field(..., ge=0)


class DiscountValidateResponse(BaseModel):
    valid: bool
    discount_amount: Decimal
    message: str
