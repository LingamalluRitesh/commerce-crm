import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.sales import (
    DealCreateRequest,
    DealResponse,
    DealUpdateStageRequest,
    LeadConvertRequest,
    LeadConvertResponse,
    LeadCreateRequest,
    LeadResponse,
    PipelineResponse,
    QuoteCreateRequest,
    QuoteResponse,
)
from app.application.services.sales import (
    DealService,
    LeadService,
    PipelineService,
    QuoteService,
)
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


# -------------------------------------------------------------
# Leads Endpoints
# -------------------------------------------------------------
@router.get("/leads", response_model=list[LeadResponse])
async def list_leads(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("lead:read")),
) -> list[LeadResponse]:
    """List all leads for the organization."""
    return await LeadService.list_leads(db=db, tenant_id=tenant_id)


@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    data: LeadCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("lead:write")),
) -> LeadResponse:
    """Capture and score a new sales lead."""
    return await LeadService.create_lead(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post(
    "/leads/{lead_id}/convert",
    response_model=LeadConvertResponse,
    status_code=status.HTTP_200_OK,
)
async def convert_lead(
    lead_id: uuid.UUID,
    data: LeadConvertRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("lead:write")),
) -> LeadConvertResponse:
    """Convert a qualified lead to an active Customer and optional Deal."""
    return await LeadService.convert_lead(
        db=db,
        tenant_id=tenant_id,
        lead_id=lead_id,
        actor_id=current_user.id,
        data=data,
    )


# -------------------------------------------------------------
# Pipelines Endpoints
# -------------------------------------------------------------
@router.get("/pipelines", response_model=list[PipelineResponse])
async def list_pipelines(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("deal:read")),
) -> list[PipelineResponse]:
    """List sales pipelines and stages."""
    return await PipelineService.list_pipelines(db=db, tenant_id=tenant_id)


# -------------------------------------------------------------
# Deals Endpoints
# -------------------------------------------------------------
@router.get("/deals", response_model=list[DealResponse])
async def list_deals(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("deal:read")),
) -> list[DealResponse]:
    """List sales deals."""
    return await DealService.list_deals(db=db, tenant_id=tenant_id)


@router.post("/deals", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
async def create_deal(
    data: DealCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("deal:write")),
) -> DealResponse:
    """Create a new deal opportunity in the pipeline."""
    return await DealService.create_deal(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.patch("/deals/{deal_id}/stage", response_model=DealResponse)
async def update_deal_stage(
    deal_id: uuid.UUID,
    data: DealUpdateStageRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("deal:write")),
) -> DealResponse:
    """Advance deal stage; triggers revenue metrics if Closed Won."""
    return await DealService.update_deal_stage(
        db=db,
        tenant_id=tenant_id,
        deal_id=deal_id,
        actor_id=current_user.id,
        data=data,
    )


# -------------------------------------------------------------
# Quotes Endpoints
# -------------------------------------------------------------
@router.get("/quotes", response_model=list[QuoteResponse])
async def list_quotes(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("deal:read")),
) -> list[QuoteResponse]:
    """List quotes."""
    return await QuoteService.list_quotes(db=db, tenant_id=tenant_id)


@router.post("/quotes", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
async def create_quote(
    data: QuoteCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("deal:write")),
) -> QuoteResponse:
    """Generate a formal price quote for a deal."""
    return await QuoteService.create_quote(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )
