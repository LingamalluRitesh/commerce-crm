from decimal import Decimal

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_sales_pipeline_and_deal_flow(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "sales_director@hypergrowth.com",
            "password": "SalesPassword123!",
            "first_name": "Jordan",
            "last_name": "Belfort",
            "organization_name": "Hyper Growth SaaS",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Capture Lead with scoring
    lead_res = await client.post(
        "/api/v1/sales/leads",
        headers=headers,
        json={
            "first_name": "Bruce",
            "last_name": "Wayne",
            "email": "bruce@wayneenterprises.com",
            "phone": "+1-555-0900",
            "company_name": "Wayne Enterprises",
            "source": "referral",
        },
    )
    assert lead_res.status_code == 201
    lead_data = lead_res.json()
    lead_id = lead_data["id"]
    assert lead_data["score"] >= 80  # high score due to business domain, company, referral

    # 3. Convert Lead to Customer and Deal
    convert_res = await client.post(
        f"/api/v1/sales/leads/{lead_id}/convert",
        headers=headers,
        json={
            "create_deal": True,
            "deal_name": "Enterprise AI Security Suite",
            "deal_value": 75000.00,
        },
    )
    assert convert_res.status_code == 200
    conv_data = convert_res.json()
    cust_id = conv_data["customer"]["id"]
    deal_id = conv_data["deal_id"]
    assert deal_id is not None

    # 4. Fetch Pipelines & Stages
    pipe_res = await client.get("/api/v1/sales/pipelines", headers=headers)
    assert pipe_res.status_code == 200
    pipelines = pipe_res.json()
    assert len(pipelines) >= 1
    stages = pipelines[0]["stages"]
    stage_map = {s["name"]: s["id"] for s in stages}
    assert "Discovery" in stage_map
    assert "Closed Won" in stage_map

    # 5. Generate a Formal Quote for the Deal
    quote_res = await client.post(
        "/api/v1/sales/quotes",
        headers=headers,
        json={
            "deal_id": deal_id,
            "items": [
                {
                    "title": "CommerceCRM Enterprise License (Annual)",
                    "description": "Unlimited seats + dedicated AI pipeline",
                    "unit_price": 50000.00,
                    "quantity": 1,
                },
                {
                    "title": "Enterprise Implementation & Training",
                    "description": "Dedicated solution architect onboarding",
                    "unit_price": 25000.00,
                    "quantity": 1,
                },
            ],
            "discount_amount": 5000.00,
            "tax_rate_percent": 10.00,
        },
    )
    assert quote_res.status_code == 201
    quote = quote_res.json()
    assert Decimal(str(quote["subtotal"])) == Decimal("75000.00")
    assert Decimal(str(quote["discount_amount"])) == Decimal("5000.00")
    # Subtotal (75,000) - Discount (5,000) = 70,000 * 10% tax = 7,000 tax => Total = 77,000
    assert Decimal(str(quote["tax_amount"])) == Decimal("7000.00")
    assert Decimal(str(quote["total_amount"])) == Decimal("77000.00")
    assert len(quote["items"]) == 2

    # 6. Advance Deal to Closed Won
    won_stage_id = stage_map["Closed Won"]
    stage_res = await client.patch(
        f"/api/v1/sales/deals/{deal_id}/stage",
        headers=headers,
        json={"stage_id": won_stage_id},
    )
    assert stage_res.status_code == 200
    deal_updated = stage_res.json()
    assert deal_updated["status"] == "won"
    assert deal_updated["probability"] == 100

    # 7. Verify Customer Lifetime Value was updated to 75,000
    cust_res = await client.get(f"/api/v1/customers/{cust_id}", headers=headers)
    assert cust_res.status_code == 200
    assert Decimal(str(cust_res.json()["customer"]["lifetime_value"])) == Decimal("75000.00")
