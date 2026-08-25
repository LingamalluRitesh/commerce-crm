import uuid
from decimal import Decimal
from typing import Any

from app.application.services.payment_gateways.base import BasePaymentGateway
from app.core.logging import logger


class PayPalPaymentGateway(BasePaymentGateway):
    def __init__(self, client_id: str = "paypal_mock_client", secret: str = "paypal_mock_secret"):
        self.client_id = client_id
        self.secret = secret

    async def create_charge(
        self,
        amount: Decimal,
        currency: str,
        customer_id: str,
        description: str,
        idempotency_key: str,
        payment_method: str = "paypal_wallet",
    ) -> dict[str, Any]:
        order_id = f"PAYPAL-ORD-{uuid.uuid4().hex[:12].upper()}"
        logger.info(
            "paypal_capture_created",
            gateway="paypal",
            order_id=order_id,
            amount=str(amount),
        )
        return {
            "gateway": "paypal",
            "charge_id": order_id,
            "status": "COMPLETED",
            "amount": amount,
            "currency": currency.upper(),
        }

    async def process_refund(
        self,
        charge_id: str,
        amount: Decimal,
        reason: str | None = None,
    ) -> dict[str, Any]:
        refund_id = f"PAYPAL-REF-{uuid.uuid4().hex[:12].upper()}"
        return {
            "gateway": "paypal",
            "refund_id": refund_id,
            "charge_id": charge_id,
            "amount": amount,
            "status": "COMPLETED",
        }

    def verify_webhook_signature(
        self,
        payload_bytes: bytes,
        signature_header: str,
        webhook_secret: str,
    ) -> bool:
        return bool(signature_header and webhook_secret)


class WireTransferPaymentGateway(BasePaymentGateway):
    async def create_charge(
        self,
        amount: Decimal,
        currency: str,
        customer_id: str,
        description: str,
        idempotency_key: str,
        payment_method: str = "wire_transfer",
    ) -> dict[str, Any]:
        wire_ref = f"WIRE-ACH-{uuid.uuid4().hex[:10].upper()}"
        return {
            "gateway": "wire_transfer",
            "charge_id": wire_ref,
            "status": "PENDING_SETTLEMENT",
            "amount": amount,
            "currency": currency.upper(),
            "instructions": "Transfer funds to JP Morgan Chase, Swift: CHASEUS33",
        }

    async def process_refund(
        self,
        charge_id: str,
        amount: Decimal,
        reason: str | None = None,
    ) -> dict[str, Any]:
        return {
            "gateway": "wire_transfer",
            "refund_id": f"WIRE-REF-{uuid.uuid4().hex[:10].upper()}",
            "charge_id": charge_id,
            "amount": amount,
            "status": "PENDING_APPROVAL",
        }

    def verify_webhook_signature(
        self,
        payload_bytes: bytes,
        signature_header: str,
        webhook_secret: str,
    ) -> bool:
        return True
