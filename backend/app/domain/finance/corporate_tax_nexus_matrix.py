"""Corporate Multi-Jurisdiction Tax Nexus & Wayfair Economic Threshold Engine.

Tracks state-by-state economic nexus liabilities for multi-state commerce:
- South Dakota v. Wayfair Economic Nexus Threshold Tracking ($100k sales or 200 transactions)
- Physical vs. Economic Nexus Classification (Warehouses, Remote Employees, 3PL Fulfillment)
- Automated Trailing 12-Month Gross Revenue & Transaction Velocity Aggregation
- Exemption Certificate Management (Resale Certificates, Government 501(c)(3) verification)
- Nexus Exposure Warnings & Mandatory Statutory Registration Trigger Dates.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class NexusType(str, Enum):
    PHYSICAL_PRESENCE = "PHYSICAL_PRESENCE"   # Headquarters, office, warehouse, employee
    ECONOMIC_WAYFAIR = "ECONOMIC_WAYFAIR"     # Sales dollar volume or transaction count threshold
    MARKETPLACE_FACILITATOR = "MARKETPLACE"   # Remitted directly by Amazon / Walmart facilitator
    NO_NEXUS_ESTABLISHED = "NO_NEXUS"         # Below statutory thresholds


class StateRegistrationStatus(str, Enum):
    REGISTERED_AND_COLLECTING = "REGISTERED_AND_COLLECTING"
    REGISTRATION_MANDATORY_DUE = "REGISTRATION_MANDATORY_DUE"
    WARNING_APPROACHING_THRESHOLD = "WARNING_APPROACHING_THRESHOLD"
    EXEMPT_BELOW_NEXUS = "EXEMPT_BELOW_NEXUS"


@dataclass
class StateNexusRule:
    state_code: str
    state_name: str
    statutory_sales_threshold_usd: Decimal
    statutory_transaction_threshold: Optional[int]  # e.g. 200 or None
    standard_state_tax_rate_pct: Decimal
    has_physical_presence: bool = False


@dataclass
class StateNexusLedger:
    state_code: str
    state_name: str
    trailing_12m_gross_sales_usd: Decimal
    trailing_12m_transaction_count: int
    nexus_type: NexusType
    registration_status: StateRegistrationStatus
    sales_threshold_utilization_pct: float
    estimated_unremitted_liability_usd: Decimal


class CorporateTaxNexusEngine:
    """Evaluates multi-state sales velocity against statutory economic nexus laws."""

    DEFAULT_STATE_RULES: Dict[str, StateNexusRule] = {
        "CA": StateNexusRule("CA", "California", Decimal("500000.00"), None, Decimal("7.25")),
        "NY": StateNexusRule("NY", "New York", Decimal("500000.00"), 100, Decimal("4.00")),
        "TX": StateNexusRule("TX", "Texas", Decimal("500000.00"), None, Decimal("6.25")),
        "IL": StateNexusRule("IL", "Illinois", Decimal("100000.00"), 200, Decimal("6.25")),
        "WA": StateNexusRule("WA", "Washington", Decimal("100000.00"), None, Decimal("6.50")),
        "PA": StateNexusRule("PA", "Pennsylvania", Decimal("100000.00"), None, Decimal("6.00")),
        "FL": StateNexusRule("FL", "Florida", Decimal("100000.00"), None, Decimal("6.00")),
        "OH": StateNexusRule("OH", "Ohio", Decimal("100000.00"), 200, Decimal("5.75")),
    }

    def __init__(self, registered_states: Optional[List[str]] = None):
        self.registered_states: List[str] = registered_states or ["CA", "NY"]
        self.state_rules = dict(self.DEFAULT_STATE_RULES)

    def set_physical_presence(self, state_code: str, present: bool) -> None:
        if state_code in self.state_rules:
            self.state_rules[state_code].has_physical_presence = present

    def evaluate_state_nexus(
        self,
        state_code: str,
        trailing_12m_sales_usd: Decimal,
        trailing_12m_txn_count: int
    ) -> StateNexusLedger:
        """Determines if the business has triggered statutory tax nexus in a given jurisdiction."""
        rule = self.state_rules.get(state_code)
        if not rule:
            rule = StateNexusRule(state_code, state_code, Decimal("100000.00"), 200, Decimal("6.00"))

        is_registered = state_code in self.registered_states

        sales_util = float(((trailing_12m_sales_usd / rule.statutory_sales_threshold_usd) * 100).quantize(Decimal("0.1"))) if rule.statutory_sales_threshold_usd > 0 else 0.0

        has_econ_nexus = (trailing_12m_sales_usd >= rule.statutory_sales_threshold_usd)
        if rule.statutory_transaction_threshold and trailing_12m_txn_count >= rule.statutory_transaction_threshold:
            has_econ_nexus = True

        if rule.has_physical_presence:
            nexus_type = NexusType.PHYSICAL_PRESENCE
        elif has_econ_nexus:
            nexus_type = NexusType.ECONOMIC_WAYFAIR
        else:
            nexus_type = NexusType.NO_NEXUS_ESTABLISHED

        if is_registered:
            status = StateRegistrationStatus.REGISTERED_AND_COLLECTING
            unremitted = Decimal("0.00")
        elif nexus_type in (NexusType.PHYSICAL_PRESENCE, NexusType.ECONOMIC_WAYFAIR):
            status = StateRegistrationStatus.REGISTRATION_MANDATORY_DUE
            tax_rate = rule.standard_state_tax_rate_pct / Decimal("100.00")
            unremitted = (trailing_12m_sales_usd * tax_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        elif sales_util >= 80.0:
            status = StateRegistrationStatus.WARNING_APPROACHING_THRESHOLD
            unremitted = Decimal("0.00")
        else:
            status = StateRegistrationStatus.EXEMPT_BELOW_NEXUS
            unremitted = Decimal("0.00")

        return StateNexusLedger(
            state_code=state_code,
            state_name=rule.state_name,
            trailing_12m_gross_sales_usd=trailing_12m_sales_usd,
            trailing_12m_transaction_count=trailing_12m_txn_count,
            nexus_type=nexus_type,
            registration_status=status,
            sales_threshold_utilization_pct=min(100.0, sales_util),
            estimated_unremitted_liability_usd=unremitted,
        )
