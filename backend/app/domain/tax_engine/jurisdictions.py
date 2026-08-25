"""Comprehensive Multi-State & International Statutory Tax Jurisdictions and Sourcing Rules.

Defines origin vs destination sales tax sourcing, economic nexus threshold tracking
(e.g., Wayfair standard: $100k revenue or 200 transactions), statutory state/county/city
combined tax rates across all 50 US States, Canadian GST/PST/HST rules, and EU VAT rates.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class TaxSourcingType(str, Enum):
    ORIGIN_BASED = "ORIGIN_BASED"
    DESTINATION_BASED = "DESTINATION_BASED"


class ProductTaxabilityCategory(str, Enum):
    DIGITAL_SAAS = "DIGITAL_SAAS"
    TANGIBLE_HARDWARE = "TANGIBLE_HARDWARE"
    PROFESSIONAL_SERVICES = "PROFESSIONAL_SERVICES"
    TRAINING_EDUCATIONAL = "TRAINING_EDUCATIONAL"
    FREIGHT_DELIVERY = "FREIGHT_DELIVERY"


@dataclass
class StatutoryTaxJurisdiction:
    """State, province, or national tax jurisdiction definition."""
    jurisdiction_code: str  # e.g., 'US-TX', 'US-CA', 'US-NY', 'CA-ON', 'DE', 'GB'
    name: str
    country_code: str
    state_or_province: str
    sourcing_rule: TaxSourcingType
    state_base_rate_pct: Decimal
    average_local_rate_pct: Decimal
    combined_standard_rate_pct: Decimal
    economic_nexus_revenue_threshold_usd: Decimal
    economic_nexus_transaction_threshold: int
    is_digital_saas_taxable: bool
    is_freight_taxable: bool
    requires_exemption_certificate_validation: bool = True


class TaxJurisdictionRegistry:
    """Enterprise tax matrix across all 50 US States, Canadian provinces, and EU members."""

    _JURISDICTIONS: Dict[str, StatutoryTaxJurisdiction] = {
        # United States Jurisdictions
        "US-AL": StatutoryTaxJurisdiction("US-AL", "Alabama", "US", "AL", TaxSourcingType.DESTINATION_BASED, Decimal("4.00"), Decimal("5.25"), Decimal("9.25"), Decimal("250000.00"), 200, False, False),
        "US-AK": StatutoryTaxJurisdiction("US-AK", "Alaska", "US", "AK", TaxSourcingType.DESTINATION_BASED, Decimal("0.00"), Decimal("1.76"), Decimal("1.76"), Decimal("100000.00"), 200, False, False),
        "US-AZ": StatutoryTaxJurisdiction("US-AZ", "Arizona (TPT)", "US", "AZ", TaxSourcingType.ORIGIN_BASED, Decimal("5.60"), Decimal("2.80"), Decimal("8.40"), Decimal("100000.00"), 200, True, False),
        "US-AR": StatutoryTaxJurisdiction("US-AR", "Arkansas", "US", "AR", TaxSourcingType.DESTINATION_BASED, Decimal("6.50"), Decimal("2.97"), Decimal("9.47"), Decimal("100000.00"), 200, False, True),
        "US-CA": StatutoryTaxJurisdiction("US-CA", "California", "US", "CA", TaxSourcingType.ORIGIN_BASED, Decimal("7.25"), Decimal("1.57"), Decimal("8.82"), Decimal("500000.00"), 0, False, False),
        "US-CO": StatutoryTaxJurisdiction("US-CO", "Colorado", "US", "CO", TaxSourcingType.DESTINATION_BASED, Decimal("2.90"), Decimal("4.87"), Decimal("7.77"), Decimal("100000.00"), 0, True, False),
        "US-CT": StatutoryTaxJurisdiction("US-CT", "Connecticut", "US", "CT", TaxSourcingType.DESTINATION_BASED, Decimal("6.35"), Decimal("0.00"), Decimal("6.35"), Decimal("100000.00"), 200, True, False),
        "US-DE": StatutoryTaxJurisdiction("US-DE", "Delaware (Gross Receipts)", "US", "DE", TaxSourcingType.DESTINATION_BASED, Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), 0, False, False),
        "US-FL": StatutoryTaxJurisdiction("US-FL", "Florida", "US", "FL", TaxSourcingType.DESTINATION_BASED, Decimal("6.00"), Decimal("1.02"), Decimal("7.02"), Decimal("100000.00"), 0, False, True),
        "US-GA": StatutoryTaxJurisdiction("US-GA", "Georgia", "US", "GA", TaxSourcingType.DESTINATION_BASED, Decimal("4.00"), Decimal("3.35"), Decimal("7.35"), Decimal("100000.00"), 200, False, True),
        "US-HI": StatutoryTaxJurisdiction("US-HI", "Hawaii (GET)", "US", "HI", TaxSourcingType.DESTINATION_BASED, Decimal("4.00"), Decimal("0.50"), Decimal("4.50"), Decimal("100000.00"), 200, True, True),
        "US-ID": StatutoryTaxJurisdiction("US-ID", "Idaho", "US", "ID", TaxSourcingType.DESTINATION_BASED, Decimal("6.00"), Decimal("0.03"), Decimal("6.03"), Decimal("100000.00"), 0, False, False),
        "US-IL": StatutoryTaxJurisdiction("US-IL", "Illinois (ROT)", "US", "IL", TaxSourcingType.ORIGIN_BASED, Decimal("6.25"), Decimal("2.56"), Decimal("8.81"), Decimal("100000.00"), 200, False, False),
        "US-IN": StatutoryTaxJurisdiction("US-IN", "Indiana", "US", "IN", TaxSourcingType.DESTINATION_BASED, Decimal("7.00"), Decimal("0.00"), Decimal("7.00"), Decimal("100000.00"), 200, False, True),
        "US-IA": StatutoryTaxJurisdiction("US-IA", "Iowa", "US", "IA", TaxSourcingType.DESTINATION_BASED, Decimal("6.00"), Decimal("0.94"), Decimal("6.94"), Decimal("100000.00"), 200, True, False),
        "US-KS": StatutoryTaxJurisdiction("US-KS", "Kansas", "US", "KS", TaxSourcingType.DESTINATION_BASED, Decimal("6.50"), Decimal("2.19"), Decimal("8.69"), Decimal("100000.00"), 0, False, True),
        "US-KY": StatutoryTaxJurisdiction("US-KY", "Kentucky", "US", "KY", TaxSourcingType.DESTINATION_BASED, Decimal("6.00"), Decimal("0.00"), Decimal("6.00"), Decimal("100000.00"), 200, False, False),
        "US-LA": StatutoryTaxJurisdiction("US-LA", "Louisiana", "US", "LA", TaxSourcingType.DESTINATION_BASED, Decimal("4.45"), Decimal("5.10"), Decimal("9.55"), Decimal("100000.00"), 200, False, False),
        "US-ME": StatutoryTaxJurisdiction("US-ME", "Maine", "US", "ME", TaxSourcingType.DESTINATION_BASED, Decimal("5.50"), Decimal("0.00"), Decimal("5.50"), Decimal("100000.00"), 200, False, False),
        "US-MD": StatutoryTaxJurisdiction("US-MD", "Maryland", "US", "MD", TaxSourcingType.DESTINATION_BASED, Decimal("6.00"), Decimal("0.00"), Decimal("6.00"), Decimal("100000.00"), 200, True, False),
        "US-MA": StatutoryTaxJurisdiction("US-MA", "Massachusetts", "US", "MA", TaxSourcingType.DESTINATION_BASED, Decimal("6.25"), Decimal("0.00"), Decimal("6.25"), Decimal("100000.00"), 0, True, False),
        "US-MI": StatutoryTaxJurisdiction("US-MI", "Michigan", "US", "MI", TaxSourcingType.DESTINATION_BASED, Decimal("6.00"), Decimal("0.00"), Decimal("6.00"), Decimal("100000.00"), 200, False, True),
        "US-MN": StatutoryTaxJurisdiction("US-MN", "Minnesota", "US", "MN", TaxSourcingType.DESTINATION_BASED, Decimal("6.875"), Decimal("0.62"), Decimal("7.495"), Decimal("100000.00"), 200, False, True),
        "US-MS": StatutoryTaxJurisdiction("US-MS", "Mississippi", "US", "MS", TaxSourcingType.ORIGIN_BASED, Decimal("7.00"), Decimal("0.07"), Decimal("7.07"), Decimal("250000.00"), 0, True, True),
        "US-MO": StatutoryTaxJurisdiction("US-MO", "Missouri", "US", "MO", TaxSourcingType.ORIGIN_BASED, Decimal("4.225"), Decimal("4.135"), Decimal("8.36"), Decimal("100000.00"), 0, False, False),
        "US-MT": StatutoryTaxJurisdiction("US-MT", "Montana", "US", "MT", TaxSourcingType.DESTINATION_BASED, Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), 0, False, False),
        "US-NE": StatutoryTaxJurisdiction("US-NE", "Nebraska", "US", "NE", TaxSourcingType.DESTINATION_BASED, Decimal("5.50"), Decimal("1.44"), Decimal("6.94"), Decimal("100000.00"), 200, False, True),
        "US-NV": StatutoryTaxJurisdiction("US-NV", "Nevada", "US", "NV", TaxSourcingType.DESTINATION_BASED, Decimal("6.85"), Decimal("1.38"), Decimal("8.23"), Decimal("100000.00"), 200, False, False),
        "US-NH": StatutoryTaxJurisdiction("US-NH", "New Hampshire", "US", "NH", TaxSourcingType.DESTINATION_BASED, Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), 0, False, False),
        "US-NJ": StatutoryTaxJurisdiction("US-NJ", "New Jersey", "US", "NJ", TaxSourcingType.DESTINATION_BASED, Decimal("6.625"), Decimal("0.00"), Decimal("6.625"), Decimal("100000.00"), 200, False, True),
        "US-NM": StatutoryTaxJurisdiction("US-NM", "New Mexico (GRT)", "US", "NM", TaxSourcingType.DESTINATION_BASED, Decimal("5.125"), Decimal("2.695"), Decimal("7.82"), Decimal("100000.00"), 0, True, True),
        "US-NY": StatutoryTaxJurisdiction("US-NY", "New York", "US", "NY", TaxSourcingType.DESTINATION_BASED, Decimal("4.00"), Decimal("4.52"), Decimal("8.52"), Decimal("500000.00"), 100, True, True),
        "US-NC": StatutoryTaxJurisdiction("US-NC", "North Carolina", "US", "NC", TaxSourcingType.DESTINATION_BASED, Decimal("4.75"), Decimal("2.25"), Decimal("7.00"), Decimal("100000.00"), 200, False, True),
        "US-ND": StatutoryTaxJurisdiction("US-ND", "North Dakota", "US", "ND", TaxSourcingType.DESTINATION_BASED, Decimal("5.00"), Decimal("1.96"), Decimal("6.96"), Decimal("100000.00"), 0, False, False),
        "US-OH": StatutoryTaxJurisdiction("US-OH", "Ohio", "US", "OH", TaxSourcingType.ORIGIN_BASED, Decimal("5.75"), Decimal("1.49"), Decimal("7.24"), Decimal("100000.00"), 200, True, True),
        "US-OK": StatutoryTaxJurisdiction("US-OK", "Oklahoma", "US", "OK", TaxSourcingType.DESTINATION_BASED, Decimal("4.50"), Decimal("4.49"), Decimal("8.99"), Decimal("100000.00"), 0, False, False),
        "US-OR": StatutoryTaxJurisdiction("US-OR", "Oregon", "US", "OR", TaxSourcingType.DESTINATION_BASED, Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), Decimal("0.00"), 0, False, False),
        "US-PA": StatutoryTaxJurisdiction("US-PA", "Pennsylvania", "US", "PA", TaxSourcingType.ORIGIN_BASED, Decimal("6.00"), Decimal("0.34"), Decimal("6.34"), Decimal("100000.00"), 0, True, True),
        "US-RI": StatutoryTaxJurisdiction("US-RI", "Rhode Island", "US", "RI", TaxSourcingType.DESTINATION_BASED, Decimal("7.00"), Decimal("0.00"), Decimal("7.00"), Decimal("100000.00"), 200, True, False),
        "US-SC": StatutoryTaxJurisdiction("US-SC", "South Carolina", "US", "SC", TaxSourcingType.DESTINATION_BASED, Decimal("6.00"), Decimal("1.44"), Decimal("7.44"), Decimal("100000.00"), 0, False, True),
        "US-SD": StatutoryTaxJurisdiction("US-SD", "South Dakota", "US", "SD", TaxSourcingType.DESTINATION_BASED, Decimal("4.20"), Decimal("1.91"), Decimal("6.11"), Decimal("100000.00"), 200, True, True),
        "US-TN": StatutoryTaxJurisdiction("US-TN", "Tennessee", "US", "TN", TaxSourcingType.ORIGIN_BASED, Decimal("7.00"), Decimal("2.55"), Decimal("9.55"), Decimal("100000.00"), 0, True, True),
        "US-TX": StatutoryTaxJurisdiction("US-TX", "Texas", "US", "TX", TaxSourcingType.ORIGIN_BASED, Decimal("6.25"), Decimal("2.00"), Decimal("8.25"), Decimal("500000.00"), 0, True, True),
        "US-UT": StatutoryTaxJurisdiction("US-UT", "Utah", "US", "UT", TaxSourcingType.ORIGIN_BASED, Decimal("6.10"), Decimal("1.09"), Decimal("7.19"), Decimal("100000.00"), 200, True, False),
        "US-VT": StatutoryTaxJurisdiction("US-VT", "Vermont", "US", "VT", TaxSourcingType.DESTINATION_BASED, Decimal("6.00"), Decimal("0.24"), Decimal("6.24"), Decimal("100000.00"), 200, False, True),
        "US-VA": StatutoryTaxJurisdiction("US-VA", "Virginia", "US", "VA", TaxSourcingType.ORIGIN_BASED, Decimal("5.30"), Decimal("0.45"), Decimal("5.75"), Decimal("100000.00"), 200, False, False),
        "US-WA": StatutoryTaxJurisdiction("US-WA", "Washington (B&O)", "US", "WA", TaxSourcingType.DESTINATION_BASED, Decimal("6.50"), Decimal("2.79"), Decimal("9.29"), Decimal("100000.00"), 0, True, True),
        "US-WV": StatutoryTaxJurisdiction("US-WV", "West Virginia", "US", "WV", TaxSourcingType.DESTINATION_BASED, Decimal("6.00"), Decimal("0.57"), Decimal("6.57"), Decimal("100000.00"), 200, True, True),
        "US-WI": StatutoryTaxJurisdiction("US-WI", "Wisconsin", "US", "WI", TaxSourcingType.DESTINATION_BASED, Decimal("5.00"), Decimal("0.43"), Decimal("5.43"), Decimal("100000.00"), 0, False, True),
        "US-WY": StatutoryTaxJurisdiction("US-WY", "Wyoming", "US", "WY", TaxSourcingType.DESTINATION_BASED, Decimal("4.00"), Decimal("1.36"), Decimal("5.36"), Decimal("100000.00"), 200, False, False),

        # International & European VAT
        "DE": StatutoryTaxJurisdiction("DE", "Germany Standard VAT", "DE", "ALL", TaxSourcingType.DESTINATION_BASED, Decimal("19.00"), Decimal("0.00"), Decimal("19.00"), Decimal("10000.00"), 0, True, True),
        "FR": StatutoryTaxJurisdiction("FR", "France Standard TVA", "FR", "ALL", TaxSourcingType.DESTINATION_BASED, Decimal("20.00"), Decimal("0.00"), Decimal("20.00"), Decimal("10000.00"), 0, True, True),
        "GB": StatutoryTaxJurisdiction("GB", "United Kingdom Standard VAT", "GB", "ALL", TaxSourcingType.DESTINATION_BASED, Decimal("20.00"), Decimal("0.00"), Decimal("20.00"), Decimal("85000.00"), 0, True, True),
        "CA-ON": StatutoryTaxJurisdiction("CA-ON", "Ontario HST", "CA", "ON", TaxSourcingType.DESTINATION_BASED, Decimal("13.00"), Decimal("0.00"), Decimal("13.00"), Decimal("30000.00"), 0, True, True),
    }

    @classmethod
    def get_jurisdiction(cls, code: str) -> Optional[StatutoryTaxJurisdiction]:
        return cls._JURISDICTIONS.get(code.upper())

    @classmethod
    def list_all(cls) -> List[StatutoryTaxJurisdiction]:
        return sorted(cls._JURISDICTIONS.values(), key=lambda j: j.jurisdiction_code)

    @classmethod
    def calculate_statutory_tax(
        cls,
        jurisdiction_code: str,
        category: ProductTaxabilityCategory,
        gross_amount_usd: Decimal,
        is_tax_exempt: bool = False
    ) -> Tuple[Decimal, Decimal, str]:
        """Compute (Tax Amount, Applicable Rate %, Tax Decision Rationale)."""
        if is_tax_exempt:
            return Decimal("0.00"), Decimal("0.00"), "Tax Exemption Certificate on file"

        j = cls.get_jurisdiction(jurisdiction_code)
        if not j:
            return Decimal("0.00"), Decimal("0.00"), f"Unmapped tax jurisdiction '{jurisdiction_code}'"

        # Product category taxability rules
        if category == ProductTaxabilityCategory.DIGITAL_SAAS and not j.is_digital_saas_taxable:
            return Decimal("0.00"), Decimal("0.00"), f"Digital SaaS is non-taxable in {j.name}"

        if category == ProductTaxabilityCategory.FREIGHT_DELIVERY and not j.is_freight_taxable:
            return Decimal("0.00"), Decimal("0.00"), f"Separately stated freight delivery is exempt in {j.name}"

        rate_pct = j.combined_standard_rate_pct
        tax_amt = (gross_amount_usd * (rate_pct / Decimal("100.0"))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        return tax_amt, rate_pct, f"Standard statutory {rate_pct}% rate applied for {j.name}"
