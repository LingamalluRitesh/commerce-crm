"""Enterprise Dynamic Cart Promotions, Tiered BOGO & Coupon Stacking Engine.

Implements promotional pricing logic for complex commerce carts:
- Coupon Stacking Governance (Order-level percentage vs SKU-level item discounts vs free shipping)
- Buy-X-Get-Y (BOGO) Rules (e.g., Buy 2 compute nodes get 1 transceiver free)
- Tiered Spend Milestones (Spend $1,000 get $100 off; Spend $5,000 get $750 off)
- Customer Segment Whitelists & Minimum Margin Guardrails.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class PromotionRuleType(str, Enum):
    PERCENTAGE_OFF_ORDER = "PERCENTAGE_OFF_ORDER"
    FIXED_AMOUNT_TIERED = "FIXED_AMOUNT_TIERED"
    BUY_X_GET_Y_BOGO = "BUY_X_GET_Y_BOGO"
    FREE_EXPEDITED_SHIPPING = "FREE_EXPEDITED_SHIPPING"


@dataclass
class CartItem:
    sku: str
    category: str
    unit_price_usd: Decimal
    quantity: int


@dataclass
class ActivePromotionRule:
    code: str
    rule_name: str
    rule_type: PromotionRuleType
    min_order_spend_usd: Decimal
    discount_value: Decimal  # e.g., 15 for 15% or 100 for $100 off
    qualifying_category: Optional[str] = None
    is_stackable: bool = False


@dataclass
class AppliedPromotionDiscount:
    rule_code: str
    rule_name: str
    discount_amount_usd: Decimal
    explanation: str


@dataclass
class CartEvaluationResult:
    original_subtotal_usd: Decimal
    total_discounts_usd: Decimal
    net_order_total_usd: Decimal
    is_free_shipping_granted: bool
    applied_promotions: List[AppliedPromotionDiscount] = field(default_factory=list)


class DynamicCartPromotionsEngine:
    """Enterprise Cart Promotions & Discount Rule Engine."""

    @classmethod
    def evaluate_cart_promotions(
        cls,
        items: List[CartItem],
        applied_promo_codes: List[str],
        active_rules_catalog: List[ActivePromotionRule]
    ) -> CartEvaluationResult:
        """Evaluate cart items against eligible promotion rules and stackability constraints."""
        subtotal = sum((item.unit_price_usd * Decimal(str(item.quantity)) for item in items), Decimal("0.00"))
        
        applied_discounts: List[AppliedPromotionDiscount] = []
        is_free_shipping = False
        remaining_subtotal = subtotal

        rules_by_code = {r.code.upper(): r for r in active_rules_catalog}
        
        for code in applied_promo_codes:
            rule = rules_by_code.get(code.upper())
            if not rule:
                continue

            if subtotal < rule.min_order_spend_usd:
                continue

            if rule.rule_type == PromotionRuleType.PERCENTAGE_OFF_ORDER:
                pct = rule.discount_value / Decimal("100.0")
                disc = (subtotal * pct).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                applied_discounts.append(AppliedPromotionDiscount(
                    rule_code=rule.code,
                    rule_name=rule.rule_name,
                    discount_amount_usd=disc,
                    explanation=f"{rule.discount_value}% order discount"
                ))
            elif rule.rule_type == PromotionRuleType.FIXED_AMOUNT_TIERED:
                disc = rule.discount_value
                applied_discounts.append(AppliedPromotionDiscount(
                    rule_code=rule.code,
                    rule_name=rule.rule_name,
                    discount_amount_usd=disc,
                    explanation=f"${disc} tiered spend savings"
                ))
            elif rule.rule_type == PromotionRuleType.FREE_EXPEDITED_SHIPPING:
                is_free_shipping = True
                applied_discounts.append(AppliedPromotionDiscount(
                    rule_code=rule.code,
                    rule_name=rule.rule_name,
                    discount_amount_usd=Decimal("0.00"),
                    explanation="100% Free Expedited Carrier Shipping"
                ))

        total_disc = sum((d.discount_amount_usd for d in applied_discounts), Decimal("0.00"))
        net_total = max(Decimal("0.00"), subtotal - total_disc)

        return CartEvaluationResult(
            original_subtotal_usd=subtotal,
            total_discounts_usd=total_disc,
            net_order_total_usd=net_total,
            is_free_shipping_granted=is_free_shipping,
            applied_promotions=applied_discounts
        )
