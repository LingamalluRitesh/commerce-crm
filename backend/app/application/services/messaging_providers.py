import abc
import uuid
from typing import Any

from app.core.logging import logger


class BaseMessageProvider(abc.ABC):
    @abc.abstractmethod
    async def send(
        self,
        recipient: str,
        subject: str | None,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Send a message through the provider gateway."""
        pass


class SmtpEmailProvider(BaseMessageProvider):
    def __init__(
        self,
        host: str = "smtp.mailgun.org",
        port: int = 587,
        sender_email: str = "noreply@commercecrm.io",
    ):
        self.host = host
        self.port = port
        self.sender_email = sender_email

    async def send(
        self,
        recipient: str,
        subject: str | None,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        message_id = f"msg_email_{uuid.uuid4().hex[:12]}"
        logger.info(
            "smtp_email_dispatched",
            provider="smtp",
            recipient=recipient,
            subject=subject,
            message_id=message_id,
        )
        return {
            "provider": "smtp",
            "channel": "email",
            "message_id": message_id,
            "status": "delivered",
            "recipient": recipient,
        }


class TwilioSmsProvider(BaseMessageProvider):
    def __init__(
        self,
        account_sid: str = "AC_mock_twilio_sid",
        sender_phone: str = "+18005550199",
    ):
        self.account_sid = account_sid
        self.sender_phone = sender_phone

    async def send(
        self,
        recipient: str,
        subject: str | None,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        message_id = f"msg_sms_{uuid.uuid4().hex[:12]}"
        logger.info(
            "twilio_sms_dispatched",
            provider="twilio",
            recipient=recipient,
            message_id=message_id,
            length=len(content),
        )
        return {
            "provider": "twilio",
            "channel": "sms",
            "message_id": message_id,
            "status": "delivered",
            "recipient": recipient,
        }


class WebPushProvider(BaseMessageProvider):
    def __init__(self, vapid_public_key: str = "VAPID_MOCK_PUB_KEY"):
        self.vapid_public_key = vapid_public_key

    async def send(
        self,
        recipient: str,
        subject: str | None,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        message_id = f"msg_push_{uuid.uuid4().hex[:12]}"
        logger.info(
            "web_push_dispatched",
            provider="webpush",
            recipient=recipient,
            message_id=message_id,
        )
        return {
            "provider": "webpush",
            "channel": "push",
            "message_id": message_id,
            "status": "delivered",
            "recipient": recipient,
        }


class MultiChannelDispatcher:
    def __init__(self):
        self.providers: dict[str, BaseMessageProvider] = {
            "email": SmtpEmailProvider(),
            "sms": TwilioSmsProvider(),
            "push": WebPushProvider(),
        }

    async def dispatch(
        self,
        channel: str,
        recipient: str,
        content: str,
        subject: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        provider = self.providers.get(channel.lower())
        if not provider:
            raise ValueError(f"Unsupported communication channel: {channel}")

        return await provider.send(
            recipient=recipient,
            subject=subject,
            content=content,
            metadata=metadata,
        )
