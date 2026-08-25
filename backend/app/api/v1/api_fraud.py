"""REST API Endpoints for Transaction Fraud Prevention, Velocity Scoring, and RMA Return Logistics."""

from decimal import Decimal
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.domain.fraud_engine.rule_engine import (
    FraudRuleEngine, TransactionContext, FraudDecision, FraudEvaluationResult
)
from app.domain.fulfillment.rma_state_machine import (
    RMAStateMachine, ReturnAuthorizationOrder, RMALineItem, RMAStatus, ItemReturnCondition, ReturnReason
)

router = APIRouter(tags=["Fraud Prevention & Return Logistics"])

# In-memory singletons
_fraud_engine = FraudRuleEngine()
_rma_registry: Dict[str, ReturnAuthorizationOrder] = {}


class EvaluateTransactionRequest(BaseModel):
    transaction_id: str
    customer_id: str
    amount_usd: Decimal
    card_bin: str = "411111"
    card_last4: str = "1111"
    card_country_code: str = "US"
    ip_address: str = "198.51.100.42"
    ip_country_code: str = "US"
    device_fingerprint_id: str = "dev-fp-9842a1"
    billing_zip: str = "78701"
    shipping_zip: str = "78701"
    avs_result_code: str = "Y"
    cvv_result_code: str = "M"
    timestamp_utc: str = "2026-08-25T10:00:00Z"
    is_guest_checkout: bool = False
    customer_account_age_days: int = 120
    past_chargeback_count: int = 0


class RMALineItemDTO(BaseModel):
    item_id: str
    sku: str
    original_unit_price: Decimal
    return_quantity: int = 1
    reason: ReturnReason
    customer_notes: str = ""


class CreateRMARequest(BaseModel):
    order_id: str
    customer_id: str
    lines: List[RMALineItemDTO]


class InspectRMARequest(BaseModel):
    line_conditions: Dict[str, ItemReturnCondition]
    inspector_staff_id: str = "INSP-STAFF-042"
    inspection_notes: str = ""


# Seed sample RMA
_sample_rma = RMAStateMachine.create_rma(
    order_id="ORD-2026-9041",
    customer_id="cust-enterprise-001",
    lines=[
        RMALineItem("item-01", "SRV-NODE-X9", Decimal("4500.00"), 1, ReturnReason.BUYERS_REMORSE, "Upgraded to cluster architecture"),
        RMALineItem("item-02", "RAM-64GB-ECC", Decimal("180.00"), 2, ReturnReason.DEFECTIVE_HARDWARE, "Parity check error on slot 3")
    ]
)
RMAStateMachine.approve_rma(_sample_rma)
_rma_registry[_sample_rma.rma_number] = _sample_rma


# ---------------- Fraud Endpoints ----------------

@router.post("/fraud/evaluate", response_model=FraudEvaluationResult)
async def evaluate_fraud_risk(req: EvaluateTransactionRequest):
    """Run real-time heuristic & velocity fraud evaluation on transaction context."""
    ctx = TransactionContext(
        transaction_id=req.transaction_id,
        customer_id=req.customer_id,
        amount_usd=req.amount_usd,
        card_bin=req.card_bin,
        card_last4=req.card_last4,
        card_country_code=req.card_country_code,
        ip_address=req.ip_address,
        ip_country_code=req.ip_country_code,
        device_fingerprint_id=req.device_fingerprint_id,
        billing_zip=req.billing_zip,
        shipping_zip=req.shipping_zip,
        avs_result_code=req.avs_result_code,
        cvv_result_code=req.cvv_result_code,
        timestamp_utc=req.timestamp_utc,
        is_guest_checkout=req.is_guest_checkout,
        customer_account_age_days=req.customer_account_age_days,
        past_chargeback_count=req.past_chargeback_count
    )
    result = _fraud_engine.evaluate_transaction(ctx)
    return result


# ---------------- RMA Endpoints ----------------

@router.post("/rma/create", status_code=status.HTTP_201_CREATED)
async def create_rma_request(req: CreateRMARequest):
    """Initiate a Return Merchandise Authorization request."""
    lines = [
        RMALineItem(
            item_id=l.item_id,
            sku=l.sku,
            original_unit_price=l.original_unit_price,
            return_quantity=l.return_quantity,
            reason=l.reason,
            customer_notes=l.customer_notes
        )
        for l in req.lines
    ]
    rma = RMAStateMachine.create_rma(req.order_id, req.customer_id, lines)
    _rma_registry[rma.rma_number] = rma
    return rma


@router.post("/rma/{rma_number}/approve")
async def approve_rma(rma_number: str):
    """Approve RMA and issue return shipping tracking number."""
    if rma_number not in _rma_registry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RMA not found")
    rma = _rma_registry[rma_number]
    approved = RMAStateMachine.approve_rma(rma)
    return approved


@router.post("/rma/{rma_number}/inspect")
async def inspect_and_settle_rma(rma_number: str, req: InspectRMARequest):
    """Record physical warehouse condition inspection and calculate refund."""
    if rma_number not in _rma_registry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RMA not found")
    rma = _rma_registry[rma_number]
    inspected = RMAStateMachine.record_warehouse_inspection(
        rma=rma,
        line_conditions=req.line_conditions,
        inspector_id=req.inspector_staff_id,
        inspection_notes=req.inspection_notes
    )
    return inspected


@router.get("/rma/list")
async def list_all_rmas():
    """List all Return Merchandise Authorization orders."""
    return list(_rma_registry.values())
