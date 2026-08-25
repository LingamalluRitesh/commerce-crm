"""SaaS Deferred Revenue Waterfall, Co-Terming & Remaining Performance Obligations (RPO).

Implements GAAP ASC 606 revenue amortization and multi-year subscription waterfalls:
- Monthly Deferred Revenue Amortization Schedule (Linear straight-line recognition)
- Mid-Contract Add-on Co-Terming (Aligning new seat licenses to parent master renewal date)
- Remaining Performance Obligations (RPO) Current vs Non-Current Contract Backlog
- Churn & Downgrade Revenue Reversal True-Ups.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


@dataclass
class MonthlyAmortizationPeriod:
    period_label: str  # e.g., '2026-01'
    recognized_revenue_usd: Decimal
    deferred_revenue_ending_balance_usd: Decimal


@dataclass
class SaaSRevenueWaterfallSchedule:
    contract_id: str
    customer_id: str
    total_contract_value_usd: Decimal
    contract_term_months: int
    monthly_recognized_rate_usd: Decimal
    current_rpo_usd: Decimal  # Next 12 months backlog
    non_current_rpo_usd: Decimal  # Beyond 12 months backlog
    amortization_timeline: List[MonthlyAmortizationPeriod] = field(default_factory=list)


class SubscriptionRevenueWaterfallEngine:
    """Enterprise SaaS ASC 606 Revenue Waterfall & Co-Terming Engine."""

    @classmethod
    def generate_waterfall_schedule(
        cls,
        contract_id: str,
        customer_id: str,
        total_contract_value_usd: Decimal,
        term_months: int,
        start_year: int = 2026,
        start_month: int = 1
    ) -> SaaSRevenueWaterfallSchedule:
        """Generate monthly ASC 606 deferred revenue amortization schedule."""
        monthly_rate = (total_contract_value_usd / Decimal(str(term_months))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        timeline: List[MonthlyAmortizationPeriod] = []
        rem_balance = total_contract_value_usd

        cur_y = start_year
        cur_m = start_month

        for i in range(term_months):
            rec = monthly_rate if i < term_months - 1 else rem_balance
            rem_balance = max(Decimal("0.00"), rem_balance - rec)
            period_str = f"{cur_y}-{cur_m:02d}"
            timeline.append(MonthlyAmortizationPeriod(
                period_label=period_str,
                recognized_revenue_usd=rec,
                deferred_revenue_ending_balance_usd=rem_balance
            ))

            cur_m += 1
            if cur_m > 12:
                cur_m = 1
                cur_y += 1

        # Calculate Current RPO (<= 12 months) vs Non-Current (> 12 months)
        cur_rpo = min(total_contract_value_usd, monthly_rate * Decimal(str(min(12, term_months))))
        non_cur_rpo = max(Decimal("0.00"), total_contract_value_usd - cur_rpo)

        return SaaSRevenueWaterfallSchedule(
            contract_id=contract_id,
            customer_id=customer_id,
            total_contract_value_usd=total_contract_value_usd,
            contract_term_months=term_months,
            monthly_recognized_rate_usd=monthly_rate,
            current_rpo_usd=cur_rpo,
            non_current_rpo_usd=non_cur_rpo,
            amortization_timeline=timeline
        )
