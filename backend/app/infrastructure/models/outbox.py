import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    DateTime,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import GUID, TenantBaseModel


class OutboxMessage(TenantBaseModel):
    __tablename__ = "outbox_messages"

    event_type: Mapped[str] = mapped_column(
        String(100), index=True, nullable=False
    )  # e.g. order.paid.v1
    aggregate_type: Mapped[str] = mapped_column(String(50), nullable=False)
    aggregate_id: Mapped[uuid.UUID] = mapped_column(GUID(), index=True, nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="pending", index=True, nullable=False
    )  # pending, processing, published, failed
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
