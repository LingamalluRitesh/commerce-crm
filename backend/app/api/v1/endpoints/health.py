from datetime import UTC, datetime
from typing import Any

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

router = APIRouter()


@router.get("/health", summary="Liveness Probe", status_code=status.HTTP_200_OK)
async def health_check() -> dict[str, Any]:
    """Liveness probe to confirm that the HTTP API service is active."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.get("/ready", summary="Readiness Probe")
async def readiness_check(db: AsyncSession = Depends(get_db)) -> JSONResponse:
    """Readiness probe checking database and redis connectivity."""
    checks = {"database": "unknown", "redis": "unknown"}
    overall_status = True

    # 1. Database Ping Check
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "connected"
    except Exception as exc:
        checks["database"] = f"unhealthy: {str(exc)}"
        overall_status = False

    # 2. Redis Ping Check
    try:
        r = aioredis.from_url(settings.redis_url, socket_timeout=2.0)
        await r.ping()
        await r.aclose()
        checks["redis"] = "connected"
    except Exception as exc:
        # In early development or testing, redis might be optional or mockable
        checks["redis"] = f"unreachable: {str(exc)}"
        # Do not fail overall readiness in dev if redis is local optional
        if settings.ENVIRONMENT == "production":
            overall_status = False

    http_status = status.HTTP_200_OK if overall_status else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(
        status_code=http_status,
        content={
            "status": "ready" if overall_status else "degraded",
            "checks": checks,
            "timestamp": datetime.now(UTC).isoformat(),
        },
    )
