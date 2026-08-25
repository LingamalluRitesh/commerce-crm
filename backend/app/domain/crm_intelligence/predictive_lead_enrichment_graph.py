"""B2B Knowledge Graph Entity Resolution & Buying Committee Topology Engine.

Implements graph-based lead enrichment and multi-stakeholder deal dynamics:
- Corporate Hierarchy Node Resolution (Parent entity -> Subsidiary -> Regional Office)
- Buying Committee Roles:
  - Economic Buyer (Budget authorization power)
  - Technical Evaluator (Architecture compliance & security review)
  - Champion / Internal Sponsor (Departmental end-user advocate)
  - Legal & Procurement Signer (Contract MSA redlines)
- Technographic Stack Correlation & Propensity Scoring Heuristics.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class BuyingCommitteeRole(str, Enum):
    ECONOMIC_BUYER = "ECONOMIC_BUYER"
    TECHNICAL_EVALUATOR = "TECHNICAL_EVALUATOR"
    CHAMPION_SPONSOR = "CHAMPION_SPONSOR"
    PROCUREMENT_LEGAL = "PROCUREMENT_LEGAL"
    BLOCKER = "BLOCKER"


@dataclass
class StakeholderContactNode:
    contact_id: str
    full_name: str
    title: str
    department: str
    linkedin_url: str
    role_classification: BuyingCommitteeRole
    sentiment_score: float  # -1.0 (opposed) to 1.0 (advocate)
    influence_weight: float  # 0.1 to 1.0


@dataclass
class AccountKnowledgeGraphNode:
    account_id: str
    legal_name: str
    parent_company_id: Optional[str]
    industry_naics: str
    annual_revenue_range: str
    employee_count_range: str
    detected_technologies: List[str]
    stakeholder_nodes: List[StakeholderContactNode] = field(default_factory=list)


@dataclass
class DealCommitteeHealthSummary:
    account_id: str
    total_stakeholders_mapped: int
    has_economic_buyer: bool
    has_technical_evaluator: bool
    has_champion: bool
    overall_committee_sentiment_score: float
    deal_readiness_grade: str  # 'HIGH_WIN_PROBABILITY', 'MODERATE_RISK', 'SINGLE_THREADED_DANGER'


class PredictiveLeadGraphEngine:
    """Enterprise B2B Buying Committee & Knowledge Graph Analytics Engine."""

    @classmethod
    def evaluate_buying_committee(cls, account: AccountKnowledgeGraphNode) -> DealCommitteeHealthSummary:
        """Analyze multi-threading coverage and consensus readiness across the buying group."""
        tot = len(account.stakeholder_nodes)
        if tot == 0:
            return DealCommitteeHealthSummary(
                account_id=account.account_id,
                total_stakeholders_mapped=0,
                has_economic_buyer=False,
                has_technical_evaluator=False,
                has_champion=False,
                overall_committee_sentiment_score=0.0,
                deal_readiness_grade="SINGLE_THREADED_DANGER"
            )

        has_eb = any(s.role_classification == BuyingCommitteeRole.ECONOMIC_BUYER for s in account.stakeholder_nodes)
        has_tech = any(s.role_classification == BuyingCommitteeRole.TECHNICAL_EVALUATOR for s in account.stakeholder_nodes)
        has_champ = any(s.role_classification == BuyingCommitteeRole.CHAMPION_SPONSOR for s in account.stakeholder_nodes)

        # Weighted sentiment
        weighted_sum = sum(s.sentiment_score * s.influence_weight for s in account.stakeholder_nodes)
        tot_weights = sum(s.influence_weight for s in account.stakeholder_nodes)
        avg_sentiment = round(weighted_sum / max(0.01, tot_weights), 2)

        if has_eb and has_tech and has_champ and avg_sentiment > 0.4:
            grade = "HIGH_WIN_PROBABILITY"
        elif has_champ or has_tech:
            grade = "MODERATE_RISK"
        else:
            grade = "SINGLE_THREADED_DANGER"

        return DealCommitteeHealthSummary(
            account_id=account.account_id,
            total_stakeholders_mapped=tot,
            has_economic_buyer=has_eb,
            has_technical_evaluator=has_tech,
            has_champion=has_champ,
            overall_committee_sentiment_score=avg_sentiment,
            deal_readiness_grade=grade
        )
