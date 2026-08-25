from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.application.dtos.commerce import CategoryCreateRequest, ProductCreateRequest
from app.application.dtos.customer import CustomerCreateRequest
from app.application.dtos.identity import UserRegisterRequest
from app.application.dtos.inventory import StockAdjustRequest, WarehouseCreateRequest
from app.application.dtos.pricing import PriceListCreateRequest, PriceTierCreateRequest
from app.application.dtos.sales import DealCreateRequest
from app.application.dtos.support import TicketCreateRequest
from app.application.services.auth import AuthService
from app.application.services.commerce import CatalogService
from app.application.services.customer import CustomerService
from app.application.services.inventory import InventoryService, WarehouseService
from app.application.services.pricing import PricingService
from app.application.services.sales import DealService, PipelineService
from app.application.services.support import TicketService


class EnterpriseDataSeeder:
    @staticmethod
    async def seed_demo_organization(db: AsyncSession) -> dict[str, str]:
        """Seed complete Fortune 500 demo multi-tenant CRM & Commerce state."""
        # 1. Seed Org & Admin User
        auth_data = await AuthService.register_user(
            db=db,
            data=UserRegisterRequest(
                email="demo_executive@acme-enterprise.com",
                password="DemoEnterprisePass123!",
                first_name="Sarah",
                last_name="Connor",
                organization_name="Acme Enterprise Global",
            ),
        )
        tenant_id = auth_data.active_organization_id
        user_id = auth_data.user.id

        # 2. Seed Customers
        c1 = await CustomerService.create_customer(
            db=db,
            tenant_id=tenant_id,
            actor_id=user_id,
            data=CustomerCreateRequest(
                email="alex.morgan@enterprise-cloud.io",
                first_name="Alex",
                last_name="Morgan",
                phone="+1-555-019-2831",
            ),
        )
        await CustomerService.create_customer(
            db=db,
            tenant_id=tenant_id,
            actor_id=user_id,
            data=CustomerCreateRequest(
                email="elena.rostova@fintech-global.com",
                first_name="Elena",
                last_name="Rostova",
                phone="+1-555-018-9481",
            ),
        )

        # 3. Seed Catalog Category & Products
        cat = await CatalogService.create_category(
            db=db,
            tenant_id=tenant_id,
            actor_id=user_id,
            data=CategoryCreateRequest(
                name="Enterprise Cloud Hardware",
                slug="enterprise-cloud-hardware",
                description="High-density data center compute nodes and IoT edge gateways.",
            ),
        )
        p1 = await CatalogService.create_product(
            db=db,
            tenant_id=tenant_id,
            actor_id=user_id,
            data=ProductCreateRequest(
                category_id=cat.id,
                name="Enterprise Edge Compute Node X9",
                sku="SRV-NODE-X9",
                base_price=Decimal("4999.00"),
                currency="USD",
            ),
        )
        await CatalogService.create_product(
            db=db,
            tenant_id=tenant_id,
            actor_id=user_id,
            data=ProductCreateRequest(
                category_id=cat.id,
                name="Industrial IoT Gateway Pro",
                sku="IOT-GW-PRO",
                base_price=Decimal("1250.00"),
                currency="USD",
            ),
        )

        # 4. Seed B2B Tiered Price Lists
        await PricingService.create_price_list(
            db=db,
            tenant_id=tenant_id,
            actor_id=user_id,
            data=PriceListCreateRequest(
                name="Enterprise Volume Contract 2026",
                code="ENT_VOL_2026",
                currency="USD",
                is_default=True,
                tiers=[
                    PriceTierCreateRequest(
                        product_id=p1.id,
                        min_quantity=5,
                        max_quantity=19,
                        unit_price=Decimal("4500.00"),
                        discount_percentage=Decimal("10.00"),
                    ),
                    PriceTierCreateRequest(
                        product_id=p1.id,
                        min_quantity=20,
                        unit_price=Decimal("3999.00"),
                        discount_percentage=Decimal("20.00"),
                    ),
                ],
            ),
        )

        # 5. Seed Warehouses & Inventory
        wh1 = await WarehouseService.create_warehouse(
            db=db,
            tenant_id=tenant_id,
            actor_id=user_id,
            data=WarehouseCreateRequest(
                name="Dallas Primary Mega-Hub (W-1)",
                code="DAL-01",
                address_line1="100 Logistics Blvd",
                city="Dallas",
                postal_code="75001",
                country="USA",
                is_primary=True,
            ),
        )
        await InventoryService.adjust_stock(
            db=db,
            tenant_id=tenant_id,
            actor_id=user_id,
            data=StockAdjustRequest(
                warehouse_id=wh1.id,
                product_id=p1.id,
                quantity_delta=100,
                movement_type="inbound",
                reference_type="initial_seed",
                reference_id="SEED-INIT-01",
                note="Initial enterprise demo stock allocation",
            ),
        )

        # 6. Seed Sales Pipeline & Deals
        pipe = await PipelineService.get_or_create_default_pipeline(db, tenant_id)
        if pipe.stages:
            await DealService.create_deal(
                db=db,
                tenant_id=tenant_id,
                actor_id=user_id,
                data=DealCreateRequest(
                    pipeline_id=pipe.id,
                    stage_id=pipe.stages[0].id,
                    customer_id=c1.id,
                    name="Enterprise Multi-Region Edge Migration",
                    value=Decimal("250000.00"),
                    currency="USD",
                ),
            )

        # 7. Seed Support Tickets
        await TicketService.create_ticket(
            db=db,
            tenant_id=tenant_id,
            actor_id=user_id,
            data=TicketCreateRequest(
                customer_id=c1.id,
                subject="Dedicated Direct Connect Bandwidth Expansion",
                description="Customer requests 10 Gbps private interconnect to Dallas Mega-Hub.",
                priority="high",
            ),
        )

        return {
            "organization_id": str(tenant_id),
            "admin_user_id": str(user_id),
            "status": "seed_complete",
        }
