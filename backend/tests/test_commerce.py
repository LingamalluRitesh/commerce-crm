from decimal import Decimal

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_complete_commerce_order_lifecycle(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "commerce_head@omnichannel.com",
            "password": "CommercePassword123!",
            "first_name": "Jeff",
            "last_name": "Bezos",
            "organization_name": "OmniChannel Retail",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Create Category
    cat_res = await client.post(
        "/api/v1/commerce/categories",
        headers=headers,
        json={"name": "Enterprise Hardware", "description": "Edge computing & servers"},
    )
    assert cat_res.status_code == 201
    cat_id = cat_res.json()["id"]

    # 3. Create Product with Variants
    prod_res = await client.post(
        "/api/v1/commerce/products",
        headers=headers,
        json={
            "category_id": cat_id,
            "name": "Cloud Edge Gateway",
            "sku": "CEG-1000",
            "base_price": 1200.00,
            "description": "High-throughput IoT and AI inference gateway",
            "variants": [
                {
                    "name": "Cloud Edge Gateway (32GB RAM)",
                    "sku": "CEG-1000-32GB",
                    "price_override": 1500.00,
                    "attributes": {"ram": "32GB"},
                }
            ],
        },
    )
    assert prod_res.status_code == 201
    prod = prod_res.json()
    prod_id = prod["id"]
    variant_id = prod["variants"][0]["id"]

    # 4. Create Customer
    cust_res = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "first_name": "Satya",
            "last_name": "Nadella",
            "email": "satya@microsoft-corp.com",
            "status": "active",
        },
    )
    assert cust_res.status_code == 201
    cust_id = cust_res.json()["id"]

    # 5. Checkout direct items (Quantity: 2 of 32GB variant @ $1500 each = $3000 subtotal)
    # Discount: $200, Tax Rate: 10%, Shipping: $50
    # Taxable = $2800 * 10% = $280 => Total = $2800 + $280 + $50 = $3130.00
    checkout_res = await client.post(
        "/api/v1/commerce/checkout",
        headers=headers,
        json={
            "customer_id": cust_id,
            "direct_items": [{"product_id": prod_id, "variant_id": variant_id, "quantity": 2}],
            "discount_amount": 200.00,
            "shipping_amount": 50.00,
            "tax_rate_percent": 10.00,
        },
    )
    assert checkout_res.status_code == 201
    order = checkout_res.json()
    order_id = order["id"]
    assert order["status"] == "CREATED"
    assert order["payment_status"] == "pending"
    assert Decimal(str(order["subtotal"])) == Decimal("3000.00")
    assert Decimal(str(order["discount_amount"])) == Decimal("200.00")
    assert Decimal(str(order["tax_amount"])) == Decimal("280.00")
    assert Decimal(str(order["shipping_amount"])) == Decimal("50.00")
    assert Decimal(str(order["total_amount"])) == Decimal("3130.00")
    assert len(order["items"]) == 1

    # 6. Process Payment for Order
    pay_res = await client.post(
        f"/api/v1/commerce/orders/{order_id}/pay",
        headers=headers,
        json={"provider": "stripe", "provider_transaction_id": "ch_3MtwBwLkdIwHu7ix28a3tqZ1"},
    )
    assert pay_res.status_code == 200
    paid_order = pay_res.json()
    assert paid_order["status"] == "PAID"
    assert paid_order["payment_status"] == "paid"
    assert len(paid_order["payments"]) == 1

    # 7. Verify Customer Lifetime Value was updated to $3130.00
    cust_check = await client.get(f"/api/v1/customers/{cust_id}", headers=headers)
    assert Decimal(str(cust_check.json()["customer"]["lifetime_value"])) == Decimal("3130.00")

    # 8. Test State Machine Transitions (PAID -> PROCESSING -> SHIPPED -> DELIVERED)
    proc_res = await client.post(
        f"/api/v1/commerce/orders/{order_id}/status",
        headers=headers,
        json={"new_status": "PROCESSING"},
    )
    assert proc_res.status_code == 200
    assert proc_res.json()["status"] == "PROCESSING"

    ship_res = await client.post(
        f"/api/v1/commerce/orders/{order_id}/status",
        headers=headers,
        json={"new_status": "SHIPPED"},
    )
    assert ship_res.status_code == 200
    assert ship_res.json()["status"] == "SHIPPED"

    # Test Invalid State Transition (e.g. cannot transition from SHIPPED directly to CREATED)
    invalid_res = await client.post(
        f"/api/v1/commerce/orders/{order_id}/status",
        headers=headers,
        json={"new_status": "CREATED"},
    )
    assert invalid_res.status_code == 422

    # 9. Deliver Order
    deliv_res = await client.post(
        f"/api/v1/commerce/orders/{order_id}/status",
        headers=headers,
        json={"new_status": "DELIVERED"},
    )
    assert deliv_res.status_code == 200
    assert deliv_res.json()["status"] == "DELIVERED"

    # 10. Process Refund
    refund_res = await client.post(
        f"/api/v1/commerce/orders/{order_id}/refund",
        headers=headers,
        json={"reason": "Executive unit return request"},
    )
    assert refund_res.status_code == 200
    refunded_order = refund_res.json()
    assert refunded_order["status"] == "REFUNDED"
    assert refunded_order["payment_status"] == "refunded"

    # Verify Customer Lifetime Value decremented back to 0.00
    cust_after_refund = await client.get(f"/api/v1/customers/{cust_id}", headers=headers)
    assert Decimal(str(cust_after_refund.json()["customer"]["lifetime_value"])) == Decimal("0.00")
