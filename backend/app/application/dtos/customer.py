import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# -------------------------------------------------------------
# Company DTOs
# -------------------------------------------------------------
class CompanyCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    domain: str | None = None
    industry: str | None = None
    size: str | None = None
    annual_revenue: Decimal | None = None
    phone: str | None = None
    website: str | None = None


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    domain: str | None
    industry: str | None
    size: str | None
    annual_revenue: Decimal | None
    phone: str | None
    website: str | None
    created_at: datetime


# -------------------------------------------------------------
# Contact & Address DTOs
# -------------------------------------------------------------
class ContactCreateRequest(BaseModel):
    customer_id: uuid.UUID | None = None
    company_id: uuid.UUID | None = None
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = None
    job_title: str | None = None
    is_primary: bool = False


class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID | None
    company_id: uuid.UUID | None
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None
    job_title: str | None
    is_primary: bool
    created_at: datetime


class AddressCreateRequest(BaseModel):
    type: str = Field(default="billing", description="billing, shipping, office")
    line1: str = Field(..., min_length=2, max_length=255)
    line2: str | None = None
    city: str = Field(..., min_length=1, max_length=100)
    state: str | None = None
    postal_code: str = Field(..., min_length=2, max_length=20)
    country: str = Field(..., min_length=2, max_length=3, description="ISO country code, e.g. USA")
    is_default: bool = False


class AddressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID | None
    type: str
    line1: str
    line2: str | None
    city: str
    state: str | None
    postal_code: str
    country: str
    is_default: bool
    created_at: datetime


# -------------------------------------------------------------
# Interaction (Timeline) & Preferences
# -------------------------------------------------------------
class InteractionCreateRequest(BaseModel):
    channel: str = Field(..., description="email, call, meeting, note, order, ticket")
    direction: str = Field(default="outbound", description="inbound, outbound")
    subject: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1)
    sentiment: str = Field(default="neutral", description="positive, neutral, negative")
    contact_id: uuid.UUID | None = None
    interaction_metadata: dict | None = None


class InteractionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID
    contact_id: uuid.UUID | None
    channel: str
    direction: str
    subject: str
    body: str
    sentiment: str
    interaction_metadata: dict | None
    created_at: datetime


class CustomerPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    customer_id: uuid.UUID
    email_opt_in: bool
    sms_opt_in: bool
    preferred_channel: str
    language: str
    timezone: str


# -------------------------------------------------------------
# Customer CRUD & 360 Aggregated Response
# -------------------------------------------------------------
class CustomerCreateRequest(BaseModel):
    type: str = Field(default="individual", description="individual, business")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = None
    company_id: uuid.UUID | None = None
    status: str = Field(default="active", description="lead, active, churned, inactive")
    custom_attributes: dict | None = None


class CustomerUpdateRequest(BaseModel):
    type: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    company_id: uuid.UUID | None = None
    status: str | None = None
    health_score: int | None = Field(None, ge=0, le=100)
    custom_attributes: dict | None = None


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    company_id: uuid.UUID | None
    type: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None
    status: str
    health_score: int
    lifetime_value: Decimal
    currency: str
    custom_attributes: dict | None
    created_at: datetime


class Customer360Response(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    customer: CustomerResponse
    company: CompanyResponse | None = None
    contacts: list[ContactResponse] = Field(default_factory=list)
    addresses: list[AddressResponse] = Field(default_factory=list)
    recent_interactions: list[InteractionResponse] = Field(default_factory=list)
    preference: CustomerPreferenceResponse | None = None
    summary_metrics: dict = Field(default_factory=dict)
