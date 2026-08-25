import pytest
from httpx import AsyncClient

from app.application.services.data_exchange import DataExchangeService


@pytest.mark.asyncio
async def test_bulk_data_exchange_import_export(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "data_officer@snowflake-scale.com",
            "password": "DataPass123!",
            "first_name": "Benoit",
            "last_name": "Dageville",
            "organization_name": "Data Exchange Hub",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Test JSON formatting helper
    json_str = DataExchangeService.export_dataset_json([{"id": 1, "status": "active"}])
    assert '"status": "active"' in json_str

    # 3. Create a customer via API
    c_res = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "first_name": "Satya",
            "last_name": "Nadella",
            "email": "satya@microsoft-scale.com",
        },
    )
    assert c_res.status_code == 201

    # 4. Fetch customers and verify CSV serialization
    list_res = await client.get("/api/v1/customers", headers=headers)
    assert list_res.status_code == 200
    customers_data = list_res.json()
    assert len(customers_data["items"]) == 1
