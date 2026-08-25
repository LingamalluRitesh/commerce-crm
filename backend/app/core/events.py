import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class DomainEvent(BaseModel):
    """Standard base schema for all domain events across the platform."""

    event_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    event_type: str
    tenant_id: uuid.UUID
    aggregate_type: str
    aggregate_id: uuid.UUID
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    version: int = 1
    payload: dict[str, Any] = Field(default_factory=dict)


EventHandler = Callable[[DomainEvent], Any]


class EventBus:
    """In-memory domain event dispatcher for modular monolith decouple execution."""

    def __init__(self) -> None:
        self._handlers: dict[str, list[EventHandler]] = {}

    def subscribe(self, event_type: str, handler: EventHandler) -> None:
        """Register a handler callback for an event type."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)

    async def publish(self, event: DomainEvent) -> None:
        """Publish a domain event to all registered async/sync handlers."""
        handlers = self._handlers.get(event.event_type, [])
        for handler in handlers:
            try:
                res = handler(event)
                if hasattr(res, "__await__"):
                    await res
            except Exception as exc:
                # Event handler failures must be logged and handled according to dead-letter policy
                from app.core.logging import logger

                logger.error(
                    "event_handler_failed",
                    event_id=str(event.event_id),
                    event_type=event.event_type,
                    error=str(exc),
                )


# Global event bus singleton instance
event_bus = EventBus()
