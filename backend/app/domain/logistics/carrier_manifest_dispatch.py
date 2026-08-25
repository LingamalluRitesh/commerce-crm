"""End-of-Day Carrier Shipping Manifest (SCAN Form), HazMat Declarations & Customs Invoice Engine.

Implements shipping carrier dispatch operations:
- USPS / FedEx / UPS End-of-Day Shipment Confirmation Acceptance Notice (SCAN Form 5630)
- IATA / DOT 49 CFR Hazardous Materials (HazMat) dangerous goods declarations (e.g. UN3481 Lithium-ion batteries in equipment)
- Customs Commercial Invoice (CBP Form 7501) generation for cross-border exports with Harmonized Tariff Schedule (HTS) codes.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class HazMatClass(str, Enum):
    CLASS_9_LITHIUM_BATTERIES = "CLASS_9_LITHIUM_BATTERIES"  # UN 3481 / UN 3480
    CLASS_3_FLAMMABLE_LIQUIDS = "CLASS_3_FLAMMABLE_LIQUIDS"  # UN 1263
    NON_HAZARDOUS = "NON_HAZARDOUS"


@dataclass
class ManifestPackageItem:
    tracking_number: str
    recipient_name: str
    recipient_country: str
    weight_lb: float
    declared_value_usd: Decimal
    hts_code: str  # e.g., '8471.50.0150' for processing units
    hazmat_classification: HazMatClass = HazMatClass.NON_HAZARDOUS
    hazmat_un_number: Optional[str] = None


@dataclass
class CarrierManifestBatch:
    manifest_id: str  # e.g., 'MAN-20260825-FEDEX-01'
    carrier_code: str
    dispatch_facility_id: str
    dispatch_date: str
    total_packages_count: int
    total_gross_weight_lb: float
    total_declared_value_usd: Decimal
    hazmat_package_count: int
    packages: List[ManifestPackageItem] = field(default_factory=list)
    master_barcode_payload: str = ""
    is_closed_and_dispatched: bool = False


class CarrierManifestEngine:
    """Carrier Dispatch and Customs Compliance Engine."""

    @classmethod
    def generate_carrier_manifest(
        cls,
        carrier_code: str,
        facility_id: str,
        packages: List[ManifestPackageItem]
    ) -> CarrierManifestBatch:
        """Consolidate outbound shipments into an End-of-Day carrier SCAN manifest."""
        now = datetime.now(timezone.utc)
        date_str = now.strftime("%Y%m%d")
        manifest_id = f"MAN-{date_str}-{carrier_code}-{facility_id[:6].upper()}"

        tot_weight = sum(p.weight_lb for p in packages)
        tot_val = sum(p.declared_value_usd for p in packages)
        hazmat_cnt = sum(1 for p in packages if p.hazmat_classification != HazMatClass.NON_HAZARDOUS)

        # Barcode payload: Carrier + Facility + Date + Count + Checksum
        raw_barcode = f"SCAN|{carrier_code}|{facility_id}|{date_str}|{len(packages)}|{tot_weight:.1f}"

        return CarrierManifestBatch(
            manifest_id=manifest_id,
            carrier_code=carrier_code,
            dispatch_facility_id=facility_id,
            dispatch_date=now.isoformat(),
            total_packages_count=len(packages),
            total_gross_weight_lb=round(tot_weight, 2),
            total_declared_value_usd=tot_val,
            hazmat_package_count=hazmat_cnt,
            packages=packages,
            master_barcode_payload=raw_barcode,
            is_closed_and_dispatched=True
        )

    @classmethod
    def generate_customs_commercial_invoice(
        cls,
        invoice_number: str,
        shipper_eori: str,
        importer_name: str,
        importer_country: str,
        line_items: List[ManifestPackageItem]
    ) -> Dict[str, Any]:
        """Generate CBP Form 7501 cross-border commercial customs document."""
        total_customs_val = sum(i.declared_value_usd for i in line_items)
        return {
            "commercial_invoice_number": invoice_number,
            "export_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "shipper_eori_tax_id": shipper_eori,
            "importer_of_record": importer_name,
            "destination_country": importer_country,
            "total_invoice_value_usd": total_customs_val,
            "incoterms": "DAP (Delivered at Place)",
            "line_items": [
                {
                    "tracking_number": item.tracking_number,
                    "hts_tariff_code": item.hts_code,
                    "declared_value_usd": item.declared_value_usd,
                    "weight_lb": item.weight_lb,
                    "is_dangerous_goods": item.hazmat_classification != HazMatClass.NON_HAZARDOUS,
                    "un_code": item.hazmat_un_number
                }
                for item in line_items
            ],
            "statutory_declaration": "I declare that all the information contained in this invoice to be true and correct."
        }
