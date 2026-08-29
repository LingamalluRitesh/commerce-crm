import pytest
from app.application.services.discount_pricing_engine import DiscountPricingEngine, VolumeTier


def test_volume_tier_pricing():
    engine = DiscountPricingEngine(max_allowable_discount_pct=0.50)
    # 50 units of $100 product -> 15% tier discount
    res = engine.calculate_line_item_price("SKU_WIDGET", unit_price=100.0, quantity=50)
    assert res["gross_total"] == 5000.0
    assert res["volume_discount_amount"] == 750.0
    assert res["net_total"] == 4250.0


def test_stacked_coupon_and_max_cap():
    engine = DiscountPricingEngine(max_allowable_discount_pct=0.30) # Max 30% discount
    # 100 units at $10 -> 25% volume discount ($250) + 20% coupon on remaining ($150) = $400 total (40%)
    # Cap restricts total discount to 30% ($300)
    res = engine.calculate_line_item_price("SKU_PROMO", unit_price=10.0, quantity=100, coupon_code="SUMMER20")
    assert res["gross_total"] == 1000.0
    assert res["total_discount_amount"] == 300.0
    assert res["net_total"] == 700.0
