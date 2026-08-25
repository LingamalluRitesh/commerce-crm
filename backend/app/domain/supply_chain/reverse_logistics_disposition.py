"""Reverse Logistics, RMA Inspection Grading & Component Harvesting Engine.

Implements circular economy reverse supply chain management:
- RMA Inspection Grading Taxonomy:
  - Grade A: Like-New Factory Reseal (Immediate restock to finished goods inventory)
  - Grade B: Minor Blemish Refurbishment (Secondary discounted outlet channel)
  - Grade C: Component Harvesting / Cannibalization (Salvaging high-value ASIC chips, power supplies, DRAM)
  - Grade D: Certified EPA / WEEE Compliant E-Waste Recycling (Statutory certificate of destruction)
- Secondary Market Valuation & Salvage Recovery Value Calculation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class RMAGradingDisposition(str, Enum):
    GRADE_A_RESTOCK_LIKE_NEW = "GRADE_A_RESTOCK"
    GRADE_B_REFURBISH_OUTLET = "GRADE_B_REFURBISH"
    GRADE_C_COMPONENT_HARVEST = "GRADE_C_HARVEST"
    GRADE_D_EWASTE_RECYCLE = "GRADE_D_RECYCLE"


@dataclass
class HarvestedComponentPart:
    part_sku: str
    description: str
    yield_quantity: int
    unit_salvage_value_usd: Decimal

    @property
    def total_salvage_value_usd(self) -> Decimal:
        return (self.unit_salvage_value_usd * Decimal(str(self.yield_quantity))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )


@dataclass
class RMADispositionInspectionReport:
    rma_number: str
    product_sku: str
    serial_number: str
    original_msrp_usd: Decimal
    disposition_grade: RMAGradingDisposition
    restock_shelf_location: Optional[str]
    total_recovered_salvage_value_usd: Decimal
    recovery_rate_pct: float
    ewaste_compliance_cert_id: Optional[str]
    harvested_components: List[HarvestedComponentPart] = field(default_factory=list)


class ReverseLogisticsDispositionEngine:
    """Enterprise Reverse Logistics RMA Inspection & Harvesting Engine."""

    @classmethod
    def evaluate_returned_asset(
        cls,
        rma_number: str,
        sku: str,
        serial_no: str,
        msrp_usd: Decimal,
        grade: RMAGradingDisposition,
        harvested_parts: Optional[List[HarvestedComponentPart]] = None
    ) -> RMADispositionInspectionReport:
        """Calculate inventory recovery salvage value and recycling disposition."""
        parts = harvested_parts or []

        if grade == RMAGradingDisposition.GRADE_A_RESTOCK_LIKE_NEW:
            recovered_val = (msrp_usd * Decimal("0.95")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            loc = "WH1-A01-SHELF"
            cert = None
        elif grade == RMAGradingDisposition.GRADE_B_REFURBISH_OUTLET:
            recovered_val = (msrp_usd * Decimal("0.70")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            loc = "WH1-OUTLET-BAY"
            cert = None
        elif grade == RMAGradingDisposition.GRADE_C_COMPONENT_HARVEST:
            recovered_val = sum((p.total_salvage_value_usd for p in parts), Decimal("0.00"))
            loc = "PARTS-CAGE-HARVEST"
            cert = None
        else:  # GRADE_D
            recovered_val = Decimal("0.00")
            loc = None
            cert = f"WEEE-CERT-{rma_number[-6:]}"

        rec_rate = round(float(recovered_val / max(Decimal("1.00"), msrp_usd)) * 100.0, 1)

        return RMADispositionInspectionReport(
            rma_number=rma_number,
            product_sku=sku,
            serial_number=serial_no,
            original_msrp_usd=msrp_usd,
            disposition_grade=grade,
            restock_shelf_location=loc,
            total_recovered_salvage_value_usd=recovered_val,
            recovery_rate_pct=rec_rate,
            ewaste_compliance_cert_id=cert,
            harvested_components=parts
        )
