# Multi-Tenancy and Security Architecture

## 1. Multi-Tenancy Strategy

CommerceCRM enforces **Row-Level Logical Isolation** across all organizational entities within a unified PostgreSQL database, reinforced by tenant context middleware and repository-level scoping.

### 1.1 Tenant Hierarchy

```text
Organization (Tenant Root)
├── Workspace (Default / Custom)
│   ├── Team (e.g. Sales, Enterprise Support, Ops)
│   │   └── Members (Users with assigned Roles)
│   ├── Customers & Contacts
│   ├── Deals & Pipelines
│   ├── Products & Orders
│   └── Workflows & Automations
```

### 1.2 Isolation Mechanisms

1. **Explicit Foreign Key Enforcement**:
   All tenant-owned models inherit from `TenantBaseModel` containing `tenant_id: UUID` (referencing `organizations.id`).

2. **Middleware Context Injection**:
   Every incoming HTTP request resolves the authenticated user and their active `organization_id` (via JWT claims or `X-Organization-Id` header for multi-org users). This is stored in Python's async-safe `contextvars`.

3. **Repository Guardrails**:
   All database repository queries automatically apply `.where(Model.tenant_id == current_tenant_id)`. Bypassing this filter is explicitly forbidden in application use cases.

4. **Cross-Tenant Prevention**:
   IDOR (Insecure Direct Object Reference) vulnerabilities are prevented because fetching any entity by ID always combines the entity UUID with the `tenant_id`.

---

## 2. Authentication & Authorization Model

### 2.1 Role-Based Access Control (RBAC) & Granular Permissions

Permissions are modeled as `resource:action` strings (e.g., `customer:read`, `customer:write`, `deal:delete`, `settings:manage`).

Roles are collections of permissions:
- `Owner`: Full administrative access over the organization, billing, and membership.
- `Admin`: Full operational access across all domain modules.
- `Sales Representative`: Read/Write access to Leads, Contacts, Deals, Activities.
- `Support Agent`: Read/Write access to Tickets, Knowledge Articles, Customer 360 view.
- `Warehouse Manager`: Read/Write access to Inventory, Stock Movements, Fulfillment.
- `Viewer`: Read-only access to specific permitted modules.

### 2.2 Token Lifecycle
- **Access Token**: Short-lived (15 minutes) signed JWT containing user ID, active tenant ID, roles, and permissions.
- **Refresh Token**: Long-lived (7 days) cryptographically random string stored in Redis/DB with automatic rotation and replay detection.
