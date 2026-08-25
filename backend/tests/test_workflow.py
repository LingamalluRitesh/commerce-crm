import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_workflow_engine_execution(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "automation_lead@zapier-scale.com",
            "password": "WorkflowPassword123!",
            "first_name": "Sam",
            "last_name": "Altman",
            "organization_name": "Open Automation Inc",
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
            "first_name": "Peter",
            "last_name": "Thiel",
            "email": "peter@founders-fund.com",
            "status": "active",
        },
    )
    assert cust_res.status_code == 201
    cust_id = cust_res.json()["id"]
    # Set initial health score = 80
    await client.patch(f"/api/v1/customers/{cust_id}", headers=headers, json={"health_score": 80})

    # 3. Create Automated Workflow (VIP Upgrade: condition value >= 500 -> update health score +10)
    wf_res = await client.post(
        "/api/v1/workflows",
        headers=headers,
        json={
            "name": "High Value Order Reactor",
            "trigger_type": "event",
            "trigger_config": {"event_type": "order.paid.v1"},
            "nodes": [
                {
                    "node_type": "condition",
                    "name": "Check Order Amount >= $500",
                    "config": {"field": "amount", "operator": ">=", "value": 500},
                    "order_index": 0,
                },
                {
                    "node_type": "action",
                    "name": "Boost Customer Health Score +10",
                    "config": {"action": "update_health_score", "score_delta": 10},
                    "order_index": 1,
                },
                {
                    "node_type": "action",
                    "name": "Send VIP Slack Alert",
                    "config": {"action": "send_notification", "template": "VIP_ORDER_ALERT"},
                    "order_index": 2,
                },
            ],
        },
    )
    assert wf_res.status_code == 201
    wf = wf_res.json()
    wf_id = wf["id"]
    assert len(wf["nodes"]) == 3

    # 4. Test Execution with Passing Condition (amount = 1500)
    exec_res = await client.post(
        f"/api/v1/workflows/{wf_id}/execute",
        headers=headers,
        json={"payload": {"amount": 1500, "customer_id": cust_id}},
    )
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["status"] == "completed"
    assert len(exec_data["step_logs"]) == 3
    assert exec_data["step_logs"][0]["condition_passed"] is True

    # Verify Customer Health score increased from 80 to 90
    cust_check = await client.get(f"/api/v1/customers/{cust_id}", headers=headers)
    assert cust_check.json()["customer"]["health_score"] == 90

    # 5. Test Execution with Failing Condition (amount = 100) -> halts at step 1
    fail_exec_res = await client.post(
        f"/api/v1/workflows/{wf_id}/execute",
        headers=headers,
        json={"payload": {"amount": 100, "customer_id": cust_id}},
    )
    assert fail_exec_res.status_code == 200
    fail_data = fail_exec_res.json()
    assert fail_data["status"] == "completed"
    assert len(fail_data["step_logs"]) == 1
    assert fail_data["step_logs"][0]["condition_passed"] is False

    # 6. Check Execution History
    hist_res = await client.get(f"/api/v1/workflows/{wf_id}/executions", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) == 2
