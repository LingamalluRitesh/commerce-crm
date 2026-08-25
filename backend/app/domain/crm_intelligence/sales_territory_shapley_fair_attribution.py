"""Game-Theoretic Shapley Value Co-Selling Deal Commission Attribution Engine.

Implements cooperative game theory (Lloyd Shapley, 1953) for multi-stakeholder sales attribution:
- Marginal Value Contribution across all 2^n Coalition Subsets:
  - Account Executive (Deal Lead & Commercial Negotiation)
  - Solution Architect (Technical Proof of Concept / Architecture Validation)
  - Business Development Rep (Inbound Discovery / Sourcing)
  - Customer Success Manager (Executive Sponsor Alignment & Adoption Pilot)
  - Industry Domain Specialist (Vertical Compliance & RFP Response)
- Axiomatic Fairness Guarantees: Efficiency, Symmetry, Dummy Player, and Additivity.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
import itertools
import math
from typing import Dict, List, Optional, Set, Tuple


class SalesRole(str, Enum):
    ACCOUNT_EXECUTIVE = "ACCOUNT_EXECUTIVE"
    SOLUTIONS_ARCHITECT = "SOLUTIONS_ARCHITECT"
    BUSINESS_DEV_REP = "BUSINESS_DEV_REP"
    CUSTOMER_SUCCESS = "CUSTOMER_SUCCESS"
    INDUSTRY_SPECIALIST = "INDUSTRY_SPECIALIST"


@dataclass
class CoSellingParticipant:
    user_id: str
    name: str
    role: SalesRole
    logged_deal_hours: float
    key_artifacts_produced: List[str] = field(default_factory=list)


@dataclass
class FairCommissionAttribution:
    user_id: str
    name: str
    role: SalesRole
    shapley_attribution_pct: float
    attributed_acv_usd: Decimal
    commission_payout_usd: Decimal


@dataclass
class CoSellingDealAttributionResult:
    deal_id: str
    deal_name: str
    total_deal_acv_usd: Decimal
    total_commission_pool_usd: Decimal
    participants: List[FairCommissionAttribution] = field(default_factory=list)


class ShapleyCoSellingAttributionEngine:
    """Enterprise Cooperative Game-Theoretic Shapley Value Commission Engine."""

    COMMISSION_POOL_RATE_PCT = 10.0  # 10% of ACV pool

    @classmethod
    def _coalition_value(cls, coalition: Set[str], roles_by_id: Dict[str, SalesRole], total_acv: float) -> float:
        """Characteristic function v(S) modeling deal closing probability * ACV for coalition subset S."""
        if not coalition:
            return 0.0

        roles = {roles_by_id[uid] for uid in coalition}
        score = 0.0

        # AE is critical (anchor)
        if SalesRole.ACCOUNT_EXECUTIVE in roles:
            score += 0.40

        # SA provides technical proof
        if SalesRole.SOLUTIONS_ARCHITECT in roles:
            score += 0.25

        # BDR sourced opportunity
        if SalesRole.BUSINESS_DEV_REP in roles:
            score += 0.15

        # CSM executive alignment
        if SalesRole.CUSTOMER_SUCCESS in roles:
            score += 0.10

        # Industry specialist
        if SalesRole.INDUSTRY_SPECIALIST in roles:
            score += 0.10

        # Synergy multiplier for full-stack coalition
        if len(roles) >= 3 and SalesRole.ACCOUNT_EXECUTIVE in roles and SalesRole.SOLUTIONS_ARCHITECT in roles:
            score = min(1.0, score * 1.15)

        return score * total_acv

    @classmethod
    def compute_fair_commission_split(
        cls,
        deal_id: str,
        deal_name: str,
        total_acv_usd: Decimal,
        team_members: List[CoSellingParticipant]
    ) -> CoSellingDealAttributionResult:
        """Compute exact Shapley value marginal contributions for all team members."""
        n = len(team_members)
        if n == 0:
            raise ValueError("Team must have at least one participant")

        total_acv = float(total_acv_usd)
        comm_pool_usd = (total_acv_usd * Decimal(str(cls.COMMISSION_POOL_RATE_PCT / 100.0))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        member_ids = [m.user_id for m in team_members]
        roles_by_id = {m.user_id: m.role for m in team_members}
        shapley_values: Dict[str, float] = {uid: 0.0 for uid in member_ids}

        # Sum marginal contribution over all permutations of players
        all_permutations = list(itertools.permutations(member_ids))
        tot_perms = len(all_permutations)

        for perm in all_permutations:
            current_coalition: Set[str] = set()
            for player in perm:
                v_before = cls._coalition_value(current_coalition, roles_by_id, total_acv)
                current_coalition_with_player = current_coalition | {player}
                v_after = cls._coalition_value(current_coalition_with_player, roles_by_id, total_acv)
                marginal = v_after - v_before
                shapley_values[player] += (marginal / tot_perms)
                current_coalition = current_coalition_with_player

        # Normalize Shapley values so sum(pct) == 100%
        sum_sv = sum(shapley_values.values())
        attributions: List[FairCommissionAttribution] = []

        for m in team_members:
            raw_sv = shapley_values[m.user_id]
            pct = (raw_sv / sum_sv) * 100.0 if sum_sv > 0 else (100.0 / n)
            attr_acv = (total_acv_usd * Decimal(str(round(pct / 100.0, 6)))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            payout = (comm_pool_usd * Decimal(str(round(pct / 100.0, 6)))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )

            attributions.append(FairCommissionAttribution(
                user_id=m.user_id,
                name=m.name,
                role=m.role,
                shapley_attribution_pct=round(pct, 1),
                attributed_acv_usd=attr_acv,
                commission_payout_usd=payout
            ))

        return CoSellingDealAttributionResult(
            deal_id=deal_id,
            deal_name=deal_name,
            total_deal_acv_usd=total_acv_usd,
            total_commission_pool_usd=comm_pool_usd,
            participants=attributions
        )
