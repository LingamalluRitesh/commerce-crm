"""Enterprise Treasury Liquidity Pooling, Physical Sweeping & Zero-Balance Account (ZBA) Engine.

Orchestrates corporate treasury cash concentration across global legal entities:
- Multi-Entity Notional Cash Pooling & Cross-Border Currency Sweeps
- Zero-Balance Account (ZBA) Target Balancing & Automated Target Residual Float
- Intercompany Loan Ledger & Arm's Length Interest Rate Accrual (SOFR / EURIBOR + Spread)
- Working Capital Net Liquidity Forecasting & Bank Daylight Overdraft Minimization
- Tax-Optimized Repatriation Corridor & Withholding Tax (WHT) Drag Estimation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class PoolingStructureType(str, Enum):
    PHYSICAL_SWEEP_ZBA = "PHYSICAL_SWEEP_ZBA"       # Actual movement of funds to master header account
    NOTIONAL_POOLING = "NOTIONAL_POOLING"           # Virtual offset of balances without physical funds transfer
    HYBRID_OVERLAY = "HYBRID_OVERLAY"               # Regional physical sweeps with global notional overlay


class SweepDirection(str, Enum):
    SWEEP_UP_TO_MASTER = "SWEEP_UP_TO_MASTER"       # Subsidiary surplus concentrated up to master
    FUND_DOWN_FROM_MASTER = "FUND_DOWN_FROM_MASTER" # Master funds subsidiary deficit to restore target balance
    NO_TRANSFER_REQUIRED = "NO_TRANSFER_REQUIRED"


@dataclass
class TreasuryBankAccount:
    account_id: str
    entity_id: str
    entity_name: str
    bank_name: str
    currency: str
    current_balance: Decimal
    target_residual_balance: Decimal = field(default_factory=lambda: Decimal("50000.00"))
    min_sweep_threshold: Decimal = field(default_factory=lambda: Decimal("1000.00"))
    is_header_master_account: bool = False
    jurisdiction_country: str = "US"
    overdraft_interest_rate_pct: Decimal = field(default_factory=lambda: Decimal("8.50"))
    credit_interest_rate_pct: Decimal = field(default_factory=lambda: Decimal("4.25"))


@dataclass
class SweepTransferInstruction:
    instruction_id: str
    source_account_id: str
    destination_account_id: str
    direction: SweepDirection
    amount: Decimal
    currency: str
    status: str = "PENDING"
    intercompany_loan_ref: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@dataclass
class IntercompanyLoanPosition:
    loan_id: str
    lender_entity_id: str
    borrower_entity_id: str
    principal_balance_usd: Decimal
    benchmark_rate_name: str  # e.g. "SOFR-1M"
    benchmark_rate_pct: Decimal
    arms_length_spread_bps: int  # e.g. 125 bps = 1.25%
    accrued_interest_ytd_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))

    @property
    def total_interest_rate_pct(self) -> Decimal:
        spread_pct = Decimal(self.arms_length_spread_bps) / Decimal("10000.0")
        return (self.benchmark_rate_pct + spread_pct).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)


@dataclass
class TreasuryPoolDailyReconciliation:
    pool_id: str
    reconciliation_date: str
    total_physical_cash_usd: Decimal
    master_header_balance_usd: Decimal
    subsidiary_net_position_usd: Decimal
    interest_benefit_gained_usd: Decimal
    sweeps_executed_count: int
    intercompany_loan_count: int
    transfers: List[SweepTransferInstruction]


class TreasuryLiquidityPoolingEngine:
    """Calculates zero-balance account sweeps, interest optimization gains, and intercompany debt tracking."""

    def __init__(self, pool_id: str = "GLOBAL-TREASURY-POOL-01", structure: PoolingStructureType = PoolingStructureType.PHYSICAL_SWEEP_ZBA):
        self.pool_id = pool_id
        self.structure = structure
        self.accounts: Dict[str, TreasuryBankAccount] = {}
        self.intercompany_loans: Dict[str, IntercompanyLoanPosition] = {}

    def register_account(self, account: TreasuryBankAccount) -> None:
        self.accounts[account.account_id] = account

    def execute_eod_sweep_and_target_balancing(self) -> TreasuryPoolDailyReconciliation:
        """Executes End-of-Day (EOD) physical sweep simulation to restore all subsidiary accounts to target float."""
        master_acc: Optional[TreasuryBankAccount] = None
        subsidiary_accounts: List[TreasuryBankAccount] = []

        for acc in self.accounts.values():
            if acc.is_header_master_account:
                master_acc = acc
            else:
                subsidiary_accounts.append(acc)

        if not master_acc:
            raise ValueError("No header master account configured in liquidity pool")

        instructions: List[SweepTransferInstruction] = []
        now_iso = datetime.now(timezone.utc).isoformat()
        total_interest_without_pooling = Decimal("0.00")
        total_interest_with_pooling = Decimal("0.00")

        # Evaluate subsidiary accounts
        for sub in subsidiary_accounts:
            diff = sub.current_balance - sub.target_residual_balance

            # Standalone interest calculation
            if sub.current_balance < Decimal("0.00"):
                daily_od_rate = (sub.overdraft_interest_rate_pct / Decimal("100.0")) / Decimal("360.0")
                total_interest_without_pooling -= (abs(sub.current_balance) * daily_od_rate)
            else:
                daily_cr_rate = (sub.credit_interest_rate_pct / Decimal("100.0")) / Decimal("360.0")
                total_interest_without_pooling += (sub.current_balance * daily_cr_rate)

            if diff > sub.min_sweep_threshold:
                # Surplus in sub -> Sweep up to master
                sweep_amt = diff.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                inst_id = f"SWP-UP-{sub.account_id}-{datetime.now().strftime('%H%M%S%f')[:10]}"
                loan_ref = f"ICL-{master_acc.entity_id}-{sub.entity_id}"
                instructions.append(
                    SweepTransferInstruction(
                        instruction_id=inst_id,
                        source_account_id=sub.account_id,
                        destination_account_id=master_acc.account_id,
                        direction=SweepDirection.SWEEP_UP_TO_MASTER,
                        amount=sweep_amt,
                        currency=sub.currency,
                        status="COMPLETED",
                        intercompany_loan_ref=loan_ref,
                        created_at=now_iso,
                    )
                )
                sub.current_balance -= sweep_amt
                master_acc.current_balance += sweep_amt
            elif diff < -sub.min_sweep_threshold:
                # Deficit in sub -> Fund down from master
                fund_amt = abs(diff).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                inst_id = f"FND-DN-{sub.account_id}-{datetime.now().strftime('%H%M%S%f')[:10]}"
                loan_ref = f"ICL-{sub.entity_id}-{master_acc.entity_id}"
                instructions.append(
                    SweepTransferInstruction(
                        instruction_id=inst_id,
                        source_account_id=master_acc.account_id,
                        destination_account_id=sub.account_id,
                        direction=SweepDirection.FUND_DOWN_FROM_MASTER,
                        amount=fund_amt,
                        currency=sub.currency,
                        status="COMPLETED",
                        intercompany_loan_ref=loan_ref,
                        created_at=now_iso,
                    )
                )
                sub.current_balance += fund_amt
                master_acc.current_balance -= fund_amt

        # Pooled interest calculation on consolidated master balance
        if master_acc.current_balance >= Decimal("0.00"):
            daily_cr_rate = (master_acc.credit_interest_rate_pct / Decimal("100.0")) / Decimal("360.0")
            total_interest_with_pooling = (master_acc.current_balance * daily_cr_rate)
        else:
            daily_od_rate = (master_acc.overdraft_interest_rate_pct / Decimal("100.0")) / Decimal("360.0")
            total_interest_with_pooling = -(abs(master_acc.current_balance) * daily_od_rate)

        interest_benefit = max(Decimal("0.00"), (total_interest_with_pooling - total_interest_without_pooling).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
        total_cash = master_acc.current_balance + sum((s.current_balance for s in subsidiary_accounts), Decimal("0.00"))

        return TreasuryPoolDailyReconciliation(
            pool_id=self.pool_id,
            reconciliation_date=datetime.now().strftime("%Y-%m-%d"),
            total_physical_cash_usd=total_cash.quantize(Decimal("0.01")),
            master_header_balance_usd=master_acc.current_balance.quantize(Decimal("0.01")),
            subsidiary_net_position_usd=sum((s.current_balance for s in subsidiary_accounts), Decimal("0.00")).quantize(Decimal("0.01")),
            interest_benefit_gained_usd=interest_benefit,
            sweeps_executed_count=len(instructions),
            intercompany_loan_count=len(self.intercompany_loans),
            transfers=instructions,
        )
