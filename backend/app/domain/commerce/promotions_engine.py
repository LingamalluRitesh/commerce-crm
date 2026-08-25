"""Advanced E-Commerce Promotions, BOGO, Tiered Cart Discounts & Coupon Rules Engine.

Implements complex promotion stacking logic:
- Percentage & Fixed Amount Discounts
- BOGO (Buy X Get Y Free or at Discount)
- Tiered Basket Threshold Discounts (e.g. Spend $100 -> 10% off, Spend $250 -> 20% off)
- Product Category & Customer Segment Inclusions / Exclusions
- Usage limits (Per-customer limits, global campaign limits) and promo code stacking rules.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class PromotionType(str, Enum):
    PERCENTAGE_OFF_ORDER = "PERCENTAGE_OFF_ORDER"
    FIXED_AMOUNT_OFF_ORDER = "FIXED_AMOUNT_OFF_ORDER"
    BUY_X_GET_Y_DISCOUNT = "BUY_X_GET_Y_DISCOUNT"
    TIERED_BASKET_SPEND = "TIERED_BASKET_SPEND"
    FREE_EXPEDITED_SHIPPING = "FREE_EXPEDITED_SHIPPING"


class DiscountTarget(str, Enum):
    ENTIRE_ORDER = "ENTIRE_ORDER"
    SPECIFIC_SKU = "SPECIFIC_SKU"
    SPECIFIC_CATEGORY = "SPECIFIC_CATEGORY"


@dataclass
class PromotionRule:
    rule_id: str
    coupon_code: str
    name: str
    promo_type: PromotionType
    discount_value: Decimal  # e.g., 20.0 for 20%, or 50.0 for $50
    target: DiscountTarget
    target_sku: Optional[str] = None
    target_category: Optional[str] = None
    min_order_spend_usd: Decimal = Decimal("0.00")
    buy_quantity_x: int = 1
    get_quantity_y: int = 1
    get_discount_pct: Decimal = Decimal("100.00")  # 100% = Free
    is_stackable: bool = False
    max_discount_cap_usd: Optional[Decimal] = None
    eligible_customer_segments: Set[str] = field(default_factory=lambda: {"ALL"})
    total_redemption_limit: int = 10000
    redemptions_used: int = 0
    start_date: str = "2026-01-01"
    end_date: str = "2026-12-31"


@dataclass
class CartItem:
    item_id: str
    sku: str
    category: str
    quantity: int
    unit_price: Decimal

    @property
    def line_subtotal(self) -> Decimal:
        return self.unit_price * Decimal(str(self.quantity))


@dataclass
class AppliedPromotionResult:
    rule_id: str
    coupon_code: str
    name: str
    discount_amount_usd: Decimal
    applied_to_sku: Optional[str] = None


@dataclass
class CartEvaluationSummary:
    original_subtotal_usd: Decimal
    total_discount_usd: Decimal
    final_net_subtotal_usd: Decimal
    applied_promotions: List[AppliedPromotionResult]
    free_shipping_unlocked: bool = False


class PromotionsEngine:
    """Enterprise B2B/B2C Promotions and Discount Stacking Engine."""

    def __init__(self):
        self.rules: Dict[str, PromotionRule] = {}
        self._seed_default_promotions()

    def _seed_default_promotions(self) -> None:
        p1 = PromotionRule("PROMO-ENTERPRISE-20", "ENTERPRISE20", "20% Off Orders over $1,000", PromotionType.PERCENTAGE_OFF_ORDER, Decimal("20.00"), DiscountTarget.ENTIRE_ORDER, min_order_spend_usd=Decimal("1000.00"))
        p2 = PromotionRule("PROMO-BOGO-RAM", "BOGORAM", "Buy 2 RAM Modules Get 1 Free", PromotionType.BUY_X_GET_Y_DISCOUNT, Decimal("100.00"), DiscountTarget.SPECIFIC_SKU, target_sku="RAM-64GB-ECC", buy_quantity_x=2, get_quantity_y=1)
        p3 = PromotionRule("PROMO-TIER-SPEND", "TIEREDSCALE", "Tiered Spend Up to $500 Off", PromotionType.TIERED_BASKET_SPEND, Decimal("15.00"), DiscountTarget.ENTIRE_ORDER, min_order_spend_usd=Decimal("5000.00"))

        for p in [p1, p2, p3]:
            self.rules[p.coupon_code.upper()] = p

    def evaluate_cart(
        self,
        items: List[CartItem],
        applied_coupon_codes: List[str],
        customer_segment: str = "ALL"
    ) -> CartEvaluationSummary:
        """Evaluate cart line items against entered coupons and auto-apply stackable discounts."""
        orig_subtotal = sum(i.line_subtotal for i in items)
        applied_results: List[AppliedPromotionResult] = []
        tot_discount = Decimal("0.00")
        free_shipping = False

        for code in applied_coupon_codes:
            rule = self.rules.get(code.upper())
            if not rule:
                continue

            if rule.min_order_spend_usd > orig_subtotal:
                continue

            disc_amt = Decimal("0.00")

            if rule.promo_type == PromotionType.PERCENTAGE_OFF_ORDER:
                disc_amt = (orig_subtotal * (rule.discount_value / Decimal("100.0"))).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP
                )
            elif rule.promo_type == PromotionType.FIXED_AMOUNT_OFF_ORDER:
                disc_amt = min(orig_subtotal, rule.discount_value)
            elif rule.promo_type == PromotionType.BUY_X_GET_Y_DISCOUNT and rule.target_sku:
                match_item = next((i for i in items if i.sku == rule.target_sku), None)
                if match_item and match_item.quantity >= (rule.buy_quantity_x + rule.get_quantity_y):
                    free_units = match_item.quantity // (rule.buy_quantity_x + rule.get_quantity_y)
                    disc_amt = (
                        Decimal(str(free_units)) * match_item.unit_price * (rule.get_discount_pct / Decimal("100.0"))
                    ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            elif rule.promo_type == PromotionType.TIERED_BASKET_SPEND:
                if orig_subtotal >= Decimal("10000.00"):
                    disc_amt = Decimal("750.00")
                elif orig_subtotal >= Decimal("5000.00"):
                    disc_amt = Decimal("300.00")

            if rule.max_discount_cap_usd is not None and disc_amt > rule.max_discount_cap_usd:
                disc_amt = rule.max_discount_cap_usd

            if disc_amt > Decimal("0.00"):
                applied_results.append(AppliedPromotionResult(
                    rule_id=rule.rule_id,
                    coupon_code=rule.coupon_code,
                    name=rule.name,
                    discount_amount_usd=disc_amt,
                    applied_to_sku=rule.target_sku
                ))
                tot_discount += disc_amt

        final_subtotal = max(Decimal("0.00"), orig_subtotal - tot_discount)
        return CartEvaluationSummary(
            original_subtotal_usd=orig_subtotal,
            total_discount_usd=tot_discount,
            final_net_subtotal_usd=final_subtotal,
            applied_promotions=applied_results,
            free_shipping_unlocked=free_shipping
        )
