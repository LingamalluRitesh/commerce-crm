from decimal import Decimal

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_complete_inventory_and_fulfillment_lifecycle(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "ops_director@logisticsglobal.com",
            "password": "OpsPassword123!",
            "first_name": "Marcus",
            "last_name": "Vance",
            "organization_name": "Logistics Global Corp",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Create Warehouses (East & West)
    wh_east_res = await client.post(
        "/api/v1/inventory/warehouses",
        headers=headers,
        json={
            "name": "East Coast Distribution Center",
            "code": "WH-EAST-01",
            "address_line1": "100 Portway Blvd",
            "city": "Newark",
            "state": "NJ",
            "postal_code": "07114",
            "country": "USA",
            "is_primary": True,
        },
    )
    assert wh_east_res.status_code == 201
    wh_east_id = wh_east_res.json()["id"]

    wh_west_res = await client.post(
        "/api/v1/inventory/warehouses",
        headers=headers,
        json={
            "name": "West Coast Mega Hub",
            "code": "WH-WEST-01",
            "address_line1": "500 Pacific Coast Hwy",
            "city": "Long Beach",
            "state": "CA",
            "postal_code": "90802",
            "country": "USA",
            "is_primary": False,
        },
    )
    assert wh_west_res.status_code == 201
    wh_west_id = wh_west_res.json()["id"]

    # 3. Create Product
    prod_res = await client.post(
        "/api/v1/commerce/products",
        headers=headers,
        json={
            "name": "Robotic Automation Arm",
            "sku": "ROBO-ARM-X1",
            "base_price": 5000.00,
            "description": "Industrial 6-axis precision robotic arm",
        },
    )
    assert prod_res.status_code == 201
    prod_id = prod_res.json()["id"]

    # 4. Create Supplier & Purchase Order to stock East Warehouse
    sup_res = await client.post(
        "/api/v1/inventory/suppliers",
        headers=headers,
        json={
            "name": "Robotics Manufacturing Ltd",
            "contact_name": "Akira Tanaka",
            "email": "tanaka@robotics-mfg.jp",
            "phone": "+81-3-1234-5678",
            "payment_terms": "Net 60",
        },
    )
    assert sup_res.status_code == 201
    sup_id = sup_res.json()["id"]

    po_res = await client.post(
        "/api/v1/inventory/purchase-orders",
        headers=headers,
        json={
            "supplier_id": sup_id,
            "warehouse_id": wh_east_id,
            "items": [
                {
                    "product_id": prod_id,
                    "quantity_ordered": 20,
                    "unit_cost": 2500.00,
                }
            ],
        },
    )
    assert po_res.status_code == 201
    po = po_res.json()
    po_id = po["id"]
    assert Decimal(str(po["total_amount"])) == Decimal("50000.00")

    # 5. Receive Purchase Order -> Stock increments to 20
    recv_po_res = await client.post(
        f"/api/v1/inventory/purchase-orders/{po_id}/receive",
        headers=headers,
    )
    assert recv_po_res.status_code == 200
    assert recv_po_res.json()["status"] == "received"

    # Verify East stock is 20
    stock_res = await client.get(
        f"/api/v1/inventory/stock?warehouse_id={wh_east_id}", headers=headers
    )
    assert stock_res.status_code == 200
    assert stock_res.json()[0]["quantity_on_hand"] == 20

    # 6. Inter-warehouse Transfer: Transfer 5 units from East to West
    trf_res = await client.post(
        "/api/v1/inventory/transfers",
        headers=headers,
        json={
            "source_warehouse_id": wh_east_id,
            "target_warehouse_id": wh_west_id,
            "items": [{"product_id": prod_id, "quantity": 5}],
        },
    )
    assert trf_res.status_code == 201
    trf = trf_res.json()
    trf_id = trf["id"]
    assert trf["status"] == "in_transit"

    # Check East stock decreased to 15
    east_stock = await client.get(
        f"/api/v1/inventory/stock?warehouse_id={wh_east_id}", headers=headers
    )
    assert east_stock.json()[0]["quantity_on_hand"] == 15

    # 7. Receive Transfer at West Warehouse -> West stock becomes 5
    recv_trf_res = await client.post(
        f"/api/v1/inventory/transfers/{trf_id}/receive", headers=headers
    )
    assert recv_trf_res.status_code == 200
    assert recv_trf_res.json()["status"] == "received"

    west_stock = await client.get(
        f"/api/v1/inventory/stock?warehouse_id={wh_west_id}", headers=headers
    )
    assert west_stock.json()[0]["quantity_on_hand"] == 5

    # 8. Customer Order & Fulfillment Shipping
    cust_res = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "first_name": "Elon",
            "last_name": "Musk",
            "email": "elon@tesla-corp.com",
        },
    )
    cust_id = cust_res.json()["id"]

    order_res = await client.post(
        "/api/v1/commerce/checkout",
        headers=headers,
        json={
            "customer_id": cust_id,
            "direct_items": [{"product_id": prod_id, "quantity": 1}],
        },
    )
    order_id = order_res.json()["id"]

    # Pay order
    await client.post(
        f"/api/v1/commerce/orders/{order_id}/pay",
        headers=headers,
        json={"provider": "wire_transfer"},
    )

    # Fulfill Order from West Warehouse
    fulf_res = await client.post(
        "/api/v1/inventory/fulfillments",
        headers=headers,
        json={
            "order_id": order_id,
            "warehouse_id": wh_west_id,
            "carrier": "fedex",
            "tracking_number": "794644792518",
        },
    )
    assert fulf_res.status_code == 201
    fulf = fulf_res.json()
    assert fulf["status"] == "shipped"
    assert fulf["tracking_number"] == "794644792518"

    # Check Order status advanced to SHIPPED
    ord_check = await client.get(f"/api/v1/commerce/orders/{order_id}", headers=headers)
    assert ord_check.json()["status"] == "SHIPPED"
