import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# Invoice DTOs
# -------------------------------------------------------------
class InvoiceItemCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)
    quantity: int = Field(default=1, ge=1)
    unit_price: Decimal = Field(..., ge=0)


class InvoiceItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    invoice_id: uuid.UUID
    description: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal


class InvoiceCreateRequest(BaseModel):
    customer_id: uuid.UUID
    order_id: uuid.UUID | None = None
    due_date: datetime
    items: list[InvoiceItemCreate] = Field(..., min_length=1)
    tax_rate_percent: Decimal = Field(default=Decimal("0.00"), ge=0, le=100)


class CreditNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    customer_id: uuid.UUID
    invoice_id: uuid.UUID | None
    credit_number: str
    amount: Decimal
    reason: str
    status: str
    created_at: datetime


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID
    order_id: uuid.UUID | None
    invoice_number: str
    status: str
    issue_date: datetime
    due_date: datetime
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    currency: str
    items: list[InvoiceItemResponse] = Field(default_factory=list)
    credit_notes: list[CreditNoteResponse] = Field(default_factory=list)
    created_at: datetime


class InvoicePayRequest(BaseModel):
    amount: Decimal = Field(..., gt=0)


# -------------------------------------------------------------
# Subscription DTOs
# -------------------------------------------------------------
class SubscriptionCreateRequest(BaseModel):
    customer_id: uuid.UUID
    plan_name: str = Field(..., min_length=2, max_length=100)
    billing_interval: str = Field(default="monthly", description="monthly, annual")
    amount: Decimal = Field(..., ge=0)


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID
    plan_name: str
    status: str
    billing_interval: str
    amount: Decimal
    currency: str
    current_period_start: datetime
    current_period_end: datetime
    cancelled_at: datetime | None
    created_at: datetime


# -------------------------------------------------------------
# Credit Note DTOs
# -------------------------------------------------------------
class CreditNoteCreateRequest(BaseModel):
    customer_id: uuid.UUID
    invoice_id: uuid.UUID | None = None
    amount: Decimal = Field(..., gt=0)
    reason: str = Field(..., min_length=2, max_length=255)


# -------------------------------------------------------------
# Project & Time Tracking DTOs
# -------------------------------------------------------------
class ProjectTaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str | None = None
    priority: str = Field(default="medium", description="low, medium, high")
    estimated_hours: Decimal = Field(default=Decimal("0.00"), ge=0)
    assigned_to_user_id: uuid.UUID | None = None
    due_date: datetime | None = None


class TimeEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    task_id: uuid.UUID | None
    user_id: uuid.UUID
    hours: Decimal
    billable: bool
    hourly_rate: Decimal
    description: str | None
    entry_date: datetime


class ProjectTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    description: str | None
    status: str
    priority: str
    estimated_hours: Decimal
    logged_hours: Decimal
    assigned_to_user_id: uuid.UUID | None
    due_date: datetime | None
    created_at: datetime


class ProjectCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    customer_id: uuid.UUID | None = None
    budget_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    target_end_date: datetime | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID | None
    name: str
    status: str
    budget_amount: Decimal
    spent_amount: Decimal
    start_date: datetime
    target_end_date: datetime | None
    tasks: list[ProjectTaskResponse] = Field(default_factory=list)
    created_at: datetime


class TimeEntryCreateRequest(BaseModel):
    project_id: uuid.UUID
    task_id: uuid.UUID | None = None
    hours: Decimal = Field(..., gt=0)
    billable: bool = True
    hourly_rate: Decimal = Field(default=Decimal("150.00"), ge=0)
    description: str | None = None
