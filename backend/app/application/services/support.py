import secrets
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dtos.support import (
    CustomerSuccessPlanCreateRequest,
    CustomerSuccessPlanResponse,
    KnowledgeArticleCreateRequest,
    KnowledgeArticleResponse,
    SuccessMilestoneResponse,
    TicketCommentCreateRequest,
    TicketCommentResponse,
    TicketCreateRequest,
    TicketResolveRequest,
    TicketResponse,
)
from app.application.services.audit import AuditService
from app.application.services.auth import slugify
from app.core.errors import NotFoundError
from app.core.events import DomainEvent, event_bus
from app.infrastructure.models.customer import Customer
from app.infrastructure.models.support import (
    CustomerSuccessPlan,
    KnowledgeArticle,
    SuccessMilestone,
    Ticket,
    TicketComment,
)

SLA_HOURS_MAP = {
    "urgent": 4,
    "high": 12,
    "medium": 24,
    "low": 48,
}


class TicketService:
    @staticmethod
    async def create_ticket(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: TicketCreateRequest,
    ) -> TicketResponse:
        # Validate Customer
        cust_res = await db.execute(
            select(Customer).where(Customer.id == data.customer_id, Customer.tenant_id == tenant_id)
        )
        if not cust_res.scalar_one_or_none():
            raise NotFoundError("Customer", data.customer_id)

        sla_hours = SLA_HOURS_MAP.get(data.priority, 24)
        sla_deadline = datetime.now(UTC) + timedelta(hours=sla_hours)
        ticket_number = f"TCK-{datetime.now(UTC).strftime('%Y%m%d')}-{secrets.token_hex(2).upper()}"

        ticket = Ticket(
            tenant_id=tenant_id,
            customer_id=data.customer_id,
            ticket_number=ticket_number,
            subject=data.subject.strip(),
            description=data.description.strip(),
            status="open",
            priority=data.priority,
            channel=data.channel,
            assigned_to_user_id=data.assigned_to_user_id,
            sla_deadline=sla_deadline,
        )
        db.add(ticket)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="ticket:created",
            entity_type="Ticket",
            entity_id=str(ticket.id),
            new_values={"ticket_number": ticket.ticket_number, "priority": ticket.priority},
        )

        await event_bus.publish(
            DomainEvent(
                event_type="ticket.created.v1",
                tenant_id=tenant_id,
                aggregate_type="Ticket",
                aggregate_id=ticket.id,
                payload={"customer_id": str(ticket.customer_id), "priority": ticket.priority},
            )
        )

        return await TicketService.get_ticket(db, tenant_id, ticket.id)

    @staticmethod
    async def get_ticket(
        db: AsyncSession, tenant_id: uuid.UUID, ticket_id: uuid.UUID
    ) -> TicketResponse:
        db.expire_all()
        res = await db.execute(
            select(Ticket)
            .where(Ticket.id == ticket_id, Ticket.tenant_id == tenant_id)
            .options(selectinload(Ticket.comments))
        )
        ticket = res.scalar_one_or_none()
        if not ticket:
            raise NotFoundError("Ticket", ticket_id)

        return TicketResponse(
            id=ticket.id,
            tenant_id=ticket.tenant_id,
            customer_id=ticket.customer_id,
            ticket_number=ticket.ticket_number,
            subject=ticket.subject,
            description=ticket.description,
            status=ticket.status,
            priority=ticket.priority,
            channel=ticket.channel,
            assigned_to_user_id=ticket.assigned_to_user_id,
            sla_deadline=ticket.sla_deadline,
            resolved_at=ticket.resolved_at,
            closed_at=ticket.closed_at,
            satisfaction_score=ticket.satisfaction_score,
            comments=[TicketCommentResponse.model_validate(c) for c in ticket.comments],
            created_at=ticket.created_at,
        )

    @staticmethod
    async def add_comment(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        ticket_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: TicketCommentCreateRequest,
    ) -> TicketResponse:
        res = await db.execute(
            select(Ticket).where(Ticket.id == ticket_id, Ticket.tenant_id == tenant_id)
        )
        ticket = res.scalar_one_or_none()
        if not ticket:
            raise NotFoundError("Ticket", ticket_id)

        comment = TicketComment(
            tenant_id=tenant_id,
            ticket_id=ticket.id,
            author_id=actor_id,
            is_internal_note=data.is_internal_note,
            content=data.content.strip(),
        )
        db.add(comment)

        if not data.is_internal_note and ticket.status == "open":
            ticket.status = "pending"

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="ticket:comment_added",
            entity_type="Ticket",
            entity_id=str(ticket.id),
            new_values={"is_internal": data.is_internal_note},
        )

        return await TicketService.get_ticket(db, tenant_id, ticket.id)

    @staticmethod
    async def resolve_ticket(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        ticket_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: TicketResolveRequest,
    ) -> TicketResponse:
        res = await db.execute(
            select(Ticket).where(Ticket.id == ticket_id, Ticket.tenant_id == tenant_id)
        )
        ticket = res.scalar_one_or_none()
        if not ticket:
            raise NotFoundError("Ticket", ticket_id)

        now = datetime.now(UTC)
        ticket.status = "resolved"
        ticket.resolved_at = now
        ticket.satisfaction_score = data.satisfaction_score

        if data.resolution_note:
            note = TicketComment(
                tenant_id=tenant_id,
                ticket_id=ticket.id,
                author_id=actor_id,
                is_internal_note=False,
                content=f"Resolution Note: {data.resolution_note}",
            )
            db.add(note)

        # Update Customer Health Score based on CSAT
        cust_res = await db.execute(
            select(Customer).where(
                Customer.id == ticket.customer_id, Customer.tenant_id == tenant_id
            )
        )
        customer = cust_res.scalar_one_or_none()
        if customer and data.satisfaction_score is not None:
            if data.satisfaction_score >= 4:
                customer.health_score = min(100, customer.health_score + 5)
            elif data.satisfaction_score <= 2:
                customer.health_score = max(0, customer.health_score - 10)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="ticket:resolved",
            entity_type="Ticket",
            entity_id=str(ticket.id),
            new_values={"csat": data.satisfaction_score},
        )

        await event_bus.publish(
            DomainEvent(
                event_type="ticket.resolved.v1",
                tenant_id=tenant_id,
                aggregate_type="Ticket",
                aggregate_id=ticket.id,
                payload={"ticket_id": str(ticket.id), "csat": data.satisfaction_score},
            )
        )

        return await TicketService.get_ticket(db, tenant_id, ticket.id)

    @staticmethod
    async def list_tickets(db: AsyncSession, tenant_id: uuid.UUID) -> list[TicketResponse]:
        query = (
            select(Ticket)
            .where(Ticket.tenant_id == tenant_id)
            .options(selectinload(Ticket.comments))
            .order_by(Ticket.created_at.desc())
        )
        res = await db.execute(query)
        tickets = res.scalars().all()
        return [
            TicketResponse(
                id=t.id,
                tenant_id=t.tenant_id,
                customer_id=t.customer_id,
                ticket_number=t.ticket_number,
                subject=t.subject,
                description=t.description,
                status=t.status,
                priority=t.priority,
                channel=t.channel,
                assigned_to_user_id=t.assigned_to_user_id,
                sla_deadline=t.sla_deadline,
                resolved_at=t.resolved_at,
                closed_at=t.closed_at,
                satisfaction_score=t.satisfaction_score,
                comments=[TicketCommentResponse.model_validate(c) for c in t.comments],
                created_at=t.created_at,
            )
            for t in tickets
        ]


class KnowledgeBaseService:
    @staticmethod
    async def create_article(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: KnowledgeArticleCreateRequest,
    ) -> KnowledgeArticleResponse:
        base_slug = slugify(data.title)
        slug = f"{base_slug}-{secrets.token_hex(2)}"

        article = KnowledgeArticle(
            tenant_id=tenant_id,
            title=data.title.strip(),
            slug=slug,
            content=data.content.strip(),
            is_published=data.is_published,
        )
        db.add(article)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="article:created",
            entity_type="KnowledgeArticle",
            entity_id=str(article.id),
            new_values={"title": article.title, "slug": article.slug},
        )

        return KnowledgeArticleResponse.model_validate(article)

    @staticmethod
    async def list_articles(
        db: AsyncSession, tenant_id: uuid.UUID
    ) -> list[KnowledgeArticleResponse]:
        res = await db.execute(
            select(KnowledgeArticle)
            .where(KnowledgeArticle.tenant_id == tenant_id, KnowledgeArticle.is_published.is_(True))
            .order_by(KnowledgeArticle.title)
        )
        return [KnowledgeArticleResponse.model_validate(a) for a in res.scalars().all()]

    @staticmethod
    async def get_article_by_slug(
        db: AsyncSession, tenant_id: uuid.UUID, slug: str
    ) -> KnowledgeArticleResponse:
        res = await db.execute(
            select(KnowledgeArticle).where(
                KnowledgeArticle.tenant_id == tenant_id, KnowledgeArticle.slug == slug
            )
        )
        article = res.scalar_one_or_none()
        if not article:
            raise NotFoundError("KnowledgeArticle", slug)

        article.view_count += 1
        await db.flush()

        return KnowledgeArticleResponse.model_validate(article)


class SuccessPlanService:
    @staticmethod
    async def create_plan(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: CustomerSuccessPlanCreateRequest,
    ) -> CustomerSuccessPlanResponse:
        plan = CustomerSuccessPlan(
            tenant_id=tenant_id,
            customer_id=data.customer_id,
            name=data.name.strip(),
            target_outcome=data.target_outcome.strip(),
            target_completion_date=data.target_completion_date,
            status="active",
        )
        db.add(plan)
        await db.flush()

        milestones = []
        for m in data.milestones:
            mile = SuccessMilestone(
                tenant_id=tenant_id,
                plan_id=plan.id,
                title=m.title.strip(),
                description=m.description,
                due_date=m.due_date,
                is_completed=False,
            )
            db.add(mile)
            milestones.append(mile)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="success_plan:created",
            entity_type="CustomerSuccessPlan",
            entity_id=str(plan.id),
            new_values={"name": plan.name},
        )

        return await SuccessPlanService.get_plan(db, tenant_id, plan.id)

    @staticmethod
    async def get_plan(
        db: AsyncSession, tenant_id: uuid.UUID, plan_id: uuid.UUID
    ) -> CustomerSuccessPlanResponse:
        db.expire_all()
        res = await db.execute(
            select(CustomerSuccessPlan)
            .where(CustomerSuccessPlan.id == plan_id, CustomerSuccessPlan.tenant_id == tenant_id)
            .options(selectinload(CustomerSuccessPlan.milestones))
        )
        plan = res.scalar_one_or_none()
        if not plan:
            raise NotFoundError("CustomerSuccessPlan", plan_id)

        total_m = len(plan.milestones)
        completed_m = sum(1 for m in plan.milestones if m.is_completed)
        progress = int((completed_m / total_m) * 100) if total_m > 0 else 0

        return CustomerSuccessPlanResponse(
            id=plan.id,
            tenant_id=plan.tenant_id,
            customer_id=plan.customer_id,
            name=plan.name,
            status=plan.status,
            target_outcome=plan.target_outcome,
            start_date=plan.start_date,
            target_completion_date=plan.target_completion_date,
            completed_at=plan.completed_at,
            progress_percentage=progress,
            milestones=[SuccessMilestoneResponse.model_validate(m) for m in plan.milestones],
            created_at=plan.created_at,
        )

    @staticmethod
    async def complete_milestone(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        milestone_id: uuid.UUID,
        actor_id: uuid.UUID | None,
    ) -> CustomerSuccessPlanResponse:
        res = await db.execute(
            select(SuccessMilestone).where(
                SuccessMilestone.id == milestone_id, SuccessMilestone.tenant_id == tenant_id
            )
        )
        milestone = res.scalar_one_or_none()
        if not milestone:
            raise NotFoundError("SuccessMilestone", milestone_id)

        milestone.is_completed = True
        milestone.completed_at = datetime.now(UTC)
        await db.flush()

        # Check if all milestones are complete
        plan_res = await db.execute(
            select(CustomerSuccessPlan)
            .where(CustomerSuccessPlan.id == milestone.plan_id)
            .options(selectinload(CustomerSuccessPlan.milestones))
        )
        plan = plan_res.scalar_one()
        if all(m.is_completed for m in plan.milestones):
            plan.status = "completed"
            plan.completed_at = datetime.now(UTC)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="milestone:completed",
            entity_type="SuccessMilestone",
            entity_id=str(milestone.id),
            new_values={"is_completed": True},
        )

        return await SuccessPlanService.get_plan(db, tenant_id, plan.id)
