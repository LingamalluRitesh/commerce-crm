"""Double-Entry Accounting Journal, Trial Balance, and Multi-Currency Ledger Engine.

Enforces strict zero-sum balancing (Sum(Debits) == Sum(Credits)), multi-currency
foreign exchange ledger translation, immutable journal sequence hashing, and period-end
trial balance generation.
"""

from __future__ import annotations
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple
from .chart_of_accounts import AccountType, NormalBalance, ChartOfAccountsRegistry


class UnbalancedJournalEntryError(Exception):
    """Raised when total debits do not equal total credits in a journal entry."""
    pass


class InvalidAccountError(Exception):
    """Raised when an unmapped account number is referenced."""
    pass


@dataclass
class JournalLine:
    """Individual debit or credit posting in a journal entry."""
    account_number: str
    debit_amount: Decimal
    credit_amount: Decimal
    currency: str = "USD"
    fx_rate_to_base: Decimal = Decimal("1.000000")
    memo: str = ""

    @property
    def base_debit(self) -> Decimal:
        return (self.debit_amount * self.fx_rate_to_base).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def base_credit(self) -> Decimal:
        return (self.credit_amount * self.fx_rate_to_base).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass
class JournalEntry:
    """Immutable financial transaction entry with Merkle hash integrity."""
    entry_id: str
    posting_date: str  # YYYY-MM-DD
    source_document: str  # e.g. 'INV-2026-0042', 'PAY-STRIPE-8912', 'EXP-PAYROLL-08'
    description: str
    lines: List[JournalLine] = field(default_factory=list)
    is_posted: bool = False
    posted_at: Optional[str] = None
    previous_entry_hash: str = "0000000000000000000000000000000000000000000000000000000000000000"
    entry_hash: str = ""

    def validate_balanced(self) -> None:
        """Verify that total base debits exactly equal total base credits."""
        total_debits = sum(line.base_debit for line in self.lines)
        total_credits = sum(line.base_credit for line in self.lines)
        delta = abs(total_debits - total_credits)

        if delta > Decimal("0.001"):
            raise UnbalancedJournalEntryError(
                f"Journal entry '{self.entry_id}' is unbalanced: Total Debits=${total_debits}, Total Credits=${total_credits}, Diff=${delta}"
            )

    def compute_hash(self) -> str:
        """Compute cryptographic SHA-256 seal for immutable ledger chaining."""
        payload = f"{self.previous_entry_hash}|{self.entry_id}|{self.posting_date}|{self.source_document}"
        for line in self.lines:
            payload += f"|{line.account_number}:{line.base_debit}:{line.base_credit}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class GeneralLedgerEngine:
    """Enterprise General Ledger and Period Close Engine."""

    def __init__(self, chart_of_accounts: Optional[ChartOfAccountsRegistry] = None):
        self.coa = chart_of_accounts or ChartOfAccountsRegistry()
        self.journal_entries: List[JournalEntry] = []
        self._last_hash = "0000000000000000000000000000000000000000000000000000000000000000"

    def post_entry(self, entry: JournalEntry) -> JournalEntry:
        """Validate, hash, and post a journal entry to the general ledger."""
        entry.validate_balanced()
        
        # Verify account existence
        for line in entry.lines:
            acc = self.coa.get_account(line.account_number)
            if not acc:
                raise InvalidAccountError(f"Account '{line.account_number}' does not exist in Chart of Accounts.")
            if not acc.is_active:
                raise InvalidAccountError(f"Account '{line.account_number}' is inactive.")

        # Post to account balances
        for line in entry.lines:
            acc = self.coa.get_account(line.account_number)
            assert acc is not None
            acc.current_balance_debit += line.base_debit
            acc.current_balance_credit += line.base_credit

        entry.previous_entry_hash = self._last_hash
        entry.entry_hash = entry.compute_hash()
        self._last_hash = entry.entry_hash
        entry.is_posted = True
        entry.posted_at = datetime.now(timezone.utc).isoformat()

        self.journal_entries.append(entry)
        return entry

    def generate_trial_balance(self) -> List[Tuple[str, str, Decimal, Decimal]]:
        """Generate balanced Trial Balance report (Account #, Name, Total Debits, Total Credits)."""
        report: List[Tuple[str, str, Decimal, Decimal]] = []
        for acc in self.coa.list_accounts():
            if acc.current_balance_debit > 0 or acc.current_balance_credit > 0:
                report.append((
                    acc.account_number,
                    acc.name,
                    acc.current_balance_debit,
                    acc.current_balance_credit
                ))
        return report

    def generate_balance_sheet_summary(self) -> Dict[str, Decimal]:
        """Aggregate Balance Sheet totals: Assets = Liabilities + Equity."""
        total_assets = Decimal("0.00")
        total_liabilities = Decimal("0.00")
        total_equity = Decimal("0.00")

        for acc in self.coa.list_accounts():
            if acc.account_type == AccountType.ASSET:
                total_assets += acc.net_balance
            elif acc.account_type == AccountType.LIABILITY:
                total_liabilities += acc.net_balance
            elif acc.account_type == AccountType.EQUITY:
                total_equity += acc.net_balance

        return {
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "total_equity": total_equity,
            "is_in_balance": total_assets == (total_liabilities + total_equity)
        }
