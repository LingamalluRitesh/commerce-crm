import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.support import (
    CustomerSuccessPlanCreateRequest,
    CustomerSuccessPlanResponse,
    KnowledgeArticleCreateRequest,
    KnowledgeArticleResponse,
    TicketCommentCreateRequest,
    TicketCreateRequest,
    TicketResolveRequest,
    TicketResponse,
)
from app.application.services.support import (
    KnowledgeBaseService,
    SuccessPlanService,
    TicketService,
)
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


# -------------------------------------------------------------
# Tickets
# -------------------------------------------------------------
@router.get("/tickets", response_model=list[TicketResponse])
async def list_tickets(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("ticket:read")),
) -> list[TicketResponse]:
    """List customer support tickets."""
    return await TicketService.list_tickets(db=db, tenant_id=tenant_id)


@router.post("/tickets", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    data: TicketCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("ticket:write")),
) -> TicketResponse:
    """Submit a support ticket with automated SLA calculation."""
    return await TicketService.create_ticket(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("ticket:read")),
) -> TicketResponse:
    """Get single support ticket with all conversation comments."""
    return await TicketService.get_ticket(db=db, tenant_id=tenant_id, ticket_id=ticket_id)


@router.post("/tickets/{ticket_id}/comments", response_model=TicketResponse)
async def add_comment(
    ticket_id: uuid.UUID,
    data: TicketCommentCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("ticket:write")),
) -> TicketResponse:
    """Add a customer reply or internal note to support ticket."""
    return await TicketService.add_comment(
        db=db,
        tenant_id=tenant_id,
        ticket_id=ticket_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post("/tickets/{ticket_id}/resolve", response_model=TicketResponse)
async def resolve_ticket(
    ticket_id: uuid.UUID,
    data: TicketResolveRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("ticket:write")),
) -> TicketResponse:
    """Resolve ticket with CSAT feedback."""
    return await TicketService.resolve_ticket(
        db=db,
        tenant_id=tenant_id,
        ticket_id=ticket_id,
        actor_id=current_user.id,
        data=data,
    )


# -------------------------------------------------------------
# Knowledge Base
# -------------------------------------------------------------
@router.get("/articles", response_model=list[KnowledgeArticleResponse])
async def list_articles(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:read")),
) -> list[KnowledgeArticleResponse]:
    """List published knowledge base articles."""
    return await KnowledgeBaseService.list_articles(db=db, tenant_id=tenant_id)


@router.post(
    "/articles",
    response_model=KnowledgeArticleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_article(
    data: KnowledgeArticleCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> KnowledgeArticleResponse:
    """Publish a new knowledge base article."""
    return await KnowledgeBaseService.create_article(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.get("/articles/{slug}", response_model=KnowledgeArticleResponse)
async def get_article_by_slug(
    slug: str,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:read")),
) -> KnowledgeArticleResponse:
    """Read knowledge base article by unique slug."""
    return await KnowledgeBaseService.get_article_by_slug(db=db, tenant_id=tenant_id, slug=slug)


# -------------------------------------------------------------
# Customer Success Plans
# -------------------------------------------------------------
@router.post(
    "/success-plans",
    response_model=CustomerSuccessPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_success_plan(
    data: CustomerSuccessPlanCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:write")),
) -> CustomerSuccessPlanResponse:
    """Create customer success plan with onboarding/expansion milestones."""
    return await SuccessPlanService.create_plan(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post(
    "/success-plans/milestones/{milestone_id}/complete",
    response_model=CustomerSuccessPlanResponse,
)
async def complete_milestone(
    milestone_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("customer:write")),
) -> CustomerSuccessPlanResponse:
    """Mark milestone complete and advance plan progress."""
    return await SuccessPlanService.complete_milestone(
        db=db,
        tenant_id=tenant_id,
        milestone_id=milestone_id,
        actor_id=current_user.id,
    )
