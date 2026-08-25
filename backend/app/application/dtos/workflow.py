import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------
# Workflow Node DTOs
# -------------------------------------------------------------
class WorkflowNodeCreate(BaseModel):
    node_type: str = Field(
        default="action", description="trigger, condition, action, delay, branch"
    )
    name: str = Field(..., min_length=2, max_length=150)
    config: dict = Field(default_factory=dict)
    order_index: int = Field(default=0, ge=0)


class WorkflowNodeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workflow_id: uuid.UUID
    node_type: str
    name: str
    config: dict
    order_index: int
    next_node_id: uuid.UUID | None


# -------------------------------------------------------------
# Workflow DTOs
# -------------------------------------------------------------
class WorkflowCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: str | None = None
    trigger_type: str = Field(default="event", description="event, schedule, webhook, manual")
    trigger_config: dict | None = Field(
        default_factory=dict, description="e.g. {'event_type': 'order.paid.v1'}"
    )
    nodes: list[WorkflowNodeCreate] = Field(default_factory=list)


class WorkflowExecutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workflow_id: uuid.UUID
    status: str
    trigger_payload: dict | None
    step_logs: list[dict] | None
    started_at: datetime
    completed_at: datetime | None
    error_message: str | None


class WorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    description: str | None
    trigger_type: str
    trigger_config: dict | None
    status: str
    execution_count: int
    last_executed_at: datetime | None
    nodes: list[WorkflowNodeResponse] = Field(default_factory=list)
    created_at: datetime


class WorkflowExecuteRequest(BaseModel):
    payload: dict = Field(default_factory=dict)
