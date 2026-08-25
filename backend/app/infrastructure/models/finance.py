import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import GUID, TenantBaseModel


class Invoice(TenantBaseModel):
    __tablename__ = "invoices"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    order_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="draft", index=True, nullable=False
    )  # draft, sent, paid, overdue, void
    issue_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), nullable=False
    )
    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), nullable=False
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), nullable=False
    )
    paid_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), nullable=False
    )
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)

    items: Mapped[list["InvoiceItem"]] = relationship(
        "InvoiceItem", back_populates="invoice", cascade="all, delete-orphan"
    )
    credit_notes: Mapped[list["CreditNote"]] = relationship(
        "CreditNote", back_populates="invoice", cascade="all, delete-orphan"
    )


class InvoiceItem(TenantBaseModel):
    __tablename__ = "invoice_items"

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="items")


class Subscription(TenantBaseModel):
    __tablename__ = "subscriptions"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    plan_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="active", index=True, nullable=False
    )  # active, past_due, cancelled, trialing
    billing_interval: Mapped[str] = mapped_column(
        String(20), default="monthly", nullable=False
    )  # monthly, annual
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    current_period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    current_period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class CreditNote(TenantBaseModel):
    __tablename__ = "credit_notes"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    invoice_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("invoices.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    credit_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="active", nullable=False
    )  # active, applied, refunded

    invoice: Mapped["Invoice | None"] = relationship("Invoice", back_populates="credit_notes")


class Project(TenantBaseModel):
    __tablename__ = "projects"

    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="planning", index=True, nullable=False
    )  # planning, in_progress, on_hold, completed
    budget_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), nullable=False
    )
    spent_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), nullable=False
    )
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    target_end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    tasks: Mapped[list["ProjectTask"]] = relationship(
        "ProjectTask", back_populates="project", cascade="all, delete-orphan"
    )
    time_entries: Mapped[list["TimeEntry"]] = relationship(
        "TimeEntry", back_populates="project", cascade="all, delete-orphan"
    )


class ProjectTask(TenantBaseModel):
    __tablename__ = "project_tasks"

    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="todo", index=True, nullable=False
    )  # todo, in_progress, review, done
    priority: Mapped[str] = mapped_column(
        String(50), default="medium", nullable=False
    )  # low, medium, high
    estimated_hours: Mapped[Decimal] = mapped_column(
        Numeric(8, 2), default=Decimal("0.00"), nullable=False
    )
    logged_hours: Mapped[Decimal] = mapped_column(
        Numeric(8, 2), default=Decimal("0.00"), nullable=False
    )
    assigned_to_user_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    project: Mapped["Project"] = relationship("Project", back_populates="tasks")
    time_entries: Mapped[list["TimeEntry"]] = relationship(
        "TimeEntry", back_populates="task", cascade="all, delete-orphan"
    )


class TimeEntry(TenantBaseModel):
    __tablename__ = "time_entries"

    project_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    task_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("project_tasks.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    hours: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    billable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    hourly_rate: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=Decimal("0.00"), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    entry_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    project: Mapped["Project"] = relationship("Project", back_populates="time_entries")
    task: Mapped["ProjectTask | None"] = relationship("ProjectTask", back_populates="time_entries")
