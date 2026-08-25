import hashlib
import math
import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.ai import (
    DealSuggestionResponse,
    DocumentEmbeddingResponse,
    DocumentIndexRequest,
    LeadPropensityResponse,
    SemanticSearchRequest,
    SemanticSearchResult,
    TextAnalysisRequest,
    TextAnalysisResponse,
)
from app.core.errors import NotFoundError
from app.infrastructure.models.ai import DocumentEmbedding
from app.infrastructure.models.sales import Deal, Lead, PipelineStage

VECTOR_DIM = 64


def _embed_text(text: str) -> list[float]:
    """Generate normalized deterministic vector representation of text."""
    vec = [0.0] * VECTOR_DIM
    words = text.lower().split()
    if not words:
        return vec

    for word in words:
        # Hash word to vector index
        h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
        idx = h % VECTOR_DIM
        weight = 1.0 + (len(word) / 10.0)
        vec[idx] += weight

    # L2 Normalization
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec


def _cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    dot = sum(a * b for a, b in zip(vec1, vec2, strict=False))
    return float(dot)


class AIService:
    @staticmethod
    async def index_document(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        data: DocumentIndexRequest,
    ) -> DocumentEmbeddingResponse:
        vector = _embed_text(data.content)
        doc = DocumentEmbedding(
            tenant_id=tenant_id,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            chunk_index=0,
            content=data.content.strip(),
            embedding=vector,
            embedding_model="dense-embed-v1",
        )
        db.add(doc)
        await db.flush()
        return DocumentEmbeddingResponse.model_validate(doc)

    @staticmethod
    async def semantic_search(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        data: SemanticSearchRequest,
    ) -> list[SemanticSearchResult]:
        query_vec = _embed_text(data.query)

        stmt = select(DocumentEmbedding).where(DocumentEmbedding.tenant_id == tenant_id)
        if data.entity_type:
            stmt = stmt.where(DocumentEmbedding.entity_type == data.entity_type)

        res = await db.execute(stmt)
        docs = res.scalars().all()

        scored = []
        for doc in docs:
            sim = _cosine_similarity(query_vec, doc.embedding)
            scored.append(
                SemanticSearchResult(
                    id=doc.id,
                    entity_type=doc.entity_type,
                    entity_id=doc.entity_id,
                    content=doc.content,
                    similarity_score=round(sim, 4),
                )
            )

        scored.sort(key=lambda x: x.similarity_score, reverse=True)
        return scored[: data.top_k]

    @staticmethod
    async def calculate_lead_propensity(
        db: AsyncSession, tenant_id: uuid.UUID, lead_id: uuid.UUID
    ) -> LeadPropensityResponse:
        res = await db.execute(select(Lead).where(Lead.id == lead_id, Lead.tenant_id == tenant_id))
        lead = res.scalar_one_or_none()
        if not lead:
            raise NotFoundError("Lead", lead_id)

        factors = {
            "title_seniority": 0,
            "company_relevance": 0,
            "score_heuristic": min(40, int(lead.score * 0.4)),
            "budget_intent": 0,
        }

        title_lower = (lead.title or "").lower()
        if any(t in title_lower for t in ["vp", "director", "head", "chief", "cxo", "cto", "ceo"]):
            factors["title_seniority"] = 25
        elif any(t in title_lower for t in ["manager", "lead"]):
            factors["title_seniority"] = 15

        if lead.company_name:
            factors["company_relevance"] = 20

        if lead.estimated_budget and lead.estimated_budget > Decimal("10000.00"):
            factors["budget_intent"] = 15

        total_score = sum(factors.values())
        total_score = min(100, max(0, total_score))

        if total_score >= 70:
            cat = "Hot"
            actions = ["Schedule immediate technical demo", "Assign Senior Account Executive"]
        elif total_score >= 40:
            cat = "Warm"
            actions = ["Send product overview whitepaper", "Enroll in nurture email sequence"]
        else:
            cat = "Cold"
            actions = ["Keep in general marketing newsletter list"]

        return LeadPropensityResponse(
            lead_id=lead.id,
            propensity_score=total_score,
            category=cat,
            factors=factors,
            recommended_actions=actions,
        )

    @staticmethod
    def analyze_text(data: TextAnalysisRequest) -> TextAnalysisResponse:
        text = data.text.strip()
        words = text.lower().split()

        # Sentiment Lexicon Scoring
        pos_words = {
            "great",
            "excellent",
            "love",
            "amazing",
            "resolved",
            "fast",
            "thanks",
            "perfect",
            "good",
        }
        neg_words = {
            "terrible",
            "bad",
            "slow",
            "broken",
            "issue",
            "crash",
            "error",
            "horrible",
            "delay",
            "bug",
        }

        pos_count = sum(1 for w in words if w in pos_words)
        neg_count = sum(1 for w in words if w in neg_words)

        if pos_count > neg_count:
            sentiment = "positive"
            score = min(1.0, 0.3 + (pos_count * 0.2))
        elif neg_count > pos_count:
            sentiment = "negative"
            score = max(-1.0, -0.3 - (neg_count * 0.2))
        else:
            sentiment = "neutral"
            score = 0.0

        # Action Items extraction
        action_items = []
        action_keywords = ["need", "please", "will", "todo", "follow up", "fix", "deploy"]
        for sentence in text.split("."):
            s_clean = sentence.strip()
            if any(k in s_clean.lower() for k in action_keywords):
                if len(s_clean) > 5:
                    action_items.append(s_clean)

        summary = f"Summary: Extracted {len(words)} tokens with {sentiment} sentiment polarity."

        return TextAnalysisResponse(
            summary=summary,
            sentiment=sentiment,
            sentiment_score=round(score, 2),
            key_action_items=action_items or ["Review logged communication transcript"],
            detected_topics=["Customer Support", "System Operations"],
        )

    @staticmethod
    async def suggest_deal_next_steps(
        db: AsyncSession, tenant_id: uuid.UUID, deal_id: uuid.UUID
    ) -> DealSuggestionResponse:
        res = await db.execute(
            select(Deal, PipelineStage)
            .join(PipelineStage, PipelineStage.id == Deal.stage_id)
            .where(Deal.id == deal_id, Deal.tenant_id == tenant_id)
        )
        row = res.one_or_none()
        if not row:
            raise NotFoundError("Deal", deal_id)

        deal, stage = row

        actions = [
            f"Current Stage: {stage.name} ({stage.probability}% probability)",
            "Send follow-up commercial quote proposal",
            "Engage executive sponsor for security review approval",
        ]

        return DealSuggestionResponse(
            deal_id=deal.id,
            deal_name=deal.name,
            deal_value=deal.value,
            stage_name=stage.name,
            win_probability_percent=stage.probability,
            suggested_actions=actions,
        )
