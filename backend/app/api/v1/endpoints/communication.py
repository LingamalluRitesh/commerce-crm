import uuid

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.communication import (
    ChannelCreateRequest,
    ChannelResponse,
    ChatMessageCreateRequest,
    ChatMessageResponse,
    NotificationCreateRequest,
    NotificationResponse,
)
from app.application.services.communication import (
    ChatService,
    NotificationService,
    ws_manager,
)
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


# -------------------------------------------------------------
# Notifications Endpoints
# -------------------------------------------------------------
@router.get("/notifications", response_model=list[NotificationResponse])
async def list_notifications(
    unread_only: bool = Query(False),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[NotificationResponse]:
    """List current user's notifications."""
    return await NotificationService.list_notifications(
        db=db,
        tenant_id=tenant_id,
        user_id=current_user.id,
        unread_only=unread_only,
    )


@router.post(
    "/notifications",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_notification(
    data: NotificationCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> NotificationResponse:
    """Send targeted notification to user."""
    return await NotificationService.send_notification(db=db, tenant_id=tenant_id, data=data)


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> NotificationResponse:
    """Mark notification as read."""
    return await NotificationService.mark_read(
        db=db,
        tenant_id=tenant_id,
        notification_id=notification_id,
        user_id=current_user.id,
    )


# -------------------------------------------------------------
# Channels & Chat Endpoints
# -------------------------------------------------------------
@router.get("/channels", response_model=list[ChannelResponse])
async def list_channels(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:read")),
) -> list[ChannelResponse]:
    """List organization chat channels."""
    return await ChatService.list_channels(db=db, tenant_id=tenant_id)


@router.post("/channels", response_model=ChannelResponse, status_code=status.HTTP_201_CREATED)
async def create_channel(
    data: ChannelCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> ChannelResponse:
    """Create a collaborative chat channel."""
    return await ChatService.create_channel(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.get("/channels/{channel_id}/messages", response_model=list[ChatMessageResponse])
async def list_messages(
    channel_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:read")),
) -> list[ChatMessageResponse]:
    """List message history in channel."""
    return await ChatService.list_messages(db=db, tenant_id=tenant_id, channel_id=channel_id)


@router.post(
    "/channels/{channel_id}/messages",
    response_model=ChatMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def post_message(
    channel_id: uuid.UUID,
    data: ChatMessageCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:write")),
) -> ChatMessageResponse:
    """Send message to channel with real-time WebSocket broadcast."""
    return await ChatService.post_message(
        db=db,
        tenant_id=tenant_id,
        channel_id=channel_id,
        sender_id=current_user.id,
        data=data,
    )


# -------------------------------------------------------------
# Real-Time WebSocket Channel Connection
# -------------------------------------------------------------
@router.websocket("/ws/{channel_id}")
async def websocket_channel_endpoint(websocket: WebSocket, channel_id: str):
    await ws_manager.connect(channel_id, websocket)
    try:
        while True:
            # Receive and echo / heartbeat
            data = await websocket.receive_text()
            await websocket.send_json({"event": "pong", "data": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(channel_id, websocket)
