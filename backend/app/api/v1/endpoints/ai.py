import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    require_permission,
)
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
from app.application.services.ai import AIService
from app.core.database import get_db

router = APIRouter()


@router.post(
    "/embeddings/index",
    response_model=DocumentEmbeddingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def index_document(
    data: DocumentIndexRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> DocumentEmbeddingResponse:
    """Index content into dense vector embeddings for semantic search."""
    return await AIService.index_document(db=db, tenant_id=tenant_id, data=data)


@router.post("/search", response_model=list[SemanticSearchResult])
async def semantic_search(
    data: SemanticSearchRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:read")),
) -> list[SemanticSearchResult]:
    """Execute cosine similarity vector search across knowledge base and domain data."""
    return await AIService.semantic_search(db=db, tenant_id=tenant_id, data=data)


@router.get("/leads/{lead_id}/propensity", response_model=LeadPropensityResponse)
async def get_lead_propensity(
    lead_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("lead:read")),
) -> LeadPropensityResponse:
    """Compute ML propensity score and conversion probability for a sales lead."""
    return await AIService.calculate_lead_propensity(db=db, tenant_id=tenant_id, lead_id=lead_id)


@router.post("/analyze-text", response_model=TextAnalysisResponse)
async def analyze_text(
    data: TextAnalysisRequest,
    _: bool = Depends(require_permission("user:read")),
) -> TextAnalysisResponse:
    """Analyze customer interaction text for sentiment, key action items, and summary."""
    return AIService.analyze_text(data=data)


@router.get("/deals/{deal_id}/suggestions", response_model=DealSuggestionResponse)
async def get_deal_suggestions(
    deal_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("deal:read")),
) -> DealSuggestionResponse:
    """Generate AI copilot next steps and win probability analysis for a deal."""
    return await AIService.suggest_deal_next_steps(db=db, tenant_id=tenant_id, deal_id=deal_id)
