"""Enterprise Service Level Agreement (SLA) Matrix, Business Hours Engine, and Penalty Credit Calculator.

Provides multi-tier SLA policy evaluation (Severity 1 to 4), business hours calendar calculations
with holiday schedule exclusion and timezone conversions, automated breach escalation triggers,
and financial service credit penalty rebate calculations.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, date, time, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class TicketSeverity(str, Enum):
    SEV1_CRITICAL = "SEV1_CRITICAL"      # System down, core revenue impacted
    SEV2_MAJOR = "SEV2_MAJOR"            # Severe degradation, no immediate workaround
    SEV3_MODERATE = "SEV3_MODERATE"      # Normal issue, workaround available
    SEV4_MINOR = "SEV4_MINOR"            # General inquiry, cosmetic UI anomaly


class SLAPlanTier(str, Enum):
    TIER_PLATINUM_24X7 = "TIER_PLATINUM_24X7"
    TIER_GOLD_BUSINESS = "TIER_GOLD_BUSINESS"
    TIER_SILVER_STANDARD = "TIER_SILVER_STANDARD"


@dataclass
class SLAPolicyTarget:
    plan_tier: SLAPlanTier
    severity: TicketSeverity
    first_response_time_minutes: int
    resolution_time_minutes: int
    escalation_window_minutes: int
    requires_24x7_support: bool
    penalty_credit_basis_points: int  # 100 bp = 1% monthly contract credit


@dataclass
class BusinessHoursSchedule:
    """Working schedule definition for non-24x7 support tiers."""
    timezone_name: str = "America/Chicago"
    work_start_time: time = time(8, 0)
    work_end_time: time = time(18, 0)  # 8 AM to 6 PM
    work_days: Set[int] = field(default_factory=lambda: {0, 1, 2, 3, 4})  # Mon - Fri
    holidays: Set[str] = field(default_factory=lambda: {
        "2026-01-01", "2026-05-25", "2026-07-04", "2026-09-07", "2026-11-26", "2026-12-25"
    })


@dataclass
class SLAEvaluationResult:
    ticket_id: str
    severity: TicketSeverity
    plan_tier: SLAPlanTier
    response_deadline: datetime
    resolution_deadline: datetime
    is_response_breached: bool
    is_resolution_breached: bool
    response_elapsed_minutes: float
    resolution_elapsed_minutes: float
    penalty_credit_pct: Decimal
    penalty_credit_usd: Decimal
    escalation_tier_level: int
    remediation_action: str


class SLAMatrixEngine:
    """Enterprise SLA Policy Enforcement and Breach Detection Engine."""

    _POLICY_TABLE: Dict[Tuple[SLAPlanTier, TicketSeverity], SLAPolicyTarget] = {
        # Platinum 24x7 (Mission Critical)
        (SLAPlanTier.TIER_PLATINUM_24X7, TicketSeverity.SEV1_CRITICAL): SLAPolicyTarget(SLAPlanTier.TIER_PLATINUM_24X7, TicketSeverity.SEV1_CRITICAL, 15, 120, 30, True, 500),
        (SLAPlanTier.TIER_PLATINUM_24X7, TicketSeverity.SEV2_MAJOR): SLAPolicyTarget(SLAPlanTier.TIER_PLATINUM_24X7, TicketSeverity.SEV2_MAJOR, 30, 240, 60, True, 250),
        (SLAPlanTier.TIER_PLATINUM_24X7, TicketSeverity.SEV3_MODERATE): SLAPolicyTarget(SLAPlanTier.TIER_PLATINUM_24X7, TicketSeverity.SEV3_MODERATE, 120, 720, 180, True, 100),
        (SLAPlanTier.TIER_PLATINUM_24X7, TicketSeverity.SEV4_MINOR): SLAPolicyTarget(SLAPlanTier.TIER_PLATINUM_24X7, TicketSeverity.SEV4_MINOR, 240, 1440, 360, True, 0),

        # Gold Business Hours (High Priority)
        (SLAPlanTier.TIER_GOLD_BUSINESS, TicketSeverity.SEV1_CRITICAL): SLAPolicyTarget(SLAPlanTier.TIER_GOLD_BUSINESS, TicketSeverity.SEV1_CRITICAL, 30, 240, 60, False, 250),
        (SLAPlanTier.TIER_GOLD_BUSINESS, TicketSeverity.SEV2_MAJOR): SLAPolicyTarget(SLAPlanTier.TIER_GOLD_BUSINESS, TicketSeverity.SEV2_MAJOR, 60, 480, 120, False, 150),
        (SLAPlanTier.TIER_GOLD_BUSINESS, TicketSeverity.SEV3_MODERATE): SLAPolicyTarget(SLAPlanTier.TIER_GOLD_BUSINESS, TicketSeverity.SEV3_MODERATE, 240, 1440, 360, False, 50),
        (SLAPlanTier.TIER_GOLD_BUSINESS, TicketSeverity.SEV4_MINOR): SLAPolicyTarget(SLAPlanTier.TIER_GOLD_BUSINESS, TicketSeverity.SEV4_MINOR, 480, 2880, 720, False, 0),

        # Silver Standard (Standard Support)
        (SLAPlanTier.TIER_SILVER_STANDARD, TicketSeverity.SEV1_CRITICAL): SLAPolicyTarget(SLAPlanTier.TIER_SILVER_STANDARD, TicketSeverity.SEV1_CRITICAL, 60, 480, 120, False, 100),
        (SLAPlanTier.TIER_SILVER_STANDARD, TicketSeverity.SEV2_MAJOR): SLAPolicyTarget(SLAPlanTier.TIER_SILVER_STANDARD, TicketSeverity.SEV2_MAJOR, 120, 960, 240, False, 50),
        (SLAPlanTier.TIER_SILVER_STANDARD, TicketSeverity.SEV3_MODERATE): SLAPolicyTarget(SLAPlanTier.TIER_SILVER_STANDARD, TicketSeverity.SEV3_MODERATE, 480, 2880, 720, False, 0),
        (SLAPlanTier.TIER_SILVER_STANDARD, TicketSeverity.SEV4_MINOR): SLAPolicyTarget(SLAPlanTier.TIER_SILVER_STANDARD, TicketSeverity.SEV4_MINOR, 960, 5760, 1440, False, 0),
    }

    @classmethod
    def get_policy(cls, plan_tier: SLAPlanTier, severity: TicketSeverity) -> SLAPolicyTarget:
        return cls._POLICY_TABLE.get(
            (plan_tier, severity),
            cls._POLICY_TABLE[(SLAPlanTier.TIER_SILVER_STANDARD, TicketSeverity.SEV3_MODERATE)]
        )

    @classmethod
    def add_business_minutes(
        cls,
        start_dt: datetime,
        minutes_to_add: int,
        schedule: Optional[BusinessHoursSchedule] = None
    ) -> datetime:
        """Add duration in business working minutes, skipping weekends and holidays."""
        sched = schedule or BusinessHoursSchedule()
        current = start_dt
        remaining = minutes_to_add

        while remaining > 0:
            # If current day is holiday or weekend, advance to next business day start
            date_str = current.date().isoformat()
            if current.weekday() not in sched.work_days or date_str in sched.holidays:
                current = datetime.combine(current.date() + timedelta(days=1), sched.work_start_time, tzinfo=current.tzinfo)
                continue

            # If before work start, advance to work start
            day_start = datetime.combine(current.date(), sched.work_start_time, tzinfo=current.tzinfo)
            day_end = datetime.combine(current.date(), sched.work_end_time, tzinfo=current.tzinfo)

            if current < day_start:
                current = day_start

            if current >= day_end:
                current = datetime.combine(current.date() + timedelta(days=1), sched.work_start_time, tzinfo=current.tzinfo)
                continue

            available_minutes = int((day_end - current).total_seconds() / 60)
            if remaining <= available_minutes:
                current += timedelta(minutes=remaining)
                remaining = 0
            else:
                remaining -= available_minutes
                current = datetime.combine(current.date() + timedelta(days=1), sched.work_start_time, tzinfo=current.tzinfo)

        return current

    @classmethod
    def evaluate_sla_performance(
        cls,
        ticket_id: str,
        plan_tier: SLAPlanTier,
        severity: TicketSeverity,
        created_at: datetime,
        first_response_at: Optional[datetime],
        resolved_at: Optional[datetime],
        monthly_mrr_usd: Decimal = Decimal("10000.00")
    ) -> SLAEvaluationResult:
        """Evaluate ticket compliance, SLA breach state, and penalty credit."""
        policy = cls.get_policy(plan_tier, severity)

        if policy.requires_24x7_support:
            resp_deadline = created_at + timedelta(minutes=policy.first_response_time_minutes)
            resol_deadline = created_at + timedelta(minutes=policy.resolution_time_minutes)
        else:
            resp_deadline = cls.add_business_minutes(created_at, policy.first_response_time_minutes)
            resol_deadline = cls.add_business_minutes(created_at, policy.resolution_time_minutes)

        now = datetime.now(timezone.utc)
        effective_resp = first_response_at or now
        effective_resol = resolved_at or now

        resp_elapsed = (effective_resp - created_at).total_seconds() / 60.0
        resol_elapsed = (effective_resol - created_at).total_seconds() / 60.0

        is_resp_breached = effective_resp > resp_deadline
        is_resol_breached = effective_resol > resol_deadline

        # Compute Penalty Service Credit
        penalty_pct = Decimal("0.00")
        if is_resol_breached:
            penalty_pct = Decimal(str(policy.penalty_credit_basis_points)) / Decimal("100.0")
        elif is_resp_breached:
            penalty_pct = (Decimal(str(policy.penalty_credit_basis_points)) / Decimal("200.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        penalty_usd = (monthly_mrr_usd * (penalty_pct / Decimal("100.0"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Escalation Tier
        if resol_elapsed >= (policy.resolution_time_minutes * 2):
            esc_level = 3
            action = "EXECUTIVE_ESCALATION: VP of Engineering and Support Director notification dispatched"
        elif resol_elapsed >= policy.escalation_window_minutes:
            esc_level = 2
            action = "LEAD_ESCALATION: Tier-3 Principal Support Engineer assigned"
        else:
            esc_level = 1
            action = "NORMAL: Standard triage queue"

        return SLAEvaluationResult(
            ticket_id=ticket_id,
            severity=severity,
            plan_tier=plan_tier,
            response_deadline=resp_deadline,
            resolution_deadline=resol_deadline,
            is_response_breached=is_resp_breached,
            is_resolution_breached=is_resol_breached,
            response_elapsed_minutes=round(resp_elapsed, 1),
            resolution_elapsed_minutes=round(resol_elapsed, 1),
            penalty_credit_pct=penalty_pct,
            penalty_credit_usd=penalty_usd,
            escalation_tier_level=esc_level,
            remediation_action=action
        )
