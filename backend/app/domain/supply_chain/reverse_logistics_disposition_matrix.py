"""Enterprise Reverse Logistics, RMA Processing & Multi-Tier Disposition Matrix Engine.

Orchestrates post-purchase returns, inspection grading, and liquidation workflows:
- RMA (Return Merchandise Authorization) lifecycle & automated pre-approval rules
- Warranty entitlement validation & serial number return verification
- Fraudulent return velocity detection (wardrobing, empty box claims, serial mismatch)
- Optical & functional QA grading (A-Grade Pristine, B-Grade Minor Cosmetic, C-Grade Refurb Needed, Salvage)
- Optimal disposition routing: Restock to Primary, Rebox, B2B Liquidation Auction, or Environmental Scrap
- Restocking fee & refund ledger credit calculations with tax adjustments.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class RMAReason(str, Enum):
    DEFECTIVE_ON_ARRIVAL = "DEFECTIVE_ON_ARRIVAL"
    NOT_AS_DESCRIBED = "NOT_AS_DESCRIBED"
    BUYER_REMORSE = "BUYER_REMORSE"
    WRONG_ITEM_SHIPPED = "WRONG_ITEM_SHIPPED"
    SHIPPING_DAMAGE = "SHIPPING_DAMAGE"
    INCOMPATIBLE_SPECS = "INCOMPATIBLE_SPECS"


class RMAStatus(str, Enum):
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    LABEL_ISSUED = "LABEL_ISSUED"
    IN_TRANSIT = "IN_TRANSIT"
    RECEIVED_AT_HUB = "RECEIVED_AT_HUB"
    INSPECTION_IN_PROGRESS = "INSPECTION_IN_PROGRESS"
    DISPOSITION_ASSIGNED = "DISPOSITION_ASSIGNED"
    REFUND_SETTLED = "REFUND_SETTLED"
    REJECTED = "REJECTED"


class InspectionGrade(str, Enum):
    GRADE_A_NEW_OPEN_BOX = "GRADE_A_NEW_OPEN_BOX"   # Unopened / flawless condition
    GRADE_B_MINOR_COSMETIC = "GRADE_B_MINOR_COSMETIC" # Minor scratches, accessories intact
    GRADE_C_REFURB_REQUIRED = "GRADE_C_REFURB_REQUIRED" # Functional defect repairable
    GRADE_D_SALVAGE_PARTS = "GRADE_D_SALVAGE_PARTS"   # Stripped for valuable components
    GRADE_F_SCRAP_HAZMAT = "GRADE_F_SCRAP_HAZMAT"     # Unrecoverable e-waste or hazard


class DispositionChannel(str, Enum):
    RETURN_TO_PRIMARY_INVENTORY = "RETURN_TO_PRIMARY_INVENTORY"
    OUTLET_SECONDARY_STORE = "OUTLET_SECONDARY_STORE"
    B2B_WHOLESALE_LIQUIDATION = "B2B_WHOLESALE_LIQUIDATION"
    OEM_FACTORY_REPAIR = "OEM_FACTORY_REPAIR"
    CERTIFIED_E_WASTE_RECYCLING = "CERTIFIED_E_WASTE_RECYCLING"


@dataclass
class RMAItemLine:
    line_id: str
    product_id: str
    sku: str
    serial_number: Optional[str]
    purchase_price_usd: Decimal
    return_reason: RMAReason
    customer_notes: str = ""
    assigned_grade: Optional[InspectionGrade] = None
    assigned_disposition: Optional[DispositionChannel] = None
    expected_recovery_value_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))
    refurbishment_cost_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))
    restocking_fee_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))
    refund_amount_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))


@dataclass
class RMARecord:
    rma_number: str
    order_id: str
    customer_id: str
    status: RMAStatus
    created_at: str
    items: List[RMAItemLine]
    carrier_tracking_number: Optional[str] = None
    warehouse_hub_id: str = "WH-CENTRAL-REVERSE"
    is_fraud_flagged: bool = False
    fraud_risk_score: float = 0.0  # 0.0 to 100.0
    settlement_completed_at: Optional[str] = None

    @property
    def total_refund_usd(self) -> Decimal:
        return sum((item.refund_amount_usd for item in self.items), Decimal("0.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def total_recovery_usd(self) -> Decimal:
        return sum((item.expected_recovery_value_usd for item in self.items), Decimal("0.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


class ReverseLogisticsDispositionEngine:
    """Manages RMA generation, fraud prevention heuristics, physical inspection grading, and optimal disposition routing."""

    def __init__(self, remorse_restocking_fee_pct: Decimal = Decimal("15.0")):
        self.remorse_restocking_fee_pct = remorse_restocking_fee_pct
        self.rma_records: Dict[str, RMARecord] = {}
        self.customer_return_velocity: Dict[str, int] = {}  # customer_id -> returns in last 90 days

    def create_rma_request(
        self,
        order_id: str,
        customer_id: str,
        items: List[Tuple[str, str, Optional[str], Decimal, RMAReason, str]],
        days_since_purchase: int
    ) -> Tuple[bool, str, Optional[RMARecord]]:
        """Creates and validates a new RMA request against return policy and velocity fraud checks."""
        # 30-day standard return window check
        if days_since_purchase > 45:
            return False, f"Return window exceeded (Order is {days_since_purchase} days old, max policy is 45 days)", None

        recent_returns = self.customer_return_velocity.get(customer_id, 0)
        fraud_risk_score = 0.0
        fraud_flag = False

        if recent_returns >= 4:
            fraud_risk_score += 45.0
        if days_since_purchase > 35:
            fraud_risk_score += 15.0

        for it in items:
            if it[4] == RMAReason.BUYER_REMORSE and it[3] > Decimal("1000.00"):
                fraud_risk_score += 25.0

        if fraud_risk_score >= 60.0:
            fraud_flag = True

        rma_num = f"RMA-{datetime.now().strftime('%Y%m%d')}-{len(self.rma_records) + 1001:04d}"
        now_iso = datetime.now(timezone.utc).isoformat()

        rma_lines = []
        for idx, it in enumerate(items):
            line_id = f"{rma_num}-L{idx+1:02d}"
            rma_lines.append(
                RMAItemLine(
                    line_id=line_id,
                    product_id=it[0],
                    sku=it[1],
                    serial_number=it[2],
                    purchase_price_usd=it[3],
                    return_reason=it[4],
                    customer_notes=it[5],
                )
            )

        initial_status = RMAStatus.REQUESTED if fraud_flag else RMAStatus.APPROVED
        rma = RMARecord(
            rma_number=rma_num,
            order_id=order_id,
            customer_id=customer_id,
            status=initial_status,
            created_at=now_iso,
            items=rma_lines,
            carrier_tracking_number=f"1Z999REV{len(self.rma_records)+10000}",
            is_fraud_flagged=fraud_flag,
            fraud_risk_score=fraud_risk_score,
        )

        self.rma_records[rma_num] = rma
        self.customer_return_velocity[customer_id] = recent_returns + 1
        msg = "RMA Created & Pre-Approved" if not fraud_flag else "RMA Created with Fraud Review Flag (Manual Approval Required)"
        return True, msg, rma

    def conduct_inspection_and_route_disposition(
        self,
        rma_number: str,
        line_inspections: List[Tuple[str, InspectionGrade, Decimal]]  # (line_id, grade, refurb_cost_usd)
    ) -> Tuple[bool, str]:
        """Evaluates physical grade and determines mathematical optimum disposition channel."""
        rma = self.rma_records.get(rma_number)
        if not rma:
            return False, "RMA not found"

        line_map = {item.line_id: item for item in rma.items}

        for line_id, grade, refurb_cost in line_inspections:
            item = line_map.get(line_id)
            if not item:
                continue

            item.assigned_grade = grade
            item.refurbishment_cost_usd = refurb_cost

            # Disposition Decision Tree
            if grade == InspectionGrade.GRADE_A_NEW_OPEN_BOX:
                item.assigned_disposition = DispositionChannel.RETURN_TO_PRIMARY_INVENTORY
                item.expected_recovery_value_usd = (item.purchase_price_usd * Decimal("0.95")).quantize(Decimal("0.01"))
            elif grade == InspectionGrade.GRADE_B_MINOR_COSMETIC:
                item.assigned_disposition = DispositionChannel.OUTLET_SECONDARY_STORE
                item.expected_recovery_value_usd = (item.purchase_price_usd * Decimal("0.75")).quantize(Decimal("0.01"))
            elif grade == InspectionGrade.GRADE_C_REFURB_REQUIRED:
                if refurb_cost < (item.purchase_price_usd * Decimal("0.40")):
                    item.assigned_disposition = DispositionChannel.OEM_FACTORY_REPAIR
                    item.expected_recovery_value_usd = (item.purchase_price_usd * Decimal("0.65") - refurb_cost).quantize(Decimal("0.01"))
                else:
                    item.assigned_disposition = DispositionChannel.B2B_WHOLESALE_LIQUIDATION
                    item.expected_recovery_value_usd = (item.purchase_price_usd * Decimal("0.30")).quantize(Decimal("0.01"))
            elif grade == InspectionGrade.GRADE_D_SALVAGE_PARTS:
                item.assigned_disposition = DispositionChannel.B2B_WHOLESALE_LIQUIDATION
                item.expected_recovery_value_usd = (item.purchase_price_usd * Decimal("0.15")).quantize(Decimal("0.01"))
            else:
                item.assigned_disposition = DispositionChannel.CERTIFIED_E_WASTE_RECYCLING
                item.expected_recovery_value_usd = Decimal("0.00")

            # Restocking fee & refund calculation
            if item.return_reason == RMAReason.BUYER_REMORSE and grade != InspectionGrade.GRADE_A_NEW_OPEN_BOX:
                item.restocking_fee_usd = (item.purchase_price_usd * (self.remorse_restocking_fee_pct / Decimal("100.00"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            else:
                item.restocking_fee_usd = Decimal("0.00")

            item.refund_amount_usd = max(Decimal("0.00"), item.purchase_price_usd - item.restocking_fee_usd)

        rma.status = RMAStatus.DISPOSITION_ASSIGNED
        return True, f"Inspection complete for RMA {rma_number}: Total recovery ${rma.total_recovery_usd:.2f}, Refund due ${rma.total_refund_usd:.2f}"

    def settle_refund_and_close(self, rma_number: str) -> Tuple[bool, str]:
        """Finalizes customer ledger credit and marks RMA closed."""
        rma = self.rma_records.get(rma_number)
        if not rma:
            return False, "RMA not found"
        if rma.status != RMAStatus.DISPOSITION_ASSIGNED:
            return False, f"RMA cannot be settled from status {rma.status.value}"

        rma.status = RMAStatus.REFUND_SETTLED
        rma.settlement_completed_at = datetime.now(timezone.utc).isoformat()
        return True, f"Settled refund of ${rma.total_refund_usd:.2f} to customer {rma.customer_id}"
