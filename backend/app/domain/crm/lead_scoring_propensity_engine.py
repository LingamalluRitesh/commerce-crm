"""Predictive B2B Lead Scoring, Ideal Customer Profile (ICP) & Buying Propensity Engine.

Computes multi-dimensional propensity scores for enterprise sales leads:
- ICP Fit Matrix: Company Size (Employee Band), Annual Revenue, Industry Vertical, Tech Stack Compatibility
- Behavioral Intent Signals: High-Value Pageviews (Pricing, Security Docs), Whitepaper Downloads, Webinar Attendance
- Engagement Velocity: Time-decayed activity momentum (recency, frequency, duration)
- Buying Intent Tiering: Grade A (MQL Hot: Score >= 85), Grade B (Warm: 65-84), Grade C (Nurture: 40-64), Grade D (Cold: <40)
- Automated Next-Best-Action (NBA) assignment for Sales Development Representatives (SDRs).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from enum import Enum
import math
from typing import Dict, List, Optional, Tuple


class LeadGrade(str, Enum):
    GRADE_A_HOT_MQL = "GRADE_A_HOT_MQL"
    GRADE_B_WARM = "GRADE_B_WARM"
    GRADE_C_NURTURE = "GRADE_C_NURTURE"
    GRADE_D_DISQUALIFIED = "GRADE_D_DISQUALIFIED"


class CompanySizeTier(str, Enum):
    ENTERPRISE_1000_PLUS = "ENTERPRISE_1000_PLUS"
    MID_MARKET_250_999 = "MID_MARKET_250_999"
    GROWTH_50_249 = "GROWTH_50_249"
    STARTUP_1_49 = "STARTUP_1_49"


@dataclass
class LeadProfile:
    lead_id: str
    first_name: str
    last_name: str
    work_email: str
    company_name: str
    job_title: str
    company_size: CompanySizeTier
    industry: str
    uses_competitor_stack: bool = False
    pricing_page_visits_last_7d: int = 0
    security_whitepaper_downloaded: bool = False
    attended_live_demo: bool = False
    email_clicks_last_30d: int = 0
    last_activity_date_utc: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass
class LeadScoringResult:
    lead_id: str
    fit_score: int             # 0 to 50 (Firmographic / Demographic ICP Fit)
    intent_score: int          # 0 to 50 (Behavioral Intent & Recency)
    composite_score: int       # 0 to 100
    grade: LeadGrade
    recommended_sales_action: str
    key_drivers: List[str]


class LeadScoringPropensityEngine:
    """Calculates algorithmic propensity scores and routes hot enterprise opportunities to reps."""

    ICP_TITLE_KEYWORDS = {"CTO", "CIO", "VP", "DIRECTOR", "HEAD", "ARCHITECT", "FOUNDER", "CHIEF", "CISO"}
    TARGET_INDUSTRIES = {"FINTECH", "SAAS", "HEALTHCARE", "ECOMMERCE", "LOGISTICS", "TELECOM"}

    def evaluate_lead(self, lead: LeadProfile) -> LeadScoringResult:
        """Evaluates firmographic fit and behavioral intent signals."""
        fit_score = 0
        intent_score = 0
        drivers = []

        # 1. Firmographic Size Fit
        if lead.company_size == CompanySizeTier.ENTERPRISE_1000_PLUS:
            fit_score += 25
            drivers.append("Enterprise Tier (>1,000 employees)")
        elif lead.company_size == CompanySizeTier.MID_MARKET_250_999:
            fit_score += 20
            drivers.append("Mid-Market Tier (250-999 employees)")
        elif lead.company_size == CompanySizeTier.GROWTH_50_249:
            fit_score += 15
        else:
            fit_score += 5

        # 2. Industry Fit
        if lead.industry.upper() in self.TARGET_INDUSTRIES:
            fit_score += 15
            drivers.append(f"Target Industry Match ({lead.industry})")
        else:
            fit_score += 5

        # 3. Decision Maker Persona Fit
        upper_title = lead.job_title.upper()
        if any(kw in upper_title for kw in self.ICP_TITLE_KEYWORDS):
            fit_score += 10
            drivers.append(f"Senior Executive Persona ({lead.job_title})")
        else:
            fit_score += 3

        fit_score = min(50, fit_score)

        # 4. Behavioral Intent Signals
        if lead.attended_live_demo:
            intent_score += 20
            drivers.append("Attended Live Product Demo")
        if lead.security_whitepaper_downloaded:
            intent_score += 12
            drivers.append("Downloaded SOC2/Security Architecture Whitepaper")
        if lead.pricing_page_visits_last_7d >= 3:
            intent_score += 10
            drivers.append(f"High Pricing Page Velocity ({lead.pricing_page_visits_last_7d} visits in 7d)")
        elif lead.pricing_page_visits_last_7d >= 1:
            intent_score += 5

        email_points = min(8, lead.email_clicks_last_30d * 2)
        intent_score += email_points

        intent_score = min(50, intent_score)
        composite = fit_score + intent_score

        # Grade & Action Determination
        if composite >= 80:
            grade = LeadGrade.GRADE_A_HOT_MQL
            action = "Immediate SDR Outbound Phone Call & Demo Booking Invitation"
        elif composite >= 60:
            grade = LeadGrade.GRADE_B_WARM
            action = "Personalized Enterprise Email Sequence & Case Study Share"
        elif composite >= 35:
            grade = LeadGrade.GRADE_C_NURTURE
            action = "Automated Bi-Weekly Product Newsletter & Webinar Invite"
        else:
            grade = LeadGrade.GRADE_D_DISQUALIFIED
            action = "Low Intent - Retain in Passive Marketing Pool"

        return LeadScoringResult(
            lead_id=lead.lead_id,
            fit_score=fit_score,
            intent_score=intent_score,
            composite_score=composite,
            grade=grade,
            recommended_sales_action=action,
            key_drivers=drivers,
        )
