from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai,
    analytics,
    auth,
    commerce,
    communication,
    companies,
    customers,
    developer,
    events,
    finance,
    health,
    inventory,
    marketing,
    observability,
    organizations,
    pricing,
    projects,
    roles,
    sales,
    support,
    workflows,
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
api_router.include_router(pricing.router, prefix="/pricing", tags=["B2B Tiered Pricing"])

# Inventory & Fulfillment
api_router.include_router(inventory.router, prefix="/inventory", tags=["Inventory & Fulfillment"])

# Marketing Automation
api_router.include_router(marketing.router, prefix="/marketing", tags=["Marketing & Campaigns"])

# Customer Support & Success
api_router.include_router(support.router, prefix="/support", tags=["Customer Support & Success"])

# Finance & Projects
api_router.include_router(finance.router, prefix="/finance", tags=["Finance & Invoicing"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects & Time Tracking"])

# Workflow Automation
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflow Automation"])

# Unified Communication & Real-time Chat
api_router.include_router(
    communication.router, prefix="/communication", tags=["Communication & Collaboration"]
)

# Analytics & Business Intelligence
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & BI Engine"])

# AI & Machine Learning Platform
api_router.include_router(ai.router, prefix="/ai", tags=["AI & Machine Learning Platform"])

# Event-Driven Architecture & Transactional Outbox
api_router.include_router(
    events.router, prefix="/events", tags=["Event-Driven Architecture & Outbox"]
)

# Developer Platform, API Keys & HMAC Webhooks
api_router.include_router(
    developer.router, prefix="/developer", tags=["Developer Platform & Webhooks"]
)

# Observability & Enterprise Audit Vault
api_router.include_router(
    observability.router, prefix="/observability", tags=["Observability & Audit Vault"]
)

# Supply Chain, Multi-Level BOM & Freight
from app.api.v1.api_supply_chain import router as supply_chain_router
api_router.include_router(supply_chain_router)

# General Ledger & Double-Entry Accounting
from app.api.v1.api_ledger import router as ledger_router
api_router.include_router(ledger_router)

# Fraud Prevention & Return Logistics
from app.api.v1.api_fraud import router as fraud_router
api_router.include_router(fraud_router)

