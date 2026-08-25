import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_observability_security_and_audit_vault(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "ciso@datadog-scale.com",
            "password": "SecurityPassword123!",
            "first_name": "Olivier",
            "last_name": "Pomel",
            "organization_name": "Observability Vault Corp",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Verify Enterprise Security Headers on HTTP Response
    assert reg_res.headers.get("X-Frame-Options") == "DENY"
    assert reg_res.headers.get("X-Content-Type-Options") == "nosniff"
    assert "Strict-Transport-Security" in reg_res.headers
    assert "X-Process-Time" in reg_res.headers
    assert "X-Request-ID" in reg_res.headers

    # 3. Fetch Prometheus /metrics Text Endpoint
    prom_res = await client.get("/metrics")
    assert prom_res.status_code == 200
    assert "http_requests_total" in prom_res.text
    assert "http_request_duration_seconds" in prom_res.text

    # 4. Fetch Structured Observability Diagnostics
    obs_res = await client.get("/api/v1/observability/metrics", headers=headers)
    assert obs_res.status_code == 200
    obs = obs_res.json()
    assert obs["status"] == "operational"
    assert "http_requests" in obs

    # 5. Verify Immutable Cryptographic Audit Vault
    audit_res = await client.post("/api/v1/observability/audit-vault/verify", headers=headers)
    assert audit_res.status_code == 200
    vault = audit_res.json()
    assert vault["integrity_verified"] is True
    assert vault["total_audit_records"] >= 1
    assert len(vault["vault_root_hash"]) == 64
