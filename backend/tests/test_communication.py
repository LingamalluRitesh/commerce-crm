import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_complete_communication_and_chat_lifecycle(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "slack_lead@collaborate.com",
            "password": "ChatPassword123!",
            "first_name": "Stewart",
            "last_name": "Butterfield",
            "organization_name": "Collaborative OS Corp",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # Get User profile
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    user_id = me_res.json()["id"]

    # 2. Send Targeted Notification
    notif_res = await client.post(
        "/api/v1/communication/notifications",
        headers=headers,
        json={
            "user_id": user_id,
            "type": "deal",
            "title": "Enterprise Deal Closed Won!",
            "body": "Congratulations! The $100,000 ARR deal with Stark Industries has been signed.",
            "action_url": "/deals/stark-deal",
        },
    )
    assert notif_res.status_code == 201
    notif = notif_res.json()
    notif_id = notif["id"]
    assert notif["is_read"] is False

    # 3. Check Unread Notifications
    unread_res = await client.get(
        "/api/v1/communication/notifications?unread_only=true", headers=headers
    )
    assert unread_res.status_code == 200
    assert len(unread_res.json()) == 1

    # Mark Notification as Read
    read_res = await client.patch(
        f"/api/v1/communication/notifications/{notif_id}/read", headers=headers
    )
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # 4. Create Chat Channel
    chan_res = await client.post(
        "/api/v1/communication/channels",
        headers=headers,
        json={
            "name": "general-announcements",
            "type": "team",
            "is_private": False,
        },
    )
    assert chan_res.status_code == 201
    channel = chan_res.json()
    channel_id = channel["id"]
    assert channel["name"] == "general-announcements"
    assert len(channel["members"]) == 1

    # 5. Post Chat Message to Channel
    msg_res = await client.post(
        f"/api/v1/communication/channels/{channel_id}/messages",
        headers=headers,
        json={
            "content": "All hands company meeting starting in 15 minutes!",
            "attachments": [{"file_name": "agenda.pdf", "size_bytes": 102400}],
        },
    )
    assert msg_res.status_code == 201
    msg = msg_res.json()
    assert msg["content"] == "All hands company meeting starting in 15 minutes!"

    # 6. Fetch Message History
    hist_res = await client.get(
        f"/api/v1/communication/channels/{channel_id}/messages", headers=headers
    )
    assert hist_res.status_code == 200
    messages = hist_res.json()
    assert len(messages) == 1
    assert messages[0]["content"] == "All hands company meeting starting in 15 minutes!"
