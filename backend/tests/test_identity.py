import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_registration_and_org_provisioning(client: AsyncClient):
    payload = {
        "email": "ceo@acmecorp.com",
        "password": "SecurePassword123!",
        "first_name": "Alice",
        "last_name": "Smith",
        "organization_name": "Acme Corporation",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "ceo@acmecorp.com"
    assert data["user"]["first_name"] == "Alice"
    assert "active_organization_id" in data


@pytest.mark.asyncio
async def test_duplicate_registration_conflict(client: AsyncClient):
    payload = {
        "email": "duplicate@example.com",
        "password": "SecurePassword123!",
        "first_name": "Bob",
        "last_name": "Jones",
        "organization_name": "First Org",
    }
    res1 = await client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Attempt second registration with same email
    res2 = await client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    err = res2.json()
    assert err["error"]["code"] == "RESOURCE_CONFLICT"


@pytest.mark.asyncio
async def test_user_login_flow(client: AsyncClient):
    # 1. Register user
    reg_payload = {
        "email": "login_test@example.com",
        "password": "CorrectPassword123!",
        "first_name": "Charlie",
        "last_name": "Brown",
        "organization_name": "Charlie Co",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201

    # 2. Login with correct credentials
    login_payload = {
        "email": "login_test@example.com",
        "password": "CorrectPassword123!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    access_token = token_data["access_token"]

    # 3. Test invalid password
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "login_test@example.com", "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401
    assert bad_login.json()["error"]["code"] == "AUTHENTICATION_FAILED"

    # 4. Fetch authenticated user profile
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "login_test@example.com"


@pytest.mark.asyncio
async def test_token_refresh_workflow(client: AsyncClient):
    reg_payload = {
        "email": "refresh_test@example.com",
        "password": "Password12345!",
        "first_name": "David",
        "last_name": "Miller",
        "organization_name": "Miller Corp",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    refresh_token = reg_res.json()["refresh_token"]

    refresh_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_two_factor_auth_flow(client: AsyncClient):
    reg_payload = {
        "email": "twofa_user@example.com",
        "password": "SecurePassword123!",
        "first_name": "Eve",
        "last_name": "Adams",
        "organization_name": "Security Org",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Setup 2FA
    setup_res = await client.post("/api/v1/auth/2fa/setup", headers=headers)
    assert setup_res.status_code == 200
    setup_data = setup_res.json()
    assert "secret" in setup_data
    assert "provisioning_uri" in setup_data

    # Verify 2FA
    verify_res = await client.post(
        "/api/v1/auth/2fa/verify",
        headers=headers,
        json={"code": "123456"},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verified"] is True


@pytest.mark.asyncio
async def test_organization_workspaces_and_audit_trail(client: AsyncClient):
    reg_payload = {
        "email": "org_lead@enterprise.com",
        "password": "EnterprisePass123!",
        "first_name": "Franklin",
        "last_name": "Roosevelt",
        "organization_name": "Enterprise Holdings",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 1. Create Workspace
    ws_res = await client.post(
        f"/api/v1/organizations/{org_id}/workspaces",
        headers=headers,
        json={"name": "European Region", "description": "EU sales & operations"},
    )
    assert ws_res.status_code == 201
    assert ws_res.json()["name"] == "European Region"

    # 2. List Workspaces
    ws_list_res = await client.get(
        f"/api/v1/organizations/{org_id}/workspaces",
        headers=headers,
    )
    assert ws_list_res.status_code == 200
    workspaces = ws_list_res.json()
    assert len(workspaces) >= 2  # Default + European Region

    # 3. Check Audit Logs
    audit_res = await client.get(
        f"/api/v1/organizations/{org_id}/audit-logs",
        headers=headers,
    )
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 2  # user:registered, workspace:created
    actions = [log["action"] for log in logs]
    assert "user:registered" in actions
    assert "workspace:created" in actions


@pytest.mark.asyncio
async def test_cross_tenant_isolation(client: AsyncClient):
    # Register Org A
    org_a_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user_a@tenant-a.com",
            "password": "PasswordA123!",
            "first_name": "User",
            "last_name": "A",
            "organization_name": "Tenant A Corp",
        },
    )
    token_a = org_a_res.json()["access_token"]

    # Register Org B
    org_b_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user_b@tenant-b.com",
            "password": "PasswordB123!",
            "first_name": "User",
            "last_name": "B",
            "organization_name": "Tenant B Corp",
        },
    )
    org_b_id = org_b_res.json()["active_organization_id"]

    # User A attempts to access Org B audit logs using Org A's token
    cross_access_res = await client.get(
        f"/api/v1/organizations/{org_b_id}/audit-logs",
        headers={
            "Authorization": f"Bearer {token_a}",
            "X-Organization-ID": org_b_id,
        },
    )
    # Must be forbidden or unauthorized
    assert cross_access_res.status_code in [403, 404]
