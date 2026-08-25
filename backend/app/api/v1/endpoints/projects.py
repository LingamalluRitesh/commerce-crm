import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.finance import (
    ProjectCreateRequest,
    ProjectResponse,
    ProjectTaskCreateRequest,
    ProjectTaskResponse,
    TimeEntryCreateRequest,
    TimeEntryResponse,
)
from app.application.services.finance import ProjectService
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


@router.get("", response_model=list[ProjectResponse])
async def list_projects(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("project:read")),
) -> list[ProjectResponse]:
    """List all projects and budget tracking."""
    return await ProjectService.list_projects(db=db, tenant_id=tenant_id)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("project:write")),
) -> ProjectResponse:
    """Create a client project with budget."""
    return await ProjectService.create_project(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post(
    "/{project_id}/tasks",
    response_model=ProjectTaskResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_task(
    project_id: uuid.UUID,
    data: ProjectTaskCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("project:write")),
) -> ProjectTaskResponse:
    """Add a task to a project."""
    return await ProjectService.create_task(
        db=db,
        tenant_id=tenant_id,
        project_id=project_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post("/time-entries", response_model=TimeEntryResponse, status_code=status.HTTP_201_CREATED)
async def log_time_entry(
    data: TimeEntryCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("project:write")),
) -> TimeEntryResponse:
    """Log billable hours against project/task and increment budget spent."""
    return await ProjectService.log_time(
        db=db,
        tenant_id=tenant_id,
        user_id=current_user.id,
        data=data,
    )
