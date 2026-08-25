import uuid

import pytest

from app.core.events import DomainEvent, event_bus


@pytest.mark.asyncio
async def test_domain_event_bus_publishing():
    received_events = []

    async def sample_handler(event: DomainEvent):
        received_events.append(event)

    event_type = "customer.created.v1"
    event_bus.subscribe(event_type, sample_handler)

    test_event = DomainEvent(
        event_type=event_type,
        tenant_id=uuid.uuid4(),
        aggregate_type="Customer",
        aggregate_id=uuid.uuid4(),
        payload={"email": "alice@example.com"},
    )

    await event_bus.publish(test_event)

    assert len(received_events) == 1
    assert received_events[0].event_type == event_type
    assert received_events[0].payload["email"] == "alice@example.com"
