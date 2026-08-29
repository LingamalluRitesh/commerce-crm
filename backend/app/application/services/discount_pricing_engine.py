"""
Tiered Volume Discount & Promotional Coupon Pricing Engine.
Calculates quantity break brackets, percentage coupons, and maximum allowable discount caps.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field


@dataclass
class VolumeTier:
    min_quantity: int
    discount_percentage: float  # e.g. 0.10 for 10%


class DiscountPricingEngine:
    """Calculates effective cart line-item pricing under volume tiers and coupon promotions."""

    def __init__(self, max_allowable_discount_pct: float = 0.50):
        self.max_discount_pct = max_allowable_discount_pct
        self.volume_tiers: Dict[str, List[VolumeTier]] = {
            "DEFAULT": [
                VolumeTier(min_quantity=10, discount_percentage=0.05),
                VolumeTier(min_quantity=50, discount_percentage=0.15),
                VolumeTier(min_quantity=100, discount_percentage=0.25),
            ]
        }
        self.active_coupons: Dict[str, Dict[str, Any]] = {
            "SUMMER20": {"type": "PERCENTAGE", "value": 0.20},
            "SAVE50": {"type": "FIXED_AMOUNT", "value": 50.0},
        }

    def register_product_tiers(self, sku: str, tiers: List[VolumeTier]) -> None:
        self.volume_tiers[sku] = sorted(tiers, key=lambda t: t.min_quantity, reverse=True)

    def calculate_line_item_price(
        self,
        sku: str,
        unit_price: float,
        quantity: int,
        coupon_code: Optional[str] = None,
    ) -> Dict[str, Any]:
        gross_total = unit_price * quantity
        tiers = self.volume_tiers.get(sku, self.volume_tiers.get("DEFAULT", []))

        # 1. Volume discount
        volume_discount_pct = 0.0
        for tier in sorted(tiers, key=lambda t: t.min_quantity, reverse=True):
            if quantity >= tier.min_quantity:
                volume_discount_pct = tier.discount_percentage
                break

        volume_discount_amount = gross_total * volume_discount_pct

        # 2. Coupon discount
        coupon_discount_amount = 0.0
        if coupon_code and coupon_code.upper() in self.active_coupons:
            coupon = self.active_coupons[coupon_code.upper()]
            if coupon["type"] == "PERCENTAGE":
                coupon_discount_amount = (gross_total - volume_discount_amount) * coupon["value"]
            elif coupon["type"] == "FIXED_AMOUNT":
                coupon_discount_amount = min(gross_total - volume_discount_amount, coupon["value"])

        total_discount = volume_discount_amount + coupon_discount_amount
        # Enforce maximum discount safety cap
        max_discount_allowed = gross_total * self.max_discount_pct
        effective_discount = min(total_discount, max_discount_allowed)
        net_total = round(gross_total - effective_discount, 2)

        return {
            "sku": sku,
            "quantity": quantity,
            "unit_price": unit_price,
            "gross_total": round(gross_total, 2),
            "volume_discount_amount": round(volume_discount_amount, 2),
            "coupon_discount_amount": round(coupon_discount_amount, 2),
            "total_discount_amount": round(effective_discount, 2),
            "net_total": net_total,
            "effective_unit_price": round(net_total / quantity, 2),
        }
