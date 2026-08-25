"""Multivariate Lead Propensity Scoring, Intent Telemetry, and Deal Forecast Engine.

Implements B2B lead conversion propensity scoring (0 to 100):
- Firmographic Ideal Customer Profile (ICP) Fit (30%)
- Digital Intent & Content Engagement Signals (25%)
- Technographic Stack Alignment (20%)
- Budget Authority & Decision Maker Role (15%)
- Buying Velocity & Timeline Urgency (10%)
Predicts deal win probability, expected contract value, and next recommended sales action.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class LeadGrade(str, Enum):
    GRADE_A_HOT = "GRADE_A_HOT"          # Score >= 85
    GRADE_B_WARM = "GRADE_B_WARM"        # Score 70 - 84
    GRADE_C_NURTURE = "GRADE_C_NURTURE"  # Score 50 - 69
    GRADE_D_UNQUALIFIED = "GRADE_D_UNQUALIFIED" # Score < 50


class DecisionMakerRole(str, Enum):
    C_LEVEL_EXECUTIVE = "C_LEVEL_EXECUTIVE"  # CEO, CTO, CIO, CFO
    VP_DIRECTOR = "VP_DIRECTOR"              # VP Engineering, Director of IT
    TECHNICAL_LEAD = "TECHNICAL_LEAD"        # Principal Architect, Team Lead
    INDIVIDUAL_CONTRIBUTOR = "INDIVIDUAL_CONTRIBUTOR"
    STUDENT_RESEARCHER = "STUDENT_RESEARCHER"


@dataclass
class LeadProfileContext:
    lead_id: str
    company_name: str
    industry: str
    employee_count: int
    annual_revenue_usd: Decimal
    contact_role: DecisionMakerRole
    website_visits_last_14d: int
    whitepaper_downloads: int
    pricing_page_visits: int
    api_docs_views: int
    uses_target_tech_stack: bool  # e.g., Kubernetes, Next.js, Postgres
    budget_confirmed: bool
    target_decision_timeframe_months: int


@dataclass
class LeadScoringResult:
    lead_id: str
    company_name: str
    total_propensity_score: int
    grade: LeadGrade
    predicted_win_probability_pct: float
    estimated_annual_deal_value_usd: Decimal
    icp_fit_score: int
    intent_score: int
    technographic_score: int
    authority_score: int
    velocity_score: int
    recommended_sales_action: str
    key_qualification_insights: List[str]


class LeadScoringEngine:
    """Enterprise AI/ML Lead Scoring and Conversion Forecast Engine."""

    TARGET_INDUSTRIES: Set[str] = {
        "HEALTHCARE_LIFE_SCIENCES",
        "FINTECH_BANKING",
        "ENTERPRISE_SOFTWARE_SAAS",
        "INDUSTRIAL_LOGISTICS",
        "AEROSPACE_DEFENSE"
    }

    @classmethod
    def evaluate_lead(cls, ctx: LeadProfileContext) -> LeadScoringResult:
        insights: List[str] = []

        # 1. Firmographic ICP Fit (30% weight)
        icp = 0
        if ctx.industry.upper() in cls.TARGET_INDUSTRIES:
            icp += 50
        else:
            icp += 20

        if 100 <= ctx.employee_count <= 5000:
            icp += 50
        elif ctx.employee_count > 5000:
            icp += 40
        elif ctx.employee_count >= 20:
            icp += 25
        else:
            icp += 10
            insights.append("SMALL_COMPANY: Under 20 employees")

        # 2. Intent Telemetry (25% weight)
        intent = 0
        intent += min(30, ctx.website_visits_last_14d * 3)
        intent += min(25, ctx.whitepaper_downloads * 12)
        intent += min(25, ctx.pricing_page_visits * 10)
        intent += min(20, ctx.api_docs_views * 5)
        intent = min(100, intent)
        if ctx.pricing_page_visits >= 3:
            insights.append("HIGH_BUYING_INTENT: Multiple pricing page visits")

        # 3. Technographic Alignment (20% weight)
        tech = 100 if ctx.uses_target_tech_stack else 40

        # 4. Decision Maker Authority (15% weight)
        if ctx.contact_role == DecisionMakerRole.C_LEVEL_EXECUTIVE:
            authority = 100
        elif ctx.contact_role == DecisionMakerRole.VP_DIRECTOR:
            authority = 85
        elif ctx.contact_role == DecisionMakerRole.TECHNICAL_LEAD:
            authority = 65
        elif ctx.contact_role == DecisionMakerRole.INDIVIDUAL_CONTRIBUTOR:
            authority = 35
        else:
            authority = 10

        if ctx.budget_confirmed:
            authority = min(100, authority + 15)
            insights.append("BUDGET_CONFIRMED: Budget pre-allocated")

        # 5. Velocity & Timeframe (10% weight)
        if ctx.target_decision_timeframe_months <= 1:
            velocity = 100
        elif ctx.target_decision_timeframe_months <= 3:
            velocity = 80
        elif ctx.target_decision_timeframe_months <= 6:
            velocity = 50
        else:
            velocity = 20

        # Aggregate Score
        total_score = int(
            (icp * 0.30) +
            (intent * 0.25) +
            (tech * 0.20) +
            (authority * 0.15) +
            (velocity * 0.10)
        )
        total_score = max(0, min(100, total_score))

        # Win Probability: Logistic mapping
        win_prob = round(100.0 / (1.0 + math.exp(-0.06 * (total_score - 50))), 1)

        # Estimated Deal Value: Base $25k + $150/employee
        est_deal = (Decimal("25000.00") + (Decimal(str(min(1000, ctx.employee_count))) * Decimal("150.00"))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        if total_score >= 85:
            grade = LeadGrade.GRADE_A_HOT
            action = "DIRECT_SALES_DISPATCH: Route immediately to Strategic Enterprise Account Executive"
        elif total_score >= 70:
            grade = LeadGrade.GRADE_B_WARM
            action = "SCHEDULE_DEMO: SDR to schedule technical discovery & platform demonstration"
        elif total_score >= 50:
            grade = LeadGrade.GRADE_C_NURTURE
            action = "MARKETING_AUTOMATION: Enroll in targeted enterprise email nurture sequence"
        else:
            grade = LeadGrade.GRADE_D_UNQUALIFIED
            action = "SELF_SERVE: Provide developer documentation and community sandbox access"

        return LeadScoringResult(
            lead_id=ctx.lead_id,
            company_name=ctx.company_name,
            total_propensity_score=total_score,
            grade=grade,
            predicted_win_probability_pct=win_prob,
            estimated_annual_deal_value_usd=est_deal,
            icp_fit_score=icp,
            intent_score=intent,
            technographic_score=tech,
            authority_score=authority,
            velocity_score=velocity,
            recommended_sales_action=action,
            key_qualification_insights=insights
        )
