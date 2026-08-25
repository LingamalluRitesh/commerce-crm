"""Sales Territory Management, Round-Robin Lead Routing, and Quota Attainment Engine.

Provides multi-variable B2B sales territory management:
- Geographic routing (US Regions: West, Central, East, EMEA, APAC)
- Named Account enterprise carve-outs (Fortune 500 strategic tier)
- Weighted round-robin SDR/AE lead assignment with active capacity load balancing
- Sales quota attainment tracking, split commission calculation, and accelerator tiers (e.g. 100-120% quota -> 1.5x accelerator, >120% -> 2.0x accelerator).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class TerritoryRegion(str, Enum):
    US_WEST = "US_WEST"
    US_CENTRAL = "US_CENTRAL"
    US_EAST = "US_EAST"
    EMEA_EUROPE = "EMEA_EUROPE"
    APAC_PACIFIC = "APAC_PACIFIC"
    GLOBAL_STRATEGIC_ACCOUNTS = "GLOBAL_STRATEGIC_ACCOUNTS"


@dataclass
class SalesRepresentative:
    rep_id: str
    name: str
    email: str
    assigned_territory: TerritoryRegion
    annual_quota_usd: Decimal
    closed_revenue_ytd_usd: Decimal = Decimal("0.00")
    active_leads_count: int = 0
    max_lead_capacity: int = 40
    is_available: bool = True
    base_commission_rate_pct: Decimal = Decimal("10.00")

    @property
    def quota_attainment_pct(self) -> Decimal:
        if self.annual_quota_usd <= Decimal("0.00"):
            return Decimal("0.00")
        return ((self.closed_revenue_ytd_usd / self.annual_quota_usd) * Decimal("100.0")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )


@dataclass
class CommissionCalculationResult:
    rep_id: str
    deal_id: str
    deal_amount_usd: Decimal
    base_commission_usd: Decimal
    accelerator_multiplier: Decimal
    total_commission_earned_usd: Decimal
    new_ytd_closed_revenue: Decimal
    new_quota_attainment_pct: Decimal


class TerritoryRoutingEngine:
    """Enterprise Sales Territory and Commission Accelerator Engine."""

    STATE_TO_REGION: Dict[str, TerritoryRegion] = {
        # US West
        "WA": TerritoryRegion.US_WEST, "OR": TerritoryRegion.US_WEST, "CA": TerritoryRegion.US_WEST,
        "NV": TerritoryRegion.US_WEST, "ID": TerritoryRegion.US_WEST, "AZ": TerritoryRegion.US_WEST,
        # US Central
        "TX": TerritoryRegion.US_CENTRAL, "IL": TerritoryRegion.US_CENTRAL, "CO": TerritoryRegion.US_CENTRAL,
        "MO": TerritoryRegion.US_CENTRAL, "MN": TerritoryRegion.US_CENTRAL, "WI": TerritoryRegion.US_CENTRAL,
        # US East
        "NY": TerritoryRegion.US_EAST, "MA": TerritoryRegion.US_EAST, "FL": TerritoryRegion.US_EAST,
        "NJ": TerritoryRegion.US_EAST, "PA": TerritoryRegion.US_EAST, "NC": TerritoryRegion.US_EAST,
        "GA": TerritoryRegion.US_EAST, "VA": TerritoryRegion.US_EAST,
    }

    def __init__(self):
        self.reps: Dict[str, SalesRepresentative] = {}
        self._seed_default_sales_team()

    def _seed_default_sales_team(self) -> None:
        team = [
            SalesRepresentative("rep-001", "Sarah Chen", "sarah.chen@commercecrm.io", TerritoryRegion.US_WEST, Decimal("1500000.00"), Decimal("1250000.00"), 18),
            SalesRepresentative("rep-002", "Marcus Vance", "marcus.vance@commercecrm.io", TerritoryRegion.US_CENTRAL, Decimal("1200000.00"), Decimal("950000.00"), 22),
            SalesRepresentative("rep-003", "Elena Rostova", "elena.rostova@commercecrm.io", TerritoryRegion.US_EAST, Decimal("1800000.00"), Decimal("1920000.00"), 15),
            SalesRepresentative("rep-004", "David Thorne", "david.thorne@commercecrm.io", TerritoryRegion.GLOBAL_STRATEGIC_ACCOUNTS, Decimal("3000000.00"), Decimal("2400000.00"), 8),
        ]
        for r in team:
            self.reps[r.rep_id] = r

    def route_lead_to_representative(self, company_name: str, state_code: str, employee_count: int) -> SalesRepresentative:
        """Route lead based on enterprise size and geography."""
        # Fortune 500 / Enterprise (>2500 employees) -> Strategic Accounts
        if employee_count >= 2500:
            target_region = TerritoryRegion.GLOBAL_STRATEGIC_ACCOUNTS
        else:
            target_region = self.STATE_TO_REGION.get(state_code.upper(), TerritoryRegion.US_CENTRAL)

        eligible_reps = [
            r for r in self.reps.values()
            if r.assigned_territory == target_region and r.is_available and r.active_leads_count < r.max_lead_capacity
        ]

        if not eligible_reps:
            # Fallback to rep with lowest active lead load
            return min(self.reps.values(), key=lambda r: r.active_leads_count)

        # Weighted round-robin: select rep with lowest active load
        selected = min(eligible_reps, key=lambda r: r.active_leads_count)
        selected.active_leads_count += 1
        return selected

    @classmethod
    def calculate_deal_commission(
        cls,
        rep: SalesRepresentative,
        deal_id: str,
        deal_amount_usd: Decimal
    ) -> CommissionCalculationResult:
        """Calculate commission with tiered quota accelerator multipliers."""
        prior_attainment = rep.quota_attainment_pct

        # Commission Accelerators:
        # Attainment > 120%: 2.0x accelerator
        # Attainment 100% - 120%: 1.5x accelerator
        # Attainment < 100%: 1.0x baseline
        if prior_attainment >= Decimal("120.00"):
            accelerator = Decimal("2.00")
        elif prior_attainment >= Decimal("100.00"):
            accelerator = Decimal("1.50")
        else:
            accelerator = Decimal("1.00")

        base_rate = rep.base_commission_rate_pct / Decimal("100.0")
        base_comm = (deal_amount_usd * base_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total_comm = (base_comm * accelerator).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        new_closed = rep.closed_revenue_ytd_usd + deal_amount_usd
        rep.closed_revenue_ytd_usd = new_closed
        new_attainment = rep.quota_attainment_pct

        return CommissionCalculationResult(
            rep_id=rep.rep_id,
            deal_id=deal_id,
            deal_amount_usd=deal_amount_usd,
            base_commission_usd=base_comm,
            accelerator_multiplier=accelerator,
            total_commission_earned_usd=total_comm,
            new_ytd_closed_revenue=new_closed,
            new_quota_attainment_pct=new_attainment
        )
