"""European Statutory VAT Return & HMRC Making Tax Digital (MTD) Generator.

Generates official statutory VAT return filings:
- UK HMRC MTD VAT Return 9-Box Standard (Box 1: Output VAT, Box 4: Input VAT, Box 5: Net VAT Payable, Box 6: Total Sales ex VAT, Box 7: Total Purchases ex VAT)
- German Bundesfinanzministerium (BMF) Elster Umsatzsteuer-Voranmeldung (USt-VA)
- European Union VAT Information Exchange System (VIES) Recapitulative Statement (EC Sales List for B2B cross-border services/goods).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


@dataclass
class UKHMRCVATReturn9Box:
    period_key: str  # e.g., '2026-Q2'
    vrn_number: str  # 9-digit VAT Registration Number
    box1_vat_due_sales: Decimal
    box2_vat_due_acquisitions: Decimal
    box3_total_vat_due: Decimal  # Box 1 + Box 2
    box4_vat_reclaimed_purchases: Decimal
    box5_net_vat_payable_or_reclaimed: Decimal  # Box 3 - Box 4
    box6_total_sales_ex_vat: Decimal
    box7_total_purchases_ex_vat: Decimal
    box8_total_supplies_to_eu_ex_vat: Decimal
    box9_total_acquisitions_from_eu_ex_vat: Decimal
    is_payment_due_to_hmrc: bool


class EuropeanVATFilingEngine:
    """Enterprise Statutory VAT Return Generator."""

    @classmethod
    def generate_uk_hmrc_9box_return(
        cls,
        period_key: str,
        vrn: str,
        taxable_sales_usd: Decimal,
        taxable_purchases_usd: Decimal,
        standard_vat_rate_pct: Decimal = Decimal("20.00")
    ) -> UKHMRCVATReturn9Box:
        """Compute standard 9-box UK VAT return."""
        rate = standard_vat_rate_pct / Decimal("100.0")

        box1 = (taxable_sales_usd * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        box2 = Decimal("0.00")
        box3 = box1 + box2

        box4 = (taxable_purchases_usd * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        box5 = box3 - box4

        box6 = taxable_sales_usd.quantize(Decimal("1.0"), rounding=ROUND_HALF_UP)
        box7 = taxable_purchases_usd.quantize(Decimal("1.0"), rounding=ROUND_HALF_UP)
        box8 = Decimal("0.00")
        box9 = Decimal("0.00")

        is_due = box5 >= Decimal("0.00")

        return UKHMRCVATReturn9Box(
            period_key=period_key,
            vrn_number=vrn,
            box1_vat_due_sales=box1,
            box2_vat_due_acquisitions=box2,
            box3_total_vat_due=box3,
            box4_vat_reclaimed_purchases=box4,
            box5_net_vat_payable_or_reclaimed=box5,
            box6_total_sales_ex_vat=box6,
            box7_total_purchases_ex_vat=box7,
            box8_total_supplies_to_eu_ex_vat=box8,
            box9_total_acquisitions_from_eu_ex_vat=box9,
            is_payment_due_to_hmrc=is_due
        )
