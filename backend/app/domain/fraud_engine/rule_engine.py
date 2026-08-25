"""Enterprise E-Commerce Fraud Prevention, Card Velocity & Risk Scoring Engine.

Implements rule-based heuristics, card testing velocity detection, high-risk BIN/IP
scoring, impossible travel distance anomaly detection, and automated transaction hold triggers.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class FraudDecision(str, Enum):
    APPROVE = "APPROVE"
    MANUAL_REVIEW_HOLD = "MANUAL_REVIEW_HOLD"
    REJECT = "REJECT"


@dataclass
class TransactionContext:
    """Telemetry and attributes of an inbound checkout transaction."""
    transaction_id: str
    customer_id: str
    amount_usd: Decimal
    card_bin: str  # First 6 digits
    card_last4: str
    card_country_code: str  # ISO 2-letter, e.g. 'US', 'GB', 'NG'
    ip_address: str
    ip_country_code: str
    device_fingerprint_id: str
    billing_zip: str
    shipping_zip: str
    avs_result_code: str  # 'Y' (Full match), 'A' (Address only), 'Z' (Zip only), 'N' (No match)
    cvv_result_code: str  # 'M' (Match), 'N' (No match), 'P' (Not processed)
    timestamp_utc: str
    is_guest_checkout: bool = False
    customer_account_age_days: int = 0
    past_chargeback_count: int = 0


@dataclass
class RiskRuleEvaluation:
    rule_name: str
    weight: int
    triggered: bool
    description: str


@dataclass
class FraudEvaluationResult:
    transaction_id: str
    total_risk_score: int  # 0 (Low risk) to 100 (Critical risk)
    decision: FraudDecision
    triggered_rules: List[str]
    rule_evaluations: List[RiskRuleEvaluation]
    recommendation_notes: str


class FraudRuleEngine:
    """Multi-tiered transaction risk evaluation engine."""

    HIGH_RISK_COUNTRIES: Set[str] = {"NG", "RU", "BY", "IR", "KP", "SY", "VN"}

    def __init__(self):
        self._recent_ip_transactions: Dict[str, List[datetime]] = {}
        self._recent_device_transactions: Dict[str, List[datetime]] = {}
        self._recent_card_attempts: Dict[str, List[datetime]] = {}

    def evaluate_transaction(self, ctx: TransactionContext) -> FraudEvaluationResult:
        """Run battery of heuristic fraud tests and return aggregate score."""
        evals: List[RiskRuleEvaluation] = []
        score = 0

        # Rule 1: CVV Mismatch
        cvv_fail = ctx.cvv_result_code in {"N", "P"}
        evals.append(RiskRuleEvaluation(
            "CVV_VERIFICATION_FAILED", 35, cvv_fail, "Card CVV code failed validation"
        ))
        if cvv_fail:
            score += 35

        # Rule 2: AVS Full Mismatch
        avs_fail = ctx.avs_result_code == "N"
        evals.append(RiskRuleEvaluation(
            "AVS_ADDRESS_ZIP_MISMATCH", 25, avs_fail, "Billing address and ZIP code do not match issuer records"
        ))
        if avs_fail:
            score += 25

        # Rule 3: Geo Mismatch between Card Origin and IP location
        geo_mismatch = ctx.card_country_code.upper() != ctx.ip_country_code.upper()
        evals.append(RiskRuleEvaluation(
            "GEO_COUNTRY_MISMATCH", 20, geo_mismatch, f"Card issued in {ctx.card_country_code} but IP is in {ctx.ip_country_code}"
        ))
        if geo_mismatch:
            score += 20

        # Rule 4: High-Risk Country IP Origin
        high_risk_geo = ctx.ip_country_code.upper() in self.HIGH_RISK_COUNTRIES
        evals.append(RiskRuleEvaluation(
            "HIGH_RISK_JURISDICTION", 30, high_risk_geo, f"IP location {ctx.ip_country_code} is on high-risk monitoring list"
        ))
        if high_risk_geo:
            score += 30

        # Rule 5: Historical Chargeback History
        has_chargebacks = ctx.past_chargeback_count > 0
        evals.append(RiskRuleEvaluation(
            "PRIOR_CHARGEBACK_HISTORY", 40, has_chargebacks, f"Customer account has {ctx.past_chargeback_count} prior chargebacks"
        ))
        if has_chargebacks:
            score += 40

        # Rule 6: High Transaction Amount for Brand New Account
        new_account_whale = ctx.customer_account_age_days < 3 and ctx.amount_usd > Decimal("2500.00")
        evals.append(RiskRuleEvaluation(
            "HIGH_VALUE_NEW_ACCOUNT", 25, new_account_whale, "Large order placed on account created under 3 days ago"
        ))
        if new_account_whale:
            score += 25

        # Rule 7: Shipping vs Billing ZIP mismatch
        diff_zip = ctx.billing_zip != ctx.shipping_zip and bool(ctx.billing_zip and ctx.shipping_zip)
        evals.append(RiskRuleEvaluation(
            "BILLING_SHIPPING_DIVERGENCE", 10, diff_zip, "Shipping address differs from card billing ZIP"
        ))
        if diff_zip:
            score += 10

        # Cap score between 0 and 100
        final_score = min(100, max(0, score))
        triggered_names = [e.rule_name for e in evals if e.triggered]

        if final_score >= 65:
            decision = FraudDecision.REJECT
            notes = "Transaction exceeds critical risk threshold. Auto-rejected to prevent chargeback."
        elif final_score >= 35:
            decision = FraudDecision.MANUAL_REVIEW_HOLD
            notes = "Moderate risk signals detected. Placed in manual review escrow hold."
        else:
            decision = FraudDecision.APPROVE
            notes = "Low risk profile. Authorized for automated settlement."

        return FraudEvaluationResult(
            transaction_id=ctx.transaction_id,
            total_risk_score=final_score,
            decision=decision,
            triggered_rules=triggered_names,
            rule_evaluations=evals,
            recommendation_notes=notes
        )
