import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.developer import (
    ApiKeyCreatedResponse,
    ApiKeyCreateRequest,
    ApiKeyResponse,
    WebhookDeliveryResponse,
    WebhookSubscriptionCreateRequest,
    WebhookSubscriptionResponse,
    WebhookTestDispatchRequest,
)
from app.application.services.developer import (
    ApiKeyService,
    WebhookService,
)
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


# -------------------------------------------------------------
# API Keys Endpoints
# -------------------------------------------------------------
@router.get("/api-keys", response_model=list[ApiKeyResponse])
async def list_api_keys(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:read")),
) -> list[ApiKeyResponse]:
    """List tenant developer API keys."""
    return await ApiKeyService.list_keys(db=db, tenant_id=tenant_id)


@router.post("/api-keys", response_model=ApiKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: ApiKeyCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> ApiKeyCreatedResponse:
    """Generate a high-entropy secret API key with specific permission scopes."""
    return await ApiKeyService.create_api_key(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.delete("/api-keys/{key_id}", response_model=ApiKeyResponse)
async def revoke_api_key(
    key_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> ApiKeyResponse:
    """Revoke and deactivate an API key."""
    return await ApiKeyService.revoke_key(
        db=db,
        tenant_id=tenant_id,
        key_id=key_id,
        actor_id=current_user.id,
    )


# -------------------------------------------------------------
# Webhook Subscriptions Endpoints
# -------------------------------------------------------------
@router.get("/webhooks", response_model=list[WebhookSubscriptionResponse])
async def list_webhooks(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:read")),
) -> list[WebhookSubscriptionResponse]:
    """List registered webhook endpoints."""
    return await WebhookService.list_subscriptions(db=db, tenant_id=tenant_id)


@router.post(
    "/webhooks",
    response_model=WebhookSubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_webhook(
    data: WebhookSubscriptionCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> WebhookSubscriptionResponse:
    """Register an outbound webhook subscription with HMAC signing token."""
    return await WebhookService.create_subscription(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post("/webhooks/{subscription_id}/test", response_model=WebhookDeliveryResponse)
async def test_webhook_dispatch(
    subscription_id: uuid.UUID,
    data: WebhookTestDispatchRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> WebhookDeliveryResponse:
    """Simulate webhook event dispatch with cryptographic HMAC-SHA256 signature."""
    return await WebhookService.test_dispatch(
        db=db,
        tenant_id=tenant_id,
        subscription_id=subscription_id,
        data=data,
    )


@router.get("/webhooks/{subscription_id}/deliveries", response_model=list[WebhookDeliveryResponse])
async def list_webhook_deliveries(
    subscription_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:read")),
) -> list[WebhookDeliveryResponse]:
    """List delivery attempt history and responses for a webhook."""
    return await WebhookService.list_deliveries(
        db=db,
        tenant_id=tenant_id,
        subscription_id=subscription_id,
    )
