"""
End-to-End Commerce CRM Pricing, Churn Prediction & Tokenization Test Suite.
Validates Tiered Pricing Rules, RFM Metrics, and PCI-DSS Compliant Card Tokenization.
"""

import pytest
from app.application.services.discount_pricing_engine import DiscountPricingEngine
from app.application.services.churn_ltv_service import CustomerChurnLtvService
from app.application.services.payment_token_shield import PaymentTokenShield


def test_e2e_commerce_crm_workflow():
    # 1. Volume Tiered Line-Item Pricing Calculation
    pricing_engine = DiscountPricingEngine(max_allowable_discount_pct=0.40)
    line_item = pricing_engine.calculate_line_item_price(
        sku="SKU_ENTERPRISE_SERVER",
        unit_price=250.0,
        quantity=60,
        coupon_code="SUMMER20",
    )
    assert line_item["gross_total"] == 15000.0
    assert line_item["volume_discount_amount"] == 2250.0
    assert line_item["net_total"] > 0

    # 2. Customer Churn & LTV Assessment
    churn_service = CustomerChurnLtvService()
    rfm = churn_service.compute_rfm_metrics(
        days_since_last_order=15,
        total_orders=12,
        total_spend=line_item["net_total"],
        avg_support_tickets_per_month=0.5,
    )
    assert rfm["churn_risk_tier"] == "LOW_CHURN_RISK"
    assert rfm["projected_ltv"] > 10000.0

    # 3. Payment Tokenization
    token_shield = PaymentTokenShield()
    token_info = token_shield.tokenize_card(
        card_number="4111111111111111",
        cardholder_name="Enterprise Billing Corp",
        exp_month=11,
        exp_year=2027,
    )
    assert token_info["masked_pan"] == "411111******1111"
    assert token_info["status"] == "TOKENIZED_ACTIVE"
