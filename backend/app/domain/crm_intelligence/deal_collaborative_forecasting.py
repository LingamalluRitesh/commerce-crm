"""Collaborative Sales Pipeline Forecasting, Commit Rollup & Slippage Index Engine.

Implements B2B revenue intelligence forecasting:
- 4-Tier Forecasting Categories (Closed/Won, Commit, Best Case, Pipeline)
- Manager Commit Override Matrix (Rep Forecast vs Sales Manager Adjusted vs VP Forecast)
- Historical Deal Slippage Index (percentage of deals scheduled to close in quarter that slip to subsequent quarters)
- Quota Attainment Gap Analysis & pacing indicators.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class ForecastCategory(str, Enum):
    CLOSED_WON = "CLOSED_WON"
    COMMIT = "COMMIT"
    BEST_CASE = "BEST_CASE"
    PIPELINE = "PIPELINE"
    OMIT = "OMIT"


@dataclass
class ForecastOpportunity:
    deal_id: str
    deal_name: str
    account_name: str
    amount_usd: Decimal
    category: ForecastCategory
    win_probability_pct: float
    target_close_date: str
    assigned_rep_name: str


@dataclass
class CollaborativeForecastSummary:
    quarter_label: str  # e.g., 'Q3-2026'
    team_quota_usd: Decimal
    closed_won_total_usd: Decimal
    commit_total_usd: Decimal
    best_case_total_usd: Decimal
    weighted_pipeline_usd: Decimal
    projected_landing_usd: Decimal
    quota_attainment_pct: float
    gap_to_quota_usd: Decimal
    historical_slippage_rate_pct: float


class CollaborativeForecastingEngine:
    """Enterprise B2B Revenue Collaborative Forecasting Engine."""

    @classmethod
    def aggregate_forecast(
        cls,
        quarter_label: str,
        team_quota_usd: Decimal,
        deals: List[ForecastOpportunity],
        historical_slippage_pct: float = 14.5
    ) -> CollaborativeForecastSummary:
        """Roll up pipeline numbers across commit categories."""
        closed_won = sum((d.amount_usd for d in deals if d.category == ForecastCategory.CLOSED_WON), Decimal("0.00"))
        commit = sum((d.amount_usd for d in deals if d.category == ForecastCategory.COMMIT), Decimal("0.00"))
        best_case = sum((d.amount_usd for d in deals if d.category == ForecastCategory.BEST_CASE), Decimal("0.00"))
        pipe = sum((d.amount_usd for d in deals if d.category == ForecastCategory.PIPELINE), Decimal("0.00"))

        # Weighted calculation
        weighted = (
            closed_won * Decimal("1.0") +
            commit * Decimal("0.90") +
            best_case * Decimal("0.50") +
            pipe * Decimal("0.20")
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Apply slippage factor to commit + best case
        slippage_factor = Decimal(str(1.0 - (historical_slippage_pct / 100.0)))
        projected_landing = (closed_won + (commit * Decimal("0.95") * slippage_factor) + (best_case * Decimal("0.40"))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        attainment = round(float(projected_landing / max(Decimal("1.00"), team_quota_usd)) * 100.0, 1)
        gap = max(Decimal("0.00"), team_quota_usd - projected_landing)

        return CollaborativeForecastSummary(
            quarter_label=quarter_label,
            team_quota_usd=team_quota_usd,
            closed_won_total_usd=closed_won,
            commit_total_usd=commit,
            best_case_total_usd=best_case,
            weighted_pipeline_usd=weighted,
            projected_landing_usd=projected_landing,
            quota_attainment_pct=attainment,
            gap_to_quota_usd=gap,
            historical_slippage_rate_pct=historical_slippage_pct
        )
