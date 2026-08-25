import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.outbox import (
    OutboxBatchProcessResponse,
    OutboxMessageResponse,
    OutboxReplayRequest,
)
from app.core.events import DomainEvent, event_bus
from app.infrastructure.models.outbox import OutboxMessage


class OutboxService:
    @staticmethod
    async def record_event(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        event_type: str,
        aggregate_type: str,
        aggregate_id: uuid.UUID,
        payload: dict,
    ) -> OutboxMessage:
        msg = OutboxMessage(
            tenant_id=tenant_id,
            event_type=event_type,
            aggregate_type=aggregate_type,
            aggregate_id=aggregate_id,
            payload=payload,
            status="pending",
            retry_count=0,
        )
        db.add(msg)
        await db.flush()
        return msg

    @staticmethod
    async def process_batch(
        db: AsyncSession, tenant_id: uuid.UUID, batch_size: int = 50
    ) -> OutboxBatchProcessResponse:
        query = (
            select(OutboxMessage)
            .where(
                OutboxMessage.tenant_id == tenant_id,
                OutboxMessage.status.in_(["pending", "failed"]),
                OutboxMessage.retry_count < 3,
            )
            .order_by(OutboxMessage.created_at.asc())
            .limit(batch_size)
        )
        res = await db.execute(query)
        messages = res.scalars().all()

        published_count = 0
        failed_count = 0
        responses = []

        for msg in messages:
            try:
                # Dispatch to Domain Event Bus
                await event_bus.publish(
                    DomainEvent(
                        event_type=msg.event_type,
                        tenant_id=msg.tenant_id,
                        aggregate_type=msg.aggregate_type,
                        aggregate_id=msg.aggregate_id,
                        payload=msg.payload,
                    )
                )

                msg.status = "published"
                msg.published_at = datetime.now(UTC)
                msg.last_error = None
                published_count += 1

            except Exception as e:
                msg.retry_count += 1
                msg.last_error = str(e)
                if msg.retry_count >= 3:
                    msg.status = "failed"
                failed_count += 1

            responses.append(OutboxMessageResponse.model_validate(msg))

        await db.flush()

        return OutboxBatchProcessResponse(
            processed_count=len(messages),
            published_count=published_count,
            failed_count=failed_count,
            messages=responses,
        )

    @staticmethod
    async def replay_failed(
        db: AsyncSession, tenant_id: uuid.UUID, data: OutboxReplayRequest
    ) -> OutboxBatchProcessResponse:
        query = select(OutboxMessage).where(
            OutboxMessage.tenant_id == tenant_id, OutboxMessage.status == "failed"
        )
        if data.event_type:
            query = query.where(OutboxMessage.event_type == data.event_type)

        res = await db.execute(query)
        failed_msgs = res.scalars().all()

        for msg in failed_msgs:
            msg.status = "pending"
            msg.retry_count = 0
            msg.last_error = None

        await db.flush()

        # Run process batch on the reset messages
        return await OutboxService.process_batch(db, tenant_id, batch_size=len(failed_msgs) or 50)

    @staticmethod
    async def list_messages(
        db: AsyncSession, tenant_id: uuid.UUID, status: str | None = None
    ) -> list[OutboxMessageResponse]:
        query = select(OutboxMessage).where(OutboxMessage.tenant_id == tenant_id)
        if status:
            query = query.where(OutboxMessage.status == status)

        res = await db.execute(query.order_by(OutboxMessage.created_at.desc()))
        return [OutboxMessageResponse.model_validate(m) for m in res.scalars().all()]
