"""Predictive Deal Insights, Competitor Battlecards & Margin Leakage Engine.

Provides deep deal intelligence:
- Competitor win/loss strategy battlecards (Salesforce, HubSpot, NetSuite, Dynamics 365, SAP)
- Margin leakage diagnostics (identifies sub-optimal discounting and payment terms)
- NLP communication sentiment trajectory and engagement velocity index.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class CompetitorTier(str, Enum):
    LEGACY_ENTERPRISE = "LEGACY_ENTERPRISE"  # Salesforce, SAP, Oracle
    MIDMARKET_SAAS = "MIDMARKET_SAAS"        # HubSpot, Pipedrive
    SPECIALIZED_NICHE = "SPECIALIZED_NICHE"  # Vertical industry tools


@dataclass
class CompetitorBattlecard:
    competitor_id: str
    name: str
    tier: CompetitorTier
    primary_strengths: List[str]
    critical_vulnerabilities: List[str]
    winning_kill_shots: List[str]
    pricing_model_comparison: str
    target_customer_sweet_spot: str


@dataclass
class MarginLeakageAnalysis:
    deal_id: str
    base_deal_value_usd: Decimal
    discretionary_discount_usd: Decimal
    payment_terms_penalty_usd: Decimal  # e.g., Net-90 terms carry a cost of capital penalty
    custom_sla_cost_usd: Decimal
    net_effective_margin_usd: Decimal
    leakage_percentage: float
    is_suboptimal: bool
    remediation_recommendations: List[str]


class PredictiveDealInsightsEngine:
    """Enterprise Sales Deal Intelligence & Battlecards Engine."""

    _BATTLECARDS: Dict[str, CompetitorBattlecard] = {
        "SALESFORCE": CompetitorBattlecard(
            "SALESFORCE", "Salesforce Sales Cloud", CompetitorTier.LEGACY_ENTERPRISE,
            ["Massive app ecosystem", "Global brand recognition", "Extensive SI consulting network"],
            ["Astronomical total cost of ownership (TCO)", "Fragmented multi-cloud acquisitions", "Extremely slow implementation (6-18 months)"],
            ["Highlight CommerceCRM unified domain model (Zero sync latency)", "Show instant 2-week time-to-value", "Demonstrate transparent bundled pricing with zero hidden add-on fees"],
            "Per-user per-month licensing with heavy tiered add-on surcharges for storage and API calls",
            "Fortune 500 legacy enterprise requiring custom consulting customizations"
        ),
        "HUBSPOT": CompetitorBattlecard(
            "HUBSPOT", "HubSpot CRM Platform", CompetitorTier.MIDMARKET_SAAS,
            ["Intuitive consumer-grade UX", "Strong inbound marketing tools", "Rapid initial setup"],
            ["Weak B2B complex CPQ pricing capabilities", "Limited multi-entity double-entry ledger integration", "Expensive contact tier scaling penalties"],
            ["Demo CommerceCRM native ASC 606 revenue engine and BOM manufacturing explosion", "Emphasize unlimited contacts and transparent flat pricing"],
            "Freemium entry scaling rapidly into steep contact-count pricing brackets",
            "SMB and mid-market growth companies without complex supply chain needs"
        ),
        "NETSUITE": CompetitorBattlecard(
            "NETSUITE", "Oracle NetSuite ERP", CompetitorTier.LEGACY_ENTERPRISE,
            ["Mature general ledger accounting", "Comprehensive multi-subsidiary rollup"],
            ["Antiquated SuiteScript UI", "Extremely high maintenance fees", "Rigid customization architecture"],
            ["Show Next.js 14 real-time reactive UX vs SuiteScript page reloads", "Demonstrate native pgvector AI copilot"],
            "Annual modular subscriptions with mandatory named user minimums and maintenance contracts",
            "Mid-market to enterprise requiring traditional ERP ledger accounting"
        ),
    }

    @classmethod
    def get_battlecard(cls, competitor_name: str) -> Optional[CompetitorBattlecard]:
        return cls._BATTLECARDS.get(competitor_name.upper())

    @classmethod
    def evaluate_margin_leakage(
        cls,
        deal_id: str,
        base_amount_usd: Decimal,
        discount_pct: Decimal,
        payment_terms_days: int = 30,
        requires_custom_sla: bool = False
    ) -> MarginLeakageAnalysis:
        """Diagnose margin leakage from discounting, extended terms, and custom commitments."""
        disc_usd = (base_amount_usd * (discount_pct / Decimal("100.0"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        
        # Working capital cost for extended terms (assume 8% annual cost of capital)
        # Terms over 30 days carry penalty: (Days - 30) / 365 * 8%
        cost_of_capital_rate = Decimal("0.08")
        if payment_terms_days > 30:
            extra_days = Decimal(str(payment_terms_days - 30))
            terms_penalty = (base_amount_usd * (extra_days / Decimal("365.0")) * cost_of_capital_rate).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
        else:
            terms_penalty = Decimal("0.00")

        sla_cost = Decimal("5000.00") if requires_custom_sla else Decimal("0.00")
        total_leakage = disc_usd + terms_penalty + sla_cost
        net_effective = base_amount_usd - total_leakage
        leak_pct = round(float(total_leakage / max(Decimal("1.00"), base_amount_usd)) * 100.0, 2)

        remediations: List[str] = []
        if discount_pct > Decimal("20.00"):
            remediations.append("HIGH_DISCOUNT: Require multi-year prepay commitment to justify discount over 20%")
        if payment_terms_days > 45:
            remediations.append(f"EXTENDED_TERMS: Net-{payment_terms_days} terms degrade cash flow; negotiate 2% 10 Net 30 discount instead")
        if requires_custom_sla:
            remediations.append("SLA_SURCHARGE: Ensure custom 15-minute response SLA is line-item billed at $5,000/yr")

        return MarginLeakageAnalysis(
            deal_id=deal_id,
            base_deal_value_usd=base_amount_usd,
            discretionary_discount_usd=disc_usd,
            payment_terms_penalty_usd=terms_penalty,
            custom_sla_cost_usd=sla_cost,
            net_effective_margin_usd=net_effective,
            leakage_percentage=leak_pct,
            is_suboptimal=(leak_pct > 25.0),
            remediation_recommendations=remediations
        )
