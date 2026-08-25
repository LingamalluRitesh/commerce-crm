import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dtos.pricing import (
    CalculateTieredPriceRequest,
    CalculateTieredPriceResponse,
    PriceListCreateRequest,
    PriceListResponse,
)
from app.application.services.audit import AuditService
from app.core.errors import ConflictError, NotFoundError
from app.infrastructure.models.commerce import Product
from app.infrastructure.models.pricing import PriceList, PriceTier


class PricingService:
    @staticmethod
    async def create_price_list(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: PriceListCreateRequest,
    ) -> PriceListResponse:
        # Check code uniqueness
        res = await db.execute(
            select(PriceList).where(
                PriceList.tenant_id == tenant_id, PriceList.code == data.code.upper()
            )
        )
        if res.scalar_one_or_none():
            raise ConflictError("PriceList with this code already exists")

        price_list = PriceList(
            tenant_id=tenant_id,
            name=data.name.strip(),
            code=data.code.upper().strip(),
            currency=data.currency.upper(),
            description=data.description,
            is_default=data.is_default,
        )
        db.add(price_list)
        await db.flush()

        # Add price tiers
        for tier in data.tiers:
            pt = PriceTier(
                tenant_id=tenant_id,
                price_list_id=price_list.id,
                product_id=tier.product_id,
                min_quantity=tier.min_quantity,
                max_quantity=tier.max_quantity,
                unit_price=tier.unit_price,
                discount_percentage=tier.discount_percentage,
            )
            db.add(pt)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="price_list:created",
            entity_type="PriceList",
            entity_id=str(price_list.id),
            new_values={"name": price_list.name, "code": price_list.code},
        )

        price_list_id = price_list.id
        db.expire_all()
        q = (
            select(PriceList)
            .options(selectinload(PriceList.tiers))
            .where(PriceList.id == price_list_id)
        )
        result = await db.execute(q)
        return PriceListResponse.model_validate(result.scalar_one())

    @staticmethod
    async def calculate_tiered_price(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        data: CalculateTieredPriceRequest,
    ) -> CalculateTieredPriceResponse:
        # Check product base price
        p_res = await db.execute(
            select(Product).where(Product.id == data.product_id, Product.tenant_id == tenant_id)
        )
        product = p_res.scalar_one_or_none()
        if not product:
            raise NotFoundError("Product", data.product_id)

        base_unit_price = product.base_price
        effective_unit_price = base_unit_price
        discount_pct = Decimal("0.00")

        # Find applicable tier if price list exists
        tier_query = (
            select(PriceTier)
            .join(PriceList)
            .where(
                PriceTier.tenant_id == tenant_id,
                PriceTier.product_id == data.product_id,
                PriceTier.min_quantity <= data.quantity,
            )
        )
        if data.price_list_id:
            tier_query = tier_query.where(PriceTier.price_list_id == data.price_list_id)
        else:
            tier_query = tier_query.where(PriceList.is_default.is_(True))

        tier_query = tier_query.order_by(PriceTier.min_quantity.desc())
        t_res = await db.execute(tier_query)
        matching_tier = t_res.scalars().first()

        if matching_tier:
            if matching_tier.unit_price > 0:
                effective_unit_price = matching_tier.unit_price
            if matching_tier.discount_percentage > 0:
                discount_pct = matching_tier.discount_percentage
                effective_unit_price = effective_unit_price * (
                    Decimal("1.00") - (discount_pct / Decimal("100.00"))
                )

        total_net = (effective_unit_price * Decimal(data.quantity)).quantize(Decimal("0.01"))

        return CalculateTieredPriceResponse(
            product_id=data.product_id,
            quantity=data.quantity,
            base_unit_price=base_unit_price,
            effective_unit_price=effective_unit_price.quantize(Decimal("0.01")),
            discount_percentage=discount_pct,
            total_net_price=total_net,
        )
