"""Customer 360 Health Scoring, Retention Heuristics, and Churn Prediction Engine.

Computes weighted multi-factor customer health score (0 to 100):
- Product Adoption & Active Daily Users (25%)
- Open Support Ticket Severity & SLA Breaches (20%)
- Invoice Payment Promptness & Dunning Risk (20%)
- Net Promoter Score (NPS) & CSAT Survey Sentiment (15%)
- Executive Relationship Engagement & QBR Cadence (20%)
Generates automated churn warning signals and mitigation playbooks.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Tuple


class AccountHealthTier(str, Enum):
    CHAMPION = "CHAMPION"          # Score >= 85
    HEALTHY = "HEALTHY"            # Score 70 - 84
    AT_RISK = "AT_RISK"            # Score 50 - 69
    CRITICAL_CHURN = "CRITICAL_CHURN" # Score < 50


class ChurnRiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    IMMINENT = "IMMINENT"


@dataclass
class CustomerHealthTelemetry:
    customer_id: str
    account_name: str
    mrr_usd: Decimal
    licensed_seats: int
    active_daily_users_30d: int
    open_critical_tickets: int
    avg_ticket_resolution_hours: float
    days_sales_outstanding_dso: int
    past_due_invoices_count: int
    latest_nps_score: int  # -100 to +100
    days_since_last_qbr: int
    renewal_days_remaining: int


@dataclass
class HealthScoreBreakdown:
    customer_id: str
    account_name: str
    overall_health_score: int  # 0 to 100
    health_tier: AccountHealthTier
    churn_risk: ChurnRiskLevel
    adoption_score: int
    support_score: int
    finance_score: int
    sentiment_score: int
    relationship_score: int
    predicted_churn_probability_pct: float
    recommended_playbook_action: str
    alert_flags: List[str]


class CustomerHealthScorer:
    """Enterprise Customer Health and Churn Predictor."""

    @classmethod
    def calculate_health_score(cls, t: CustomerHealthTelemetry) -> HealthScoreBreakdown:
        flags: List[str] = []

        # 1. Adoption Score (25% weight)
        seat_utilization = (t.active_daily_users_30d / max(1, t.licensed_seats)) * 100.0
        if seat_utilization >= 80.0:
            adoption = 100
        elif seat_utilization >= 60.0:
            adoption = 80
        elif seat_utilization >= 40.0:
            adoption = 60
        else:
            adoption = 30
            flags.append("LOW_PRODUCT_ADOPTION: Seat utilization below 40%")

        # 2. Support Score (20% weight)
        if t.open_critical_tickets == 0 and t.avg_ticket_resolution_hours <= 8.0:
            support = 100
        elif t.open_critical_tickets == 0:
            support = 85
        elif t.open_critical_tickets == 1:
            support = 55
            flags.append("OPEN_CRITICAL_TICKET: 1 Sev-1 ticket open")
        else:
            support = 20
            flags.append(f"SEV1_TICKET_ESCALATION: {t.open_critical_tickets} critical tickets unresolved")

        # 3. Finance & DSO Score (20% weight)
        if t.past_due_invoices_count == 0 and t.days_sales_outstanding_dso <= 30:
            finance = 100
        elif t.past_due_invoices_count == 0:
            finance = 80
        elif t.past_due_invoices_count == 1:
            finance = 45
            flags.append("PAST_DUE_INVOICE: 1 invoice overdue")
        else:
            finance = 15
            flags.append(f"COLLECTIONS_RISK: {t.past_due_invoices_count} overdue invoices")

        # 4. Sentiment & NPS (15% weight)
        if t.latest_nps_score >= 50:
            sentiment = 100
        elif t.latest_nps_score >= 20:
            sentiment = 80
        elif t.latest_nps_score >= 0:
            sentiment = 60
        elif t.latest_nps_score >= -30:
            sentiment = 40
            flags.append("DETRACTOR_NPS: Passive/Detractor survey response")
        else:
            sentiment = 10
            flags.append("CRITICAL_DETRACTOR: Negative NPS score < -30")

        # 5. Relationship & QBR Cadence (20% weight)
        if t.days_since_last_qbr <= 90:
            relationship = 100
        elif t.days_since_last_qbr <= 180:
            relationship = 75
        elif t.days_since_last_qbr <= 270:
            relationship = 50
            flags.append("QBR_OVERDUE: No executive check-in over 6 months")
        else:
            relationship = 20
            flags.append("EXECUTIVE_DISENGAGEMENT: No contact in > 9 months")

        # Weighted Total Score
        total_score = int(
            (adoption * 0.25) +
            (support * 0.20) +
            (finance * 0.20) +
            (sentiment * 0.15) +
            (relationship * 0.20)
        )
        total_score = max(0, min(100, total_score))

        # Health Tier & Churn Risk
        if total_score >= 85:
            tier = AccountHealthTier.CHAMPION
            risk = ChurnRiskLevel.LOW
            churn_prob = 2.5
            action = "Identify expansion, up-sell, and reference customer opportunities"
        elif total_score >= 70:
            tier = AccountHealthTier.HEALTHY
            risk = ChurnRiskLevel.LOW
            churn_prob = 8.0
            action = "Maintain quarterly executive cadence and standard CS check-ins"
        elif total_score >= 50:
            tier = AccountHealthTier.AT_RISK
            risk = ChurnRiskLevel.MEDIUM if t.renewal_days_remaining > 90 else ChurnRiskLevel.HIGH
            churn_prob = 35.0
            action = "Deploy Customer Success Manager for targeted adoption review & root cause remediation"
        else:
            tier = AccountHealthTier.CRITICAL_CHURN
            risk = ChurnRiskLevel.IMMINENT
            churn_prob = 78.5
            action = "EMERGENCY: Initiate Executive Sponsor intervention, schedule emergency QBR, resolve Sev-1 tickets"

        return HealthScoreBreakdown(
            customer_id=t.customer_id,
            account_name=t.account_name,
            overall_health_score=total_score,
            health_tier=tier,
            churn_risk=risk,
            adoption_score=adoption,
            support_score=support,
            finance_score=finance,
            sentiment_score=sentiment,
            relationship_score=relationship,
            predicted_churn_probability_pct=churn_prob,
            recommended_playbook_action=action,
            alert_flags=flags
        )
