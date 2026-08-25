"""Inventory ABC Analysis, Cycle Counting Schedules & Shrink Variance Reconciliation Engine.

Implements Pareto 80/20 ABC inventory classification:
- Class A: Top 80% annual dollar volume (counted monthly / 12x per year)
- Class B: Next 15% annual dollar volume (counted quarterly / 4x per year)
- Class C: Remaining 5% annual dollar volume (counted semi-annually / 2x per year)
Performs blind double-count variance reconciliation and automated General Ledger inventory shrink write-offs.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class ABCClassification(str, Enum):
    CLASS_A = "CLASS_A"  # Critical high-value velocity
    CLASS_B = "CLASS_B"  # Moderate value
    CLASS_C = "CLASS_C"  # Low value / bulk items


@dataclass
class InventoryItemValuation:
    sku: str
    name: str
    annual_unit_demand: int
    unit_cost_usd: Decimal
    current_book_qty: int

    @property
    def annual_dollar_volume(self) -> Decimal:
        return (Decimal(str(self.annual_unit_demand)) * self.unit_cost_usd).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )


@dataclass
class ClassifiedSKURecord:
    sku: str
    name: str
    annual_dollar_volume: Decimal
    percentage_of_total_value: float
    cumulative_value_pct: float
    classification: ABCClassification
    annual_count_frequency: int


@dataclass
class CycleCountVarianceResult:
    count_id: str
    sku: str
    location_bin: str
    book_quantity: int
    physical_count_quantity: int
    variance_units: int
    variance_usd: Decimal
    variance_pct: float
    requires_manager_approval: bool
    gl_adjustment_entry_suggested: str


class CycleCountingEngine:
    """Enterprise Inventory ABC Classification & Variance Reconciliation Engine."""

    @classmethod
    def perform_abc_analysis(cls, items: List[InventoryItemValuation]) -> List[ClassifiedSKURecord]:
        """Rank items by annual dollar usage and classify into A/B/C tiers."""
        if not items:
            return []

        # Sort descending by annual dollar volume
        sorted_items = sorted(items, key=lambda i: i.annual_dollar_volume, reverse=True)
        total_vol = sum(i.annual_dollar_volume for i in sorted_items)
        if total_vol <= Decimal("0.00"):
            total_vol = Decimal("1.00")

        classified: List[ClassifiedSKURecord] = []
        cumulative_usd = Decimal("0.00")

        for idx, it in enumerate(sorted_items):
            cumulative_usd += it.annual_dollar_volume
            pct_total = round(float(it.annual_dollar_volume / total_vol) * 100.0, 2)
            cum_pct = round(float(cumulative_usd / total_vol) * 100.0, 2)

            if idx == 0 or cum_pct <= 80.0:
                tier = ABCClassification.CLASS_A
                freq = 12  # Monthly
            elif cum_pct <= 95.0:
                tier = ABCClassification.CLASS_B
                freq = 4   # Quarterly
            else:
                tier = ABCClassification.CLASS_C
                freq = 2   # Semi-annually

            classified.append(ClassifiedSKURecord(
                sku=it.sku,
                name=it.name,
                annual_dollar_volume=it.annual_dollar_volume,
                percentage_of_total_value=pct_total,
                cumulative_value_pct=cum_pct,
                classification=tier,
                annual_count_frequency=freq
            ))

        return classified

    @classmethod
    def reconcile_physical_count(
        cls,
        count_id: str,
        sku: str,
        name: str,
        unit_cost: Decimal,
        location_bin: str,
        book_qty: int,
        physical_qty: int
    ) -> CycleCountVarianceResult:
        """Evaluate count variance and trigger GL inventory adjustment."""
        var_units = physical_qty - book_qty
        var_usd = (Decimal(str(var_units)) * unit_cost).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        var_pct = round((abs(var_units) / max(1, book_qty)) * 100.0, 2)

        # Requires manager sign-off if variance exceeds $500 or 5%
        req_approval = abs(var_usd) > Decimal("500.00") or var_pct > 5.0

        if var_units < 0:
            gl_msg = f"DEBIT 50200 (Inventory Shrink Expense) ${abs(var_usd)}, CREDIT 12000 (Inventory Asset) ${abs(var_usd)}"
        elif var_units > 0:
            gl_msg = f"DEBIT 12000 (Inventory Asset) ${abs(var_usd)}, CREDIT 50200 (Inventory Gain Adjustment) ${abs(var_usd)}"
        else:
            gl_msg = "ZERO_VARIANCE: Book matches physical count exactly"

        return CycleCountVarianceResult(
            count_id=count_id,
            sku=sku,
            location_bin=location_bin,
            book_quantity=book_qty,
            physical_count_quantity=physical_qty,
            variance_units=var_units,
            variance_usd=var_usd,
            variance_pct=var_pct,
            requires_manager_approval=req_approval,
            gl_adjustment_entry_suggested=gl_msg
        )
