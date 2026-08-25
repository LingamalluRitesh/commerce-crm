import uuid
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import GUID, TenantBaseModel


class PriceList(TenantBaseModel):
    __tablename__ = "price_lists"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    tiers: Mapped[list["PriceTier"]] = relationship(
        "PriceTier", back_populates="price_list", cascade="all, delete-orphan"
    )


class PriceTier(TenantBaseModel):
    __tablename__ = "price_tiers"

    price_list_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("price_lists.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    min_quantity: Mapped[int] = mapped_column(default=1, nullable=False)
    max_quantity: Mapped[int | None] = mapped_column(nullable=True)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False)
    discount_percentage: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), default=Decimal("0.00"), nullable=False
    )

    price_list: Mapped["PriceList"] = relationship("PriceList", back_populates="tiers")
