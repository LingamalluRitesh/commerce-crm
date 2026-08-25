import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class DocumentIndexRequest(BaseModel):
    entity_type: str = Field(..., description="KnowledgeArticle, Customer, Ticket, Deal")
    entity_id: uuid.UUID
    content: str = Field(..., min_length=1)


class DocumentEmbeddingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    chunk_index: int
    content: str
    embedding_model: str
    created_at: datetime


class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    entity_type: str | None = None
    top_k: int = Field(default=5, ge=1, le=50)


class SemanticSearchResult(BaseModel):
    id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    content: str
    similarity_score: float


class LeadPropensityResponse(BaseModel):
    lead_id: uuid.UUID
    propensity_score: int = Field(..., ge=0, le=100)
    category: str = Field(..., description="Hot, Warm, Cold")
    factors: dict[str, int]
    recommended_actions: list[str]


class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1)
    entity_type: str = "Customer"
    entity_id: uuid.UUID | None = None


class TextAnalysisResponse(BaseModel):
    summary: str
    sentiment: str  # positive, neutral, negative
    sentiment_score: float  # -1.0 to 1.0
    key_action_items: list[str]
    detected_topics: list[str]


class DealSuggestionResponse(BaseModel):
    deal_id: uuid.UUID
    deal_name: str
    deal_value: Decimal
    stage_name: str
    win_probability_percent: int
    suggested_actions: list[str]
