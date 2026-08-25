"""Inventory Lot & Serial Number Traceability, Expiration (FEFO), and Quarantine Engine.

Provides deep tracking for regulated inventory:
- Unique serial number lifecycle (MANUFACTURED -> IN_STOCK -> ALLOCATED -> SHIPPED -> RETURNED_RMA -> SCRAPPED)
- Lot batch number tracking with manufacture date, expiration date, and First-Expired First-Out (FEFO) allocation
- Regulatory recall quarantine isolation (locks all lots in an active recall from picking or shipment).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, date, timezone
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class SerialStatus(str, Enum):
    MANUFACTURED = "MANUFACTURED"
    IN_STOCK = "IN_STOCK"
    ALLOCATED_TO_ORDER = "ALLOCATED_TO_ORDER"
    SHIPPED = "SHIPPED"
    RETURNED_RMA = "RETURNED_RMA"
    QUARANTINED_DEFECT = "QUARANTINED_DEFECT"
    SCRAPPED = "SCRAPPED"


class LotQuarantineState(str, Enum):
    RELEASED_CLEARED = "RELEASED_CLEARED"
    PENDING_QA_INSPECTION = "PENDING_QA_INSPECTION"
    RECALL_QUARANTINED = "RECALL_QUARANTINED"
    EXPIRED_LOCKED = "EXPIRED_LOCKED"


@dataclass
class InventoryLotBatch:
    lot_number: str  # e.g., 'LOT-202608-X01'
    sku: str
    warehouse_id: str
    manufacture_date: str  # YYYY-MM-DD
    expiration_date: str   # YYYY-MM-DD
    initial_quantity: int
    current_quantity_on_hand: int
    allocated_quantity: int = 0
    quarantine_state: LotQuarantineState = LotQuarantineState.RELEASED_CLEARED
    certificate_of_analysis_url: Optional[str] = None
    quarantine_reason: Optional[str] = None

    @property
    def available_quantity(self) -> int:
        if self.quarantine_state != LotQuarantineState.RELEASED_CLEARED:
            return 0
        return max(0, self.current_quantity_on_hand - self.allocated_quantity)


@dataclass
class SerializedUnit:
    serial_number: str  # e.g., 'SN-X9-2026-008492'
    sku: str
    lot_number: str
    current_warehouse_id: str
    current_bin_location: str
    status: SerialStatus
    associated_order_id: Optional[str] = None
    last_inspected_at: Optional[str] = None


class LotSerialTraceabilityEngine:
    """Enterprise inventory batch lot and serial tracking engine."""

    def __init__(self):
        self._lots: Dict[str, InventoryLotBatch] = {}
        self._serials: Dict[str, SerializedUnit] = {}
        self._active_recalls: Set[str] = set()

    def register_lot(self, lot: InventoryLotBatch) -> None:
        self._lots[lot.lot_number] = lot

    def register_serial(self, unit: SerializedUnit) -> None:
        self._serials[unit.serial_number] = unit

    def get_fefo_allocation(self, sku: str, warehouse_id: str, required_qty: int) -> List[Tuple[str, int]]:
        """Allocate required quantity across lots prioritizing earliest expiration date (FEFO)."""
        matching_lots = [
            l for l in self._lots.values()
            if l.sku == sku and l.warehouse_id == warehouse_id and l.available_quantity > 0
        ]
        # Sort by expiration date ascending (FEFO)
        sorted_lots = sorted(matching_lots, key=lambda l: l.expiration_date)

        allocated_plan: List[Tuple[str, int]] = []
        needed = required_qty

        for lot in sorted_lots:
            if needed <= 0:
                break
            alloc = min(lot.available_quantity, needed)
            if alloc > 0:
                allocated_plan.append((lot.lot_number, alloc))
                lot.allocated_quantity += alloc
                needed -= alloc

        if needed > 0:
            raise ValueError(f"Insufficient available unquarantined stock for SKU '{sku}'. Shortfall: {needed} units.")

        return allocated_plan

    def trigger_lot_recall(self, lot_number: str, reason: str) -> int:
        """Lock lot and all associated serial numbers under active regulatory recall quarantine."""
        if lot_number not in self._lots:
            raise ValueError(f"Lot '{lot_number}' not found.")

        lot = self._lots[lot_number]
        lot.quarantine_state = LotQuarantineState.RECALL_QUARANTINED
        lot.quarantine_reason = reason
        self._active_recalls.add(lot_number)

        locked_count = 0
        for s in self._serials.values():
            if s.lot_number == lot_number and s.status in {SerialStatus.IN_STOCK, SerialStatus.ALLOCATED_TO_ORDER}:
                s.status = SerialStatus.QUARANTINED_DEFECT
                locked_count += 1

        return locked_count
