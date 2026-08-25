import uuid

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ai_vector_search_and_intelligence(client: AsyncClient):
    # 1. Register organization & user
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "ai_researcher@deepmind-crm.com",
            "password": "AiIntelligence123!",
            "first_name": "Demis",
            "last_name": "Hassabis",
            "organization_name": "DeepMind Commerce OS",
        },
    )
    token = reg_res.json()["access_token"]
    org_id = reg_res.json()["active_organization_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Organization-ID": org_id,
    }

    # 2. Index 2 Documents into Vector Store
    doc1_id = uuid.uuid4()
    doc2_id = uuid.uuid4()

    idx1_res = await client.post(
        "/api/v1/ai/embeddings/index",
        headers=headers,
        json={
            "entity_type": "KnowledgeArticle",
            "entity_id": str(doc1_id),
            "content": (
                "PostgreSQL connection pooling configuration " "and pgvector query indexing guide."
            ),
        },
    )
    assert idx1_res.status_code == 201

    idx2_res = await client.post(
        "/api/v1/ai/embeddings/index",
        headers=headers,
        json={
            "entity_type": "KnowledgeArticle",
            "entity_id": str(doc2_id),
            "content": "Return merchandise authorization and customer refund processing policies.",
        },
    )
    assert idx2_res.status_code == 201

    # 3. Perform Vector Semantic Search
    search_res = await client.post(
        "/api/v1/ai/search",
        headers=headers,
        json={"query": "database connection pool postgres indexing", "top_k": 2},
    )
    assert search_res.status_code == 200
    results = search_res.json()
    assert len(results) == 2
    # Verify the database document ranked top with highest similarity
    assert results[0]["entity_id"] == str(doc1_id)
    assert results[0]["similarity_score"] > results[1]["similarity_score"]

    # 4. Lead Propensity Scoring
    lead_res = await client.post(
        "/api/v1/sales/leads",
        headers=headers,
        json={
            "first_name": "Marc",
            "last_name": "Benioff",
            "email": "marc@salesforce-hq.com",
            "company_name": "Salesforce Corp",
            "title": "Chief Executive Officer",
            "estimated_budget": 50000.00,
        },
    )
    lead_id = lead_res.json()["id"]

    prop_res = await client.get(f"/api/v1/ai/leads/{lead_id}/propensity", headers=headers)
    assert prop_res.status_code == 200
    prop_data = prop_res.json()
    assert prop_data["category"] == "Hot"
    assert prop_data["propensity_score"] >= 70
    assert len(prop_data["recommended_actions"]) >= 1

    # 5. NLP Sentiment & Action Items Extraction
    analysis_res = await client.post(
        "/api/v1/ai/analyze-text",
        headers=headers,
        json={
            "text": (
                "The new CRM deployment is great and perfectly resolved our latency! "
                "Please follow up next Monday to review security logs."
            ),
        },
    )
    assert analysis_res.status_code == 200
    nlp_data = analysis_res.json()
    assert nlp_data["sentiment"] == "positive"
    assert nlp_data["sentiment_score"] > 0
    assert len(nlp_data["key_action_items"]) >= 1
