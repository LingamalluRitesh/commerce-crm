import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.workflow import (
    WorkflowCreateRequest,
    WorkflowExecuteRequest,
    WorkflowExecutionResponse,
    WorkflowResponse,
)
from app.application.services.workflow import WorkflowService
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


@router.get("", response_model=list[WorkflowResponse])
async def list_workflows(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("workflow:read")),
) -> list[WorkflowResponse]:
    """List automated workflows."""
    return await WorkflowService.list_workflows(db=db, tenant_id=tenant_id)


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    data: WorkflowCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("workflow:write")),
) -> WorkflowResponse:
    """Design and register an automated event/action workflow."""
    return await WorkflowService.create_workflow(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("workflow:read")),
) -> WorkflowResponse:
    """Get single workflow definition and node sequence."""
    return await WorkflowService.get_workflow(db=db, tenant_id=tenant_id, workflow_id=workflow_id)


@router.post("/{workflow_id}/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    workflow_id: uuid.UUID,
    data: WorkflowExecuteRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("workflow:write")),
) -> WorkflowExecutionResponse:
    """Manually invoke or test run workflow execution."""
    return await WorkflowService.execute_workflow(
        db=db,
        tenant_id=tenant_id,
        workflow_id=workflow_id,
        payload=data.payload,
    )


@router.get("/{workflow_id}/executions", response_model=list[WorkflowExecutionResponse])
async def list_executions(
    workflow_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("workflow:read")),
) -> list[WorkflowExecutionResponse]:
    """List execution history and step logs for a workflow."""
    return await WorkflowService.list_executions(
        db=db, tenant_id=tenant_id, workflow_id=workflow_id
    )
