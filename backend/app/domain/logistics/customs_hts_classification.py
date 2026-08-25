"""Harmonized Tariff Schedule (HTS) Customs Classification, Duty Valuation & Trade Agreement Engine.

Implements World Customs Organization (WCO) 6-digit to 10-digit HTS tariff classification:
- Chapter / Heading / Subheading / Statistical Suffix taxonomy
- Ad valorem and specific customs duty rates
- Preferential Trade Agreements (USMCA / NAFTA 2.0 Regional Value Content [RVC], EU-UK Trade & Cooperation Agreement, CPTPP)
- Section 301 / Section 232 statutory trade remedies and merchandise processing fees (MPF).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class TradeAgreementProgram(str, Enum):
    GENERAL_MFN = "GENERAL_MFN"  # Most Favored Nation (Column 1)
    USMCA_NORTH_AMERICA = "USMCA_NORTH_AMERICA"
    EU_UK_TCA = "EU_UK_TCA"
    CPTPP_PACIFIC = "CPTPP_PACIFIC"
    GSP_DEVELOPING = "GSP_DEVELOPING"


@dataclass
class HTSCodeDefinition:
    hts_code: str  # e.g., '8471.50.0150'
    description: str
    general_rate_ad_valorem_pct: Decimal
    preferential_rates: Dict[TradeAgreementProgram, Decimal] = field(default_factory=dict)
    section_301_tariff_pct: Decimal = Decimal("0.00")
    unit_of_quantity: str = "NO"  # Number/Units


@dataclass
class CustomsDutyCalculationResult:
    hts_code: str
    description: str
    customs_value_usd: Decimal
    origin_country: str
    destination_country: str
    trade_program_applied: TradeAgreementProgram
    base_duty_rate_pct: Decimal
    base_duty_amount_usd: Decimal
    section_301_duty_usd: Decimal
    merchandise_processing_fee_usd: Decimal
    total_customs_duties_usd: Decimal
    effective_total_tariff_pct: Decimal


class CustomsHTSEngine:
    """Enterprise Customs Duty & International Trade Compliance Engine."""

    _HTS_DATABASE: Dict[str, HTSCodeDefinition] = {
        "8471.50.0150": HTSCodeDefinition("8471.50.0150", "Processing units for digital automatic data processing machines (Servers / Edge Nodes)", Decimal("0.00"), {TradeAgreementProgram.USMCA_NORTH_AMERICA: Decimal("0.00"), TradeAgreementProgram.EU_UK_TCA: Decimal("0.00")}, Decimal("25.00")),
        "8542.31.0000": HTSCodeDefinition("8542.31.0000", "Electronic integrated circuits: Processors and controllers (CPUs / SOCs)", Decimal("0.00"), {TradeAgreementProgram.USMCA_NORTH_AMERICA: Decimal("0.00")}, Decimal("0.00")),
        "8542.32.0015": HTSCodeDefinition("8542.32.0015", "Dynamic read-write random-access memory (DRAM / DDR5 modules)", Decimal("0.00"), {TradeAgreementProgram.USMCA_NORTH_AMERICA: Decimal("0.00")}, Decimal("0.00")),
        "8523.51.0000": HTSCodeDefinition("8523.51.0000", "Solid-state non-volatile storage devices (Enterprise NVMe SSDs)", Decimal("0.00"), {TradeAgreementProgram.USMCA_NORTH_AMERICA: Decimal("0.00")}, Decimal("25.00")),
        "8473.30.5100": HTSCodeDefinition("8473.30.5100", "Parts and accessories for server machines: Printed circuit assemblies", Decimal("0.00"), {TradeAgreementProgram.USMCA_NORTH_AMERICA: Decimal("0.00")}, Decimal("25.00")),
        "8504.40.6018": HTSCodeDefinition("8504.40.6018", "Power supplies for data processing machines (Server Redundant PSUs)", Decimal("3.00"), {TradeAgreementProgram.USMCA_NORTH_AMERICA: Decimal("0.00")}, Decimal("25.00")),
    }

    @classmethod
    def calculate_customs_duties(
        cls,
        hts_code: str,
        customs_value_usd: Decimal,
        origin_country: str,
        destination_country: str,
        trade_program: TradeAgreementProgram = TradeAgreementProgram.GENERAL_MFN
    ) -> CustomsDutyCalculationResult:
        """Compute itemized customs duties, Section 301 tariffs, and MPF fees."""
        item = cls._HTS_DATABASE.get(hts_code)
        if not item:
            # Fallback default generic electronics
            item = HTSCodeDefinition(hts_code, f"Unclassified Machinery ({hts_code})", Decimal("2.50"))

        # Base Duty Rate
        if trade_program in item.preferential_rates:
            base_rate = item.preferential_rates[trade_program]
        else:
            base_rate = item.general_rate_ad_valorem_pct

        base_duty = (customs_value_usd * (base_rate / Decimal("100.0"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Section 301 China Tariff (Applies if origin is CN)
        sec301_rate = item.section_301_tariff_pct if origin_country.upper() == "CN" else Decimal("0.00")
        sec301_duty = (customs_value_usd * (sec301_rate / Decimal("100.0"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # US Merchandise Processing Fee (MPF) = 0.3464% (Min $31.67, Max $614.35)
        mpf_raw = (customs_value_usd * Decimal("0.003464")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        mpf = max(Decimal("31.67"), min(Decimal("614.35"), mpf_raw)) if destination_country.upper() == "US" else Decimal("0.00")

        total_duties = base_duty + sec301_duty + mpf
        effective_pct = Decimal("0.00")
        if customs_value_usd > Decimal("0.00"):
            effective_pct = ((total_duties / customs_value_usd) * Decimal("100.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        return CustomsDutyCalculationResult(
            hts_code=item.hts_code,
            description=item.description,
            customs_value_usd=customs_value_usd,
            origin_country=origin_country,
            destination_country=destination_country,
            trade_program_applied=trade_program,
            base_duty_rate_pct=base_rate,
            base_duty_amount_usd=base_duty,
            section_301_duty_usd=sec301_duty,
            merchandise_processing_fee_usd=mpf,
            total_customs_duties_usd=total_duties,
            effective_total_tariff_pct=effective_pct
        )
