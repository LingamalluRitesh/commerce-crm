import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import GUID, TenantBaseModel


class ApiKey(TenantBaseModel):
    __tablename__ = "api_keys"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    key_prefix: Mapped[str] = mapped_column(String(20), nullable=False)
    hashed_key: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    scopes: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class WebhookSubscription(TenantBaseModel):
    __tablename__ = "webhook_subscriptions"

    url: Mapped[str] = mapped_column(String(500), nullable=False)
    secret_token: Mapped[str] = mapped_column(String(255), nullable=False)
    events: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    retry_limit: Mapped[int] = mapped_column(Integer, default=5, nullable=False)

    deliveries: Mapped[list["WebhookDelivery"]] = relationship(
        "WebhookDelivery", back_populates="subscription", cascade="all, delete-orphan"
    )


class WebhookDelivery(TenantBaseModel):
    __tablename__ = "webhook_deliveries"

    subscription_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("webhook_subscriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="delivered", index=True, nullable=False
    )  # delivered, failed, retrying
    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    attempt_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    subscription: Mapped["WebhookSubscription"] = relationship(
        "WebhookSubscription", back_populates="deliveries"
    )
