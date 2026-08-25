import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# Notification DTOs
# -------------------------------------------------------------
class NotificationCreateRequest(BaseModel):
    user_id: uuid.UUID
    type: str = Field(default="system", description="system, deal, ticket, order, mention")
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1)
    action_url: str | None = None
    notification_metadata: dict | None = None


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    user_id: uuid.UUID
    type: str
    title: str
    body: str
    action_url: str | None
    is_read: bool
    read_at: datetime | None
    created_at: datetime


# -------------------------------------------------------------
# Chat & Channel DTOs
# -------------------------------------------------------------
class ChannelMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    channel_id: uuid.UUID
    user_id: uuid.UUID
    role: str


class ChannelCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    type: str = Field(default="team", description="direct, team, customer_shared")
    is_private: bool = False
    initial_member_ids: list[uuid.UUID] = Field(default_factory=list)


class ChannelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    type: str
    is_private: bool
    members: list[ChannelMemberResponse] = Field(default_factory=list)
    created_at: datetime


class ChatMessageCreateRequest(BaseModel):
    content: str = Field(..., min_length=1)
    attachments: list[dict] | None = None


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    channel_id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    attachments: list[dict] | None
    created_at: datetime
