import pytest
from httpx import AsyncClient

from app.core.errors import NotFoundError, PermissionDeniedError
from app.main import app


@pytest.mark.asyncio
async def test_not_found_app_exception():
    exc = NotFoundError(resource="Customer", identifier="12345")
    assert exc.status_code == 404
    assert exc.code == "RESOURCE_NOT_FOUND"
    assert "12345" in exc.message
    assert exc.details["resource"] == "Customer"


@pytest.mark.asyncio
async def test_permission_denied_exception():
    exc = PermissionDeniedError(permission="deal:delete")
    assert exc.status_code == 403
    assert exc.code == "PERMISSION_DENIED"
    assert exc.details["required_permission"] == "deal:delete"


@pytest.mark.asyncio
async def test_custom_error_route_handling(client: AsyncClient):
    # Test route raising AppException
    @app.get("/api/v1/test-error")
    async def trigger_test_error():
        raise NotFoundError("Order", "ord_999")

    response = await client.get("/api/v1/test-error")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "RESOURCE_NOT_FOUND"
    assert data["error"]["details"]["resource"] == "Order"
    assert "request_id" in data["error"]
