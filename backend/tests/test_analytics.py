from decimal import Decimal

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_executive_analytics_dashboard(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "bi_director@tableau-scale.com",
            "password": "AnalyticsPassword123!",
            "first_name": "Hans",
            "last_name": "Rosling",
            "organization_name": "Data Visuals Corp",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Seed Customer
    cust_res = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "first_name": "Sheryl",
            "last_name": "Sandberg",
            "email": "sheryl@meta-hq.com",
            "status": "active",
        },
    )
    assert cust_res.status_code == 201
    cust_id = cust_res.json()["id"]

    # 3. Seed Deal & Advance to Won ($50,000)
    pipe_res = await client.get("/api/v1/sales/pipelines", headers=headers)
    won_stage_id = [s["id"] for s in pipe_res.json()[0]["stages"] if s["is_won_stage"]][0]

    deal_res = await client.post(
        "/api/v1/sales/deals",
        headers=headers,
        json={
            "name": "Global Enterprise Social Cloud",
            "customer_id": cust_id,
            "value": 50000.00,
        },
    )
    deal_id = deal_res.json()["id"]
    await client.patch(
        f"/api/v1/sales/deals/{deal_id}/stage",
        headers=headers,
        json={"stage_id": won_stage_id},
    )

    # 4. Seed Product, Order & Pay ($1000)
    prod_res = await client.post(
        "/api/v1/commerce/products",
        headers=headers,
        json={
            "name": "Business Analytics License",
            "sku": "BI-LIC-100",
            "base_price": 1000.00,
        },
    )
    prod_id = prod_res.json()["id"]

    ord_res = await client.post(
        "/api/v1/commerce/checkout",
        headers=headers,
        json={
            "customer_id": cust_id,
            "direct_items": [{"product_id": prod_id, "quantity": 1}],
        },
    )
    ord_id = ord_res.json()["id"]
    await client.post(
        f"/api/v1/commerce/orders/{ord_id}/pay",
        headers=headers,
        json={"provider": "credit_card"},
    )

    # 5. Seed Support Ticket & Resolve with 5-Star CSAT
    tck_res = await client.post(
        "/api/v1/support/tickets",
        headers=headers,
        json={
            "customer_id": cust_id,
            "subject": "Configuring Tableau Webhook connector",
            "description": "Need assistance with JSON webhook payload format.",
            "priority": "medium",
        },
    )
    tck_id = tck_res.json()["id"]
    await client.post(
        f"/api/v1/support/tickets/{tck_id}/resolve",
        headers=headers,
        json={"satisfaction_score": 5},
    )

    # 6. Fetch Executive Analytics Dashboard
    dash_res = await client.get("/api/v1/analytics/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash = dash_res.json()

    # Sales
    assert dash["sales"]["total_deals"] == 1
    assert dash["sales"]["won_deals"] == 1
    assert Decimal(str(dash["sales"]["won_pipeline_value"])) == Decimal("50000.00")
    assert Decimal(str(dash["sales"]["win_rate_percent"])) == Decimal("100.00")

    # Commerce
    assert dash["commerce"]["total_orders"] == 1
    assert dash["commerce"]["paid_orders"] == 1
    assert Decimal(str(dash["commerce"]["total_revenue"])) == Decimal("1000.00")

    # Customers
    assert dash["customers"]["total_customers"] == 1
    assert dash["customers"]["active_customers"] == 1

    # Support
    assert dash["support"]["total_tickets"] == 1
    assert dash["support"]["resolved_tickets"] == 1
    assert Decimal(str(dash["support"]["average_csat"])) == Decimal("5.00")

    # 7. Fetch Sales Funnel
    funnel_res = await client.get("/api/v1/analytics/sales-funnel", headers=headers)
    assert funnel_res.status_code == 200
    funnel = funnel_res.json()
    assert len(funnel) >= 1
