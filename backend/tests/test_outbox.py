import uuid

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_transactional_outbox_processing_and_replay(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "event_architect@confluent-scale.com",
            "password": "OutboxPassword123!",
            "first_name": "Jay",
            "last_name": "Kreps",
            "organization_name": "Stream Engine Inc",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Stage Transactional Outbox Events
    stg1 = await client.post(
        "/api/v1/events/outbox",
        headers=headers,
        json={
            "event_type": "order.placed.v1",
            "aggregate_type": "Order",
            "aggregate_id": str(uuid.uuid4()),
            "payload": {"order_total": 499.00, "customer_email": "stream@kafka.org"},
        },
    )
    assert stg1.status_code == 201

    stg2 = await client.post(
        "/api/v1/events/outbox",
        headers=headers,
        json={
            "event_type": "inventory.reserved.v1",
            "aggregate_type": "StockItem",
            "aggregate_id": str(uuid.uuid4()),
            "payload": {"sku": "SRV-NODE-01", "reserved_qty": 2},
        },
    )
    assert stg2.status_code == 201

    # 3. Query Pending Outbox Events
    list_res = await client.get("/api/v1/events/outbox?status=pending", headers=headers)
    assert list_res.status_code == 200
    pending_msgs = list_res.json()
    assert len(pending_msgs) == 2

    # 4. Trigger Outbox Drain Batch Processing
    process_res = await client.post("/api/v1/events/outbox/process?batch_size=50", headers=headers)
    assert process_res.status_code == 200
    p_data = process_res.json()
    assert p_data["processed_count"] == 2
    assert p_data["published_count"] == 2
    assert p_data["failed_count"] == 0

    # Verify no pending messages remain
    check_res = await client.get("/api/v1/events/outbox?status=pending", headers=headers)
    assert len(check_res.json()) == 0

    # 5. Test Replay of Events
    replay_res = await client.post("/api/v1/events/outbox/replay", headers=headers, json={})
    assert replay_res.status_code == 200
