"""Return Merchandise Authorization (RMA) Lifecycle and Inspection Grading State Machine.

Provides complete return order state transitions (REQUESTED -> APPROVED -> IN_TRANSIT ->
INSPECTED -> REFUNDED / REJECTED), condition grading (A: Like New, B: Open Box, C: Damaged, D: Scrap),
dynamic restocking fee calculation, and reverse logistics tracking.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class RMAStatus(str, Enum):
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    IN_TRANSIT = "IN_TRANSIT"
    RECEIVED_AT_WAREHOUSE = "RECEIVED_AT_WAREHOUSE"
    INSPECTED = "INSPECTED"
    REFUND_PROCESSED = "REFUND_PROCESSED"
    REPLACEMENT_DISPATCHED = "REPLACEMENT_DISPATCHED"
    REJECTED = "REJECTED"


class ItemReturnCondition(str, Enum):
    GRADE_A_PRISTINE = "GRADE_A_PRISTINE"      # Unopened, sealed in original packaging
    GRADE_B_OPEN_BOX = "GRADE_B_OPEN_BOX"      # Opened, complete accessories, minor box wear
    GRADE_C_REFURB_NEEDED = "GRADE_C_REFURB_NEEDED" # Functional, cosmetic blemishes, missing minor parts
    GRADE_D_DEFECTIVE_SCRAP = "GRADE_D_DEFECTIVE_SCRAP" # Non-functional, damaged, liquid ingress


class ReturnReason(str, Enum):
    DEFECTIVE_HARDWARE = "DEFECTIVE_HARDWARE"
    BUYERS_REMORSE = "BUYERS_REMORSE"
    WRONG_ITEM_SHIPPED = "WRONG_ITEM_SHIPPED"
    SHIPPING_DAMAGE = "SHIPPING_DAMAGE"
    UNAUTHORIZED_PURCHASE = "UNAUTHORIZED_PURCHASE"


@dataclass
class RMALineItem:
    item_id: str
    sku: str
    original_unit_price: Decimal
    return_quantity: int
    reason: ReturnReason
    customer_notes: str = ""
    assigned_condition: Optional[ItemReturnCondition] = None
    restocking_fee_percentage: Decimal = Decimal("0.00")
    approved_refund_amount: Decimal = Decimal("0.00")


@dataclass
class ReturnAuthorizationOrder:
    rma_number: str  # e.g., 'RMA-2026-00941'
    order_id: str
    customer_id: str
    status: RMAStatus
    created_at: str
    return_carrier: str = "FEDEX_RETURN"
    tracking_number: str = ""
    lines: List[RMALineItem] = field(default_factory=list)
    inspection_notes: str = ""
    inspector_staff_id: Optional[str] = None
    total_original_value: Decimal = Decimal("0.00")
    total_refund_approved: Decimal = Decimal("0.00")


class RMAStateMachine:
    """Enterprise reverse logistics and return inspection state machine."""

    RESTOCKING_FEE_MATRIX: Dict[Tuple[ReturnReason, ItemReturnCondition], Decimal] = {
        (ReturnReason.BUYERS_REMORSE, ItemReturnCondition.GRADE_A_PRISTINE): Decimal("5.00"),
        (ReturnReason.BUYERS_REMORSE, ItemReturnCondition.GRADE_B_OPEN_BOX): Decimal("15.00"),
        (ReturnReason.BUYERS_REMORSE, ItemReturnCondition.GRADE_C_REFURB_NEEDED): Decimal("25.00"),
        (ReturnReason.BUYERS_REMORSE, ItemReturnCondition.GRADE_D_DEFECTIVE_SCRAP): Decimal("50.00"),
        (ReturnReason.DEFECTIVE_HARDWARE, ItemReturnCondition.GRADE_A_PRISTINE): Decimal("0.00"),
        (ReturnReason.DEFECTIVE_HARDWARE, ItemReturnCondition.GRADE_B_OPEN_BOX): Decimal("0.00"),
        (ReturnReason.DEFECTIVE_HARDWARE, ItemReturnCondition.GRADE_C_REFURB_NEEDED): Decimal("0.00"),
        (ReturnReason.DEFECTIVE_HARDWARE, ItemReturnCondition.GRADE_D_DEFECTIVE_SCRAP): Decimal("0.00"),
        (ReturnReason.WRONG_ITEM_SHIPPED, ItemReturnCondition.GRADE_A_PRISTINE): Decimal("0.00"),
        (ReturnReason.SHIPPING_DAMAGE, ItemReturnCondition.GRADE_D_DEFECTIVE_SCRAP): Decimal("0.00"),
    }

    @classmethod
    def create_rma(
        cls,
        order_id: str,
        customer_id: str,
        lines: List[RMALineItem]
    ) -> ReturnAuthorizationOrder:
        """Initialize new RMA in REQUESTED status."""
        total_val = sum(l.original_unit_price * l.return_quantity for l in lines)
        rma_num = f"RMA-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{len(lines):03d}"
        
        return ReturnAuthorizationOrder(
            rma_number=rma_num,
            order_id=order_id,
            customer_id=customer_id,
            status=RMAStatus.REQUESTED,
            created_at=datetime.now(timezone.utc).isoformat(),
            lines=lines,
            total_original_value=total_val
        )

    @classmethod
    def approve_rma(
        cls,
        rma: ReturnAuthorizationOrder,
        carrier: str = "FEDEX_RETURN",
        prepaid_tracking: str = "9801238491823"
    ) -> ReturnAuthorizationOrder:
        """Transition RMA to APPROVED and issue prepaid return shipping label."""
        if rma.status != RMAStatus.REQUESTED:
            raise ValueError(f"Cannot approve RMA in status {rma.status}")

        rma.status = RMAStatus.APPROVED
        rma.return_carrier = carrier
        rma.tracking_number = prepaid_tracking
        return rma

    @classmethod
    def record_warehouse_inspection(
        cls,
        rma: ReturnAuthorizationOrder,
        line_conditions: Dict[str, ItemReturnCondition],
        inspector_id: str,
        inspection_notes: str = ""
    ) -> ReturnAuthorizationOrder:
        """Grade received items and calculate itemized refund net of restocking fees."""
        rma.status = RMAStatus.INSPECTED
        rma.inspector_staff_id = inspector_id
        rma.inspection_notes = inspection_notes
        total_refund = Decimal("0.00")

        for line in rma.lines:
            cond = line_conditions.get(line.item_id, ItemReturnCondition.GRADE_B_OPEN_BOX)
            line.assigned_condition = cond

            # Determine restocking fee percentage
            fee_pct = cls.RESTOCKING_FEE_MATRIX.get((line.reason, cond), Decimal("10.00"))
            line.restocking_fee_percentage = fee_pct

            line_gross = line.original_unit_price * line.return_quantity
            fee_deduction = (line_gross * (fee_pct / Decimal("100.0"))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            approved_refund = line_gross - fee_deduction
            line.approved_refund_amount = approved_refund
            total_refund += approved_refund

        rma.total_refund_approved = total_refund
        return rma
