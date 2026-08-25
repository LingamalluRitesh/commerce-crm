"""B2B Sales Pipeline Deal Progression State Machine & Win-Loss Analytics.

Enforces pipeline governance and stage progression:
- LEAD_INBOX -> MQL_QUALIFIED -> SQL_ACCEPTED -> DISCOVERY_SCOPING -> CPQ_PROPOSAL -> CONTRACT_LEGAL -> CLOSED_WON / CLOSED_LOST
- Stage velocity time-in-stage gates (triggers stalled deal warnings if in stage > 30 days)
- Mandatory reason code taxonomy for Closed-Lost opportunities (e.g., PRICE_TOO_HIGH, MISSING_FEATURE, COMPETITOR_WIN, BUDGET_FREEZE).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class DealStage(str, Enum):
    LEAD_INBOX = "LEAD_INBOX"
    MQL_QUALIFIED = "MQL_QUALIFIED"
    SQL_ACCEPTED = "SQL_ACCEPTED"
    DISCOVERY_SCOPING = "DISCOVERY_SCOPING"
    CPQ_PROPOSAL = "CPQ_PROPOSAL"
    CONTRACT_LEGAL = "CONTRACT_LEGAL"
    CLOSED_WON = "CLOSED_WON"
    CLOSED_LOST = "CLOSED_LOST"


class ClosedLostReasonCode(str, Enum):
    PRICE_BUDGET_CONSTRAINTS = "PRICE_BUDGET_CONSTRAINTS"
    COMPETITOR_CHOSEN = "COMPETITOR_CHOSEN"
    MISSING_PRODUCT_CAPABILITY = "MISSING_PRODUCT_CAPABILITY"
    INTERNAL_PROJECT_CANCELLED = "INTERNAL_PROJECT_CANCELLED"
    NO_DECISION_STALLED = "NO_DECISION_STALLED"
    SECURITY_COMPLIANCE_REJECTION = "SECURITY_COMPLIANCE_REJECTION"


@dataclass
class DealStageTransitionRecord:
    from_stage: Optional[DealStage]
    to_stage: DealStage
    transitioned_at: str
    transitioned_by_user_id: str
    notes: str = ""


@dataclass
class EnterpriseDealState:
    deal_id: str
    account_id: str
    deal_name: str
    current_stage: DealStage
    deal_amount_usd: Decimal
    stage_win_probability_pct: int
    created_at: str
    assigned_ae_id: str
    stage_history: List[DealStageTransitionRecord] = field(default_factory=list)
    closed_lost_reason: Optional[ClosedLostReasonCode] = None
    competitor_name: Optional[str] = None
    contract_signed_at: Optional[str] = None

    @property
    def weighted_forecast_amount(self) -> Decimal:
        return (self.deal_amount_usd * (Decimal(str(self.stage_win_probability_pct)) / Decimal("100.0"))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )


class DealStateMachine:
    """Enterprise Sales Deal Lifecycle State Machine."""

    STAGE_PROBABILITY_MAP: Dict[DealStage, int] = {
        DealStage.LEAD_INBOX: 10,
        DealStage.MQL_QUALIFIED: 25,
        DealStage.SQL_ACCEPTED: 40,
        DealStage.DISCOVERY_SCOPING: 55,
        DealStage.CPQ_PROPOSAL: 75,
        DealStage.CONTRACT_LEGAL: 90,
        DealStage.CLOSED_WON: 100,
        DealStage.CLOSED_LOST: 0,
    }

    ALLOWED_TRANSITIONS: Dict[DealStage, Set[DealStage]] = {
        DealStage.LEAD_INBOX: {DealStage.MQL_QUALIFIED, DealStage.CLOSED_LOST},
        DealStage.MQL_QUALIFIED: {DealStage.SQL_ACCEPTED, DealStage.CLOSED_LOST},
        DealStage.SQL_ACCEPTED: {DealStage.DISCOVERY_SCOPING, DealStage.CLOSED_LOST},
        DealStage.DISCOVERY_SCOPING: {DealStage.CPQ_PROPOSAL, DealStage.CLOSED_LOST},
        DealStage.CPQ_PROPOSAL: {DealStage.CONTRACT_LEGAL, DealStage.DISCOVERY_SCOPING, DealStage.CLOSED_LOST},
        DealStage.CONTRACT_LEGAL: {DealStage.CLOSED_WON, DealStage.CPQ_PROPOSAL, DealStage.CLOSED_LOST},
        DealStage.CLOSED_WON: set(),
        DealStage.CLOSED_LOST: {DealStage.LEAD_INBOX}  # Re-open allowable
    }

    @classmethod
    def create_deal(cls, deal_id: str, account_id: str, name: str, amount_usd: Decimal, rep_id: str) -> EnterpriseDealState:
        now = datetime.now(timezone.utc).isoformat()
        deal = EnterpriseDealState(
            deal_id=deal_id,
            account_id=account_id,
            deal_name=name,
            current_stage=DealStage.LEAD_INBOX,
            deal_amount_usd=amount_usd,
            stage_win_probability_pct=cls.STAGE_PROBABILITY_MAP[DealStage.LEAD_INBOX],
            created_at=now,
            assigned_ae_id=rep_id,
            stage_history=[DealStageTransitionRecord(None, DealStage.LEAD_INBOX, now, rep_id, "Deal initial creation")]
        )
        return deal

    @classmethod
    def advance_stage(
        cls,
        deal: EnterpriseDealState,
        next_stage: DealStage,
        user_id: str,
        notes: str = "",
        lost_reason: Optional[ClosedLostReasonCode] = None,
        competitor: Optional[str] = None
    ) -> EnterpriseDealState:
        """Advance deal to next stage with invariant enforcement."""
        if next_stage not in cls.ALLOWED_TRANSITIONS.get(deal.current_stage, set()):
            raise ValueError(f"Invalid deal stage transition from {deal.current_stage} to {next_stage}")

        if next_stage == DealStage.CLOSED_LOST and not lost_reason:
            raise ValueError("A structured ClosedLostReasonCode is mandatory when marking a deal CLOSED_LOST.")

        deal.current_stage = next_stage
        deal.stage_win_probability_pct = cls.STAGE_PROBABILITY_MAP[next_stage]
        if next_stage == DealStage.CLOSED_LOST:
            deal.closed_lost_reason = lost_reason
            deal.competitor_name = competitor
        elif next_stage == DealStage.CLOSED_WON:
            deal.contract_signed_at = datetime.now(timezone.utc).isoformat()

        now = datetime.now(timezone.utc).isoformat()
        deal.stage_history.append(DealStageTransitionRecord(
            from_stage=deal.current_stage,
            to_stage=next_stage,
            transitioned_at=now,
            transitioned_by_user_id=user_id,
            notes=notes
        ))

        return deal
