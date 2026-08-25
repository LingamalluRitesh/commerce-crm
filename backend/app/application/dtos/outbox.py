import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OutboxMessageCreateRequest(BaseModel):
    event_type: str = Field(..., min_length=2, max_length=100)
    aggregate_type: str = Field(..., min_length=2, max_length=50)
    aggregate_id: uuid.UUID
    payload: dict = Field(default_factory=dict)


class OutboxMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    event_type: str
    aggregate_type: str
    aggregate_id: uuid.UUID
    payload: dict
    status: str
    retry_count: int
    last_error: str | None
    published_at: datetime | None
    created_at: datetime


class OutboxBatchProcessResponse(BaseModel):
    processed_count: int
    published_count: int
    failed_count: int
    messages: list[OutboxMessageResponse] = Field(default_factory=list)


class OutboxReplayRequest(BaseModel):
    event_type: str | None = None
