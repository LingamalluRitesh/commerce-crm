# ADR-0002: Multi-Tenancy Data Isolation Strategy

## Status
Accepted

## Context
CommerceCRM is a multi-tenant SaaS application where multiple organizations share computing and storage infrastructure. Complete data isolation between tenants is a non-negotiable security requirement.

## Decision
We adopt **Row-Level Logical Isolation** using a shared PostgreSQL database:
1. Every organization-scoped database table includes an indexed `tenant_id: UUID` column referencing `organizations.id`.
2. Middleware injects `tenant_id` into async execution context (`contextvars`).
3. Repository queries automatically apply tenant filtering (`WHERE tenant_id = :tenant_id`).
4. Cross-tenant access is forbidden at the application service layer.

## Consequences
- **Positive**: Cost-efficient infrastructure utilization, simplified cross-tenant analytics (for platform superadmins), fast tenant provisioning, easy schema migrations.
- **Negative**: Requires strict repository abstraction and automated security tests to prevent accidental omission of tenant filters.
