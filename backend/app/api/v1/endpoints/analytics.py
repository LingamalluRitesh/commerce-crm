import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    require_permission,
)
from app.application.dtos.analytics import (
    ExecutiveDashboardResponse,
    FunnelStageMetric,
)
from app.application.services.analytics import AnalyticsService
from app.core.database import get_db

router = APIRouter()


@router.get("/dashboard", response_model=ExecutiveDashboardResponse)
async def get_executive_dashboard(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:read")),
) -> ExecutiveDashboardResponse:
    """Get aggregated executive BI metrics across Sales, Commerce,
    Customers, Support, and Inventory."""
    return await AnalyticsService.get_dashboard(db=db, tenant_id=tenant_id)


@router.get("/sales-funnel", response_model=list[FunnelStageMetric])
async def get_sales_funnel(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("deal:read")),
) -> list[FunnelStageMetric]:
    """Get sales pipeline funnel metrics by stage."""
    return await AnalyticsService.get_sales_funnel(db=db, tenant_id=tenant_id)
