"""Customer 360 RFM Segmentation, Cohort Retention Decay, and Lifetime Value (CLV) Engine.

Implements B2B/B2C RFM (Recency, Frequency, Monetary) 5x5x5 quintile segmentation:
- Champions (555, 554, 545, 544)
- Loyal Customers (455, 454, 445, 444)
- Potential Loyalists (535, 534, 435, 434)
- Promising Recent (515, 514, 513)
- Need Attention (335, 334, 325, 324)
- At Risk (255, 254, 245, 244)
- Hibernating / Lost (111, 112, 121, 122)
Calculates predictive Customer Lifetime Value (CLV) and multi-period retention matrices.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class RFMSegmentName(str, Enum):
    CHAMPIONS = "CHAMPIONS"
    LOYAL_CUSTOMERS = "LOYAL_CUSTOMERS"
    POTENTIAL_LOYALISTS = "POTENTIAL_LOYALISTS"
    NEW_CUSTOMERS = "NEW_CUSTOMERS"
    NEED_ATTENTION = "NEED_ATTENTION"
    AT_RISK_CUSTOMERS = "AT_RISK_CUSTOMERS"
    CANNOT_LOSE_THEM = "CANNOT_LOSE_THEM"
    HIBERNATING_LOST = "HIBERNATING_LOST"


@dataclass
class CustomerRFMProfile:
    customer_id: str
    account_name: str
    recency_days: int          # Days since last completed purchase/transaction
    frequency_orders_count: int # Total orders placed in last 365 days
    monetary_total_spend_usd: Decimal # Total net revenue generated
    average_order_value_usd: Decimal
    first_order_date: str
    latest_order_date: str


@dataclass
class EvaluatedRFMScore:
    customer_id: str
    account_name: str
    recency_score: int    # 1 (Worst) to 5 (Best)
    frequency_score: int  # 1 to 5
    monetary_score: int   # 1 to 5
    rfm_cell: str         # e.g., '555', '435'
    segment: RFMSegmentName
    predicted_annual_clv_usd: Decimal
    recommended_retention_action: str


@dataclass
class CohortRetentionRow:
    cohort_month: str      # '2025-01', '2025-02'
    cohort_size_accounts: int
    initial_arr_usd: Decimal
    retention_pct_by_month: List[float]  # Month 0 (100%), Month 1, Month 2, ... Month 12


class RFMAnalyticsEngine:
    """Enterprise Customer Analytics & Cohort Modeling Engine."""

    # 80-20 Quintile Scoring Thresholds
    RECENCY_THRESHOLDS = [15, 45, 90, 180]         # Days: <=15 -> 5, <=45 -> 4, <=90 -> 3, <=180 -> 2, >180 -> 1
    FREQUENCY_THRESHOLDS = [2, 5, 12, 25]          # Orders: >=25 -> 5, >=12 -> 4, >=5 -> 3, >=2 -> 2, <2 -> 1
    MONETARY_THRESHOLDS = [
        Decimal("2500.00"), Decimal("10000.00"), Decimal("50000.00"), Decimal("150000.00")
    ] # Spend: >=$150k -> 5, >=$50k -> 4, >=$10k -> 3, >=$2.5k -> 2, <$2.5k -> 1

    @classmethod
    def score_recency(cls, days: int) -> int:
        if days <= cls.RECENCY_THRESHOLDS[0]:
            return 5
        elif days <= cls.RECENCY_THRESHOLDS[1]:
            return 4
        elif days <= cls.RECENCY_THRESHOLDS[2]:
            return 3
        elif days <= cls.RECENCY_THRESHOLDS[3]:
            return 2
        return 1

    @classmethod
    def score_frequency(cls, orders: int) -> int:
        if orders >= cls.FREQUENCY_THRESHOLDS[3]:
            return 5
        elif orders >= cls.FREQUENCY_THRESHOLDS[2]:
            return 4
        elif orders >= cls.FREQUENCY_THRESHOLDS[1]:
            return 3
        elif orders >= cls.FREQUENCY_THRESHOLDS[0]:
            return 2
        return 1

    @classmethod
    def score_monetary(cls, spend: Decimal) -> int:
        if spend >= cls.MONETARY_THRESHOLDS[3]:
            return 5
        elif spend >= cls.MONETARY_THRESHOLDS[2]:
            return 4
        elif spend >= cls.MONETARY_THRESHOLDS[1]:
            return 3
        elif spend >= cls.MONETARY_THRESHOLDS[0]:
            return 2
        return 1

    @classmethod
    def classify_segment(cls, r: int, f: int, m: int) -> Tuple[RFMSegmentName, str]:
        """Classify RFM triplet into actionable customer marketing segment."""
        if r in {4, 5} and f in {4, 5} and m in {4, 5}:
            return RFMSegmentName.CHAMPIONS, "Reward loyalty, invite to advisory board, upsell new flagship lines"
        elif r in {3, 4, 5} and f in {3, 4, 5} and m in {3, 4}:
            return RFMSegmentName.LOYAL_CUSTOMERS, "Offer volume rebates, introduce annual multi-year contract renewals"
        elif r in {4, 5} and f in {1, 2, 3} and m in {1, 2, 3}:
            return RFMSegmentName.NEW_CUSTOMERS, "High-touch onboarding, product training sessions, early success metrics"
        elif r in {3, 4} and f in {1, 2, 3} and m in {3, 4, 5}:
            return RFMSegmentName.POTENTIAL_LOYALISTS, "Recommend high-margin bundles and complementary solution modules"
        elif r in {2, 3} and f in {2, 3} and m in {2, 3}:
            return RFMSegmentName.NEED_ATTENTION, "Targeted win-back campaigns, customer success diagnostic calls"
        elif r in {1, 2} and f in {3, 4, 5} and m in {3, 4, 5}:
            return RFMSegmentName.CANNOT_LOSE_THEM, "CRITICAL: Urgent executive outreach, customized retention pricing"
        elif r in {1, 2} and f in {1, 2, 3} and m in {2, 3, 4}:
            return RFMSegmentName.AT_RISK_CUSTOMERS, "Reactivate with personalized value-add content and renewal discounts"
        else:
            return RFMSegmentName.HIBERNATING_LOST, "Automated low-cost re-engagement surveys and self-serve campaigns"

    @classmethod
    def evaluate_customer(cls, profile: CustomerRFMProfile) -> EvaluatedRFMScore:
        r = cls.score_recency(profile.recency_days)
        f = cls.score_frequency(profile.frequency_orders_count)
        m = cls.score_monetary(profile.monetary_total_spend_usd)
        rfm_str = f"{r}{f}{m}"

        segment, action = cls.classify_segment(r, f, m)

        # Predictive Annual CLV formula: (AOV * Purchase_Frequency * Gross_Margin * Margin_Multiplier)
        margin_factor = Decimal("0.65")  # 65% gross margin baseline
        retention_multiplier = Decimal(str(round(0.5 + (r * 0.15) + (f * 0.10), 2)))
        annual_clv = (
            profile.average_order_value_usd * Decimal(str(max(1, profile.frequency_orders_count))) * margin_factor * retention_multiplier
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        return EvaluatedRFMScore(
            customer_id=profile.customer_id,
            account_name=profile.account_name,
            recency_score=r,
            frequency_score=f,
            monetary_score=m,
            rfm_cell=rfm_str,
            segment=segment,
            predicted_annual_clv_usd=annual_clv,
            recommended_retention_action=action
        )

    @classmethod
    def generate_synthetic_cohort_matrix(cls) -> List[CohortRetentionRow]:
        """Generate benchmark SaaS enterprise cohort retention matrix (Net Retention Rate > 110%)."""
        cohorts = [
            ("2025-01", 45, Decimal("450000.00"), [100.0, 98.2, 96.5, 95.8, 97.4, 99.1, 102.3, 105.6, 108.2, 111.4, 114.2, 118.5]),
            ("2025-04", 52, Decimal("520000.00"), [100.0, 99.0, 97.8, 98.5, 101.2, 104.8, 107.5, 110.2, 113.8, 116.5, 119.2, 122.0]),
            ("2025-07", 60, Decimal("600000.00"), [100.0, 98.5, 97.0, 99.2, 103.4, 106.8, 109.5, 112.4, 115.8, 118.2, 121.5, 124.8]),
            ("2025-10", 68, Decimal("680000.00"), [100.0, 99.2, 98.4, 101.5, 105.8, 108.9, 112.5, 115.8, 118.9, 122.4, 125.6, 128.9]),
        ]
        return [
            CohortRetentionRow(c[0], c[1], c[2], c[3]) for c in cohorts
        ]
