import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# Ticket DTOs
# -------------------------------------------------------------
class TicketCreateRequest(BaseModel):
    customer_id: uuid.UUID
    subject: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=1)
    priority: str = Field(default="medium", description="low, medium, high, urgent")
    channel: str = Field(default="web", description="email, web, chat, phone")
    assigned_to_user_id: uuid.UUID | None = None


class TicketCommentCreateRequest(BaseModel):
    content: str = Field(..., min_length=1)
    is_internal_note: bool = False


class TicketCommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    ticket_id: uuid.UUID
    author_id: uuid.UUID | None
    is_internal_note: bool
    content: str
    created_at: datetime


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID
    ticket_number: str
    subject: str
    description: str
    status: str
    priority: str
    channel: str
    assigned_to_user_id: uuid.UUID | None
    sla_deadline: datetime | None
    resolved_at: datetime | None
    closed_at: datetime | None
    satisfaction_score: int | None
    comments: list[TicketCommentResponse] = Field(default_factory=list)
    created_at: datetime


class TicketResolveRequest(BaseModel):
    satisfaction_score: int | None = Field(None, ge=1, le=5)
    resolution_note: str | None = None


# -------------------------------------------------------------
# Knowledge Base DTOs
# -------------------------------------------------------------
class KnowledgeArticleCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    content: str = Field(..., min_length=1)
    is_published: bool = True


class KnowledgeArticleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    title: str
    slug: str
    content: str
    is_published: bool
    view_count: int
    helpful_count: int
    created_at: datetime


# -------------------------------------------------------------
# Customer Success Plan DTOs
# -------------------------------------------------------------
class SuccessMilestoneCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str | None = None
    due_date: datetime | None = None


class SuccessMilestoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    plan_id: uuid.UUID
    title: str
    description: str | None
    is_completed: bool
    due_date: datetime | None
    completed_at: datetime | None


class CustomerSuccessPlanCreateRequest(BaseModel):
    customer_id: uuid.UUID
    name: str = Field(..., min_length=2, max_length=200)
    target_outcome: str = Field(..., min_length=2)
    target_completion_date: datetime | None = None
    milestones: list[SuccessMilestoneCreateRequest] = Field(default_factory=list)


class CustomerSuccessPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID
    name: str
    status: str
    target_outcome: str
    start_date: datetime
    target_completion_date: datetime | None
    completed_at: datetime | None
    progress_percentage: int = 0
    milestones: list[SuccessMilestoneResponse] = Field(default_factory=list)
    created_at: datetime
