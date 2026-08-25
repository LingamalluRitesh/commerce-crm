import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import GUID, TenantBaseModel


class Workflow(TenantBaseModel):
    __tablename__ = "workflows"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    trigger_type: Mapped[str] = mapped_column(
        String(50), default="event", nullable=False
    )  # event, schedule, webhook, manual
    trigger_config: Mapped[dict | None] = mapped_column(
        JSON, nullable=True
    )  # e.g. {"event_type": "customer.created.v1"}
    status: Mapped[str] = mapped_column(
        String(50), default="active", index=True, nullable=False
    )  # active, draft, paused
    execution_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_executed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    nodes: Mapped[list["WorkflowNode"]] = relationship(
        "WorkflowNode",
        back_populates="workflow",
        order_by="WorkflowNode.order_index",
        cascade="all, delete-orphan",
    )
    executions: Mapped[list["WorkflowExecution"]] = relationship(
        "WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan"
    )


class WorkflowNode(TenantBaseModel):
    __tablename__ = "workflow_nodes"

    workflow_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("workflows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    node_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # trigger, condition, action, delay, branch
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    config: Mapped[dict] = mapped_column(
        JSON, default=dict, nullable=False
    )  # e.g. {"action": "update_health_score", "score_delta": 5}
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    next_node_id: Mapped[uuid.UUID | None] = mapped_column(GUID(), nullable=True)

    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="nodes")


class WorkflowExecution(TenantBaseModel):
    __tablename__ = "workflow_executions"

    workflow_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("workflows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    trigger_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="running", index=True, nullable=False
    )  # running, completed, failed
    step_logs: Mapped[list[dict] | None] = mapped_column(JSON, default=list, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="executions")
