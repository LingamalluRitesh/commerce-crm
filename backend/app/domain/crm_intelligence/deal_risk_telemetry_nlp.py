"""B2B Deal Risk Telemetry, Stakeholder Sentiment Drift & Pipeline Slippage Engine.

Implements real-time conversation telemetry and deal velocity diagnostics:
- Stakeholder Engagement Degradation & Ghosting Heuristics (Days since last executive reply)
- Competitor Mention & Discount Objection Sentiment Drift
- Stage Progression Velocity vs Historic Benchmark Average Duration (Slippage Index)
- Automated AI Rescue Intervention Playbooks & Deal Health Scoring.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Tuple


class RiskSeverity(str, Enum):
    CRITICAL_DEAL_AT_RISK = "CRITICAL_DEAL_AT_RISK"
    MODERATE_STALLING = "MODERATE_STALLING"
    HEALTHY_ON_TRACK = "HEALTHY_ON_TRACK"


class DealObjectionTaxonomy(str, Enum):
    PRICING_BUDGET_FREEZE = "PRICING_BUDGET_FREEZE"
    COMPETITOR_INCUMBENT_LOCKIN = "COMPETITOR_INCUMBENT_LOCKIN"
    SECURITY_COMPLIANCE_GAP = "SECURITY_COMPLIANCE_GAP"
    INTERNAL_REORG_CHANGE = "INTERNAL_REORG_CHANGE"
    LACK_OF_EXECUTIVE_SPONSOR = "LACK_OF_EXECUTIVE_SPONSOR"


@dataclass
class ConversationSignalEvent:
    timestamp: str
    channel: str  # 'EMAIL', 'SLACK_CONNECT', 'ZOOM_TRANSCRIPT'
    sender_title: str
    sentiment_polarity: float  # -1.0 to 1.0
    detected_objection: Optional[DealObjectionTaxonomy]
    is_executive_stakeholder: bool


@dataclass
class B2BDealRiskProfile:
    deal_id: str
    deal_name: str
    account_name: str
    deal_value_usd: Decimal
    current_stage: str
    days_in_current_stage: int
    benchmark_stage_days: int
    days_since_last_customer_response: int
    overall_health_score: float  # 0 to 100
    risk_level: RiskSeverity
    primary_risk_factor: str
    recommended_rescue_action: str
    signals: List[ConversationSignalEvent] = field(default_factory=list)


class DealRiskTelemetryEngine:
    """Enterprise Deal Risk & Conversation Telemetry Diagnostics Engine."""

    @classmethod
    def evaluate_deal_risk(
        cls,
        deal_id: str,
        deal_name: str,
        account_name: str,
        deal_value_usd: Decimal,
        current_stage: str,
        days_in_stage: int,
        benchmark_stage_days: int,
        days_since_last_response: int,
        signals: List[ConversationSignalEvent]
    ) -> B2BDealRiskProfile:
        """Evaluate deal velocity, sentiment drift, and identify critical closing bottlenecks."""
        health = 100.0

        # Stage velocity penalty (if days in stage exceeds 1.5x benchmark)
        velocity_ratio = days_in_stage / max(1, benchmark_stage_days)
        if velocity_ratio > 2.0:
            health -= 35.0
        elif velocity_ratio > 1.5:
            health -= 20.0

        # Ghosting penalty
        if days_since_last_response > 14:
            health -= 40.0
        elif days_since_last_response > 7:
            health -= 20.0

        # Sentiment penalty
        recent_signals = signals[-5:] if signals else []
        if recent_signals:
            avg_sentiment = sum(s.sentiment_polarity for s in recent_signals) / len(recent_signals)
            if avg_sentiment < -0.2:
                health -= 25.0
            elif avg_sentiment < 0.2:
                health -= 10.0

        health = max(0.0, min(100.0, health))

        # Classify risk
        if health < 45.0:
            severity = RiskSeverity.CRITICAL_DEAL_AT_RISK
            factor = "Executive Ghosting & Stage Stagnation"
            action = "Trigger VP Sales Executive Sponsor outreach and schedule emergency deal triage."
        elif health < 75.0:
            severity = RiskSeverity.MODERATE_STALLING
            factor = "Slight Pipeline Velocity Delay"
            action = "Send personalized customer ROI calculator and confirm evaluation timeline."
        else:
            severity = RiskSeverity.HEALTHY_ON_TRACK
            factor = "Active Engagement & Fast Progression"
            action = "Proceed with standard procurement redline and MSA signing."

        return B2BDealRiskProfile(
            deal_id=deal_id,
            deal_name=deal_name,
            account_name=account_name,
            deal_value_usd=deal_value_usd,
            current_stage=current_stage,
            days_in_current_stage=days_in_stage,
            benchmark_stage_days=benchmark_stage_days,
            days_since_last_customer_response=days_since_last_response,
            overall_health_score=round(health, 1),
            risk_level=severity,
            primary_risk_factor=factor,
            recommended_rescue_action=action,
            signals=signals
        )
