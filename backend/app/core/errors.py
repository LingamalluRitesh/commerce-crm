from typing import Any

from fastapi import HTTPException, status
from pydantic import BaseModel, Field


class ErrorResponsePayload(BaseModel):
    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error description")
    request_id: str | None = Field(None, description="Unique trace request ID")
    details: dict[str, Any] | None = Field(None, description="Contextual error details")


class StandardErrorResponse(BaseModel):
    error: ErrorResponsePayload


class AppException(HTTPException):
    """Base application exception with machine-readable error codes."""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(status_code=status_code, detail=message)
        self.code = code
        self.message = message
        self.details = details or {}


class NotFoundError(AppException):
    def __init__(self, resource: str, identifier: Any, message: str | None = None):
        msg = message or f"{resource} with identifier '{identifier}' was not found."
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="RESOURCE_NOT_FOUND",
            message=msg,
            details={"resource": resource, "identifier": str(identifier)},
        )


class AuthenticationError(AppException):
    def __init__(self, message: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="AUTHENTICATION_FAILED",
            message=message,
        )


class PermissionDeniedError(AppException):
    def __init__(self, permission: str | None = None, message: str | None = None):
        msg = message or "You do not have permission to perform this action."
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="PERMISSION_DENIED",
            message=msg,
            details={"required_permission": permission} if permission else {},
        )


class TenantIsolationError(AppException):
    def __init__(self, message: str = "Cross-tenant access violation detected."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="TENANT_ISOLATION_VIOLATION",
            message=message,
        )


class ConflictError(AppException):
    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="RESOURCE_CONFLICT",
            message=message,
            details=details,
        )


class ValidationAppError(AppException):
    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="VALIDATION_ERROR",
            message=message,
            details=details,
        )
