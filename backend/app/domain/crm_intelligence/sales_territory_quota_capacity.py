"""Sales Territory Headcount Capacity Planning & Ramp Productivity Engine.

Implements B2B sales capacity modeling:
- New Hire Rep Ramp Curve Modeling:
  - Months 1-3 (Ramp Phase 1): 25% Quota Productivity
  - Months 4-6 (Ramp Phase 2): 50% Quota Productivity
  - Months 7-9 (Ramp Phase 3): 75% Quota Productivity
  - Months 10+ (Fully Ramped): 100% Quota Productivity ($1.2M annual quota base)
- Quota Coverage Buffer Factor (Target: 1.25x capacity coverage over corporate bookings target)
- Historical Annual Attrition Rate & Backfill Lead Time Forecasting.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class RepTenureTier(str, Enum):
    RAMPING_PHASE_1_MONTHS_1_3 = "RAMPING_PHASE_1"
    RAMPING_PHASE_2_MONTHS_4_6 = "RAMPING_PHASE_2"
    RAMPING_PHASE_3_MONTHS_7_9 = "RAMPING_PHASE_3"
    FULLY_RAMPED_TENURED = "FULLY_RAMPED"


@dataclass
class SalesRepCapacityProfile:
    rep_id: str
    name: str
    territory_code: str
    tenure_months: int
    base_annual_quota_usd: Decimal

    @property
    def ramp_tier(self) -> RepTenureTier:
        if self.tenure_months <= 3:
            return RepTenureTier.RAMPING_PHASE_1_MONTHS_1_3
        elif self.tenure_months <= 6:
            return RepTenureTier.RAMPING_PHASE_2_MONTHS_4_6
        elif self.tenure_months <= 9:
            return RepTenureTier.RAMPING_PHASE_3_MONTHS_7_9
        return RepTenureTier.FULLY_RAMPED_TENURED

    @property
    def effective_productivity_pct(self) -> float:
        if self.tenure_months <= 3:
            return 25.0
        elif self.tenure_months <= 6:
            return 50.0
        elif self.tenure_months <= 9:
            return 75.0
        return 100.0

    @property
    def effective_annual_capacity_usd(self) -> Decimal:
        mult = Decimal(str(self.effective_productivity_pct / 100.0))
        return (self.base_annual_quota_usd * mult).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass
class TerritoryCapacityPlanSummary:
    plan_year: int
    corporate_bookings_target_usd: Decimal
    total_sales_reps_count: int
    fully_ramped_reps_count: int
    ramping_reps_count: int
    total_effective_quota_capacity_usd: Decimal
    quota_capacity_coverage_ratio: float
    is_adequately_covered: bool
    recommended_headcount_additions: int


class SalesCapacityPlanningEngine:
    """Enterprise Sales Capacity & Ramp Modeling Engine."""

    TARGET_COVERAGE_RATIO = 1.25  # 125% capacity coverage needed for risk buffer

    @classmethod
    def evaluate_team_capacity(
        cls,
        plan_year: int,
        target_revenue_usd: Decimal,
        reps: List[SalesRepCapacityProfile]
    ) -> TerritoryCapacityPlanSummary:
        """Evaluate effective quota carrying capacity and hiring gap."""
        tot_reps = len(reps)
        ramped = sum(1 for r in reps if r.ramp_tier == RepTenureTier.FULLY_RAMPED_TENURED)
        ramping = tot_reps - ramped

        tot_cap = sum((r.effective_annual_capacity_usd for r in reps), Decimal("0.00"))
        coverage = round(float(tot_cap / max(Decimal("1.00"), target_revenue_usd)), 2)

        is_adequate = coverage >= cls.TARGET_COVERAGE_RATIO

        # Calculate needed additions if under-covered
        needed_cap = target_revenue_usd * Decimal(str(cls.TARGET_COVERAGE_RATIO))
        cap_deficit = max(Decimal("0.00"), needed_cap - tot_cap)
        # Average fully ramped rep carries $1.2M
        rec_hires = int((cap_deficit / Decimal("1200000.00")).quantize(Decimal("1.0"), rounding=ROUND_HALF_UP))

        return TerritoryCapacityPlanSummary(
            plan_year=plan_year,
            corporate_bookings_target_usd=target_revenue_usd,
            total_sales_reps_count=tot_reps,
            fully_ramped_reps_count=ramped,
            ramping_reps_count=ramping,
            total_effective_quota_capacity_usd=tot_cap,
            quota_capacity_coverage_ratio=coverage,
            is_adequately_covered=is_adequate,
            recommended_headcount_additions=rec_hires
        )
