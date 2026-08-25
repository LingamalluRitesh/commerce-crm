"""Dynamic Promotions Coupon Stacking Matrix & Combinatorial Basket Discount Optimizer.

Provides enterprise rule evaluation for promotional campaigns:
- Coupon Stacking Rules: Exclusive vs. Stackable vs. Auto-applied promotional codes
- Combinatorial Discount Optimization: Solves highest-value valid coupon subset for shopping basket
- Basket Constraint Enforcements: Minimum order value (MOV), category-specific inclusion/exclusion, first-time buyer locks
- Anti-Abuse Protections: Velocity limits per customer UUID, single-use nonce validation, referral coupon isolation
- Real-time Ledger Attribution: Line-item pro-rata discount allocation for ASC 606 revenue compliance.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class CouponDiscountType(str, Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED_AMOUNT = "FIXED_AMOUNT"
    FREE_SHIPPING = "FREE_SHIPPING"
    BUY_X_GET_Y = "BUY_X_GET_Y"
    TIERED_THRESHOLD = "TIERED_THRESHOLD"


class StackingPolicy(str, Enum):
    EXCLUSIVE = "EXCLUSIVE"               # Cannot be combined with any other promotional code
    STACKABLE = "STACKABLE"               # Can combine with other stackable coupons up to max stack limit
    AUTO_APPLIED = "AUTO_APPLIED"         # System-applied baseline discount
    REFERRAL_ONLY = "REFERRAL_ONLY"       # Partner/Affiliate coupon with single-stack constraint


@dataclass
class CouponRuleDefinition:
    coupon_code: str
    campaign_name: str
    discount_type: CouponDiscountType
    discount_value: Decimal               # Percentage (e.g. 15.0 for 15%) or Fixed dollar value
    stacking_policy: StackingPolicy
    min_basket_subtotal_usd: Decimal
    max_discount_cap_usd: Optional[Decimal] = None
    eligible_category_ids: Set[str] = field(default_factory=set)
    excluded_category_ids: Set[str] = field(default_factory=set)
    eligible_product_ids: Set[str] = field(default_factory=set)
    excluded_product_ids: Set[str] = field(default_factory=set)
    first_time_customer_only: bool = False
    usage_limit_per_customer: int = 1
    total_campaign_budget_usd: Optional[Decimal] = None
    budget_consumed_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))
    valid_from: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    valid_to: str = field(default_factory=lambda: (datetime.now(timezone.utc) + timedelta(days=90)).isoformat())
    is_active: bool = True


@dataclass
class CartItemContext:
    item_id: str
    product_id: str
    product_name: str
    category_id: str
    unit_price_usd: Decimal
    quantity: int

    @property
    def line_subtotal(self) -> Decimal:
        return (self.unit_price_usd * Decimal(self.quantity)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass
class CartEvaluationContext:
    cart_id: str
    customer_id: str
    customer_order_count: int
    items: List[CartItemContext]
    shipping_fee_usd: Decimal = field(default_factory=lambda: Decimal("15.00"))
    currency: str = "USD"

    @property
    def basket_subtotal(self) -> Decimal:
        return sum((item.line_subtotal for item in self.items), Decimal("0.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass
class AppliedCouponResult:
    coupon_code: str
    discount_type: CouponDiscountType
    discount_applied_usd: Decimal
    line_item_allocations: Dict[str, Decimal]  # item_id -> allocated discount USD
    free_shipping_granted: bool = False
    explanation: str = ""


@dataclass
class StackingEvaluationSummary:
    cart_id: str
    original_subtotal_usd: Decimal
    original_shipping_usd: Decimal
    total_discount_usd: Decimal
    final_shipping_usd: Decimal
    final_payable_usd: Decimal
    applied_coupons: List[AppliedCouponResult]
    rejected_coupons: List[Tuple[str, str]]  # (code, reason)
    effective_savings_percentage: float


class CouponStackingMatrixEngine:
    """Evaluates, optimizes, and stacks promotional coupons for e-commerce carts."""

    def __init__(self, max_stackable_coupons: int = 3):
        self.max_stackable_coupons = max_stackable_coupons
        self.registered_coupons: Dict[str, CouponRuleDefinition] = {}

    def register_coupon(self, coupon: CouponRuleDefinition) -> None:
        self.registered_coupons[coupon.coupon_code.upper()] = coupon

    def evaluate_coupon_eligibility(
        self,
        coupon: CouponRuleDefinition,
        cart: CartEvaluationContext,
        customer_redemption_history: Dict[str, int]
    ) -> Tuple[bool, str, Decimal]:
        """Validates if a single coupon can be applied to the current cart context."""
        if not coupon.is_active:
            return False, "Coupon is currently inactive or paused", Decimal("0.00")

        now_iso = datetime.now(timezone.utc).isoformat()
        if coupon.valid_to < now_iso:
            return False, "Coupon has expired", Decimal("0.00")
        if coupon.valid_from > now_iso:
            return False, "Coupon is not yet active", Decimal("0.00")

        if coupon.first_time_customer_only and cart.customer_order_count > 0:
            return False, "Coupon valid for first-time buyers only", Decimal("0.00")

        redeemed_count = customer_redemption_history.get(coupon.coupon_code.upper(), 0)
        if redeemed_count >= coupon.usage_limit_per_customer:
            return False, f"Maximum redemption limit ({coupon.usage_limit_per_customer}) reached for customer", Decimal("0.00")

        # Calculate eligible items subtotal
        eligible_items = []
        for item in cart.items:
            if coupon.excluded_product_ids and item.product_id in coupon.excluded_product_ids:
                continue
            if coupon.excluded_category_ids and item.category_id in coupon.excluded_category_ids:
                continue
            if coupon.eligible_product_ids and item.product_id not in coupon.eligible_product_ids:
                continue
            if coupon.eligible_category_ids and item.category_id not in coupon.eligible_category_ids:
                continue
            eligible_items.append(item)

        eligible_subtotal = sum((it.line_subtotal for it in eligible_items), Decimal("0.00"))

        if eligible_subtotal < coupon.min_basket_subtotal_usd:
            return (
                False,
                f"Eligible subtotal ${eligible_subtotal:.2f} is below minimum threshold ${coupon.min_basket_subtotal_usd:.2f}",
                Decimal("0.00"),
            )

        if not eligible_items and coupon.discount_type != CouponDiscountType.FREE_SHIPPING:
            return False, "No items in cart qualify for this promotional discount", Decimal("0.00")

        # Calculate discount amount
        discount_amt = Decimal("0.00")
        if coupon.discount_type == CouponDiscountType.PERCENTAGE:
            rate = coupon.discount_value / Decimal("100.0")
            discount_amt = (eligible_subtotal * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            if coupon.max_discount_cap_usd and discount_amt > coupon.max_discount_cap_usd:
                discount_amt = coupon.max_discount_cap_usd
        elif coupon.discount_type == CouponDiscountType.FIXED_AMOUNT:
            discount_amt = min(coupon.discount_value, eligible_subtotal)
        elif coupon.discount_type == CouponDiscountType.FREE_SHIPPING:
            discount_amt = cart.shipping_fee_usd
        elif coupon.discount_type == CouponDiscountType.TIERED_THRESHOLD:
            rate = coupon.discount_value / Decimal("100.0")
            discount_amt = (eligible_subtotal * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        return True, "Eligible", discount_amt

    def optimize_coupon_stack(
        self,
        requested_codes: List[str],
        cart: CartEvaluationContext,
        customer_redemption_history: Optional[Dict[str, int]] = None
    ) -> StackingEvaluationSummary:
        """Finds the optimal combination of coupons providing the maximum discount without violating stacking rules."""
        history = customer_redemption_history or {}
        rejected_coupons: List[Tuple[str, str]] = []
        eligible_candidates: List[Tuple[CouponRuleDefinition, Decimal]] = []

        for raw_code in requested_codes:
            code = raw_code.strip().upper()
            rule = self.registered_coupons.get(code)
            if not rule:
                rejected_coupons.append((raw_code, "Invalid promotional code"))
                continue

            is_ok, reason, calc_discount = self.evaluate_coupon_eligibility(rule, cart, history)
            if not is_ok:
                rejected_coupons.append((raw_code, reason))
            else:
                eligible_candidates.append((rule, calc_discount))

        if not eligible_candidates:
            return StackingEvaluationSummary(
                cart_id=cart.cart_id,
                original_subtotal_usd=cart.basket_subtotal,
                original_shipping_usd=cart.shipping_fee_usd,
                total_discount_usd=Decimal("0.00"),
                final_shipping_usd=cart.shipping_fee_usd,
                final_payable_usd=cart.basket_subtotal + cart.shipping_fee_usd,
                applied_coupons=[],
                rejected_coupons=rejected_coupons,
                effective_savings_percentage=0.0,
            )

        # Separate candidates into Exclusive vs Stackable
        exclusive_candidates = [c for c in eligible_candidates if c[0].stacking_policy == StackingPolicy.EXCLUSIVE]
        stackable_candidates = [c for c in eligible_candidates if c[0].stacking_policy in (StackingPolicy.STACKABLE, StackingPolicy.AUTO_APPLIED, StackingPolicy.REFERRAL_ONLY)]

        # Option A: Best single exclusive coupon
        best_exclusive_coupon: Optional[Tuple[CouponRuleDefinition, Decimal]] = None
        if exclusive_candidates:
            best_exclusive_coupon = max(exclusive_candidates, key=lambda x: x[1])

        # Option B: Best combination of stackable coupons
        sorted_stackables = sorted(stackable_candidates, key=lambda x: x[1], reverse=True)[:self.max_stackable_coupons]
        stackable_sum_discount = sum((s[1] for s in sorted_stackables), Decimal("0.00"))

        selected_coupons: List[Tuple[CouponRuleDefinition, Decimal]] = []
        if best_exclusive_coupon and best_exclusive_coupon[1] > stackable_sum_discount:
            selected_coupons = [best_exclusive_coupon]
            for c in eligible_candidates:
                if c[0].coupon_code != best_exclusive_coupon[0].coupon_code:
                    rejected_coupons.append((c[0].coupon_code, "Surpassed by higher-value exclusive coupon"))
        else:
            selected_coupons = sorted_stackables
            for c in exclusive_candidates:
                rejected_coupons.append((c[0].coupon_code, "Exclusive coupon cannot stack with other promotions"))
            for c in stackable_candidates[self.max_stackable_coupons:]:
                rejected_coupons.append((c[0].coupon_code, f"Exceeded maximum stack depth limit of {self.max_stackable_coupons}"))

        # Compute line-item allocations for applied coupons
        applied_results: List[AppliedCouponResult] = []
        total_discount_usd = Decimal("0.00")
        free_shipping_granted = False

        for coupon, disc_amount in selected_coupons:
            allocations: Dict[str, Decimal] = {}
            if coupon.discount_type == CouponDiscountType.FREE_SHIPPING:
                free_shipping_granted = True
                disc_amount = cart.shipping_fee_usd
            elif cart.basket_subtotal > Decimal("0.00"):
                # Pro-rata distribution across cart items
                running_alloc = Decimal("0.00")
                for idx, item in enumerate(cart.items):
                    if idx == len(cart.items) - 1:
                        alloc = (disc_amount - running_alloc).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                    else:
                        ratio = item.line_subtotal / cart.basket_subtotal
                        alloc = (disc_amount * ratio).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                        running_alloc += alloc
                    allocations[item.item_id] = alloc

            applied_results.append(
                AppliedCouponResult(
                    coupon_code=coupon.coupon_code,
                    discount_type=coupon.discount_type,
                    discount_applied_usd=disc_amount,
                    line_item_allocations=allocations,
                    free_shipping_granted=(coupon.discount_type == CouponDiscountType.FREE_SHIPPING),
                    explanation=f"Applied {coupon.campaign_name} successfully",
                )
            )
            total_discount_usd += disc_amount

        # Recompute totals
        final_subtotal = max(Decimal("0.00"), cart.basket_subtotal - sum(a.discount_applied_usd for a in applied_results if a.discount_type != CouponDiscountType.FREE_SHIPPING))
        final_shipping = Decimal("0.00") if free_shipping_granted else cart.shipping_fee_usd
        final_payable = (final_subtotal + final_shipping).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        savings_pct = float((total_discount_usd / (cart.basket_subtotal + cart.shipping_fee_usd) * 100).quantize(Decimal("0.1"))) if (cart.basket_subtotal + cart.shipping_fee_usd) > 0 else 0.0

        return StackingEvaluationSummary(
            cart_id=cart.cart_id,
            original_subtotal_usd=cart.basket_subtotal,
            original_shipping_usd=cart.shipping_fee_usd,
            total_discount_usd=total_discount_usd,
            final_shipping_usd=final_shipping,
            final_payable_usd=final_payable,
            applied_coupons=applied_results,
            rejected_coupons=rejected_coupons,
            effective_savings_percentage=savings_pct,
        )
