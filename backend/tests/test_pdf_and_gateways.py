from decimal import Decimal

import pytest

from app.application.services.messaging_providers import MultiChannelDispatcher
from app.application.services.payment_gateways import (
    PayPalPaymentGateway,
    StripePaymentGateway,
    WireTransferPaymentGateway,
)
from app.application.services.pdf import PDFDocumentService


@pytest.mark.asyncio
async def test_pdf_rendering_and_payment_gateways():
    # 1. Test Commercial Invoice PDF Rendering
    payload = PDFDocumentService.export_invoice_base64_payload(
        invoice_number="INV-2026-9999",
        customer_name="Stripe Global Inc",
        customer_email="billing@stripe.com",
        issue_date="2026-08-25",
        due_date="2026-09-25",
        status="paid",
        items=[
            {
                "description": "Enterprise SaaS Core (500 Seats)",
                "quantity": 1,
                "unit_price": 50000.00,
                "total_amount": 50000.00,
            }
        ],
        subtotal=Decimal("50000.00"),
        tax_rate=Decimal("8.00"),
        tax_amount=Decimal("4000.00"),
        total_gross=Decimal("54000.00"),
    )
    assert payload["invoice_number"] == "INV-2026-9999"
    assert len(payload["base64_content"]) > 100

    # 2. Test Stripe Payment Gateway Adapter
    stripe_gw = StripePaymentGateway()
    charge = await stripe_gw.create_charge(
        amount=Decimal("54000.00"),
        currency="USD",
        customer_id="cust_123",
        description="Invoice INV-2026-9999",
        idempotency_key="idemp_key_123",
    )
    assert charge["status"] == "succeeded"
    assert charge["gateway"] == "stripe"

    # 3. Test PayPal Gateway Adapter
    paypal_gw = PayPalPaymentGateway()
    pp_charge = await paypal_gw.create_charge(
        amount=Decimal("1200.00"),
        currency="USD",
        customer_id="cust_456",
        description="Consulting Package",
        idempotency_key="idemp_key_456",
    )
    assert pp_charge["status"] == "COMPLETED"

    # 4. Test Wire Gateway
    wire_gw = WireTransferPaymentGateway()
    wire_charge = await wire_gw.create_charge(
        amount=Decimal("100000.00"),
        currency="USD",
        customer_id="cust_789",
        description="Custom Data Center Cluster",
        idempotency_key="idemp_key_789",
    )
    assert wire_charge["status"] == "PENDING_SETTLEMENT"

    # 5. Test Multi-Channel Dispatcher
    dispatcher = MultiChannelDispatcher()
    email_res = await dispatcher.dispatch(
        channel="email",
        recipient="ceo@enterprise.com",
        subject="Monthly Performance KPI",
        content="All SLAs maintained at 99.9%.",
    )
    assert email_res["status"] == "delivered"
