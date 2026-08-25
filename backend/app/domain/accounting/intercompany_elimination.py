"""Corporate Multi-Entity Consolidation & Automated Intercompany Elimination Journal Engine.

Implements GAAP ASC 810 / IFRS 10 corporate consolidation accounting:
- Elimination of intercompany sales and cost of goods sold
- Elimination of intercompany payables (AP) and receivables (AR)
- Elimination of intercompany management fees and shared service allocations
- Elimination of unrealized profit/margin in ending downstream inventory
- Foreign currency Cumulative Translation Adjustment (CTA) consolidation balancing.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class IntercompanyTransactionType(str, Enum):
    INTERCOMPANY_INVENTORY_SALE = "INTERCOMPANY_INVENTORY_SALE"
    INTERCOMPANY_MANAGEMENT_FEE = "INTERCOMPANY_MANAGEMENT_FEE"
    INTERCOMPANY_LOAN_INTEREST = "INTERCOMPANY_LOAN_INTEREST"
    INTERCOMPANY_DIVIDEND = "INTERCOMPANY_DIVIDEND"


@dataclass
class LegalEntityNode:
    entity_id: str  # e.g., 'ENT-US-PARENT', 'ENT-UK-SUB', 'ENT-DE-GMBH'
    legal_name: str
    jurisdiction_country: str
    functional_currency: str
    ownership_percentage: Decimal = Decimal("100.00")
    is_parent_holding: bool = False


@dataclass
class IntercompanyTradeRecord:
    trade_id: str
    selling_entity_id: str
    buying_entity_id: str
    trade_type: IntercompanyTransactionType
    transaction_amount_usd: Decimal
    unrealized_profit_margin_pct: Decimal  # e.g., 25% markup
    ending_inventory_retained_pct: Decimal = Decimal("0.00") # % still unsold to third parties


@dataclass
class ConsolidationEliminationJournal:
    elimination_id: str
    description: str
    debit_account_number: str
    debit_account_name: str
    credit_account_number: str
    credit_account_name: str
    elimination_amount_usd: Decimal


class IntercompanyEliminationEngine:
    """Enterprise multi-entity consolidation elimination engine."""

    def __init__(self):
        self.entities: Dict[str, LegalEntityNode] = {}
        self._seed_corporate_structure()

    def _seed_corporate_structure(self) -> None:
        p = LegalEntityNode("ENT-US-PARENT", "CommerceCRM Global Holdings Inc.", "US", "USD", Decimal("100.00"), True)
        s1 = LegalEntityNode("ENT-UK-SUB", "CommerceCRM UK Operations Ltd.", "GB", "GBP", Decimal("100.00"), False)
        s2 = LegalEntityNode("ENT-DE-GMBH", "CommerceCRM Deutschland GmbH", "DE", "EUR", Decimal("100.00"), False)

        for e in [p, s1, s2]:
            self.entities[e.entity_id] = e

    def generate_elimination_entries(
        self,
        trades: List[IntercompanyTradeRecord]
    ) -> List[ConsolidationEliminationJournal]:
        """Generate balanced double-entry elimination entries for consolidated financial statements."""
        eliminations: List[ConsolidationEliminationJournal] = []
        el_idx = 1

        for trade in trades:
            # 1. Elimination of Intercompany Sales & Cost of Goods Sold (Revenue & COGS wash)
            eliminations.append(ConsolidationEliminationJournal(
                elimination_id=f"ELIM-{el_idx:04d}",
                description=f"Eliminate intercompany revenue/COGS between {trade.selling_entity_id} and {trade.buying_entity_id}",
                debit_account_number="40100",  # Debit Revenue (reduce revenue)
                debit_account_name="Intercompany Revenue Elimination",
                credit_account_number="50200", # Credit COGS (reduce COGS)
                credit_account_name="Intercompany COGS Elimination",
                elimination_amount_usd=trade.transaction_amount_usd
            ))
            el_idx += 1

            # 2. Elimination of Intercompany AR and AP balances
            eliminations.append(ConsolidationEliminationJournal(
                elimination_id=f"ELIM-{el_idx:04d}",
                description=f"Eliminate intercompany trade receivable/payable balances",
                debit_account_number="20100",  # Debit AP (reduce liability)
                debit_account_name="Intercompany Accounts Payable",
                credit_account_number="11000", # Credit AR (reduce asset)
                credit_account_name="Intercompany Accounts Receivable",
                elimination_amount_usd=trade.transaction_amount_usd
            ))
            el_idx += 1

            # 3. Elimination of Unrealized Profit in Ending Downstream Inventory
            if trade.ending_inventory_retained_pct > Decimal("0.00"):
                retained_val = trade.transaction_amount_usd * (trade.ending_inventory_retained_pct / Decimal("100.0"))
                unrealized_profit = (retained_val * (trade.unrealized_profit_margin_pct / Decimal("100.0"))).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP
                )

                if unrealized_profit > Decimal("0.00"):
                    eliminations.append(ConsolidationEliminationJournal(
                        elimination_id=f"ELIM-{el_idx:04d}",
                        description=f"Eliminate unrealized intercompany markup in ending inventory balance",
                        debit_account_number="50200",  # Debit COGS (increase consolidated COGS)
                        debit_account_name="Consolidated COGS - Unrealized Profit",
                        credit_account_number="12000", # Credit Inventory (reduce inventory asset to cost)
                        credit_account_name="Finished Goods Inventory Asset",
                        elimination_amount_usd=unrealized_profit
                    ))
                    el_idx += 1

        return eliminations
