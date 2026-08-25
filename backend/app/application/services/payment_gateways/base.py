import abc
from decimal import Decimal
from typing import Any


class BasePaymentGateway(abc.ABC):
    @abc.abstractmethod
    async def create_charge(
        self,
        amount: Decimal,
        currency: str,
        customer_id: str,
        description: str,
        idempotency_key: str,
        payment_method: str = "card",
    ) -> dict[str, Any]:
        """Authorize and capture a payment charge."""
        pass

    @abc.abstractmethod
    async def process_refund(
        self,
        charge_id: str,
        amount: Decimal,
        reason: str | None = None,
    ) -> dict[str, Any]:
        """Issue a full or partial refund on a previously settled charge."""
        pass

    @abc.abstractmethod
    def verify_webhook_signature(
        self,
        payload_bytes: bytes,
        signature_header: str,
        webhook_secret: str,
    ) -> bool:
        """Verify the cryptographic authenticity of an inbound gateway webhook."""
        pass
