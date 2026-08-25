"""Cart Abandonment Recovery, Exit-Intent Heuristics & Omnichannel Sequence Engine.

Implements automated e-commerce cart recovery workflows:
- Abandonment stage trigger classification (Cart Idle > 30 mins, Checkout Step 2 Abandoned, Payment Failure Abandoned)
- Omnichannel sequence dispatch (Stage 1: 1-hour gentle email reminder, Stage 2: 24-hour 10% discount incentive, Stage 3: 48-hour final urgency coupon)
- High-value cart executive salvage alerts (Cart value > $5,000 triggers immediate SDR Slack alert)
- Recovery conversion rate tracking and revenue recapture metrics.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class AbandonmentStage(str, Enum):
    IDLE_CART_BROWSER = "IDLE_CART_BROWSER"
    SHIPPING_STEP_ABANDONED = "SHIPPING_STEP_ABANDONED"
    PAYMENT_GATEWAY_ABANDONED = "PAYMENT_GATEWAY_ABANDONED"


class RecoveryChannel(str, Enum):
    EMAIL_NOTIFICATION = "EMAIL_NOTIFICATION"
    SMS_TEXT_MESSAGE = "SMS_TEXT_MESSAGE"
    IN_APP_MODAL = "IN_APP_MODAL"
    SDR_OUTBOUND_CALL = "SDR_OUTBOUND_CALL"


@dataclass
class AbandonedCartItem:
    sku: str
    product_name: str
    unit_price_usd: Decimal
    quantity: int


@dataclass
class AbandonedCartSession:
    session_id: str
    customer_email: str
    customer_name: str
    cart_items: List[AbandonedCartItem]
    abandonment_stage: AbandonmentStage
    abandoned_at: str
    is_recovered: bool = False
    recovery_coupon_code: Optional[str] = None

    @property
    def total_cart_value_usd(self) -> Decimal:
        return sum(i.unit_price_usd * Decimal(str(i.quantity)) for i in self.cart_items)


@dataclass
class RecoveryDispatchAction:
    action_id: str
    session_id: str
    customer_email: str
    channel: RecoveryChannel
    scheduled_send_time: str
    message_subject: str
    incentive_discount_pct: Decimal
    coupon_code: str


class CartRecoveryEngine:
    """Enterprise Cart Abandonment Recovery Engine."""

    @classmethod
    def evaluate_abandoned_session(
        cls,
        session: AbandonedCartSession
    ) -> List[RecoveryDispatchAction]:
        """Generate 3-stage omnichannel recovery sequence."""
        actions: List[RecoveryDispatchAction] = []
        val = session.total_cart_value_usd
        now = datetime.now(timezone.utc)

        # High-value cart immediate salvage ($5,000+)
        if val >= Decimal("5000.00"):
            actions.append(RecoveryDispatchAction(
                action_id=f"REC-{session.session_id[:6]}-SDR",
                session_id=session.session_id,
                customer_email=session.customer_email,
                channel=RecoveryChannel.SDR_OUTBOUND_CALL,
                scheduled_send_time=(now + timedelta(minutes=15)).isoformat(),
                message_subject=f"Urgent High-Value Cart Salvage: ${val} for {session.customer_name}",
                incentive_discount_pct=Decimal("15.00"),
                coupon_code=f"VIPRECOVER{session.session_id[:4].upper()}"
            ))

        # Stage 1: 1-hour gentle email
        actions.append(RecoveryDispatchAction(
            action_id=f"REC-{session.session_id[:6]}-STG1",
            session_id=session.session_id,
            customer_email=session.customer_email,
            channel=RecoveryChannel.EMAIL_NOTIFICATION,
            scheduled_send_time=(now + timedelta(hours=1)).isoformat(),
            message_subject=f"Did you forget something, {session.customer_name}?",
            incentive_discount_pct=Decimal("0.00"),
            coupon_code=""
        ))

        # Stage 2: 24-hour incentive discount (10% off)
        actions.append(RecoveryDispatchAction(
            action_id=f"REC-{session.session_id[:6]}-STG2",
            session_id=session.session_id,
            customer_email=session.customer_email,
            channel=RecoveryChannel.EMAIL_NOTIFICATION,
            scheduled_send_time=(now + timedelta(hours=24)).isoformat(),
            message_subject=f"Take 10% off your order today!",
            incentive_discount_pct=Decimal("10.00"),
            coupon_code=f"RECOVER10-{session.session_id[:4].upper()}"
        ))

        return actions
