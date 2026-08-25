from decimal import Decimal

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_b2b_tiered_pricing_engine(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "pricing_lead@intel-scale.com",
            "password": "PricingPass123!",
            "first_name": "Gordon",
            "last_name": "Moore",
            "organization_name": "Semiconductor Pricing Corp",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Create Category & Product
    cat_res = await client.post(
        "/api/v1/commerce/categories",
        headers=headers,
        json={"name": "Silicon Compute", "slug": "silicon-compute"},
    )
    cat_id = cat_res.json()["id"]

    prod_res = await client.post(
        "/api/v1/commerce/products",
        headers=headers,
        json={
            "category_id": cat_id,
            "name": "Xeon Enterprise Accelerator",
            "slug": "xeon-enterprise-accelerator",
            "sku": "XN-ACCEL-01",
            "base_price": "1000.00",
            "currency": "USD",
        },
    )
    prod_id = prod_res.json()["id"]

    # 3. Create Tiered Price List
    plist_res = await client.post(
        "/api/v1/pricing/price-lists",
        headers=headers,
        json={
            "name": "Global Volume Discount 2026",
            "code": "VOL_DISC_2026",
            "currency": "USD",
            "is_default": True,
            "tiers": [
                {
                    "product_id": prod_id,
                    "min_quantity": 10,
                    "max_quantity": 49,
                    "unit_price": "900.00",
                    "discount_percentage": "10.00",
                },
                {
                    "product_id": prod_id,
                    "min_quantity": 50,
                    "unit_price": "800.00",
                    "discount_percentage": "20.00",
                },
            ],
        },
    )
    assert plist_res.status_code == 201
    plist = plist_res.json()
    assert len(plist["tiers"]) == 2

    # 4. Calculate Price for Single Item (Base price: 1000.00)
    calc1 = await client.post(
        "/api/v1/pricing/calculate",
        headers=headers,
        json={"product_id": prod_id, "quantity": 1},
    )
    assert calc1.status_code == 200
    assert Decimal(str(calc1.json()["total_net_price"])) == Decimal("1000.00")

    # 5. Calculate Price for 15 Items (Tier 1: 10% discount on 900.00 = 810.00 unit price)
    calc2 = await client.post(
        "/api/v1/pricing/calculate",
        headers=headers,
        json={"product_id": prod_id, "quantity": 15},
    )
    assert calc2.status_code == 200
    res2 = calc2.json()
    assert Decimal(str(res2["effective_unit_price"])) == Decimal("810.00")
    assert Decimal(str(res2["total_net_price"])) == Decimal("12150.00")
