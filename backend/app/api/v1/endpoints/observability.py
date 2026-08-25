import uuid
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    require_permission,
)
from app.api.observability import EVENT_COUNTS, REQUEST_COUNTS
from app.application.services.audit import AuditService
from app.core.database import get_db

router = APIRouter()


@router.get("/metrics")
async def get_system_metrics(
    _: bool = Depends(require_permission("user:read")),
) -> dict[str, Any]:
    """Get structured system telemetry and request counters."""
    return {
        "http_requests": dict(REQUEST_COUNTS),
        "domain_events": dict(EVENT_COUNTS),
        "status": "operational",
    }


@router.post("/audit-vault/verify")
async def verify_audit_vault(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("user:read")),
) -> dict[str, Any]:
    """Verify cryptographic hash integrity chain across immutable audit records."""
    return await AuditService.verify_audit_vault_integrity(db=db, tenant_id=tenant_id)
