"""US Customs Brokerage, ISF 10+2 Importer Security Filing & Continuous Bond Calculator.

Implements statutory US CBP international logistics compliance:
- ISF (Importer Security Filing 10+2) 24 hours prior to ocean vessel vessel loading (Manufacturer, Seller, Buyer, Ship-to, Container Stuffing Location, Consolidator, Importer of Record Number, Consignee Number, Country of Origin, HTSUS 6-digit)
- Customs Continuous Import Bond calculation: Minimum $50,000 bond or 10% of total annual duties, taxes, and fees paid to CBP in the previous 12 months
- Anti-Dumping Duty (ADD) & Countervailing Duty (CVD) statutory scope evaluations
- ACE (Automated Commercial Environment) Electronic Entry Summary (Form 7501) declaration.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


@dataclass
class ISF10Plus2Declaration:
    isf_transaction_number: str
    bill_of_lading_number: str
    importer_of_record_ein: str
    consignee_number_ein: str
    manufacturer_name_address: str
    seller_name_address: str
    buyer_name_address: str
    ship_to_party_address: str
    country_of_origin_code: str
    htsus_6digit_subheading: str
    container_stuffing_location: str
    consolidator_name: str
    is_filed_24h_prior_to_lading: bool = True


@dataclass
class ContinuousBondRequirement:
    annual_duties_and_taxes_usd: Decimal
    required_continuous_bond_amount_usd: Decimal  # Rounded up to nearest $10k
    annual_bond_premium_usd: Decimal
    bond_coverage_ratio: float


class CustomsBrokerageComplianceEngine:
    """Enterprise US CBP Customs Brokerage & Import Compliance Engine."""

    MINIMUM_CONTINUOUS_BOND_USD = Decimal("50000.00")
    BOND_PREMIUM_RATE = Decimal("0.008")  # 0.8% annual surety premium

    @classmethod
    def calculate_continuous_import_bond(
        cls,
        annual_duties_and_taxes_usd: Decimal
    ) -> ContinuousBondRequirement:
        """Calculate statutory 10% CBP continuous import bond rounded up to nearest $10,000."""
        ten_pct = annual_duties_and_taxes_usd * Decimal("0.10")

        if ten_pct <= cls.MINIMUM_CONTINUOUS_BOND_USD:
            bond_amt = cls.MINIMUM_CONTINUOUS_BOND_USD
        else:
            # Strictly round up to the next multiple of $10,000
            factor = Decimal("10000.00")
            raw_div = ten_pct / factor
            ceil_units = math.ceil(float(raw_div))
            bond_amt = Decimal(str(ceil_units)) * factor

        premium = (bond_amt * cls.BOND_PREMIUM_RATE).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        cov_ratio = float(bond_amt / max(Decimal("1.00"), annual_duties_and_taxes_usd))

        return ContinuousBondRequirement(
            annual_duties_and_taxes_usd=annual_duties_and_taxes_usd,
            required_continuous_bond_amount_usd=bond_amt,
            annual_bond_premium_usd=premium,
            bond_coverage_ratio=round(cov_ratio, 2)
        )
