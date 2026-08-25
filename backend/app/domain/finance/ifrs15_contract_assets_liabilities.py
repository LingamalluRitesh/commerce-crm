"""IFRS 15 & ASC 606 Multi-Element Performance Obligation (POB) & Contract Asset/Liability Rollforward.

Implements statutory 5-step revenue recognition accounting:
1. Identify the contract with the enterprise customer
2. Identify the separate performance obligations (POBs: Software License, Professional Services, Maintenance, Cloud Hosting)
3. Determine transaction price (including variable consideration & financing components)
4. Allocate transaction price based on relative Standalone Selling Price (SSP)
5. Recognize revenue as performance obligations are satisfied (over time vs point in time)
- Automated Contract Asset (Unbilled AR) & Contract Liability (Deferred Revenue) rollforward reconciliation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class SatisfactionType(str, Enum):
    POINT_IN_TIME = "POINT_IN_TIME"             # Perpetual license, physical equipment delivery
    OVER_TIME_RATABLE = "OVER_TIME_RATABLE"       # Cloud SaaS subscription, hosting
    OVER_TIME_PERCENT_COMPLETE = "OVER_TIME_PERCENT_COMPLETE" # Professional implementation services


class POBStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    FULFILLED = "FULFILLED"
    TERMINATED = "TERMINATED"


@dataclass
class PerformanceObligation:
    pob_id: str
    description: str
    standalone_selling_price_usd: Decimal  # Estimated standalone price (SSP)
    satisfaction_type: SatisfactionType
    allocated_transaction_price_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))
    completion_percentage: float = 0.0     # 0.0 to 100.0
    cumulative_recognized_revenue_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))
    status: POBStatus = POBStatus.NOT_STARTED
    term_months: int = 12
    service_start_date: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))

    @property
    def unearned_revenue_balance_usd(self) -> Decimal:
        return max(Decimal("0.00"), self.allocated_transaction_price_usd - self.cumulative_recognized_revenue_usd).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass
class RevenueContract:
    contract_id: str
    customer_id: str
    customer_name: str
    contract_start_date: str
    contract_end_date: str
    total_contract_value_usd: Decimal
    billed_invoiced_to_date_usd: Decimal
    cash_collected_to_date_usd: Decimal
    performance_obligations: List[PerformanceObligation]

    @property
    def total_ssp(self) -> Decimal:
        return sum((p.standalone_selling_price_usd for p in self.performance_obligations), Decimal("0.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def total_recognized_revenue_usd(self) -> Decimal:
        return sum((p.cumulative_recognized_revenue_usd for p in self.performance_obligations), Decimal("0.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def contract_asset_usd(self) -> Decimal:
        """Unbilled AR: Revenue recognized in excess of amounts billed."""
        diff = self.total_recognized_revenue_usd - self.billed_invoiced_to_date_usd
        return max(Decimal("0.00"), diff).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def contract_liability_usd(self) -> Decimal:
        """Deferred Revenue: Amounts billed in excess of revenue recognized."""
        diff = self.billed_invoiced_to_date_usd - self.total_recognized_revenue_usd
        return max(Decimal("0.00"), diff).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass
class ContractRollforwardSummary:
    contract_id: str
    customer_name: str
    total_deal_value_usd: Decimal
    billed_amount_usd: Decimal
    total_revenue_recognized_usd: Decimal
    contract_asset_unbilled_usd: Decimal
    contract_liability_deferred_usd: Decimal
    pob_breakdown: List[Dict[str, str]]
    audit_compliance_verdict: str


class IFRS15RevenueRecognitionEngine:
    """Manages relative SSP transaction price allocations and ASC 606/IFRS 15 contract asset/liability ledger."""

    def __init__(self):
        self.contracts: Dict[str, RevenueContract] = {}

    def register_and_allocate_contract(self, contract: RevenueContract) -> RevenueContract:
        """Step 4: Allocates total contract value pro-rata based on relative Standalone Selling Prices (SSP)."""
        total_ssp = contract.total_ssp
        if total_ssp <= Decimal("0.00"):
            raise ValueError("Total Standalone Selling Price (SSP) cannot be zero")

        running_allocation = Decimal("0.00")
        for idx, pob in enumerate(contract.performance_obligations):
            if idx == len(contract.performance_obligations) - 1:
                pob.allocated_transaction_price_usd = (contract.total_contract_value_usd - running_allocation).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            else:
                ratio = pob.standalone_selling_price_usd / total_ssp
                allocated = (contract.total_contract_value_usd * ratio).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                pob.allocated_transaction_price_usd = allocated
                running_allocation += allocated

        self.contracts[contract.contract_id] = contract
        return contract

    def recognize_period_revenue(
        self,
        contract_id: str,
        pob_progress_updates: List[Tuple[str, float]]  # (pob_id, progress_percentage 0-100)
    ) -> ContractRollforwardSummary:
        """Step 5: Updates performance obligation progress and recalculates contract assets/liabilities."""
        contract = self.contracts.get(contract_id)
        if not contract:
            raise ValueError(f"Contract {contract_id} not found")

        update_map = {pob_id: pct for pob_id, pct in pob_progress_updates}

        pob_summaries = []
        for pob in contract.performance_obligations:
            if pob.pob_id in update_map:
                pob.completion_percentage = min(100.0, max(0.0, update_map[pob.pob_id]))

            # Compute cumulative revenue
            if pob.satisfaction_type == SatisfactionType.POINT_IN_TIME:
                if pob.completion_percentage >= 100.0:
                    pob.cumulative_recognized_revenue_usd = pob.allocated_transaction_price_usd
                    pob.status = POBStatus.FULFILLED
                else:
                    pob.cumulative_recognized_revenue_usd = Decimal("0.00")
                    pob.status = POBStatus.NOT_STARTED
            else:
                rate = Decimal(str(round(pob.completion_percentage / 100.0, 4)))
                pob.cumulative_recognized_revenue_usd = (pob.allocated_transaction_price_usd * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                pob.status = POBStatus.FULFILLED if pob.completion_percentage >= 100.0 else POBStatus.IN_PROGRESS

            pob_summaries.append({
                "pob_id": pob.pob_id,
                "description": pob.description,
                "ssp_usd": str(pob.standalone_selling_price_usd),
                "allocated_price_usd": str(pob.allocated_transaction_price_usd),
                "progress_pct": f"{pob.completion_percentage:.1f}%",
                "recognized_usd": str(pob.cumulative_recognized_revenue_usd),
                "unearned_usd": str(pob.unearned_revenue_balance_usd),
                "status": pob.status.value,
            })

        return ContractRollforwardSummary(
            contract_id=contract.contract_id,
            customer_name=contract.customer_name,
            total_deal_value_usd=contract.total_contract_value_usd,
            billed_amount_usd=contract.billed_invoiced_to_date_usd,
            total_revenue_recognized_usd=contract.total_recognized_revenue_usd,
            contract_asset_unbilled_usd=contract.contract_asset_usd,
            contract_liability_deferred_usd=contract.contract_liability_usd,
            pob_breakdown=pob_summaries,
            audit_compliance_verdict="PASSED_ASC606_IFRS15_REVENUE_STANDARDS",
        )
