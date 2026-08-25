import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_developer_platform_api_keys_and_webhooks(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "dev_advocate@twilio-scale.com",
            "password": "DeveloperPassword123!",
            "first_name": "Jeff",
            "last_name": "Lawson",
            "organization_name": "Developer APIs Corp",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Provision Scoped Developer API Key
    key_res = await client.post(
        "/api/v1/developer/api-keys",
        headers=headers,
        json={
            "name": "Production E-commerce Integration",
            "scopes": ["customer:read", "order:read", "order:write"],
            "expires_in_days": 90,
        },
    )
    assert key_res.status_code == 201
    key_data = key_res.json()
    assert key_data["raw_api_key"].startswith("ccrm_live_")
    key_id = key_data["id"]

    # List API Keys (Raw key is NOT exposed in list)
    keys_list = await client.get("/api/v1/developer/api-keys", headers=headers)
    assert keys_list.status_code == 200
    assert len(keys_list.json()) == 1
    assert "raw_api_key" not in keys_list.json()[0]

    # 3. Revoke API Key
    revoke_res = await client.delete(f"/api/v1/developer/api-keys/{key_id}", headers=headers)
    assert revoke_res.status_code == 200
    assert revoke_res.json()["is_active"] is False

    # 4. Register Outbound Webhook Subscription
    hook_res = await client.post(
        "/api/v1/developer/webhooks",
        headers=headers,
        json={
            "url": "https://api.partnerapp.com/v1/commerce-events",
            "events": ["order.paid.v1", "customer.created.v1"],
        },
    )
    assert hook_res.status_code == 201
    hook = hook_res.json()
    hook_id = hook["id"]
    assert hook["secret_token"].startswith("whsec_")

    # 5. Simulate Webhook Dispatch with HMAC Signature
    dispatch_res = await client.post(
        f"/api/v1/developer/webhooks/{hook_id}/test",
        headers=headers,
        json={
            "event_type": "order.paid.v1",
            "payload": {"order_id": "ORD-12345", "amount": 250.00, "status": "paid"},
        },
    )
    assert dispatch_res.status_code == 200
    delivery = dispatch_res.json()
    assert delivery["status"] == "delivered"
    assert delivery["status_code"] == 200
    assert "signature_header" in delivery["payload"]
    assert "v1=" in delivery["payload"]["signature_header"]

    # 6. Check Delivery History
    history_res = await client.get(
        f"/api/v1/developer/webhooks/{hook_id}/deliveries", headers=headers
    )
    assert history_res.status_code == 200
    deliveries = history_res.json()
    assert len(deliveries) == 1
    assert deliveries[0]["event_type"] == "order.paid.v1"
