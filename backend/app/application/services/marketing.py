import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.customer import CustomerResponse
from app.application.dtos.marketing import (
    CampaignCreateRequest,
    CampaignResponse,
    CampaignSendResponse,
    DiscountCodeCreateRequest,
    DiscountCodeResponse,
    DiscountValidateRequest,
    DiscountValidateResponse,
    MessageTemplateCreateRequest,
    MessageTemplateResponse,
    SegmentCreateRequest,
    SegmentResponse,
)
from app.application.services.audit import AuditService
from app.core.errors import ConflictError, NotFoundError, ValidationAppError
from app.core.events import DomainEvent, event_bus
from app.infrastructure.models.customer import Customer
from app.infrastructure.models.marketing import (
    Campaign,
    CampaignRecipient,
    DiscountCode,
    MessageTemplate,
    Segment,
)


class SegmentService:
    @staticmethod
    async def create_segment(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: SegmentCreateRequest,
    ) -> SegmentResponse:
        segment = Segment(
            tenant_id=tenant_id,
            name=data.name.strip(),
            type=data.type,
            criteria=data.criteria,
            is_active=True,
        )
        db.add(segment)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="segment:created",
            entity_type="Segment",
            entity_id=str(segment.id),
            new_values={"name": segment.name},
        )

        return SegmentResponse.model_validate(segment)

    @staticmethod
    async def list_segments(db: AsyncSession, tenant_id: uuid.UUID) -> list[SegmentResponse]:
        res = await db.execute(
            select(Segment)
            .where(Segment.tenant_id == tenant_id, Segment.is_active.is_(True))
            .order_by(Segment.name)
        )
        return [SegmentResponse.model_validate(s) for s in res.scalars().all()]

    @staticmethod
    async def get_segment_customers(
        db: AsyncSession, tenant_id: uuid.UUID, segment_id: uuid.UUID
    ) -> list[CustomerResponse]:
        res = await db.execute(
            select(Segment).where(Segment.id == segment_id, Segment.tenant_id == tenant_id)
        )
        segment = res.scalar_one_or_none()
        if not segment:
            raise NotFoundError("Segment", segment_id)

        query = select(Customer).where(Customer.tenant_id == tenant_id)
        criteria = segment.criteria or {}

        if "status" in criteria:
            query = query.where(Customer.status == criteria["status"])
        if "type" in criteria:
            query = query.where(Customer.type == criteria["type"])
        if "health_score_gte" in criteria:
            query = query.where(Customer.health_score >= criteria["health_score_gte"])
        if "health_score_lte" in criteria:
            query = query.where(Customer.health_score <= criteria["health_score_lte"])
        if "lifetime_value_gte" in criteria:
            query = query.where(
                Customer.lifetime_value >= Decimal(str(criteria["lifetime_value_gte"]))
            )
        if "lifetime_value_lte" in criteria:
            query = query.where(
                Customer.lifetime_value <= Decimal(str(criteria["lifetime_value_lte"]))
            )

        cust_res = await db.execute(query)
        customers = cust_res.scalars().all()
        return [CustomerResponse.model_validate(c) for c in customers]


class TemplateService:
    @staticmethod
    async def create_template(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: MessageTemplateCreateRequest,
    ) -> MessageTemplateResponse:
        template = MessageTemplate(
            tenant_id=tenant_id,
            name=data.name.strip(),
            channel=data.channel,
            subject=data.subject,
            body=data.body,
            variables=data.variables or [],
            is_active=True,
        )
        db.add(template)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="template:created",
            entity_type="MessageTemplate",
            entity_id=str(template.id),
            new_values={"name": template.name},
        )

        return MessageTemplateResponse.model_validate(template)

    @staticmethod
    async def list_templates(
        db: AsyncSession, tenant_id: uuid.UUID
    ) -> list[MessageTemplateResponse]:
        res = await db.execute(
            select(MessageTemplate)
            .where(MessageTemplate.tenant_id == tenant_id, MessageTemplate.is_active.is_(True))
            .order_by(MessageTemplate.name)
        )
        return [MessageTemplateResponse.model_validate(t) for t in res.scalars().all()]


class CampaignService:
    @staticmethod
    async def create_campaign(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: CampaignCreateRequest,
    ) -> CampaignResponse:
        campaign = Campaign(
            tenant_id=tenant_id,
            name=data.name.strip(),
            channel=data.channel,
            segment_id=data.segment_id,
            template_id=data.template_id,
            subject=data.subject,
            content=data.content,
            scheduled_at=data.scheduled_at,
            status="draft",
        )
        db.add(campaign)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="campaign:created",
            entity_type="Campaign",
            entity_id=str(campaign.id),
            new_values={"name": campaign.name, "channel": campaign.channel},
        )

        return CampaignResponse.model_validate(campaign)

    @staticmethod
    async def list_campaigns(db: AsyncSession, tenant_id: uuid.UUID) -> list[CampaignResponse]:
        res = await db.execute(
            select(Campaign)
            .where(Campaign.tenant_id == tenant_id)
            .order_by(Campaign.created_at.desc())
        )
        return [CampaignResponse.model_validate(c) for c in res.scalars().all()]

    @staticmethod
    async def send_campaign(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        campaign_id: uuid.UUID,
        actor_id: uuid.UUID | None,
    ) -> CampaignSendResponse:
        res = await db.execute(
            select(Campaign).where(Campaign.id == campaign_id, Campaign.tenant_id == tenant_id)
        )
        campaign = res.scalar_one_or_none()
        if not campaign:
            raise NotFoundError("Campaign", campaign_id)

        if not campaign.segment_id:
            raise ValidationAppError("Campaign does not have an assigned segment.")

        # Target Customers
        customers = await SegmentService.get_segment_customers(db, tenant_id, campaign.segment_id)

        count = 0
        now = datetime.now(UTC)
        for cust in customers:
            recipient = CampaignRecipient(
                tenant_id=tenant_id,
                campaign_id=campaign.id,
                customer_id=cust.id,
                status="delivered",
                sent_at=now,
            )
            db.add(recipient)
            count += 1

        campaign.status = "completed"
        campaign.sent_at = now
        campaign.total_recipients = count
        campaign.delivered_count = count
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="campaign:sent",
            entity_type="Campaign",
            entity_id=str(campaign.id),
            new_values={"recipients_count": count},
        )

        await event_bus.publish(
            DomainEvent(
                event_type="campaign.sent.v1",
                tenant_id=tenant_id,
                aggregate_type="Campaign",
                aggregate_id=campaign.id,
                payload={"campaign_name": campaign.name, "recipients_count": count},
            )
        )

        return CampaignSendResponse(
            campaign_id=campaign.id,
            status=campaign.status,
            recipients_count=count,
            message=f"Campaign successfully dispatched to {count} recipients.",
        )


class DiscountService:
    @staticmethod
    async def create_discount_code(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: DiscountCodeCreateRequest,
    ) -> DiscountCodeResponse:
        code_upper = data.code.strip().upper()
        existing = await db.execute(
            select(DiscountCode).where(
                DiscountCode.tenant_id == tenant_id, DiscountCode.code == code_upper
            )
        )
        if existing.scalar_one_or_none():
            raise ConflictError(f"Discount code '{code_upper}' already exists.")

        discount = DiscountCode(
            tenant_id=tenant_id,
            code=code_upper,
            discount_type=data.discount_type,
            value=data.value,
            min_order_value=data.min_order_value,
            max_uses=data.max_uses,
            expires_at=data.expires_at,
            is_active=True,
        )
        db.add(discount)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="discount:created",
            entity_type="DiscountCode",
            entity_id=str(discount.id),
            new_values={"code": discount.code, "value": str(discount.value)},
        )

        return DiscountCodeResponse.model_validate(discount)

    @staticmethod
    async def validate_discount(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        data: DiscountValidateRequest,
    ) -> DiscountValidateResponse:
        code_upper = data.code.strip().upper()
        res = await db.execute(
            select(DiscountCode).where(
                DiscountCode.tenant_id == tenant_id, DiscountCode.code == code_upper
            )
        )
        discount = res.scalar_one_or_none()

        if not discount or not discount.is_active:
            return DiscountValidateResponse(
                valid=False,
                discount_amount=Decimal("0.00"),
                message="Invalid or inactive coupon code.",
            )

        if discount.expires_at and discount.expires_at < datetime.now(UTC):
            return DiscountValidateResponse(
                valid=False,
                discount_amount=Decimal("0.00"),
                message="Coupon code has expired.",
            )

        if discount.max_uses is not None and discount.used_count >= discount.max_uses:
            return DiscountValidateResponse(
                valid=False,
                discount_amount=Decimal("0.00"),
                message="Coupon usage limit reached.",
            )

        if discount.min_order_value and data.order_subtotal < discount.min_order_value:
            return DiscountValidateResponse(
                valid=False,
                discount_amount=Decimal("0.00"),
                message=(
                    f"Order subtotal must be at least ${discount.min_order_value} "
                    f"to apply this coupon."
                ),
            )

        # Calculate discount amount
        if discount.discount_type == "percentage":
            calc_amount = data.order_subtotal * (discount.value / Decimal("100.00"))
        else:
            calc_amount = discount.value

        discount_amount = min(data.order_subtotal, calc_amount)

        return DiscountValidateResponse(
            valid=True,
            discount_amount=discount_amount,
            message="Coupon applied successfully.",
        )
