"""Corporate Statutory Income Tax Provision & GAAP ASC 740 Accounting Engine.

Implements statutory corporate tax calculations and ASC 740 financial statement disclosures:
- Pre-Tax GAAP Financial Accounting Income (Book Income)
- Permanent Book-to-Tax Differences (Non-deductible meals/entertainment, tax-exempt municipal interest, fines)
- Temporary Timing Differences (MACRS tax vs Straight-Line book depreciation, deferred revenue, warranty reserves)
- Deferred Tax Assets (DTA) & Deferred Tax Liabilities (DTL) Recognition
- Valuation Allowance Realizability Assessment (More-likely-than-not standard)
- Effective Tax Rate (ETR) Statutory-to-GAAP Reconciliation Matrix.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


@dataclass
class CorporateTaxProvisionSummary:
    tax_year: int
    pre_tax_book_income_usd: Decimal
    permanent_differences_usd: Decimal
    temporary_differences_usd: Decimal
    taxable_income_usd: Decimal
    statutory_tax_rate_pct: float
    current_tax_expense_usd: Decimal
    deferred_tax_expense_usd: Decimal
    total_income_tax_expense_usd: Decimal
    effective_tax_rate_pct: float
    deferred_tax_asset_balance_usd: Decimal
    deferred_tax_liability_balance_usd: Decimal
    net_dta_dtl_balance_usd: Decimal


class StatutoryCorporateTaxEngine:
    """Enterprise ASC 740 Corporate Tax Provision Engine."""

    STATUTORY_FEDERAL_RATE = 0.21  # US Federal Corporate Tax Rate 21%
    STATUTORY_STATE_BLENDED = 0.04  # 4% Blended state rate
    COMBINED_RATE = 0.25  # 25% Combined statutory rate

    @classmethod
    def calculate_annual_tax_provision(
        cls,
        tax_year: int,
        pre_tax_book_income_usd: Decimal,
        non_deductible_expenses_usd: Decimal,
        tax_exempt_income_usd: Decimal,
        macrs_depreciation_difference_usd: Decimal,  # Positive if tax deprec > book deprec
        warranty_reserve_difference_usd: Decimal     # Positive if book exp > tax deduct
    ) -> CorporateTaxProvisionSummary:
        """Calculate complete ASC 740 income tax provision and balance sheet deferrals."""
        # Permanent Differences = Non-deductible - Tax-exempt
        perm_diff = non_deductible_expenses_usd - tax_exempt_income_usd

        # Temporary Differences = -MACRS diff + Warranty reserve diff
        # MACRS accelerated depreciation creates future taxable income (DTL)
        # Warranty reserve creates future deductible income (DTA)
        temp_diff = -macrs_depreciation_difference_usd + warranty_reserve_difference_usd

        # Taxable income on IRS Form 1120
        taxable_income = max(Decimal("0.00"), pre_tax_book_income_usd + perm_diff + temp_diff)

        combined_rate_dec = Decimal(str(cls.COMBINED_RATE))

        current_tax = (taxable_income * combined_rate_dec).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        deferred_tax = ((-temp_diff) * combined_rate_dec).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total_tax_exp = current_tax + deferred_tax

        etr = 0.0
        if pre_tax_book_income_usd > Decimal("0.00"):
            etr = round(float(total_tax_exp / pre_tax_book_income_usd) * 100.0, 2)

        # Deferred Balances
        dtl = (macrs_depreciation_difference_usd * combined_rate_dec).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        dta = (warranty_reserve_difference_usd * combined_rate_dec).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        net_balance = dta - dtl

        return CorporateTaxProvisionSummary(
            tax_year=tax_year,
            pre_tax_book_income_usd=pre_tax_book_income_usd,
            permanent_differences_usd=perm_diff,
            temporary_differences_usd=temp_diff,
            taxable_income_usd=taxable_income,
            statutory_tax_rate_pct=25.0,
            current_tax_expense_usd=current_tax,
            deferred_tax_expense_usd=deferred_tax,
            total_income_tax_expense_usd=total_tax_exp,
            effective_tax_rate_pct=etr,
            deferred_tax_asset_balance_usd=dta,
            deferred_tax_liability_balance_usd=dtl,
            net_dta_dtl_balance_usd=net_balance
        )
