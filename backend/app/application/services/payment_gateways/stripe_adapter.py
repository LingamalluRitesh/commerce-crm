import hashlib
import hmac
import uuid
from decimal import Decimal
from typing import Any

from app.application.services.payment_gateways.base import BasePaymentGateway
from app.core.logging import logger


class StripePaymentGateway(BasePaymentGateway):
    def __init__(self, api_key: str = "sk_test_mock_stripe_key"):
        self.api_key = api_key

    async def create_charge(
        self,
        amount: Decimal,
        currency: str,
        customer_id: str,
        description: str,
        idempotency_key: str,
        payment_method: str = "card",
    ) -> dict[str, Any]:
        charge_id = f"ch_stripe_{uuid.uuid4().hex[:16]}"
        logger.info(
            "stripe_charge_created",
            gateway="stripe",
            charge_id=charge_id,
            amount=str(amount),
            currency=currency,
            idempotency_key=idempotency_key,
        )
        return {
            "gateway": "stripe",
            "charge_id": charge_id,
            "status": "succeeded",
            "amount": amount,
            "currency": currency.upper(),
            "receipt_url": f"https://pay.stripe.com/receipts/{charge_id}",
        }

    async def process_refund(
        self,
        charge_id: str,
        amount: Decimal,
        reason: str | None = None,
    ) -> dict[str, Any]:
        refund_id = f"re_stripe_{uuid.uuid4().hex[:16]}"
        logger.info(
            "stripe_refund_processed",
            gateway="stripe",
            refund_id=refund_id,
            charge_id=charge_id,
            amount=str(amount),
        )
        return {
            "gateway": "stripe",
            "refund_id": refund_id,
            "charge_id": charge_id,
            "amount": amount,
            "status": "succeeded",
        }

    def verify_webhook_signature(
        self,
        payload_bytes: bytes,
        signature_header: str,
        webhook_secret: str,
    ) -> bool:
        try:
            # Parse Stripe signature format: t=timestamp,v1=signature
            elements = dict(item.split("=") for item in signature_header.split(","))
            timestamp = elements.get("t", "")
            expected_sig = elements.get("v1", "")

            signed_payload = f"{timestamp}.".encode() + payload_bytes
            computed_sig = hmac.new(
                webhook_secret.encode("utf-8"), signed_payload, hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(computed_sig, expected_sig)
        except Exception:
            return False
