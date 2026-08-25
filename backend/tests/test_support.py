import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_complete_support_and_success_lifecycle(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "head_of_support@delightful.com",
            "password": "SupportPassword123!",
            "first_name": "Tony",
            "last_name": "Hsieh",
            "organization_name": "Delightful Customer OS",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Create Customer
    cust_res = await client.post(
        "/api/v1/customers",
        headers=headers,
        json={
            "first_name": "Reed",
            "last_name": "Hastings",
            "email": "reed@netflix-hq.com",
            "status": "active",
        },
    )
    assert cust_res.status_code == 201
    cust_id = cust_res.json()["id"]

    # 3. Submit Urgent Support Ticket
    ticket_res = await client.post(
        "/api/v1/support/tickets",
        headers=headers,
        json={
            "customer_id": cust_id,
            "subject": "Production API Latency Spike",
            "description": "API responses taking > 2000ms on us-east-1 cluster.",
            "priority": "urgent",
            "channel": "chat",
        },
    )
    assert ticket_res.status_code == 201
    ticket = ticket_res.json()
    ticket_id = ticket["id"]
    assert ticket["status"] == "open"
    assert ticket["priority"] == "urgent"
    assert ticket["sla_deadline"] is not None

    # 4. Add Internal Note and Agent Reply
    note_res = await client.post(
        f"/api/v1/support/tickets/{ticket_id}/comments",
        headers=headers,
        json={
            "content": "Investigating RDS query plan degradation.",
            "is_internal_note": True,
        },
    )
    assert note_res.status_code == 200
    assert len(note_res.json()["comments"]) == 1

    reply_res = await client.post(
        f"/api/v1/support/tickets/{ticket_id}/comments",
        headers=headers,
        json={
            "content": "We identified an index cache eviction and deployed a hotfix.",
            "is_internal_note": False,
        },
    )
    assert reply_res.status_code == 200
    assert reply_res.json()["status"] == "pending"
    assert len(reply_res.json()["comments"]) == 2

    # 5. Resolve Ticket with 5-Star CSAT Feedback
    resolve_res = await client.post(
        f"/api/v1/support/tickets/{ticket_id}/resolve",
        headers=headers,
        json={
            "satisfaction_score": 5,
            "resolution_note": "Issue resolved with database parameter tuning.",
        },
    )
    assert resolve_res.status_code == 200
    res_ticket = resolve_res.json()
    assert res_ticket["status"] == "resolved"
    assert res_ticket["satisfaction_score"] == 5

    # 6. Publish Knowledge Base Article
    kb_res = await client.post(
        "/api/v1/support/articles",
        headers=headers,
        json={
            "title": "Optimizing High-Throughput API Query Cache",
            "content": (
                "Step by step guide to configure connection pooling "
                "and query result caching."
            ),
            "is_published": True,
        },
    )
    assert kb_res.status_code == 201
    kb_slug = kb_res.json()["slug"]

    # Fetch Article by Slug
    read_res = await client.get(
        f"/api/v1/support/articles/{kb_slug}", headers=headers
    )
    assert read_res.status_code == 200
    assert read_res.json()["view_count"] == 1

    # 7. Customer Success Plan with Milestones
    plan_res = await client.post(
        "/api/v1/support/success-plans",
        headers=headers,
        json={
            "customer_id": cust_id,
            "name": "Enterprise Migration & Onboarding",
            "target_outcome": "Seamless cutover of 10M monthly active subscribers.",
            "milestones": [
                {"title": "Initial Data Sync & Schema Mapping"},
                {"title": "Load Testing at 50,000 req/sec"},
            ],
        },
    )
    assert plan_res.status_code == 201
    plan = plan_res.json()
    assert plan["progress_percentage"] == 0
    assert len(plan["milestones"]) == 2

    m1_id = plan["milestones"][0]["id"]
    m2_id = plan["milestones"][1]["id"]

    # Complete Milestone 1 -> 50% progress
    m1_res = await client.post(
        f"/api/v1/support/success-plans/milestones/{m1_id}/complete", headers=headers
    )
    assert m1_res.status_code == 200
    assert m1_res.json()["progress_percentage"] == 50
    assert m1_res.json()["status"] == "active"

    # Complete Milestone 2 -> 100% progress & plan completed
    m2_res = await client.post(
        f"/api/v1/support/success-plans/milestones/{m2_id}/complete", headers=headers
    )
    assert m2_res.status_code == 200
    assert m2_res.json()["progress_percentage"] == 100
    assert m2_res.json()["status"] == "completed"
