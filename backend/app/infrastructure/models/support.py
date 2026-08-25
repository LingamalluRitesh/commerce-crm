import uuid
from datetime import UTC, datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import GUID, TenantBaseModel


class Ticket(TenantBaseModel):
    __tablename__ = "tickets"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ticket_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="open", index=True, nullable=False
    )  # open, pending, resolved, closed
    priority: Mapped[str] = mapped_column(
        String(50), default="medium", index=True, nullable=False
    )  # low, medium, high, urgent
    channel: Mapped[str] = mapped_column(
        String(50), default="web", nullable=False
    )  # email, web, chat, phone
    assigned_to_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    sla_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    satisfaction_score: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1 to 5

    comments: Mapped[list["TicketComment"]] = relationship(
        "TicketComment", back_populates="ticket", cascade="all, delete-orphan"
    )


class TicketComment(TenantBaseModel):
    __tablename__ = "ticket_comments"

    ticket_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    is_internal_note: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="comments")


class KnowledgeArticle(TenantBaseModel):
    __tablename__ = "knowledge_articles"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    helpful_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint("tenant_id", "slug", name="uq_knowledge_articles_tenant_slug"),
    )


class CustomerSuccessPlan(TenantBaseModel):
    __tablename__ = "customer_success_plans"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="active", nullable=False
    )  # active, paused, completed
    target_outcome: Mapped[str] = mapped_column(Text, nullable=False)
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    target_completion_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    milestones: Mapped[list["SuccessMilestone"]] = relationship(
        "SuccessMilestone", back_populates="plan", cascade="all, delete-orphan"
    )


class SuccessMilestone(TenantBaseModel):
    __tablename__ = "success_milestones"

    plan_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("customer_success_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    plan: Mapped["CustomerSuccessPlan"] = relationship(
        "CustomerSuccessPlan", back_populates="milestones"
    )
