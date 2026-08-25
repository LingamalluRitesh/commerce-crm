import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.models.identity import Membership, Permission, Role, role_permissions

DEFAULT_PERMISSIONS = [
    # Identity & Org
    ("org:read", "organization", "View organization settings and details"),
    ("org:write", "organization", "Update organization settings and details"),
    ("user:read", "identity", "View users and memberships"),
    ("user:invite", "identity", "Invite new users to organization"),
    ("role:manage", "identity", "Create and modify roles and permissions"),
    ("audit:read", "security", "View security and change audit logs"),
    # Customers
    ("customer:read", "customers", "View customer profiles and timeline"),
    ("customer:write", "customers", "Create and update customers"),
    ("customer:delete", "customers", "Delete customer records"),
    # Sales
    ("lead:read", "sales", "View leads and lead scores"),
    ("lead:write", "sales", "Create, update, and convert leads"),
    ("deal:read", "sales", "View pipeline deals and stages"),
    ("deal:write", "sales", "Create, update, and close deals"),
    # Commerce & Orders
    ("product:read", "commerce", "View catalog products and prices"),
    ("product:write", "commerce", "Create and update products"),
    ("order:read", "commerce", "View customer orders and payments"),
    ("order:write", "commerce", "Create orders and update state"),
    # Inventory
    ("inventory:read", "inventory", "View stock levels and warehouses"),
    ("inventory:write", "inventory", "Adjust stock, create POs and transfers"),
    # Support
    ("ticket:read", "support", "View support tickets and SLAs"),
    ("ticket:write", "support", "Update tickets, respond to customers"),
    # Workflows & AI
    ("workflow:manage", "workflow", "Create and trigger automated workflows"),
    ("ai:query", "ai", "Execute AI summaries and RAG queries"),
]


class RBACService:
    @staticmethod
    async def seed_system_permissions(db: AsyncSession) -> dict[str, Permission]:
        """Ensure all canonical system permissions exist in database."""
        result = await db.execute(select(Permission))
        existing = {p.code: p for p in result.scalars().all()}

        created = {}
        for code, module, desc in DEFAULT_PERMISSIONS:
            if code not in existing:
                perm = Permission(code=code, module=module, description=desc)
                db.add(perm)
                created[code] = perm
            else:
                created[code] = existing[code]

        await db.flush()
        return created

    @staticmethod
    async def create_default_roles_for_tenant(
        db: AsyncSession, tenant_id: uuid.UUID
    ) -> dict[str, Role]:
        """Create standard roles (Owner, Admin, Sales, Support, Viewer) for a new organization."""
        all_perms = await RBACService.seed_system_permissions(db)

        # 1. Owner Role (All Permissions)
        owner_role = Role(
            tenant_id=tenant_id,
            name="Owner",
            description="Full organization ownership and administrative access",
            is_system=True,
            permissions=list(all_perms.values()),
        )
        db.add(owner_role)

        # 2. Admin Role (All except organization destruction)
        admin_role = Role(
            tenant_id=tenant_id,
            name="Admin",
            description="Full operational management across all modules",
            is_system=True,
            permissions=list(all_perms.values()),
        )
        db.add(admin_role)

        # 3. Sales Role
        sales_perm_codes = {
            "customer:read",
            "customer:write",
            "lead:read",
            "lead:write",
            "deal:read",
            "deal:write",
            "product:read",
            "ai:query",
        }
        sales_role = Role(
            tenant_id=tenant_id,
            name="Sales Representative",
            description="Manage leads, opportunities, deals, and customer interactions",
            is_system=True,
            permissions=[p for code, p in all_perms.items() if code in sales_perm_codes],
        )
        db.add(sales_role)

        # 4. Support Role
        support_perm_codes = {
            "customer:read",
            "ticket:read",
            "ticket:write",
            "order:read",
            "ai:query",
        }
        support_role = Role(
            tenant_id=tenant_id,
            name="Support Agent",
            description="Manage customer tickets, SLAs, and customer conversations",
            is_system=True,
            permissions=[p for code, p in all_perms.items() if code in support_perm_codes],
        )
        db.add(support_role)

        await db.flush()
        return {
            "Owner": owner_role,
            "Admin": admin_role,
            "Sales": sales_role,
            "Support": support_role,
        }

    @staticmethod
    async def get_user_permissions(
        db: AsyncSession, user_id: uuid.UUID, tenant_id: uuid.UUID
    ) -> list[str]:
        """Fetch all resolved permission codes for a user in a given organization."""
        query = (
            select(Permission.code)
            .join(role_permissions, Permission.id == role_permissions.c.permission_id)
            .join(Role, Role.id == role_permissions.c.role_id)
            .join(Membership, Membership.role_id == Role.id)
            .where(
                Membership.user_id == user_id,
                Membership.tenant_id == tenant_id,
                Membership.status == "active",
            )
        )
        result = await db.execute(query)
        return list(result.scalars().all())
