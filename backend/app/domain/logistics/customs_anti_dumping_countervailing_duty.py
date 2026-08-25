"""Customs Anti-Dumping & Countervailing Duty (AD/CVD) Tariff Compliance Engine.

Implements statutory trade remedy compliance under US Tariff Act of 1930 (19 U.S.C. 1673):
- Department of Commerce (DOC) & US International Trade Commission (ITC) AD/CVD Case Database:
  - Solar Cells & Photovoltaic Silicon Wafers (Case A-570-979)
  - Aluminum Extrusions & Structural Shapes (Case A-570-967)
  - Stainless Steel Seamless Tubes (Case A-489-844)
- Cash Deposit Rate & Combined AD/CVD Assessment Rate Computation
- Scope Ruling Exemption Determinations & Continuous Customs Entry Summary True-Ups.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class TradeRemedyType(str, Enum):
    ANTI_DUMPING_DUTY = "ANTI_DUMPING_DUTY"
    COUNTERVAILING_DUTY = "COUNTERVAILING_DUTY"
    COMBINED_AD_CVD = "COMBINED_AD_CVD"


@dataclass
class ADCVDCaseRecord:
    case_number: str  # e.g., 'A-570-979'
    country_of_origin: str
    commodity_description: str
    remedy_type: TradeRemedyType
    ad_cash_deposit_rate_pct: float
    cvd_cash_deposit_rate_pct: float
    is_subject_to_scope_ruling: bool


@dataclass
class CustomsTariffAssessmentResult:
    entry_number: str
    hts_code: str
    country_of_origin: str
    entered_customs_value_usd: Decimal
    base_mfn_duty_rate_pct: float
    ad_cash_deposit_usd: Decimal
    cvd_cash_deposit_usd: Decimal
    base_duty_usd: Decimal
    total_customs_deposit_usd: Decimal
    effective_total_duty_rate_pct: float
    is_scope_ruling_required: bool


class CustomsADCVDEngine:
    """Enterprise AD/CVD Trade Remedy Tariff Engine."""

    _CASES: Dict[str, ADCVDCaseRecord] = {
        "8541.40.60": ADCVDCaseRecord("A-570-979", "CN", "Crystalline Silicon Photovoltaic Cells", TradeRemedyType.COMBINED_AD_CVD, 23.50, 15.20, True),
        "7604.21.00": ADCVDCaseRecord("A-570-967", "CN", "Aluminum Extrusions and Structural Shapes", TradeRemedyType.COMBINED_AD_CVD, 33.28, 12.10, False),
        "7304.41.00": ADCVDCaseRecord("A-489-844", "TR", "Stainless Steel Seamless Pipe and Tube", TradeRemedyType.ANTI_DUMPING_DUTY, 18.75, 0.00, False),
    }

    @classmethod
    def calculate_customs_duties(
        cls,
        entry_number: str,
        hts_code: str,
        country_of_origin: str,
        entered_value_usd: Decimal,
        mfn_rate_pct: float = 2.5
    ) -> CustomsTariffAssessmentResult:
        """Calculate base MFN duties and applicable AD/CVD cash deposit rates."""
        base_duty = (entered_value_usd * Decimal(str(round(mfn_rate_pct / 100.0, 6)))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        case = cls._CASES.get(hts_code)
        if case and case.country_of_origin == country_of_origin:
            ad_dep = (entered_value_usd * Decimal(str(round(case.ad_cash_deposit_rate_pct / 100.0, 6)))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            cvd_dep = (entered_value_usd * Decimal(str(round(case.cvd_cash_deposit_rate_pct / 100.0, 6)))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            scope_req = case.is_subject_to_scope_ruling
        else:
            ad_dep = Decimal("0.00")
            cvd_dep = Decimal("0.00")
            scope_req = False

        total_deposit = base_duty + ad_dep + cvd_dep
        eff_rate = round(float(total_deposit / max(Decimal("1.00"), entered_value_usd)) * 100.0, 2)

        return CustomsTariffAssessmentResult(
            entry_number=entry_number,
            hts_code=hts_code,
            country_of_origin=country_of_origin,
            entered_customs_value_usd=entered_value_usd,
            base_mfn_duty_rate_pct=mfn_rate_pct,
            ad_cash_deposit_usd=ad_dep,
            cvd_cash_deposit_usd=cvd_dep,
            base_duty_usd=base_duty,
            total_customs_deposit_usd=total_deposit,
            effective_total_duty_rate_pct=eff_rate,
            is_scope_ruling_required=scope_req
        )
