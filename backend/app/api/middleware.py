import time
import uuid
from collections.abc import Callable
from contextvars import ContextVar

from fastapi import FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.errors import AppException, ErrorResponsePayload
from app.core.logging import logger

# Context variables for tracing and tenant scoping
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")
tenant_id_ctx: ContextVar[str] = ContextVar("tenant_id", default="")


class RequestTracingMiddleware(BaseHTTPMiddleware):
    """Middleware for injecting Request-ID, capturing latency, and logging structured metrics."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        req_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:16]}"
        request_id_ctx.set(req_id)
        request.state.request_id = req_id

        # Extract tenant header if provided
        org_id = request.headers.get("X-Organization-ID") or ""
        tenant_id_ctx.set(org_id)
        request.state.tenant_id = org_id

        start_time = time.perf_counter()
        try:
            response = await call_next(request)
            process_time = time.perf_counter() - start_time
            response.headers["X-Request-ID"] = req_id
            response.headers["X-Process-Time"] = f"{process_time:.4f}s"

            # Enterprise Security Headers
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

            # Record Prometheus Metrics
            from app.api.observability import record_request_metric

            record_request_metric(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code,
                duration_sec=process_time,
            )

            logger.info(
                "http_request",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration=f"{process_time:.4f}s",
                request_id=req_id,
            )
            return response
        except Exception as exc:
            process_time = time.perf_counter() - start_time
            logger.error(
                "unhandled_http_exception",
                method=request.method,
                path=request.url.path,
                duration=f"{process_time:.4f}s",
                request_id=req_id,
                error=str(exc),
            )
            raise exc


def register_exception_handlers(app: FastAPI) -> None:
    """Register custom exception handlers conforming to standard API error contracts."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        req_id = getattr(request.state, "request_id", request_id_ctx.get())
        payload = ErrorResponsePayload(
            code=exc.code,
            message=exc.message,
            request_id=req_id,
            details=exc.details,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": payload.model_dump(exclude_none=True)},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        req_id = getattr(request.state, "request_id", request_id_ctx.get())
        payload = ErrorResponsePayload(
            code="VALIDATION_ERROR",
            message="The request payload failed validation.",
            request_id=req_id,
            details={"errors": exc.errors()},
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"error": payload.model_dump(exclude_none=True)},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        req_id = getattr(request.state, "request_id", request_id_ctx.get())
        payload = ErrorResponsePayload(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected server error occurred. Please contact support.",
            request_id=req_id,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": payload.model_dump(exclude_none=True)},
        )
