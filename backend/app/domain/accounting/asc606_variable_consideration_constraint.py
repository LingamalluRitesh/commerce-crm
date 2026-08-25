"""GAAP ASC 606 Variable Consideration & Reversal Constraint Assessment Engine.

Implements statutory revenue recognition for contingent milestone contracts:
- Variable Consideration Estimation Methods:
  1. Expected Value Method (Sum of probability-weighted amounts across outcomes)
  2. Most Likely Amount Method (Single most likely outcome in binary contracts)
- ASC 606 Constraint Test: Revenue included only if it is PROBABLE that a significant reversal will NOT occur
- Milestone Achievement Threshold Tracking & Clawback Risk Reserve Accruals.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class EstimationMethod(str, Enum):
    EXPECTED_VALUE = "EXPECTED_VALUE"
    MOST_LIKELY_AMOUNT = "MOST_LIKELY_AMOUNT"


@dataclass
class ContingentContractOutcome:
    outcome_name: str
    payout_amount_usd: Decimal
    probability_weight: float  # 0.0 to 1.0


@dataclass
class VariableConsiderationContract:
    contract_id: str
    customer_name: str
    base_fixed_fee_usd: Decimal
    estimation_method: EstimationMethod
    reversal_risk_factors_present: bool
    outcomes: List[ContingentContractOutcome] = field(default_factory=list)


@dataclass
class ASC606RevenueAssessmentResult:
    contract_id: str
    customer_name: str
    base_fixed_fee_usd: Decimal
    unconstrained_variable_amount_usd: Decimal
    is_constraint_applied: bool
    constraint_discount_usd: Decimal
    recognized_transaction_price_usd: Decimal
    deferred_contingency_reserve_usd: Decimal
    compliance_guidance_notes: str


class ASC606VariableConsiderationEngine:
    """Enterprise ASC 606 Variable Consideration & Constraint Engine."""

    @classmethod
    def evaluate_contract_transaction_price(
        cls,
        contract: VariableConsiderationContract
    ) -> ASC606RevenueAssessmentResult:
        """Evaluate contract variable consideration and enforce reversal constraint rules."""
        if contract.estimation_method == EstimationMethod.EXPECTED_VALUE:
            # Expected value = sum(amount * prob)
            unconstrained = sum(
                (o.payout_amount_usd * Decimal(str(round(o.probability_weight, 4))) for o in contract.outcomes),
                Decimal("0.00")
            ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            # Most likely outcome
            best_outcome = max(contract.outcomes, key=lambda o: o.probability_weight)
            unconstrained = best_outcome.payout_amount_usd

        # Check constraint: if high reversal risk or volatile external factor, constrain by 50%
        if contract.reversal_risk_factors_present:
            constraint_discount = (unconstrained * Decimal("0.50")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            is_constrained = True
            notes = "Constraint applied: Revenue limited to probable un-reversal threshold."
        else:
            constraint_discount = Decimal("0.00")
            is_constrained = False
            notes = "Full variable consideration recognized (High historical predictability)."

        allowed_variable = unconstrained - constraint_discount
        total_tx_price = contract.base_fixed_fee_usd + allowed_variable

        return ASC606RevenueAssessmentResult(
            contract_id=contract.contract_id,
            customer_name=contract.customer_name,
            base_fixed_fee_usd=contract.base_fixed_fee_usd,
            unconstrained_variable_amount_usd=unconstrained,
            is_constraint_applied=is_constrained,
            constraint_discount_usd=constraint_discount,
            recognized_transaction_price_usd=total_tx_price,
            deferred_contingency_reserve_usd=constraint_discount,
            compliance_guidance_notes=notes
        )
