import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    require_permission,
)
from app.application.dtos.outbox import (
    OutboxBatchProcessResponse,
    OutboxMessageCreateRequest,
    OutboxMessageResponse,
    OutboxReplayRequest,
)
from app.application.services.outbox import OutboxService
from app.core.database import get_db

router = APIRouter()


@router.get("/outbox", response_model=list[OutboxMessageResponse])
async def list_outbox_messages(
    status_filter: str | None = Query(None, alias="status"),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:read")),
) -> list[OutboxMessageResponse]:
    """List transactional outbox events."""
    return await OutboxService.list_messages(db=db, tenant_id=tenant_id, status=status_filter)


@router.post("/outbox", response_model=OutboxMessageResponse, status_code=status.HTTP_201_CREATED)
async def stage_outbox_event(
    data: OutboxMessageCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> OutboxMessageResponse:
    """Stage a domain event into the transactional outbox table."""
    msg = await OutboxService.record_event(
        db=db,
        tenant_id=tenant_id,
        event_type=data.event_type,
        aggregate_type=data.aggregate_type,
        aggregate_id=data.aggregate_id,
        payload=data.payload,
    )
    return OutboxMessageResponse.model_validate(msg)


@router.post("/outbox/process", response_model=OutboxBatchProcessResponse)
async def process_outbox_batch(
    batch_size: int = Query(50, ge=1, le=200),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> OutboxBatchProcessResponse:
    """Process pending transactional outbox events and dispatch to event bus."""
    return await OutboxService.process_batch(db=db, tenant_id=tenant_id, batch_size=batch_size)


@router.post("/outbox/replay", response_model=OutboxBatchProcessResponse)
async def replay_failed_outbox_events(
    data: OutboxReplayRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> OutboxBatchProcessResponse:
    """Reset and replay failed transactional outbox events."""
    return await OutboxService.replay_failed(db=db, tenant_id=tenant_id, data=data)
