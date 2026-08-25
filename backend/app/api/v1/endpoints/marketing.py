import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
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
from app.application.services.marketing import (
    CampaignService,
    DiscountService,
    SegmentService,
    TemplateService,
)
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


# -------------------------------------------------------------
# Segments
# -------------------------------------------------------------
@router.get("/segments", response_model=list[SegmentResponse])
async def list_segments(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("marketing:read")),
) -> list[SegmentResponse]:
    """List customer audience segments."""
    return await SegmentService.list_segments(db=db, tenant_id=tenant_id)


@router.post("/segments", response_model=SegmentResponse, status_code=status.HTTP_201_CREATED)
async def create_segment(
    data: SegmentCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("marketing:write")),
) -> SegmentResponse:
    """Create a dynamic or static customer segment."""
    return await SegmentService.create_segment(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.get("/segments/{segment_id}/customers", response_model=list[CustomerResponse])
async def get_segment_customers(
    segment_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("marketing:read")),
) -> list[CustomerResponse]:
    """Evaluate and retrieve all matching customers in this segment."""
    return await SegmentService.get_segment_customers(
        db=db, tenant_id=tenant_id, segment_id=segment_id
    )


# -------------------------------------------------------------
# Templates
# -------------------------------------------------------------
@router.get("/templates", response_model=list[MessageTemplateResponse])
async def list_templates(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("marketing:read")),
) -> list[MessageTemplateResponse]:
    """List message templates."""
    return await TemplateService.list_templates(db=db, tenant_id=tenant_id)


@router.post(
    "/templates",
    response_model=MessageTemplateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_template(
    data: MessageTemplateCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("marketing:write")),
) -> MessageTemplateResponse:
    """Create an email or SMS template."""
    return await TemplateService.create_template(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


# -------------------------------------------------------------
# Campaigns
# -------------------------------------------------------------
@router.get("/campaigns", response_model=list[CampaignResponse])
async def list_campaigns(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("marketing:read")),
) -> list[CampaignResponse]:
    """List marketing campaigns."""
    return await CampaignService.list_campaigns(db=db, tenant_id=tenant_id)


@router.post("/campaigns", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    data: CampaignCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("marketing:write")),
) -> CampaignResponse:
    """Create a new marketing campaign."""
    return await CampaignService.create_campaign(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post("/campaigns/{campaign_id}/send", response_model=CampaignSendResponse)
async def send_campaign(
    campaign_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("marketing:write")),
) -> CampaignSendResponse:
    """Trigger dispatch of marketing campaign to targeted segment."""
    return await CampaignService.send_campaign(
        db=db,
        tenant_id=tenant_id,
        campaign_id=campaign_id,
        actor_id=current_user.id,
    )


# -------------------------------------------------------------
# Discount Codes
# -------------------------------------------------------------
@router.post("/discounts", response_model=DiscountCodeResponse, status_code=status.HTTP_201_CREATED)
async def create_discount_code(
    data: DiscountCodeCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("marketing:write")),
) -> DiscountCodeResponse:
    """Create a promotional discount coupon."""
    return await DiscountService.create_discount_code(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post("/discounts/validate", response_model=DiscountValidateResponse)
async def validate_discount(
    data: DiscountValidateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:read")),
) -> DiscountValidateResponse:
    """Validate discount coupon against an active order subtotal."""
    return await DiscountService.validate_discount(
        db=db,
        tenant_id=tenant_id,
        data=data,
    )
