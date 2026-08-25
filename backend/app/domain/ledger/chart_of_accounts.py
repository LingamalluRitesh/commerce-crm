"""Enterprise Chart of Accounts and General Ledger Account Hierarchy.

Defines standard 5-digit account code numbering rules (1xxxx Assets, 2xxxx Liabilities,
3xxxx Equity, 4xxxx Revenue, 5xxxx Cost of Goods Sold, 6xxxx Operating Expenses),
normal balances, multi-currency attributes, and parent-child account rollups.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional


class AccountType(str, Enum):
    ASSET = "ASSET"
    LIABILITY = "LIABILITY"
    EQUITY = "EQUITY"
    REVENUE = "REVENUE"
    COGS = "COGS"
    EXPENSE = "EXPENSE"


class NormalBalance(str, Enum):
    DEBIT = "DEBIT"
    CREDIT = "CREDIT"


@dataclass
class AccountNode:
    """Individual General Ledger Account definition."""
    account_number: str  # e.g., '10100'
    name: str
    account_type: AccountType
    normal_balance: NormalBalance
    is_reconciliation: bool = False
    is_active: bool = True
    parent_account_number: Optional[str] = None
    currency: str = "USD"
    description: str = ""
    current_balance_debit: Decimal = Decimal("0.00")
    current_balance_credit: Decimal = Decimal("0.00")

    @property
    def net_balance(self) -> Decimal:
        """Net balance in direction of account normal balance."""
        if self.normal_balance == NormalBalance.DEBIT:
            return self.current_balance_debit - self.current_balance_credit
        else:
            return self.current_balance_credit - self.current_balance_debit


class ChartOfAccountsRegistry:
    """Enterprise standard chart of accounts hierarchy registry."""

    def __init__(self):
        self._accounts: Dict[str, AccountNode] = {}
        self._load_standard_coaSkeleton()

    def _load_standard_coaSkeleton(self) -> None:
        """Seed foundational GAAP / IFRS enterprise accounts."""
        defaults = [
            # Assets (10000 - 19999)
            AccountNode("10100", "Operating Cash - USD Checking", AccountType.ASSET, NormalBalance.DEBIT, is_reconciliation=True),
            AccountNode("10200", "Operating Cash - EUR Clearing", AccountType.ASSET, NormalBalance.DEBIT, currency="EUR", is_reconciliation=True),
            AccountNode("11000", "Accounts Receivable - Trade", AccountType.ASSET, NormalBalance.DEBIT),
            AccountNode("11050", "Allowance for Doubtful Accounts", AccountType.ASSET, NormalBalance.CREDIT),
            AccountNode("12000", "Finished Goods Inventory Asset", AccountType.ASSET, NormalBalance.DEBIT),
            AccountNode("12100", "Raw Materials Inventory Asset", AccountType.ASSET, NormalBalance.DEBIT),
            AccountNode("13000", "Prepaid SaaS & Cloud Infrastructure", AccountType.ASSET, NormalBalance.DEBIT),
            AccountNode("15000", "Computer & Edge Server Hardware", AccountType.ASSET, NormalBalance.DEBIT),
            AccountNode("15100", "Accumulated Depreciation - Hardware", AccountType.ASSET, NormalBalance.CREDIT),

            # Liabilities (20000 - 29999)
            AccountNode("20100", "Accounts Payable - Trade", AccountType.LIABILITY, NormalBalance.CREDIT),
            AccountNode("21000", "Accrued Payroll & Bonuses", AccountType.LIABILITY, NormalBalance.CREDIT),
            AccountNode("22000", "Statutory Sales Tax Payable", AccountType.LIABILITY, NormalBalance.CREDIT),
            AccountNode("22100", "EU VAT OSS Payable", AccountType.LIABILITY, NormalBalance.CREDIT, currency="EUR"),
            AccountNode("23000", "Deferred SaaS Subscription Revenue (ASC 606)", AccountType.LIABILITY, NormalBalance.CREDIT),

            # Equity (30000 - 39999)
            AccountNode("30100", "Common Stock - Par Value", AccountType.EQUITY, NormalBalance.CREDIT),
            AccountNode("30200", "Additional Paid-In Capital (APIC)", AccountType.EQUITY, NormalBalance.CREDIT),
            AccountNode("31000", "Retained Earnings", AccountType.EQUITY, NormalBalance.CREDIT),
            AccountNode("32000", "Cumulative Translation Adjustment (CTA)", AccountType.EQUITY, NormalBalance.CREDIT),

            # Revenue (40000 - 49999)
            AccountNode("40100", "SaaS Enterprise Subscription Revenue", AccountType.REVENUE, NormalBalance.CREDIT),
            AccountNode("40200", "Professional Services & Solutions Revenue", AccountType.REVENUE, NormalBalance.CREDIT),
            AccountNode("40300", "Hardware Device & Edge Node Sales", AccountType.REVENUE, NormalBalance.CREDIT),
            AccountNode("49000", "Realized Forex Gain / Loss", AccountType.REVENUE, NormalBalance.CREDIT),
            AccountNode("49100", "Unrealized Forex Gain / Loss", AccountType.REVENUE, NormalBalance.CREDIT),

            # COGS (50000 - 59999)
            AccountNode("50100", "Cloud Datacenter & Bandwidth Hosting COGS", AccountType.COGS, NormalBalance.DEBIT),
            AccountNode("50200", "Hardware Manufacturing Component Costs", AccountType.COGS, NormalBalance.DEBIT),
            AccountNode("50300", "Payment Gateway & Interchange Processing Fees", AccountType.COGS, NormalBalance.DEBIT),

            # Operating Expenses (60000 - 69999)
            AccountNode("60100", "Engineering & R&D Salaries", AccountType.EXPENSE, NormalBalance.DEBIT),
            AccountNode("60200", "Sales & Marketing Dispatches", AccountType.EXPENSE, NormalBalance.DEBIT),
            AccountNode("60300", "General & Administrative OpEx", AccountType.EXPENSE, NormalBalance.DEBIT),
            AccountNode("60400", "Depreciation & Amortization", AccountType.EXPENSE, NormalBalance.DEBIT),
        ]
        for acc in defaults:
            self._accounts[acc.account_number] = acc

    def get_account(self, account_number: str) -> Optional[AccountNode]:
        return self._accounts.get(account_number)

    def list_accounts(self) -> List[AccountNode]:
        return sorted(self._accounts.values(), key=lambda a: a.account_number)

    def register_custom_account(self, account: AccountNode) -> None:
        self._accounts[account.account_number] = account
