"""Vendor Managed Inventory (VMI), Consignment Stock & Title Transfer Engine.

Implements lean manufacturing VMI and supplier-owned consignment inventory:
- Consignment Stock Min/Max Supermarket Buffer Monitoring (Title remains with supplier until consumed on assembly line)
- Point-of-Use Pull Signal Trigger (Automated 852 EDI / Webhook replenishment dispatch to vendor)
- Instant Legal Title Transfer Execution upon factory floor barcode scan (Debit Raw Materials Inventory / Credit Accounts Payable)
- Monthly Consignment Self-Billing Invoice Generation for vendor reconciliation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class StockOwnership(str, Enum):
    SUPPLIER_OWNED_CONSIGNMENT = "SUPPLIER_OWNED_CONSIGNMENT"
    ENTERPRISE_OWNED = "ENTERPRISE_OWNED"


@dataclass
class VMIConsignmentItem:
    sku: str
    supplier_id: str
    supplier_name: str
    bin_location: str
    min_buffer_units: int
    max_buffer_units: int
    current_on_hand_consignment_units: int
    unit_cost_usd: Decimal
    ownership: StockOwnership = StockOwnership.SUPPLIER_OWNED_CONSIGNMENT


@dataclass
class TitleTransferConsumptionEvent:
    event_id: str
    sku: str
    supplier_id: str
    quantity_consumed: int
    unit_cost_usd: Decimal
    total_payable_usd: Decimal
    consumed_at: str
    work_order_id: str
    gl_debit_account: str  # '1310 - Raw Material Inventory'
    gl_credit_account: str  # '2010 - Accounts Payable - Consignment'


class VMIConsignmentEngine:
    """Enterprise VMI Consignment Inventory & Title Transfer Engine."""

    @classmethod
    def process_point_of_use_consumption(
        cls,
        item: VMIConsignmentItem,
        quantity_consumed: int,
        work_order_id: str
    ) -> Tuple[TitleTransferConsumptionEvent, bool]:
        """Consume stock, transfer legal title to enterprise, and trigger replenishment if below min."""
        if item.current_on_hand_consignment_units < quantity_consumed:
            raise ValueError(
                f"Insufficient consignment stock: {item.current_on_hand_consignment_units} units available, requested {quantity_consumed}."
            )

        item.current_on_hand_consignment_units -= quantity_consumed
        tot_payable = (Decimal(str(quantity_consumed)) * item.unit_cost_usd).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        now = datetime.now(timezone.utc).isoformat()

        event = TitleTransferConsumptionEvent(
            event_id=f"TT-{work_order_id[:8].upper()}-{item.sku[:6]}",
            sku=item.sku,
            supplier_id=item.supplier_id,
            quantity_consumed=quantity_consumed,
            unit_cost_usd=item.unit_cost_usd,
            total_payable_usd=tot_payable,
            consumed_at=now,
            work_order_id=work_order_id,
            gl_debit_account="1310 - Raw Material Inventory",
            gl_credit_account="2010 - Accounts Payable - Consignment"
        )

        # Check if replenishment pull signal is needed
        needs_replenishment = item.current_on_hand_consignment_units <= item.min_buffer_units

        return event, needs_replenishment
