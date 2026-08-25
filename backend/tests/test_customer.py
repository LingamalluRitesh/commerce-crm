import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_customer_360_lifecycle(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "sales_lead@globaltech.com",
            "password": "GlobalPassword123!",
            "first_name": "Sarah",
            "last_name": "Connor",
            "organization_name": "Global Tech Industries",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Create Company
    comp_res = await client.post(
        "/api/v1/companies",
        headers=headers,
        json={
            "name": "Stark Industries",
            "domain": "starkindustries.com",
            "industry": "Defense & Energy",
            "size": "1000+",
            "annual_revenue": 50000000.00,
        },
    )
    assert comp_res.status_code == 201
    comp_id = comp_res.json()["id"]

    # 3. Create Customer associated with company
    cust_res = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "type": "business",
            "first_name": "Tony",
            "last_name": "Stark",
            "email": "tony@starkindustries.com",
            "phone": "+1-555-0199",
            "company_id": comp_id,
            "status": "active",
        },
    )
    assert cust_res.status_code == 201
    cust_data = cust_res.json()
    cust_id = cust_data["id"]
    assert cust_data["email"] == "tony@starkindustries.com"
    assert cust_data["health_score"] == 100

    # 4. Add Customer Address
    addr_res = await client.post(
        f"/api/v1/customers/{cust_id}/addresses",
        headers=headers,
        json={
            "type": "shipping",
            "line1": "10880 Malibu Point",
            "city": "Malibu",
            "state": "CA",
            "postal_code": "90265",
            "country": "USA",
            "is_default": True,
        },
    )
    assert addr_res.status_code == 201
    assert addr_res.json()["city"] == "Malibu"

    # 5. Log Timeline Interaction (Call)
    inter_res = await client.post(
        f"/api/v1/customers/{cust_id}/interactions",
        headers=headers,
        json={
            "channel": "call",
            "direction": "outbound",
            "subject": "Executive Quarter Strategy Alignment",
            "body": "Discussed Q4 expansion and deployment of clean energy arc reactors.",
            "sentiment": "positive",
        },
    )
    assert inter_res.status_code == 201
    assert inter_res.json()["sentiment"] == "positive"

    # 6. Fetch Full Customer 360 Aggregated Profile
    c360_res = await client.get(
        f"/api/v1/customers/{cust_id}",
        headers=headers,
    )
    assert c360_res.status_code == 200
    c360 = c360_res.json()
    assert c360["customer"]["email"] == "tony@starkindustries.com"
    assert c360["company"]["name"] == "Stark Industries"
    assert len(c360["addresses"]) == 1
    assert len(c360["recent_interactions"]) == 1
    assert c360["preference"]["email_opt_in"] is True
    assert c360["summary_metrics"]["total_interactions"] == 1

    # 7. Update Customer Health & Status
    patch_res = await client.patch(
        f"/api/v1/customers/{cust_id}",
        headers=headers,
        json={"health_score": 95, "status": "active"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["health_score"] == 95

    # 8. List & Search Customers
    search_res = await client.get(
        "/api/v1/customers?q=Tony&status=active",
        headers=headers,
    )
    assert search_res.status_code == 200
    items = search_res.json()["items"]
    assert len(items) == 1
    assert items[0]["first_name"] == "Tony"


@pytest.mark.asyncio
async def test_cross_tenant_customer_isolation(client: AsyncClient):
    # Org 1
    res1 = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@org-one.com",
            "password": "Password123!",
            "first_name": "Admin",
            "last_name": "One",
            "organization_name": "Org One",
        },
    )
    token1 = res1.json()["access_token"]
    org1_id = res1.json()["active_organization_id"]

    cust1 = await client.post(
        "/api/v1/customers",
        headers={"Authorization": f"Bearer {token1}", "X-Organization-ID": org1_id},
        json={
            "first_name": "Secret",
            "last_name": "Customer",
            "email": "secret@org-one.com",
        },
    )
    cust1_id = cust1.json()["id"]

    # Org 2
    res2 = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@org-two.com",
            "password": "Password123!",
            "first_name": "Admin",
            "last_name": "Two",
            "organization_name": "Org Two",
        },
    )
    token2 = res2.json()["access_token"]
    org2_id = res2.json()["active_organization_id"]

    # User from Org 2 attempts to fetch Customer from Org 1
    cross_res = await client.get(
        f"/api/v1/customers/{cust1_id}",
        headers={"Authorization": f"Bearer {token2}", "X-Organization-ID": org2_id},
    )
    # Must be 404 (or 403) within Org 2's tenant context
    assert cross_res.status_code in [403, 404]
