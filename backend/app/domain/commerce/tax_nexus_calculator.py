"""US Economic Tax Nexus Threshold Monitor & South Dakota v. Wayfair Compliance Engine.

Tracks state-by-state economic sales tax nexus thresholds:
- Monitors trailing 12-month gross revenue and transaction count by state
- Standard $100,000 revenue or 200 separate transactions statutory threshold
- High-threshold states (CA, TX, NY: $500,000 threshold)
- Automated alerts when approaching 80% of economic nexus registration threshold.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class NexusStatus(str, Enum):
    NEXUS_ESTABLISHED_REGISTRATION_REQUIRED = "NEXUS_ESTABLISHED_REGISTRATION_REQUIRED"
    APPROACHING_NEXUS_WARNING = "APPROACHING_NEXUS_WARNING"  # 80% to 99%
    SAFE_HARBOR_BELOW_THRESHOLD = "SAFE_HARBOR_BELOW_THRESHOLD"


@dataclass
class StateNexusThresholdRule:
    state_code: str
    state_name: str
    statutory_dollar_threshold_usd: Decimal
    statutory_transaction_count_threshold: Optional[int]
    requires_both_dollar_and_count: bool = False


@dataclass
class StateNexusEvaluationResult:
    state_code: str
    state_name: str
    current_gross_revenue_usd: Decimal
    current_transactions_count: int
    dollar_threshold_usd: Decimal
    transaction_threshold: Optional[int]
    revenue_utilization_pct: float
    status: NexusStatus
    registration_deadline_notes: str


class TaxNexusEngine:
    """Enterprise US Economic Nexus Compliance Engine."""

    _STATE_RULES: Dict[str, StateNexusThresholdRule] = {
        "CA": StateNexusThresholdRule("CA", "California", Decimal("500000.00"), None),
        "TX": StateNexusThresholdRule("TX", "Texas", Decimal("500000.00"), None),
        "NY": StateNexusThresholdRule("NY", "New York", Decimal("500000.00"), 100, requires_both_dollar_and_count=True),
        "FL": StateNexusThresholdRule("FL", "Florida", Decimal("100000.00"), None),
        "IL": StateNexusThresholdRule("IL", "Illinois", Decimal("100000.00"), 200),
        "PA": StateNexusThresholdRule("PA", "Pennsylvania", Decimal("100000.00"), None),
        "OH": StateNexusThresholdRule("OH", "Ohio", Decimal("100000.00"), 200),
        "GA": StateNexusThresholdRule("GA", "Georgia", Decimal("100000.00"), 200),
        "NC": StateNexusThresholdRule("NC", "North Carolina", Decimal("100000.00"), 200),
        "WA": StateNexusThresholdRule("WA", "Washington", Decimal("100000.00"), None),
    }

    @classmethod
    def evaluate_state_nexus(
        cls,
        state_code: str,
        trailing_revenue_usd: Decimal,
        trailing_transactions: int
    ) -> StateNexusEvaluationResult:
        """Evaluate if seller has established economic nexus requiring sales tax registration."""
        st = state_code.upper()
        rule = cls._STATE_RULES.get(st, StateNexusThresholdRule(st, f"State of {st}", Decimal("100000.00"), 200))

        rev_pct = round(float(trailing_revenue_usd / rule.statutory_dollar_threshold_usd) * 100.0, 1)

        # Check breach
        has_rev_breach = trailing_revenue_usd >= rule.statutory_dollar_threshold_usd
        has_cnt_breach = rule.statutory_transaction_count_threshold is not None and trailing_transactions >= rule.statutory_transaction_count_threshold

        if rule.requires_both_dollar_and_count:
            is_breached = has_rev_breach and has_cnt_breach
        else:
            is_breached = has_rev_breach or has_cnt_breach

        if is_breached:
            status = NexusStatus.NEXUS_ESTABLISHED_REGISTRATION_REQUIRED
            msg = f"NEXUS ESTABLISHED: Must register with {rule.state_name} Department of Revenue within 30 days."
        elif rev_pct >= 80.0 or (rule.statutory_transaction_count_threshold and trailing_transactions >= int(rule.statutory_transaction_count_threshold * 0.8)):
            status = NexusStatus.APPROACHING_NEXUS_WARNING
            msg = f"WARNING: Approaching nexus threshold ({rev_pct}% of dollar limit). Prepare tax registration."
        else:
            status = NexusStatus.SAFE_HARBOR_BELOW_THRESHOLD
            msg = f"SAFE: Below statutory economic nexus thresholds ({rev_pct}% of limit)."

        return StateNexusEvaluationResult(
            state_code=rule.state_code,
            state_name=rule.state_name,
            current_gross_revenue_usd=trailing_revenue_usd,
            current_transactions_count=trailing_transactions,
            dollar_threshold_usd=rule.statutory_dollar_threshold_usd,
            transaction_threshold=rule.statutory_transaction_count_threshold,
            revenue_utilization_pct=rev_pct,
            status=status,
            registration_deadline_notes=msg
        )
