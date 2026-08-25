from decimal import Decimal

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_marketing_campaigns_and_segmentation(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "cmo@growthscale.com",
            "password": "MarketingPassword123!",
            "first_name": "Gary",
            "last_name": "Vee",
            "organization_name": "GrowthScale Media",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Seed Customers with differing health scores
    # VIP Customer (Score 95, Active)
    vip_res = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "first_name": "Warren",
            "last_name": "Buffett",
            "email": "warren@berkshire.com",
            "status": "active",
        },
    )
    assert vip_res.status_code == 201
    vip_id = vip_res.json()["id"]
    await client.patch(f"/api/v1/customers/{vip_id}", headers=headers, json={"health_score": 95})

    # Churned Customer (Score 30, Churned)
    churn_res = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "status": "churned",
        },
    )
    assert churn_res.status_code == 201
    churn_id = churn_res.json()["id"]
    await client.patch(f"/api/v1/customers/{churn_id}", headers=headers, json={"health_score": 30})

    # 3. Create Dynamic Segment (VIP Customers: status == 'active' & health_score >= 80)
    seg_res = await client.post(
        "/api/v1/marketing/segments",
        headers=headers,
        json={
            "name": "VIP Enterprise Champions",
            "type": "dynamic",
            "criteria": {"status": "active", "health_score_gte": 80},
        },
    )
    assert seg_res.status_code == 201
    seg_id = seg_res.json()["id"]

    # 4. Evaluate Segment -> Must only return Warren, not John
    seg_custs_res = await client.get(
        f"/api/v1/marketing/segments/{seg_id}/customers", headers=headers
    )
    assert seg_custs_res.status_code == 200
    seg_custs = seg_custs_res.json()
    assert len(seg_custs) == 1
    assert seg_custs[0]["email"] == "warren@berkshire.com"

    # 5. Create Template
    tmpl_res = await client.post(
        "/api/v1/marketing/templates",
        headers=headers,
        json={
            "name": "Executive VIP Exclusive Announcement",
            "channel": "email",
            "subject": "Exclusive Enterprise Preview: {{first_name}}",
            "body": (
                "Hello {{first_name}}, as a valued partner at {{company_name}}, "
                "we invite you to our AI Keynote."
            ),
            "variables": ["first_name", "company_name"],
        },
    )
    assert tmpl_res.status_code == 201
    tmpl_id = tmpl_res.json()["id"]

    # 6. Create & Dispatch Campaign
    camp_res = await client.post(
        "/api/v1/marketing/campaigns",
        headers=headers,
        json={
            "name": "Q4 VIP Exclusive AI Keynote",
            "channel": "email",
            "segment_id": seg_id,
            "template_id": tmpl_id,
            "subject": "Exclusive Enterprise Preview",
            "content": "Full HTML Keynote content and access passes.",
        },
    )
    assert camp_res.status_code == 201
    camp_id = camp_res.json()["id"]

    # Send Campaign
    send_res = await client.post(f"/api/v1/marketing/campaigns/{camp_id}/send", headers=headers)
    assert send_res.status_code == 200
    send_data = send_res.json()
    assert send_data["status"] == "completed"
    assert send_data["recipients_count"] == 1

    # 7. Create and Validate Promotional Discount Codes
    # 20% off for orders over $500
    disc_res = await client.post(
        "/api/v1/marketing/discounts",
        headers=headers,
        json={
            "code": "GROWTH20",
            "discount_type": "percentage",
            "value": 20.00,
            "min_order_value": 500.00,
            "max_uses": 100,
        },
    )
    assert disc_res.status_code == 201

    # Validate for order of $1000 -> 20% discount = $200
    val_res = await client.post(
        "/api/v1/marketing/discounts/validate",
        headers=headers,
        json={"code": "GROWTH20", "order_subtotal": 1000.00},
    )
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["valid"] is True
    assert Decimal(str(val_data["discount_amount"])) == Decimal("200.00")

    # Validate for order under minimum ($300) -> invalid
    invalid_val_res = await client.post(
        "/api/v1/marketing/discounts/validate",
        headers=headers,
        json={"code": "GROWTH20", "order_subtotal": 300.00},
    )
    assert invalid_val_res.status_code == 200
    assert invalid_val_res.json()["valid"] is False
