from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    commerce,
    companies,
    customers,
    health,
    inventory,
    marketing,
    organizations,
    roles,
    sales,
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

# Sales Pipelines & CRM
api_router.include_router(sales.router, prefix="/sales", tags=["Sales Pipeline & CRM"])

# Commerce, Catalog & Orders
api_router.include_router(commerce.router, prefix="/commerce", tags=["Commerce & Orders"])

# Inventory & Fulfillment
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory & Fulfillment"])

# Marketing Automation
api_router.include_router(marketing.router, prefix="/marketing", tags=["Marketing & Campaigns"])
