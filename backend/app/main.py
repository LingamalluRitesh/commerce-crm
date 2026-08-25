from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.middleware import RequestTracingMiddleware, register_exception_handlers
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.core.logging import logger, setup_logging
import app.infrastructure.models  # noqa: F401
from app.infrastructure.models.identity import Organization
from app.infrastructure.seed.enterprise_seeder import EnterpriseDataSeeder


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and shutdown routines."""
    setup_logging(debug=settings.DEBUG)
    logger.info(
        "application_startup",
        service=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
    )

    # Initialize tables and seed demo data if database is fresh
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        async with AsyncSessionLocal() as db:
            org_res = await db.execute(select(Organization))
            if not org_res.scalars().first():
                logger.info("seeding_initial_demo_organization")
                await EnterpriseDataSeeder.seed_demo_organization(db=db)
                await db.commit()
                logger.info("seeding_complete")
    except Exception as exc:
        logger.error("startup_db_init_failed", error=str(exc))

    yield
    logger.info("application_shutdown", service=settings.PROJECT_NAME)


def create_application() -> FastAPI:
    """Factory function for instantiating the CommerceCRM FastAPI app."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # 1. Register Custom Tracing & Tenant Scoping Middleware
    app.add_middleware(RequestTracingMiddleware)

    # 2. Register CORS Middleware
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # 3. Register Standard Exception Handlers
    register_exception_handlers(app)

    # 4. Mount Prometheus /metrics Router
    from app.api.observability import router as metrics_router

    app.include_router(metrics_router)

    # 5. Mount API v1 Router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()
