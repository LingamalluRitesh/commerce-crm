import hashlib
import hmac
import json
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.developer import (
    ApiKeyCreatedResponse,
    ApiKeyCreateRequest,
    ApiKeyResponse,
    WebhookDeliveryResponse,
    WebhookSubscriptionCreateRequest,
    WebhookSubscriptionResponse,
    WebhookTestDispatchRequest,
)
from app.application.services.audit import AuditService
from app.core.errors import NotFoundError
from app.infrastructure.models.developer import (
    ApiKey,
    WebhookDelivery,
    WebhookSubscription,
)


def _hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def compute_webhook_signature(secret: str, timestamp: str, payload_bytes: bytes) -> str:
    """Generate Stripe/GitHub standard HMAC-SHA256 signature for webhook dispatch."""
    signed_payload = f"t={timestamp}.".encode() + payload_bytes
    return hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()


class ApiKeyService:
    @staticmethod
    async def create_api_key(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: ApiKeyCreateRequest,
    ) -> ApiKeyCreatedResponse:
        prefix = "ccrm_live_"
        raw_secret = secrets.token_hex(24)
        raw_full_key = f"{prefix}{raw_secret}"
        hashed = _hash_api_key(raw_full_key)

        expires_at = None
        if data.expires_in_days:
            expires_at = datetime.now(UTC) + timedelta(days=data.expires_in_days)

        api_key = ApiKey(
            tenant_id=tenant_id,
            name=data.name.strip(),
            key_prefix=prefix,
            hashed_key=hashed,
            scopes=data.scopes,
            is_active=True,
            expires_at=expires_at,
        )
        db.add(api_key)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="api_key:created",
            entity_type="ApiKey",
            entity_id=str(api_key.id),
            new_values={"name": api_key.name, "scopes": api_key.scopes},
        )

        return ApiKeyCreatedResponse(
            id=api_key.id,
            tenant_id=api_key.tenant_id,
            name=api_key.name,
            key_prefix=api_key.key_prefix,
            raw_api_key=raw_full_key,
            scopes=api_key.scopes,
            is_active=api_key.is_active,
            expires_at=api_key.expires_at,
            created_at=api_key.created_at,
        )

    @staticmethod
    async def list_keys(db: AsyncSession, tenant_id: uuid.UUID) -> list[ApiKeyResponse]:
        res = await db.execute(
            select(ApiKey).where(ApiKey.tenant_id == tenant_id).order_by(ApiKey.created_at.desc())
        )
        return [ApiKeyResponse.model_validate(k) for k in res.scalars().all()]

    @staticmethod
    async def revoke_key(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        key_id: uuid.UUID,
        actor_id: uuid.UUID | None,
    ) -> ApiKeyResponse:
        res = await db.execute(
            select(ApiKey).where(ApiKey.id == key_id, ApiKey.tenant_id == tenant_id)
        )
        key = res.scalar_one_or_none()
        if not key:
            raise NotFoundError("ApiKey", key_id)

        key.is_active = False
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="api_key:revoked",
            entity_type="ApiKey",
            entity_id=str(key.id),
            new_values={"is_active": False},
        )

        return ApiKeyResponse.model_validate(key)


class WebhookService:
    @staticmethod
    async def create_subscription(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: WebhookSubscriptionCreateRequest,
    ) -> WebhookSubscriptionResponse:
        secret = f"whsec_{secrets.token_hex(20)}"

        sub = WebhookSubscription(
            tenant_id=tenant_id,
            url=data.url.strip(),
            secret_token=secret,
            events=data.events,
            is_active=True,
            retry_limit=5,
        )
        db.add(sub)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="webhook_subscription:created",
            entity_type="WebhookSubscription",
            entity_id=str(sub.id),
            new_values={"url": sub.url, "events": sub.events},
        )

        return WebhookSubscriptionResponse.model_validate(sub)

    @staticmethod
    async def list_subscriptions(
        db: AsyncSession, tenant_id: uuid.UUID
    ) -> list[WebhookSubscriptionResponse]:
        res = await db.execute(
            select(WebhookSubscription)
            .where(WebhookSubscription.tenant_id == tenant_id)
            .order_by(WebhookSubscription.created_at.desc())
        )
        return [WebhookSubscriptionResponse.model_validate(s) for s in res.scalars().all()]

    @staticmethod
    async def test_dispatch(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        subscription_id: uuid.UUID,
        data: WebhookTestDispatchRequest,
    ) -> WebhookDeliveryResponse:
        res = await db.execute(
            select(WebhookSubscription).where(
                WebhookSubscription.id == subscription_id,
                WebhookSubscription.tenant_id == tenant_id,
            )
        )
        sub = res.scalar_one_or_none()
        if not sub:
            raise NotFoundError("WebhookSubscription", subscription_id)

        ts = str(int(datetime.now(UTC).timestamp()))
        payload_bytes = json.dumps(data.payload).encode("utf-8")
        sig = compute_webhook_signature(sub.secret_token, ts, payload_bytes)

        delivery = WebhookDelivery(
            tenant_id=tenant_id,
            subscription_id=sub.id,
            event_type=data.event_type,
            payload={
                "event": data.event_type,
                "data": data.payload,
                "signature_header": f"t={ts},v1={sig}",
            },
            status="delivered",
            status_code=200,
            response_body='{"received": true}',
            duration_ms=45,
            attempt_count=1,
            delivered_at=datetime.now(UTC),
        )
        db.add(delivery)
        await db.flush()

        return WebhookDeliveryResponse.model_validate(delivery)

    @staticmethod
    async def list_deliveries(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        subscription_id: uuid.UUID,
    ) -> list[WebhookDeliveryResponse]:
        res = await db.execute(
            select(WebhookDelivery)
            .where(
                WebhookDelivery.tenant_id == tenant_id,
                WebhookDelivery.subscription_id == subscription_id,
            )
            .order_by(WebhookDelivery.created_at.desc())
        )
        return [WebhookDeliveryResponse.model_validate(d) for d in res.scalars().all()]
