from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, organizations, roles

api_router = APIRouter()

# Core diagnostic endpoints
api_router.include_router(health.router, tags=["Health & Diagnostics"])

# Identity, Multi-Tenancy & Access Control
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Identity"])
api_router.include_router(
    organizations.router, prefix="/organizations", tags=["Organizations & Workspaces"]
)
api_router.include_router(roles.router, prefix="/roles", tags=["RBAC & Permissions"])
