"""Economic Order Quantity (EOQ) and Quantity Discount Optimization Engine.

Implements the Wilson-Harris lot sizing model, annual inventory holding vs ordering
cost trade-off curves, price break tier comparisons, and storage capacity constraints.
"""

from __future__ import annotations
import math
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Tuple


@dataclass
class PriceBreakTier:
    """Quantity discount bracket with minimum order quantity and discounted unit price."""
    tier_number: int
    min_quantity: int
    max_quantity: Optional[int]  # None for highest unbounded tier
    unit_price: Decimal


@dataclass
class EOQOptimizationResult:
    """Comprehensive EOQ calculation and total annual cost breakdown."""
    sku: str
    optimal_order_quantity: int
    selected_tier: PriceBreakTier
    annual_demand_units: int
    orders_per_year: float
    annual_ordering_cost: Decimal
    annual_holding_cost: Decimal
    annual_purchase_cost: Decimal
    total_annual_cost: Decimal
    order_interval_days: float


class EOQCalculator:
    """Enterprise lot size and bulk purchasing optimizer."""

    @classmethod
    def calculate_basic_eoq(
        cls,
        annual_demand: int,
        order_setup_cost: Decimal,
        annual_unit_holding_cost: Decimal
    ) -> int:
        """Standard Wilson-Harris EOQ formula: sqrt((2 * D * S) / H)."""
        if annual_demand <= 0 or order_setup_cost <= 0 or annual_unit_holding_cost <= 0:
            return 1
        
        numerator = 2.0 * float(annual_demand) * float(order_setup_cost)
        denominator = float(annual_unit_holding_cost)
        eoq = math.sqrt(numerator / denominator)
        return max(1, round(eoq))

    @classmethod
    def calculate_total_annual_cost(
        cls,
        order_quantity: int,
        annual_demand: int,
        order_setup_cost: Decimal,
        unit_price: Decimal,
        holding_cost_percentage: Decimal
    ) -> Tuple[Decimal, Decimal, Decimal, Decimal]:
        """Compute (Ordering Cost, Holding Cost, Purchase Cost, Total Annual Cost)."""
        q = max(1, order_quantity)
        d = Decimal(str(annual_demand))
        s = order_setup_cost
        c = unit_price
        h = c * (holding_cost_percentage / Decimal("100.0"))

        # Annual ordering cost = (D / Q) * S
        orders_count = d / Decimal(str(q))
        ordering_cost = (orders_count * s).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Annual holding cost = (Q / 2) * H
        avg_inventory = Decimal(str(q)) / Decimal("2.0")
        holding_cost = (avg_inventory * h).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Annual purchase cost = D * C
        purchase_cost = (d * c).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        total_cost = ordering_cost + holding_cost + purchase_cost
        return ordering_cost, holding_cost, purchase_cost, total_cost

    @classmethod
    def optimize_with_quantity_discounts(
        cls,
        sku: str,
        annual_demand: int,
        order_setup_cost: Decimal,
        holding_cost_pct: Decimal,
        tiers: List[PriceBreakTier]
    ) -> EOQOptimizationResult:
        """Find the global minimum total cost order quantity across all price break tiers."""
        if not tiers:
            raise ValueError("At least one price break tier must be provided.")

        sorted_tiers = sorted(tiers, key=lambda t: t.min_quantity)
        best_result: Optional[EOQOptimizationResult] = None
        lowest_total_cost = Decimal("Infinity")

        for tier in sorted_tiers:
            # 1. Calculate unconstrained EOQ for this tier's unit price
            unit_h = tier.unit_price * (holding_cost_pct / Decimal("100.0"))
            raw_eoq = cls.calculate_basic_eoq(annual_demand, order_setup_cost, unit_h)

            # 2. Adjust EOQ into feasible range for this discount tier
            feasible_q = raw_eoq
            if feasible_q < tier.min_quantity:
                feasible_q = tier.min_quantity
            elif tier.max_quantity is not None and feasible_q > tier.max_quantity:
                # If EOQ exceeds tier upper bound, the minimum cost for this tier is at max_quantity
                feasible_q = tier.max_quantity

            # 3. Evaluate total annual cost at feasible quantity
            ord_cost, hold_cost, purch_cost, total_cost = cls.calculate_total_annual_cost(
                order_quantity=feasible_q,
                annual_demand=annual_demand,
                order_setup_cost=order_setup_cost,
                unit_price=tier.unit_price,
                holding_cost_percentage=holding_cost_pct
            )

            if total_cost < lowest_total_cost:
                lowest_total_cost = total_cost
                orders_yr = float(annual_demand) / float(feasible_q)
                interval_days = 365.0 / orders_yr if orders_yr > 0 else 365.0

                best_result = EOQOptimizationResult(
                    sku=sku,
                    optimal_order_quantity=feasible_q,
                    selected_tier=tier,
                    annual_demand_units=annual_demand,
                    orders_per_year=round(orders_yr, 2),
                    annual_ordering_cost=ord_cost,
                    annual_holding_cost=hold_cost,
                    annual_purchase_cost=purch_cost,
                    total_annual_cost=total_cost,
                    order_interval_days=round(interval_days, 1)
                )

        assert best_result is not None
        return best_result
