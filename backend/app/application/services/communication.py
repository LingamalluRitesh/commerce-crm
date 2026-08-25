import uuid
from datetime import UTC, datetime

from fastapi import WebSocket
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dtos.communication import (
    ChannelCreateRequest,
    ChannelMemberResponse,
    ChannelResponse,
    ChatMessageCreateRequest,
    ChatMessageResponse,
    NotificationCreateRequest,
    NotificationResponse,
)
from app.application.services.audit import AuditService
from app.core.errors import NotFoundError
from app.core.events import DomainEvent, event_bus
from app.infrastructure.models.communication import (
    Channel,
    ChannelMember,
    ChatMessage,
    Notification,
)


class ConnectionManager:
    def __init__(self):
        # channel_id -> list of WebSockets
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, channel_id: str, websocket: WebSocket):
        await websocket.accept()
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []
        self.active_connections[channel_id].append(websocket)

    def disconnect(self, channel_id: str, websocket: WebSocket):
        if channel_id in self.active_connections:
            if websocket in self.active_connections[channel_id]:
                self.active_connections[channel_id].remove(websocket)

    async def broadcast(self, channel_id: str, message: dict):
        if channel_id in self.active_connections:
            for connection in self.active_connections[channel_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass


ws_manager = ConnectionManager()


class NotificationService:
    @staticmethod
    async def send_notification(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        data: NotificationCreateRequest,
    ) -> NotificationResponse:
        notif = Notification(
            tenant_id=tenant_id,
            user_id=data.user_id,
            type=data.type,
            title=data.title.strip(),
            body=data.body.strip(),
            action_url=data.action_url,
            notification_metadata=data.notification_metadata or {},
        )
        db.add(notif)
        await db.flush()

        await event_bus.publish(
            DomainEvent(
                event_type="notification.sent.v1",
                tenant_id=tenant_id,
                aggregate_type="Notification",
                aggregate_id=notif.id,
                payload={"user_id": str(notif.user_id), "title": notif.title},
            )
        )

        return NotificationResponse.model_validate(notif)

    @staticmethod
    async def list_notifications(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        user_id: uuid.UUID,
        unread_only: bool = False,
    ) -> list[NotificationResponse]:
        query = select(Notification).where(
            Notification.tenant_id == tenant_id, Notification.user_id == user_id
        )
        if unread_only:
            query = query.where(Notification.is_read.is_(False))

        res = await db.execute(query.order_by(Notification.created_at.desc()))
        return [NotificationResponse.model_validate(n) for n in res.scalars().all()]

    @staticmethod
    async def mark_read(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        notification_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> NotificationResponse:
        res = await db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.tenant_id == tenant_id,
                Notification.user_id == user_id,
            )
        )
        notif = res.scalar_one_or_none()
        if not notif:
            raise NotFoundError("Notification", notification_id)

        notif.is_read = True
        notif.read_at = datetime.now(UTC)
        await db.flush()
        return NotificationResponse.model_validate(notif)


class ChatService:
    @staticmethod
    async def create_channel(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID,
        data: ChannelCreateRequest,
    ) -> ChannelResponse:
        channel = Channel(
            tenant_id=tenant_id,
            name=data.name.strip(),
            type=data.type,
            is_private=data.is_private,
        )
        db.add(channel)
        await db.flush()

        # Add creator as admin
        creator_member = ChannelMember(
            tenant_id=tenant_id,
            channel_id=channel.id,
            user_id=actor_id,
            role="admin",
        )
        db.add(creator_member)

        # Add initial members
        for u_id in data.initial_member_ids:
            if u_id != actor_id:
                db.add(
                    ChannelMember(
                        tenant_id=tenant_id,
                        channel_id=channel.id,
                        user_id=u_id,
                        role="member",
                    )
                )

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="channel:created",
            entity_type="Channel",
            entity_id=str(channel.id),
            new_values={"name": channel.name},
        )

        return await ChatService.get_channel(db, tenant_id, channel.id)

    @staticmethod
    async def get_channel(
        db: AsyncSession, tenant_id: uuid.UUID, channel_id: uuid.UUID
    ) -> ChannelResponse:
        db.expire_all()
        res = await db.execute(
            select(Channel)
            .where(Channel.id == channel_id, Channel.tenant_id == tenant_id)
            .options(selectinload(Channel.members))
        )
        channel = res.scalar_one_or_none()
        if not channel:
            raise NotFoundError("Channel", channel_id)

        return ChannelResponse(
            id=channel.id,
            tenant_id=channel.tenant_id,
            name=channel.name,
            type=channel.type,
            is_private=channel.is_private,
            members=[ChannelMemberResponse.model_validate(m) for m in channel.members],
            created_at=channel.created_at,
        )

    @staticmethod
    async def list_channels(db: AsyncSession, tenant_id: uuid.UUID) -> list[ChannelResponse]:
        query = (
            select(Channel)
            .where(Channel.tenant_id == tenant_id)
            .options(selectinload(Channel.members))
            .order_by(Channel.created_at.desc())
        )
        res = await db.execute(query)
        channels = res.scalars().all()
        return [
            ChannelResponse(
                id=c.id,
                tenant_id=c.tenant_id,
                name=c.name,
                type=c.type,
                is_private=c.is_private,
                members=[ChannelMemberResponse.model_validate(m) for m in c.members],
                created_at=c.created_at,
            )
            for c in channels
        ]

    @staticmethod
    async def post_message(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        channel_id: uuid.UUID,
        sender_id: uuid.UUID,
        data: ChatMessageCreateRequest,
    ) -> ChatMessageResponse:
        # Validate Channel
        await ChatService.get_channel(db, tenant_id, channel_id)

        msg = ChatMessage(
            tenant_id=tenant_id,
            channel_id=channel_id,
            sender_id=sender_id,
            content=data.content.strip(),
            attachments=data.attachments or [],
        )
        db.add(msg)
        await db.flush()

        resp = ChatMessageResponse.model_validate(msg)

        # Broadcast via WebSockets
        await ws_manager.broadcast(
            channel_id=str(channel_id),
            message={
                "type": "chat_message",
                "id": str(resp.id),
                "channel_id": str(resp.channel_id),
                "sender_id": str(resp.sender_id),
                "content": resp.content,
                "created_at": resp.created_at.isoformat(),
            },
        )

        return resp

    @staticmethod
    async def list_messages(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        channel_id: uuid.UUID,
    ) -> list[ChatMessageResponse]:
        query = (
            select(ChatMessage)
            .where(ChatMessage.tenant_id == tenant_id, ChatMessage.channel_id == channel_id)
            .order_by(ChatMessage.created_at.asc())
        )
        res = await db.execute(query)
        return [ChatMessageResponse.model_validate(m) for m in res.scalars().all()]
