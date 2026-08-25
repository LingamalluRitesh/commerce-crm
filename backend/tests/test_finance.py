from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_complete_finance_and_projects_lifecycle(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "cfo@enterprisefinance.com",
            "password": "FinancePassword123!",
            "first_name": "Ray",
            "last_name": "Dalio",
            "organization_name": "Bridgewater Cloud OS",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Create Customer
    cust_res = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "first_name": "Jensen",
            "last_name": "Huang",
            "email": "jensen@nvidia-hq.com",
            "status": "active",
        },
    )
    assert cust_res.status_code == 201
    cust_id = cust_res.json()["id"]

    # 3. Create Commercial Invoice
    # 2 servers @ $5000 = $10,000 + 10% tax = $11,000
    due = (datetime.now(UTC) + timedelta(days=30)).isoformat()
    inv_res = await client.post(
        "/api/v1/finance/invoices",
        headers=headers,
        json={
            "customer_id": cust_id,
            "due_date": due,
            "items": [
                {
                    "description": "GPU Accelerated Cloud Node",
                    "quantity": 2,
                    "unit_price": 5000.00,
                }
            ],
            "tax_rate_percent": 10.00,
        },
    )
    assert inv_res.status_code == 201
    inv = inv_res.json()
    inv_id = inv["id"]
    assert Decimal(str(inv["subtotal"])) == Decimal("10000.00")
    assert Decimal(str(inv["tax_amount"])) == Decimal("1000.00")
    assert Decimal(str(inv["total_amount"])) == Decimal("11000.00")
    assert Decimal(str(inv["paid_amount"])) == Decimal("0.00")
    assert inv["status"] == "sent"

    # 4. Pay Invoice
    pay_res = await client.post(
        f"/api/v1/finance/invoices/{inv_id}/pay",
        headers=headers,
        json={"amount": 11000.00},
    )
    assert pay_res.status_code == 200
    paid_inv = pay_res.json()
    assert paid_inv["status"] == "paid"
    assert Decimal(str(paid_inv["paid_amount"])) == Decimal("11000.00")

    # Verify Customer Lifetime Value was updated to $11,000
    cust_check = await client.get(f"/api/v1/customers/{cust_id}", headers=headers)
    assert Decimal(str(cust_check.json()["customer"]["lifetime_value"])) == Decimal("11000.00")

    # 5. Create SaaS Recurring Subscription
    sub_res = await client.post(
        "/api/v1/finance/subscriptions",
        headers=headers,
        json={
            "customer_id": cust_id,
            "plan_name": "AI Supercluster Tier",
            "billing_interval": "monthly",
            "amount": 2500.00,
        },
    )
    assert sub_res.status_code == 201
    sub = sub_res.json()
    assert sub["status"] == "active"
    assert Decimal(str(sub["amount"])) == Decimal("2500.00")

    # 6. Create Project & Tasks
    proj_res = await client.post(
        "/api/v1/projects",
        headers=headers,
        json={
            "name": "NVIDIA GPU Cluster Onboarding",
            "customer_id": cust_id,
            "budget_amount": 50000.00,
        },
    )
    assert proj_res.status_code == 201
    proj = proj_res.json()
    proj_id = proj["id"]
    assert Decimal(str(proj["budget_amount"])) == Decimal("50000.00")
    assert Decimal(str(proj["spent_amount"])) == Decimal("0.00")

    task_res = await client.post(
        f"/api/v1/projects/{proj_id}/tasks",
        headers=headers,
        json={
            "title": "Hardware Rack Installation & InfiniBand Wiring",
            "estimated_hours": 40.0,
            "priority": "high",
        },
    )
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]

    # 7. Log Billable Time Entry (10 hours @ $200/hr = $2000 spent)
    time_res = await client.post(
        "/api/v1/projects/time-entries",
        headers=headers,
        json={
            "project_id": proj_id,
            "task_id": task_id,
            "hours": 10.0,
            "hourly_rate": 200.00,
            "description": "Completed physical transceiver testing.",
        },
    )
    assert time_res.status_code == 201
    assert Decimal(str(time_res.json()["hours"])) == Decimal("10.00")

    # Verify project spent amount is updated to $2000
    proj_check = await client.get("/api/v1/projects", headers=headers)
    assert proj_check.status_code == 200
    p_data = proj_check.json()[0]
    assert Decimal(str(p_data["spent_amount"])) == Decimal("2000.00")
    assert Decimal(str(p_data["tasks"][0]["logged_hours"])) == Decimal("10.00")
