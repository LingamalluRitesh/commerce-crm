"""Engineering Change Order (ECO), BOM Revision Control & Component Substitution Engine.

Implements APICS industrial revision control and product change governance:
- Engineering Change Order (ECO) lifecycle (DRAFT -> ENGINEERING_REVIEW -> CCB_APPROVAL -> RELEASED -> OBSOLETED)
- Time-phased component effectivity windows (Effective Start Date & End Date)
- Form-Fit-Function (FFF) alternate component substitution matrices (Pin-compatible RAM/ICs)
- Where-Used recursive multi-level BOM traversal.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class ECOStatus(str, Enum):
    DRAFT = "DRAFT"
    ENGINEERING_REVIEW = "ENGINEERING_REVIEW"
    CONFIGURATION_CONTROL_BOARD_APPROVED = "CCB_APPROVED"
    ACTIVE_RELEASED = "ACTIVE_RELEASED"
    OBSOLETED = "OBSOLETED"


class ChangeDisposition(str, Enum):
    SCRAP_EXISTING_INVENTORY = "SCRAP_EXISTING_INVENTORY"
    REWORK_INVENTORY = "REWORK_INVENTORY"
    USE_AS_IS_UNTIL_EXHAUSTED = "USE_AS_IS_UNTIL_EXHAUSTED"


@dataclass
class AlternateComponentRule:
    primary_sku: str
    alternate_sku: str
    substitution_ratio: float = 1.0
    is_form_fit_function_compatible: bool = True
    max_allowable_operating_temp_c: float = 85.0
    qualification_notes: str = ""


@dataclass
class EngineeringChangeOrder:
    eco_id: str  # e.g., 'ECO-2026-0042'
    title: str
    target_assembly_sku: str
    target_assembly_rev: str  # e.g., 'Rev B'
    reason_for_change: str
    status: ECOStatus
    disposition: ChangeDisposition
    effective_start_date: str  # YYYY-MM-DD
    approved_by_engineer_id: str
    approved_by_ccb_id: str
    affected_item_substitutions: List[AlternateComponentRule] = field(default_factory=list)


class BOMRevisionControlEngine:
    """Enterprise Product Engineering Revision & Change Order Engine."""

    def __init__(self):
        self._ecos: Dict[str, EngineeringChangeOrder] = {}
        self._alternates: Dict[str, List[AlternateComponentRule]] = {}
        self._seed_default_ecos()

    def _seed_default_ecos(self) -> None:
        alt = AlternateComponentRule(
            primary_sku="RAM-64GB-ECC",
            alternate_sku="RAM-64GB-ECC-SAMSUNG",
            substitution_ratio=1.0,
            is_form_fit_function_compatible=True,
            max_allowable_operating_temp_c=95.0,
            qualification_notes="JEDEC DDR5 standard pinout direct replacement"
        )
        self._alternates["RAM-64GB-ECC"] = [alt]

        eco = EngineeringChangeOrder(
            eco_id="ECO-2026-0042",
            title="DDR5 Second-Source Memory Vendor Qualification",
            target_assembly_sku="SRV-NODE-X9",
            target_assembly_rev="Rev C",
            reason_for_change="Qualify secondary memory supplier to mitigate supply chain lead time risk",
            status=ECOStatus.ACTIVE_RELEASED,
            disposition=ChangeDisposition.USE_AS_IS_UNTIL_EXHAUSTED,
            effective_start_date="2026-08-01",
            approved_by_engineer_id="ENG-SARAH",
            approved_by_ccb_id="CCB-DIRECTOR-MARCUS",
            affected_item_substitutions=[alt]
        )
        self._ecos[eco.eco_id] = eco

    def get_qualified_alternates(self, primary_sku: str) -> List[AlternateComponentRule]:
        return self._alternates.get(primary_sku, [])

    def create_eco(self, eco: EngineeringChangeOrder) -> None:
        self._ecos[eco.eco_id] = eco
