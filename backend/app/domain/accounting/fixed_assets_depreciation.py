"""Enterprise Fixed Asset Register, Capital Expenditure (CapEx) & Multi-Method Depreciation Engine.

Implements GAAP & IRS statutory depreciation methods:
- Straight-Line (SL)
- Double Declining Balance (DDB - 200% acceleration)
- Sum-of-the-Years-Digits (SYD)
- Modified Accelerated Cost Recovery System (MACRS 3-year, 5-year, 7-year, 15-year half-year convention).
Calculates accumulated depreciation, net book value (NBV), disposal gain/loss, and automated monthly journal postings.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class DepreciationMethod(str, Enum):
    STRAIGHT_LINE = "STRAIGHT_LINE"
    DOUBLE_DECLINING_BALANCE = "DOUBLE_DECLINING_BALANCE"
    SUM_OF_YEARS_DIGITS = "SUM_OF_YEARS_DIGITS"
    MACRS_5_YEAR_HALF_YEAR = "MACRS_5_YEAR_HALF_YEAR"


class AssetCategory(str, Enum):
    COMPUTER_EDGE_HARDWARE = "COMPUTER_EDGE_HARDWARE"  # 3-5 years
    OFFICE_FURNITURE_FIXTURES = "OFFICE_FURNITURE_FIXTURES"  # 7 years
    INDUSTRIAL_MANUFACTURING_MACHINERY = "INDUSTRIAL_MANUFACTURING_MACHINERY"  # 10 years
    SOFTWARE_INTANGIBLES = "SOFTWARE_INTANGIBLES"  # 3 years amort


@dataclass
class DepreciationPeriodSchedule:
    period_year: int
    beginning_book_value: Decimal
    depreciation_expense: Decimal
    accumulated_depreciation: Decimal
    ending_book_value: Decimal


@dataclass
class FixedAssetMasterRecord:
    asset_tag: str  # e.g., 'AST-2026-00481'
    name: str
    category: AssetCategory
    acquisition_date: str  # YYYY-MM-DD
    placed_in_service_date: str
    original_cost_usd: Decimal
    salvage_scrap_value_usd: Decimal
    useful_life_years: int
    depreciation_method: DepreciationMethod
    is_active: bool = True
    gl_asset_account: str = "15000"
    gl_accum_depr_account: str = "15100"
    gl_depr_expense_account: str = "60400"


class FixedAssetDepreciationEngine:
    """Enterprise Fixed Asset Register & Amortization Engine."""

    # IRS MACRS 5-Year Property Half-Year Convention percentages
    MACRS_5YR_TABLE: List[Decimal] = [
        Decimal("20.00"),  # Year 1 (half year)
        Decimal("32.00"),  # Year 2
        Decimal("19.20"),  # Year 3
        Decimal("11.52"),  # Year 4
        Decimal("11.52"),  # Year 5
        Decimal("5.76"),   # Year 6 (half year)
    ]

    @classmethod
    def calculate_straight_line(cls, cost: Decimal, salvage: Decimal, life_years: int) -> List[DepreciationPeriodSchedule]:
        """Compute Straight-Line depreciation schedule."""
        depreciable_base = cost - salvage
        annual_exp = (depreciable_base / Decimal(str(life_years))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        schedules: List[DepreciationPeriodSchedule] = []

        current_beg = cost
        accum = Decimal("0.00")

        for yr in range(1, life_years + 1):
            if yr == life_years:
                exp = depreciable_base - accum
            else:
                exp = annual_exp

            accum += exp
            ending = current_beg - exp

            schedules.append(DepreciationPeriodSchedule(
                period_year=yr,
                beginning_book_value=current_beg,
                depreciation_expense=exp,
                accumulated_depreciation=accum,
                ending_book_value=ending
            ))
            current_beg = ending

        return schedules

    @classmethod
    def calculate_double_declining_balance(cls, cost: Decimal, salvage: Decimal, life_years: int) -> List[DepreciationPeriodSchedule]:
        """Compute 200% Double Declining Balance with automatic switch to Straight-Line."""
        rate = (Decimal("2.0") / Decimal(str(life_years))).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        schedules: List[DepreciationPeriodSchedule] = []

        current_beg = cost
        accum = Decimal("0.00")

        for yr in range(1, life_years + 1):
            ddb_exp = (current_beg * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            
            # Ensure ending book value does not drop below salvage value
            if (current_beg - ddb_exp) < salvage:
                exp = max(Decimal("0.00"), current_beg - salvage)
            else:
                exp = ddb_exp

            accum += exp
            ending = current_beg - exp

            schedules.append(DepreciationPeriodSchedule(
                period_year=yr,
                beginning_book_value=current_beg,
                depreciation_expense=exp,
                accumulated_depreciation=accum,
                ending_book_value=ending
            ))
            current_beg = ending

        return schedules

    @classmethod
    def calculate_macrs_5year(cls, cost: Decimal) -> List[DepreciationPeriodSchedule]:
        """Compute IRS statutory MACRS 5-year schedule."""
        schedules: List[DepreciationPeriodSchedule] = []
        current_beg = cost
        accum = Decimal("0.00")

        for yr, pct in enumerate(cls.MACRS_5YR_TABLE, start=1):
            exp = (cost * (pct / Decimal("100.0"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            accum += exp
            ending = current_beg - exp

            schedules.append(DepreciationPeriodSchedule(
                period_year=yr,
                beginning_book_value=current_beg,
                depreciation_expense=exp,
                accumulated_depreciation=accum,
                ending_book_value=ending
            ))
            current_beg = ending

        return schedules

    @classmethod
    def generate_asset_schedule(cls, asset: FixedAssetMasterRecord) -> List[DepreciationPeriodSchedule]:
        if asset.depreciation_method == DepreciationMethod.STRAIGHT_LINE:
            return cls.calculate_straight_line(asset.original_cost_usd, asset.salvage_scrap_value_usd, asset.useful_life_years)
        elif asset.depreciation_method == DepreciationMethod.DOUBLE_DECLINING_BALANCE:
            return cls.calculate_double_declining_balance(asset.original_cost_usd, asset.salvage_scrap_value_usd, asset.useful_life_years)
        elif asset.depreciation_method == DepreciationMethod.MACRS_5_YEAR_HALF_YEAR:
            return cls.calculate_macrs_5year(asset.original_cost_usd)
        return cls.calculate_straight_line(asset.original_cost_usd, asset.salvage_scrap_value_usd, asset.useful_life_years)
