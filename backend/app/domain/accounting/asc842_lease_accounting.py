"""GAAP ASC 842 & IFRS 16 Enterprise Lease Accounting & ROU Amortization Engine.

Implements statutory corporate lease accounting standards:
- Right-of-Use (ROU) Asset Initial Valuation & Capitalization
- Lease Liability Present Value (PV) Discounting using Lessee Incremental Borrowing Rate (IBR)
- Operating Lease vs Finance / Capital Lease Classification Test (5 GAAP Bright-Line Criteria):
  1. Transfer of ownership to lessee at end of term
  2. Purchase option reasonably certain of exercise
  3. Lease term represents major part of remaining economic life (>=75%)
  4. Present value of lease payments equals or exceeds substantially all asset fair value (>=90%)
  5. Specialized nature with no alternative use to lessor
- Monthly Straight-Line Operating Cost Recognition & Finance Lease Interest/Amortization Schedules.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
import math
from typing import Dict, List, Optional, Tuple


class LeaseClassification(str, Enum):
    OPERATING_LEASE = "OPERATING_LEASE"
    FINANCE_LEASE = "FINANCE_LEASE"


@dataclass
class MonthlyLeaseScheduleEntry:
    month_index: int
    period_label: str  # e.g., '2026-01'
    lease_payment_usd: Decimal
    interest_expense_usd: Decimal
    principal_reduction_usd: Decimal
    ending_lease_liability_usd: Decimal
    rou_asset_amortization_usd: Decimal
    ending_rou_asset_carrying_val_usd: Decimal
    total_periodic_lease_cost_usd: Decimal


@dataclass
class LeaseContractSummary:
    lease_id: str
    asset_description: str
    lessor_name: str
    commencement_date: str
    lease_term_months: int
    monthly_payment_usd: Decimal
    discount_rate_annual_pct: float
    asset_fair_market_val_usd: Decimal
    classification: LeaseClassification
    initial_lease_liability_usd: Decimal
    initial_rou_asset_val_usd: Decimal
    schedule: List[MonthlyLeaseScheduleEntry] = field(default_factory=list)


class ASC842LeaseAccountingEngine:
    """Enterprise ASC 842 & IFRS 16 Lease Accounting Engine."""

    @classmethod
    def classify_and_amortize_lease(
        cls,
        lease_id: str,
        asset_description: str,
        lessor_name: str,
        commencement_date: str,
        term_months: int,
        monthly_payment_usd: Decimal,
        discount_rate_annual_pct: float,
        asset_fair_market_val_usd: Decimal,
        economic_life_months: int = 60,
        transfers_ownership: bool = False,
        has_purchase_option: bool = False,
        is_specialized: bool = False
    ) -> LeaseContractSummary:
        """Evaluate ASC 842 classification criteria and generate full monthly balance sheet & P&L schedules."""
        monthly_rate = (discount_rate_annual_pct / 100.0) / 12.0
        
        # Calculate Present Value of lease payments (Annuity immediate/due)
        # PV = PMT * [(1 - (1+r)^-n) / r]
        if monthly_rate > 0:
            pv_factor = (1.0 - math.pow(1.0 + monthly_rate, -term_months)) / monthly_rate
        else:
            pv_factor = float(term_months)

        pv_payments = (monthly_payment_usd * Decimal(str(round(pv_factor, 6)))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        # 5 Criteria Test
        is_finance = (
            transfers_ownership or
            has_purchase_option or
            (term_months / max(1, economic_life_months)) >= 0.75 or
            (float(pv_payments) / max(1.0, float(asset_fair_market_val_usd))) >= 0.90 or
            is_specialized
        )
        classification = LeaseClassification.FINANCE_LEASE if is_finance else LeaseClassification.OPERATING_LEASE

        # Initial ROU Asset = Initial Lease Liability
        initial_liability = pv_payments
        initial_rou = pv_payments

        schedule: List[MonthlyLeaseScheduleEntry] = []
        liability_bal = initial_liability
        rou_bal = initial_rou

        total_undiscounted_pmts = monthly_payment_usd * Decimal(str(term_months))
        straight_line_operating_cost = (total_undiscounted_pmts / Decimal(str(term_months))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        cur_year = int(commencement_date[:4])
        cur_month = int(commencement_date[5:7])

        for m in range(1, term_months + 1):
            period_str = f"{cur_year}-{cur_month:02d}"

            # Interest expense = beginning liability * monthly rate
            interest = (liability_bal * Decimal(str(round(monthly_rate, 8)))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            principal_red = max(Decimal("0.00"), monthly_payment_usd - interest)
            liability_bal = max(Decimal("0.00"), liability_bal - principal_red)

            if classification == LeaseClassification.FINANCE_LEASE:
                # Finance lease: straight-line ROU amortization
                rou_amort = (initial_rou / Decimal(str(term_months))).quantize(
                    Decimal("0.01"), rounding=ROUND_HALF_UP
                )
                periodic_cost = interest + rou_amort
            else:
                # Operating lease: single straight-line lease expense (ROU amortization is balancing plug)
                periodic_cost = straight_line_operating_cost
                rou_amort = straight_line_operating_cost - interest

            rou_bal = max(Decimal("0.00"), rou_bal - rou_amort)

            schedule.append(MonthlyLeaseScheduleEntry(
                month_index=m,
                period_label=period_str,
                lease_payment_usd=monthly_payment_usd,
                interest_expense_usd=interest,
                principal_reduction_usd=principal_red,
                ending_lease_liability_usd=liability_bal,
                rou_asset_amortization_usd=rou_amort,
                ending_rou_asset_carrying_val_usd=rou_bal,
                total_periodic_lease_cost_usd=periodic_cost
            ))

            cur_month += 1
            if cur_month > 12:
                cur_month = 1
                cur_year += 1

        return LeaseContractSummary(
            lease_id=lease_id,
            asset_description=asset_description,
            lessor_name=lessor_name,
            commencement_date=commencement_date,
            lease_term_months=term_months,
            monthly_payment_usd=monthly_payment_usd,
            discount_rate_annual_pct=discount_rate_annual_pct,
            asset_fair_market_val_usd=asset_fair_market_val_usd,
            classification=classification,
            initial_lease_liability_usd=initial_liability,
            initial_rou_asset_val_usd=initial_rou,
            schedule=schedule
        )
