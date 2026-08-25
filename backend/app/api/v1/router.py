from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    companies,
    customers,
    health,
    organizations,
    roles,
)

api_router = APIRouter()

# Core diagnostic endpoints
api_router.include_router(health.router, tags=["Health & Diagnostics"])

# Identity, Multi-Tenancy & Access Control
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Identity"])
api_router.include_router(
    organizations.router, prefix="/organizations", tags=["Organizations & Workspaces"]
)
api_router.include_router(roles.router, prefix="/roles", tags=["RBAC & Permissions"])

# Customer 360 & Accounts
api_router.include_router(customers.router, prefix="/customers", tags=["Customer 360"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies & Accounts"])
