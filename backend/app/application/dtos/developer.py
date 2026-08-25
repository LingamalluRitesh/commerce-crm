import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# API Key DTOs
# -------------------------------------------------------------
class ApiKeyCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    scopes: list[str] = Field(
        default=["customer:read", "order:read"],
        description="Allowed permission scopes for this key",
    )
    expires_in_days: int | None = Field(default=None, ge=1, le=365)


class ApiKeyCreatedResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    key_prefix: str
    raw_api_key: str  # Only returned ONCE upon generation
    scopes: list[str]
    is_active: bool
    expires_at: datetime | None
    created_at: datetime


class ApiKeyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    key_prefix: str
    scopes: list[str]
    is_active: bool
    last_used_at: datetime | None
    expires_at: datetime | None
    created_at: datetime


# -------------------------------------------------------------
# Webhook DTOs
# -------------------------------------------------------------
class WebhookSubscriptionCreateRequest(BaseModel):
    url: str = Field(..., min_length=10, max_length=500)
    events: list[str] = Field(
        ..., min_length=1, description="e.g. ['order.paid.v1', 'customer.created.v1']"
    )


class WebhookDeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subscription_id: uuid.UUID
    event_type: str
    payload: dict
    status: str
    status_code: int | None
    response_body: str | None
    duration_ms: int | None
    attempt_count: int
    delivered_at: datetime | None
    created_at: datetime


class WebhookSubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    url: str
    secret_token: str
    events: list[str]
    is_active: bool
    retry_limit: int
    created_at: datetime


class WebhookTestDispatchRequest(BaseModel):
    event_type: str = "order.paid.v1"
    payload: dict = Field(default_factory=lambda: {"test": True, "amount": 100.00})
