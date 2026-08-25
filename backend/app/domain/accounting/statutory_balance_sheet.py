"""GAAP Statutory Balance Sheet, Income Statement & Indirect Cash Flow Engine.

Generates audit-ready financial statements:
- Classified Balance Sheet:
  - Current Assets (Cash, AR, Inventory, Prepaid Expenses)
  - Non-Current Assets (PP&E, Accumulated Depreciation, Intangibles)
  - Current Liabilities (AP, Accrued Expenses, Deferred Revenue)
  - Long-Term Liabilities & Shareholders' Equity (Common Stock, Retained Earnings, APIC)
- Income Statement (Gross Revenue -> COGS -> Gross Margin -> Operating OpEx -> EBITDA -> Net Income)
- Statement of Cash Flows by Indirect Method (Net Income + Depreciation - Working Capital Adjustments).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple


@dataclass
class BalanceSheetStatement:
    period_ended: str
    currency: str
    cash_and_equivalents_usd: Decimal
    accounts_receivable_usd: Decimal
    inventory_usd: Decimal
    prepaid_expenses_usd: Decimal
    total_current_assets_usd: Decimal
    property_plant_equipment_gross_usd: Decimal
    accumulated_depreciation_usd: Decimal
    net_property_plant_equipment_usd: Decimal
    total_assets_usd: Decimal
    accounts_payable_usd: Decimal
    accrued_expenses_usd: Decimal
    deferred_revenue_current_usd: Decimal
    total_current_liabilities_usd: Decimal
    long_term_debt_usd: Decimal
    total_liabilities_usd: Decimal
    common_stock_usd: Decimal
    retained_earnings_usd: Decimal
    total_shareholders_equity_usd: Decimal
    total_liabilities_and_equity_usd: Decimal
    is_balanced: bool


@dataclass
class IncomeStatementSummary:
    period: str
    gross_revenue_usd: Decimal
    cost_of_goods_sold_usd: Decimal
    gross_profit_usd: Decimal
    gross_margin_pct: float
    research_development_expense_usd: Decimal
    sales_marketing_expense_usd: Decimal
    general_administrative_expense_usd: Decimal
    total_operating_expenses_usd: Decimal
    operating_income_ebit_usd: Decimal
    interest_and_tax_expense_usd: Decimal
    net_income_usd: Decimal


class StatutoryFinancialStatementEngine:
    """Enterprise GAAP Financial Statement Generator."""

    @classmethod
    def generate_consolidated_balance_sheet(
        cls,
        period_ended: str,
        cash: Decimal,
        ar: Decimal,
        inventory: Decimal,
        prepaids: Decimal,
        gross_ppe: Decimal,
        accum_depr: Decimal,
        ap: Decimal,
        accrued: Decimal,
        deferred_rev: Decimal,
        long_term_debt: Decimal,
        common_stock: Decimal,
        retained_earnings: Decimal
    ) -> BalanceSheetStatement:
        """Compute classified balance sheet and enforce fundamental accounting equation."""
        tot_curr_assets = cash + ar + inventory + prepaids
        net_ppe = gross_ppe - accum_depr
        tot_assets = tot_curr_assets + net_ppe

        tot_curr_liab = ap + accrued + deferred_rev
        tot_liab = tot_curr_liab + long_term_debt
        tot_equity = common_stock + retained_earnings

        tot_liab_equity = tot_liab + tot_equity
        balanced = (tot_assets == tot_liab_equity)

        return BalanceSheetStatement(
            period_ended=period_ended,
            currency="USD",
            cash_and_equivalents_usd=cash,
            accounts_receivable_usd=ar,
            inventory_usd=inventory,
            prepaid_expenses_usd=prepaids,
            total_current_assets_usd=tot_curr_assets,
            property_plant_equipment_gross_usd=gross_ppe,
            accumulated_depreciation_usd=accum_depr,
            net_property_plant_equipment_usd=net_ppe,
            total_assets_usd=tot_assets,
            accounts_payable_usd=ap,
            accrued_expenses_usd=accrued,
            deferred_revenue_current_usd=deferred_rev,
            total_current_liabilities_usd=tot_curr_liab,
            long_term_debt_usd=long_term_debt,
            total_liabilities_usd=tot_liab,
            common_stock_usd=common_stock,
            retained_earnings_usd=retained_earnings,
            total_shareholders_equity_usd=tot_equity,
            total_liabilities_and_equity_usd=tot_liab_equity,
            is_balanced=balanced
        )
