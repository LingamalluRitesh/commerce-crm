import uuid

from sqlalchemy import (
    JSON,
    Boolean,
    Float,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import GUID, TenantBaseModel


class DocumentEmbedding(TenantBaseModel):
    __tablename__ = "document_embeddings"

    entity_type: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )  # KnowledgeArticle, Customer, Ticket, Deal
    entity_id: Mapped[uuid.UUID] = mapped_column(GUID(), index=True, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(JSON, nullable=False)  # Vector representation
    embedding_model: Mapped[str] = mapped_column(
        String(100), default="text-embedding-3-small", nullable=False
    )


class LeadScoringModel(TenantBaseModel):
    __tablename__ = "lead_scoring_models"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(20), default="1.0.0", nullable=False)
    weights: Mapped[dict] = mapped_column(
        JSON, nullable=False
    )  # e.g. {"title_seniority": 25, "company_size": 25, "engagement": 30, "budget": 20}
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class AIInteractionSummary(TenantBaseModel):
    __tablename__ = "ai_interaction_summaries"

    entity_type: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )  # Customer, Ticket, Deal
    entity_id: Mapped[uuid.UUID] = mapped_column(GUID(), index=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    sentiment: Mapped[str] = mapped_column(
        String(20), default="neutral", nullable=False
    )  # positive, neutral, negative
    sentiment_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    key_action_items: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
