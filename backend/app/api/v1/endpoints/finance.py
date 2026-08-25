import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.finance import (
    InvoiceCreateRequest,
    InvoicePayRequest,
    InvoiceResponse,
    SubscriptionCreateRequest,
    SubscriptionResponse,
)
from app.application.services.finance import (
    InvoiceService,
    SubscriptionService,
)
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


# -------------------------------------------------------------
# Invoices
# -------------------------------------------------------------
@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_invoices(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:read")),
) -> list[InvoiceResponse]:
    """List financial invoices."""
    return await InvoiceService.list_invoices(db=db, tenant_id=tenant_id)


@router.post("/invoices", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    data: InvoiceCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> InvoiceResponse:
    """Create a tax-compliant commercial invoice."""
    return await InvoiceService.create_invoice(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post("/invoices/{invoice_id}/pay", response_model=InvoiceResponse)
async def pay_invoice(
    invoice_id: uuid.UUID,
    data: InvoicePayRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> InvoiceResponse:
    """Record an invoice payment."""
    return await InvoiceService.pay_invoice(
        db=db,
        tenant_id=tenant_id,
        invoice_id=invoice_id,
        actor_id=current_user.id,
        data=data,
    )


# -------------------------------------------------------------
# Subscriptions
# -------------------------------------------------------------
@router.get("/subscriptions", response_model=list[SubscriptionResponse])
async def list_subscriptions(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:read")),
) -> list[SubscriptionResponse]:
    """List customer recurring subscriptions."""
    return await SubscriptionService.list_subscriptions(db=db, tenant_id=tenant_id)


@router.post(
    "/subscriptions",
    response_model=SubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_subscription(
    data: SubscriptionCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> SubscriptionResponse:
    """Create a recurring SaaS subscription."""
    return await SubscriptionService.create_subscription(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )
