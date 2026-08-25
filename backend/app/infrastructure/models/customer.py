import uuid
from decimal import Decimal

from sqlalchemy import (
    JSON,
    Boolean,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import GUID, TenantBaseModel


class Company(TenantBaseModel):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    domain: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    size: Mapped[str | None] = mapped_column(String(50), nullable=True)
    annual_revenue: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)

    customers: Mapped[list["Customer"]] = relationship("Customer", back_populates="company")
    contacts: Mapped[list["Contact"]] = relationship("Contact", back_populates="company")


class Customer(TenantBaseModel):
    __tablename__ = "customers"

    company_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("companies.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    type: Mapped[str] = mapped_column(String(50), default="individual", nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", index=True, nullable=False)
    health_score: Mapped[int] = mapped_column(default=100, nullable=False)
    lifetime_value: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0.00"), nullable=False
    )
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    custom_attributes: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    company: Mapped["Company | None"] = relationship("Company", back_populates="customers")
    contacts: Mapped[list["Contact"]] = relationship(
        "Contact", back_populates="customer", cascade="all, delete-orphan"
    )
    addresses: Mapped[list["Address"]] = relationship(
        "Address", back_populates="customer", cascade="all, delete-orphan"
    )
    interactions: Mapped[list["Interaction"]] = relationship(
        "Interaction", back_populates="customer", cascade="all, delete-orphan"
    )
    preference: Mapped["CustomerPreference | None"] = relationship(
        "CustomerPreference",
        back_populates="customer",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Contact(TenantBaseModel):
    __tablename__ = "contacts"

    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    company_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    job_title: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    customer: Mapped["Customer | None"] = relationship("Customer", back_populates="contacts")
    company: Mapped["Company | None"] = relationship("Company", back_populates="contacts")


class Address(TenantBaseModel):
    __tablename__ = "addresses"

    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    company_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    type: Mapped[str] = mapped_column(String(50), default="billing", nullable=False)
    line1: Mapped[str] = mapped_column(String(255), nullable=False)
    line2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)
    country: Mapped[str] = mapped_column(String(3), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    customer: Mapped["Customer | None"] = relationship("Customer", back_populates="addresses")


class Interaction(TenantBaseModel):
    __tablename__ = "interactions"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("contacts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    channel: Mapped[str] = mapped_column(String(50), nullable=False)
    direction: Mapped[str] = mapped_column(String(20), default="outbound", nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    sentiment: Mapped[str] = mapped_column(String(20), default="neutral", nullable=False)
    interaction_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="interactions")


class CustomerPreference(TenantBaseModel):
    __tablename__ = "customer_preferences"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("customers.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    email_opt_in: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sms_opt_in: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    preferred_channel: Mapped[str] = mapped_column(String(50), default="email", nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="preference")
