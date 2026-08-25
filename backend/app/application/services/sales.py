import secrets
import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dtos.customer import CustomerCreateRequest
from app.application.dtos.sales import (
    DealCreateRequest,
    DealResponse,
    DealUpdateStageRequest,
    LeadConvertRequest,
    LeadConvertResponse,
    LeadCreateRequest,
    LeadResponse,
    PipelineResponse,
    PipelineStageResponse,
    QuoteCreateRequest,
    QuoteItemResponse,
    QuoteResponse,
)
from app.application.services.audit import AuditService
from app.application.services.customer import CustomerService
from app.core.errors import ConflictError, NotFoundError, ValidationAppError
from app.core.events import DomainEvent, event_bus
from app.infrastructure.models.customer import Customer
from app.infrastructure.models.sales import (
    Deal,
    Lead,
    Pipeline,
    PipelineStage,
    Quote,
    QuoteItem,
)

DEFAULT_STAGES = [
    ("Discovery", 0, 10, False, False),
    ("Qualification", 1, 30, False, False),
    ("Proposal", 2, 60, False, False),
    ("Negotiation", 3, 80, False, False),
    ("Closed Won", 4, 100, True, False),
    ("Closed Lost", 5, 0, False, True),
]


class LeadService:
    @staticmethod
    def calculate_lead_score(email: str, company: str | None, source: str) -> int:
        score = 40
        # Business email heuristic (not gmail/yahoo/hotmail)
        if not any(
            free in email.lower() for free in ["@gmail.", "@yahoo.", "@hotmail.", "@outlook."]
        ):
            score += 25
        if company and len(company.strip()) > 2:
            score += 20
        if source in ["referral", "outbound"]:
            score += 15
        elif source == "ads":
            score += 10
        return min(100, score)

    @staticmethod
    async def create_lead(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: LeadCreateRequest,
    ) -> LeadResponse:
        calculated_score = (
            data.score
            if data.score is not None
            else LeadService.calculate_lead_score(data.email, data.company_name, data.source)
        )

        lead = Lead(
            tenant_id=tenant_id,
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            email=data.email.lower(),
            phone=data.phone,
            title=data.title,
            company_name=data.company_name,
            estimated_budget=data.estimated_budget,
            source=data.source,
            status="new",
            score=calculated_score,
            assigned_to_user_id=data.assigned_to_user_id,
        )
        db.add(lead)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="lead:created",
            entity_type="Lead",
            entity_id=str(lead.id),
            new_values={"email": lead.email, "score": lead.score},
        )

        return LeadResponse.model_validate(lead)

    @staticmethod
    async def list_leads(db: AsyncSession, tenant_id: uuid.UUID) -> list[LeadResponse]:
        res = await db.execute(
            select(Lead).where(Lead.tenant_id == tenant_id).order_by(Lead.created_at.desc())
        )
        return [LeadResponse.model_validate(lead) for lead in res.scalars().all()]

    @staticmethod
    async def convert_lead(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        lead_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: LeadConvertRequest,
    ) -> LeadConvertResponse:
        lead_res = await db.execute(
            select(Lead).where(Lead.id == lead_id, Lead.tenant_id == tenant_id)
        )
        lead = lead_res.scalar_one_or_none()
        if not lead:
            raise NotFoundError("Lead", lead_id)
        if lead.status == "converted":
            raise ConflictError("This lead has already been converted.")

        # 1. Create or Find Customer
        cust_req = CustomerCreateRequest(
            type="business" if lead.company_name else "individual",
            first_name=lead.first_name,
            last_name=lead.last_name,
            email=lead.email,
            phone=lead.phone,
            status="active",
        )
        customer = await CustomerService.create_customer(
            db=db, tenant_id=tenant_id, actor_id=actor_id, data=cust_req
        )

        # 2. Optionally create Deal
        deal_id = None
        if data.create_deal:
            pipeline = await PipelineService.get_or_create_default_pipeline(db, tenant_id)
            initial_stage = pipeline.stages[0] if pipeline.stages else None
            if not initial_stage:
                raise ValidationAppError("Pipeline contains no stages.")

            deal_name = data.deal_name or f"Deal - {customer.first_name} {customer.last_name}"
            deal = Deal(
                tenant_id=tenant_id,
                pipeline_id=pipeline.id,
                stage_id=initial_stage.id,
                customer_id=customer.id,
                name=deal_name,
                value=data.deal_value,
                probability=initial_stage.probability,
                status="open",
                assigned_to_user_id=lead.assigned_to_user_id,
            )
            db.add(deal)
            await db.flush()
            deal_id = deal.id

        # 3. Mark Lead Converted
        lead.status = "converted"
        lead.converted_customer_id = customer.id
        lead.converted_at = datetime.now(UTC)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="lead:converted",
            entity_type="Lead",
            entity_id=str(lead.id),
            new_values={
                "customer_id": str(customer.id),
                "deal_id": str(deal_id) if deal_id else None,
            },
        )

        return LeadConvertResponse(
            customer=customer,
            deal_id=deal_id,
            message="Lead converted successfully.",
        )


class PipelineService:
    @staticmethod
    async def get_or_create_default_pipeline(db: AsyncSession, tenant_id: uuid.UUID) -> Pipeline:
        query = (
            select(Pipeline)
            .where(Pipeline.tenant_id == tenant_id, Pipeline.is_default.is_(True))
            .options(selectinload(Pipeline.stages))
        )
        res = await db.execute(query)
        pipeline = res.scalar_one_or_none()

        if not pipeline:
            pipeline = Pipeline(
                tenant_id=tenant_id,
                name="Standard Sales Pipeline",
                is_default=True,
                is_active=True,
            )
            db.add(pipeline)
            await db.flush()

            for name, order, prob, is_won, is_lost in DEFAULT_STAGES:
                stage = PipelineStage(
                    tenant_id=tenant_id,
                    pipeline_id=pipeline.id,
                    name=name,
                    order_index=order,
                    probability=prob,
                    is_won_stage=is_won,
                    is_lost_stage=is_lost,
                )
                db.add(stage)
            await db.flush()

            # Refresh pipeline with stages
            res2 = await db.execute(
                select(Pipeline)
                .where(Pipeline.id == pipeline.id)
                .options(selectinload(Pipeline.stages))
            )
            pipeline = res2.scalar_one()

        return pipeline

    @staticmethod
    async def list_pipelines(db: AsyncSession, tenant_id: uuid.UUID) -> list[PipelineResponse]:
        # Ensure default exists
        await PipelineService.get_or_create_default_pipeline(db, tenant_id)

        query = (
            select(Pipeline)
            .where(Pipeline.tenant_id == tenant_id)
            .options(selectinload(Pipeline.stages))
        )
        res = await db.execute(query)
        pipelines = res.scalars().all()

        return [
            PipelineResponse(
                id=p.id,
                tenant_id=p.tenant_id,
                name=p.name,
                is_default=p.is_default,
                is_active=p.is_active,
                stages=[PipelineStageResponse.model_validate(s) for s in p.stages],
                created_at=p.created_at,
            )
            for p in pipelines
        ]


class DealService:
    @staticmethod
    async def create_deal(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: DealCreateRequest,
    ) -> DealResponse:
        # 1. Verify Customer
        cust_res = await db.execute(
            select(Customer).where(Customer.id == data.customer_id, Customer.tenant_id == tenant_id)
        )
        if not cust_res.scalar_one_or_none():
            raise NotFoundError("Customer", data.customer_id)

        # 2. Resolve Pipeline & Stage
        pipeline = await PipelineService.get_or_create_default_pipeline(db, tenant_id)
        pipeline_id = data.pipeline_id or pipeline.id

        if data.stage_id:
            stage_res = await db.execute(
                select(PipelineStage).where(
                    PipelineStage.id == data.stage_id, PipelineStage.tenant_id == tenant_id
                )
            )
            stage = stage_res.scalar_one_or_none()
            if not stage:
                raise NotFoundError("PipelineStage", data.stage_id)
        else:
            stage = pipeline.stages[0]

        deal = Deal(
            tenant_id=tenant_id,
            pipeline_id=pipeline_id,
            stage_id=stage.id,
            customer_id=data.customer_id,
            name=data.name.strip(),
            value=data.value,
            currency=data.currency,
            probability=stage.probability,
            expected_close_date=data.expected_close_date,
            status="won" if stage.is_won_stage else ("lost" if stage.is_lost_stage else "open"),
            assigned_to_user_id=data.assigned_to_user_id,
        )
        db.add(deal)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="deal:created",
            entity_type="Deal",
            entity_id=str(deal.id),
            new_values={"name": deal.name, "value": str(deal.value)},
        )

        return DealResponse.model_validate(deal)

    @staticmethod
    async def update_deal_stage(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        deal_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: DealUpdateStageRequest,
    ) -> DealResponse:
        res = await db.execute(select(Deal).where(Deal.id == deal_id, Deal.tenant_id == tenant_id))
        deal = res.scalar_one_or_none()
        if not deal:
            raise NotFoundError("Deal", deal_id)

        stage_res = await db.execute(
            select(PipelineStage).where(
                PipelineStage.id == data.stage_id, PipelineStage.tenant_id == tenant_id
            )
        )
        stage = stage_res.scalar_one_or_none()
        if not stage:
            raise NotFoundError("PipelineStage", data.stage_id)

        old_status = deal.status
        deal.stage_id = stage.id
        deal.probability = stage.probability

        if stage.is_won_stage:
            deal.status = "won"
            # Update Customer Lifetime Value
            cust_res = await db.execute(
                select(Customer).where(
                    Customer.id == deal.customer_id, Customer.tenant_id == tenant_id
                )
            )
            customer = cust_res.scalar_one_or_none()
            if customer:
                customer.lifetime_value += deal.value

            # Publish deal:won event
            await event_bus.publish(
                DomainEvent(
                    event_type="deal.won.v1",
                    tenant_id=tenant_id,
                    aggregate_type="Deal",
                    aggregate_id=deal.id,
                    payload={"customer_id": str(deal.customer_id), "deal_value": str(deal.value)},
                )
            )
        elif stage.is_lost_stage:
            deal.status = "lost"
            deal.lost_reason = data.lost_reason
        else:
            deal.status = "open"

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="deal:stage_updated",
            entity_type="Deal",
            entity_id=str(deal.id),
            old_values={"status": old_status},
            new_values={"status": deal.status, "stage_id": str(stage.id)},
        )

        return DealResponse.model_validate(deal)

    @staticmethod
    async def list_deals(db: AsyncSession, tenant_id: uuid.UUID) -> list[DealResponse]:
        res = await db.execute(
            select(Deal).where(Deal.tenant_id == tenant_id).order_by(Deal.created_at.desc())
        )
        return [DealResponse.model_validate(d) for d in res.scalars().all()]


class QuoteService:
    @staticmethod
    async def create_quote(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: QuoteCreateRequest,
    ) -> QuoteResponse:
        # Verify deal
        deal_res = await db.execute(
            select(Deal).where(Deal.id == data.deal_id, Deal.tenant_id == tenant_id)
        )
        deal = deal_res.scalar_one_or_none()
        if not deal:
            raise NotFoundError("Deal", data.deal_id)

        # Compute Line Items & Subtotal
        subtotal = Decimal("0.00")
        quote_items = []

        for item_data in data.items:
            item_total = Decimal(str(item_data.unit_price)) * Decimal(str(item_data.quantity))
            subtotal += item_total

        # Tax calculation
        tax_amount = (subtotal - data.discount_amount) * (data.tax_rate_percent / Decimal("100.00"))
        if tax_amount < Decimal("0.00"):
            tax_amount = Decimal("0.00")
        total_amount = subtotal - data.discount_amount + tax_amount

        quote_number = f"QUO-{datetime.now(UTC).strftime('%Y%m%d')}-{secrets.token_hex(2).upper()}"

        quote = Quote(
            tenant_id=tenant_id,
            deal_id=deal.id,
            customer_id=deal.customer_id,
            quote_number=quote_number,
            status="draft",
            subtotal=subtotal,
            discount_amount=data.discount_amount,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency=deal.currency,
            valid_until=data.valid_until,
        )
        db.add(quote)
        await db.flush()

        # Add items
        for item_data in data.items:
            item_total = Decimal(str(item_data.unit_price)) * Decimal(str(item_data.quantity))
            q_item = QuoteItem(
                tenant_id=tenant_id,
                quote_id=quote.id,
                title=item_data.title,
                description=item_data.description,
                unit_price=item_data.unit_price,
                quantity=item_data.quantity,
                total_price=item_total,
            )
            db.add(q_item)
            quote_items.append(q_item)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="quote:created",
            entity_type="Quote",
            entity_id=str(quote.id),
            new_values={
                "quote_number": quote.quote_number,
                "total_amount": str(quote.total_amount),
            },
        )

        return QuoteResponse(
            id=quote.id,
            tenant_id=quote.tenant_id,
            deal_id=quote.deal_id,
            customer_id=quote.customer_id,
            quote_number=quote.quote_number,
            status=quote.status,
            subtotal=quote.subtotal,
            discount_amount=quote.discount_amount,
            tax_amount=quote.tax_amount,
            total_amount=quote.total_amount,
            currency=quote.currency,
            valid_until=quote.valid_until,
            items=[QuoteItemResponse.model_validate(qi) for qi in quote_items],
            created_at=quote.created_at,
        )

    @staticmethod
    async def list_quotes(db: AsyncSession, tenant_id: uuid.UUID) -> list[QuoteResponse]:
        query = (
            select(Quote)
            .where(Quote.tenant_id == tenant_id)
            .options(selectinload(Quote.items))
            .order_by(Quote.created_at.desc())
        )
        res = await db.execute(query)
        quotes = res.scalars().all()
        return [
            QuoteResponse(
                id=q.id,
                tenant_id=q.tenant_id,
                deal_id=q.deal_id,
                customer_id=q.customer_id,
                quote_number=q.quote_number,
                status=q.status,
                subtotal=q.subtotal,
                discount_amount=q.discount_amount,
                tax_amount=q.tax_amount,
                total_amount=q.total_amount,
                currency=q.currency,
                valid_until=q.valid_until,
                items=[QuoteItemResponse.model_validate(qi) for qi in q.items],
                created_at=q.created_at,
            )
            for q in quotes
        ]
