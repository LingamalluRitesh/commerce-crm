# Database Schema & Entity Relationship Guide

## 1. Core Schema Principles

1. **UUID Primary Keys**: All tables use v4 UUIDs for primary keys to prevent enumeration attacks and support distributed ID generation.
2. **Standard Audit Timestamps**: `created_at` (TIMESTAMPTZ default NOW()) and `updated_at` (TIMESTAMPTZ auto-updating).
3. **Tenant Scoping**: `tenant_id` (UUID foreign key referencing `organizations.id`, indexed) on all tenant-owned entities.
4. **Monetary Precision**: All monetary quantities stored as `NUMERIC(14, 4)` or `DECIMAL` alongside a 3-letter currency code (e.g. `USD`, `EUR`). Never use floating-point numbers.
5. **Soft Deletion**: Applied only where audit compliance or recovery is required (`deleted_at: Optional[TIMESTAMPTZ]`).

---

## 2. Core Entities & Relationships

```
+------------------+         +------------------+         +------------------+
|   Organization   | 1 --- * |    Membership    | * --- 1 |       User       |
+------------------+         +------------------+         +------------------+
        |                            |
        | 1                          | *
        |                            v
        | *                  +------------------+
        +------------------> |       Role       |
                             +------------------+
                                     | *
                                     v
                             +------------------+
                             |    Permission    |
                             +------------------+

+------------------+         +------------------+         +------------------+
|     Customer     | 1 --- * |     Contact      |         |     Company      |
+------------------+         +------------------+         +------------------+
        | 1                          |                             |
        |                            +--------------+--------------+
        |                                           |
        | 1                                         v
        +-----------------------------------> +------------------+
        |                                     |   Interaction    |
        |                                     +------------------+
        |
        | 1 --- * +------------------+
        +-------> |       Deal       |
        |         +------------------+
        |
        | 1 --- * +------------------+ 1 --- * +------------------+
        +-------> |      Order       | ------> |    OrderItem     |
        |         +------------------+         +------------------+
        |                  | 1
        |                  v *
        |         +------------------+
        |         |     Payment      |
        |         +------------------+
        |
        | 1 --- * +------------------+
        +-------> |      Ticket      |
                  +------------------+
```

---

## 3. Key Table Definitions

### Identity & Organizations
- `users`: `id`, `email` (unique), `hashed_password`, `first_name`, `last_name`, `is_active`, `is_verified`, `two_factor_secret`, `created_at`, `updated_at`
- `organizations`: `id`, `name`, `slug` (unique), `plan_tier`, `created_at`, `updated_at`
- `workspaces`: `id`, `tenant_id`, `name`, `slug`, `created_at`, `updated_at`
- `memberships`: `id`, `tenant_id`, `user_id`, `role_id`, `status`, `created_at`, `updated_at`
- `roles`: `id`, `tenant_id`, `name`, `description`, `is_system`, `created_at`, `updated_at`
- `permissions`: `id`, `code` (e.g. `customer:read`), `module`, `description`
- `role_permissions`: `role_id`, `permission_id`
- `audit_logs`: `id`, `tenant_id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values` (JSONB), `new_values` (JSONB), `ip_address`, `user_agent`, `created_at`
