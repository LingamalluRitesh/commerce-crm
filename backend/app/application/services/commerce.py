import secrets
import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dtos.commerce import (
    CartItemAddRequest,
    CartItemResponse,
    CartResponse,
    CategoryCreateRequest,
    CategoryResponse,
    CheckoutRequest,
    OrderItemResponse,
    OrderResponse,
    PaymentResponse,
    PayOrderRequest,
    ProductCreateRequest,
    ProductResponse,
    ProductVariantResponse,
    RefundOrderRequest,
)
from app.application.services.audit import AuditService
from app.application.services.auth import slugify
from app.core.errors import ConflictError, NotFoundError, ValidationAppError
from app.core.events import DomainEvent, event_bus
from app.infrastructure.models.commerce import (
    Cart,
    CartItem,
    Category,
    Order,
    OrderItem,
    Payment,
    Product,
    ProductVariant,
    Refund,
)
from app.infrastructure.models.customer import Customer

VALID_ORDER_TRANSITIONS = {
    "CREATED": {"PAYMENT_PENDING", "PAID", "CANCELLED"},
    "PAYMENT_PENDING": {"PAID", "CANCELLED"},
    "PAID": {"PROCESSING", "REFUNDED", "CANCELLED"},
    "PROCESSING": {"SHIPPED", "CANCELLED"},
    "SHIPPED": {"DELIVERED", "RETURNED"},
    "DELIVERED": {"RETURNED", "REFUNDED"},
    "CANCELLED": set(),
    "REFUNDED": set(),
    "RETURNED": {"REFUNDED"},
}


class CatalogService:
    @staticmethod
    async def create_category(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: CategoryCreateRequest,
    ) -> CategoryResponse:
        base_slug = slugify(data.name)
        slug = f"{base_slug}-{secrets.token_hex(2)}"

        category = Category(
            tenant_id=tenant_id,
            name=data.name.strip(),
            slug=slug,
            description=data.description,
            parent_id=data.parent_id,
            is_active=True,
        )
        db.add(category)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="category:created",
            entity_type="Category",
            entity_id=str(category.id),
            new_values={"name": category.name, "slug": category.slug},
        )

        return CategoryResponse.model_validate(category)

    @staticmethod
    async def list_categories(db: AsyncSession, tenant_id: uuid.UUID) -> list[CategoryResponse]:
        query = (
            select(Category)
            .where(Category.tenant_id == tenant_id, Category.is_active.is_(True))
            .order_by(Category.name)
        )
        res = await db.execute(query)
        return [CategoryResponse.model_validate(c) for c in res.scalars().all()]

    @staticmethod
    async def create_product(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: ProductCreateRequest,
    ) -> ProductResponse:
        # Check SKU uniqueness in tenant
        sku_check = await db.execute(
            select(Product).where(Product.tenant_id == tenant_id, Product.sku == data.sku.upper())
        )
        if sku_check.scalar_one_or_none():
            raise ConflictError(f"Product with SKU '{data.sku}' already exists.")

        base_slug = slugify(data.name)
        slug = f"{base_slug}-{secrets.token_hex(2)}"

        product = Product(
            tenant_id=tenant_id,
            category_id=data.category_id,
            name=data.name.strip(),
            slug=slug,
            sku=data.sku.upper().strip(),
            description=data.description,
            base_price=data.base_price,
            currency=data.currency,
            status="active",
            track_inventory=data.track_inventory,
            is_digital=data.is_digital,
        )
        db.add(product)
        await db.flush()

        # Add Variants
        for v in data.variants:
            variant = ProductVariant(
                tenant_id=tenant_id,
                product_id=product.id,
                name=v.name,
                sku=v.sku.upper().strip(),
                price_override=v.price_override,
                attributes=v.attributes or {},
                is_active=True,
            )
            db.add(variant)

        await db.flush()

        # Reload with variants
        res = await db.execute(
            select(Product).where(Product.id == product.id).options(selectinload(Product.variants))
        )
        prod = res.scalar_one()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="product:created",
            entity_type="Product",
            entity_id=str(prod.id),
            new_values={"name": prod.name, "sku": prod.sku, "price": str(prod.base_price)},
        )

        return ProductResponse(
            id=prod.id,
            tenant_id=prod.tenant_id,
            category_id=prod.category_id,
            name=prod.name,
            slug=prod.slug,
            sku=prod.sku,
            description=prod.description,
            base_price=prod.base_price,
            currency=prod.currency,
            status=prod.status,
            track_inventory=prod.track_inventory,
            is_digital=prod.is_digital,
            variants=[ProductVariantResponse.model_validate(pv) for pv in prod.variants],
            created_at=prod.created_at,
        )

    @staticmethod
    async def list_products(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        category_id: uuid.UUID | None = None,
        search_query: str | None = None,
    ) -> list[ProductResponse]:
        query = (
            select(Product)
            .where(Product.tenant_id == tenant_id, Product.status == "active")
            .options(selectinload(Product.variants))
        )
        if category_id:
            query = query.where(Product.category_id == category_id)
        if search_query:
            pattern = f"%{search_query}%"
            query = query.where(or_(Product.name.ilike(pattern), Product.sku.ilike(pattern)))

        res = await db.execute(query.order_by(Product.created_at.desc()))
        products = res.scalars().all()

        return [
            ProductResponse(
                id=p.id,
                tenant_id=p.tenant_id,
                category_id=p.category_id,
                name=p.name,
                slug=p.slug,
                sku=p.sku,
                description=p.description,
                base_price=p.base_price,
                currency=p.currency,
                status=p.status,
                track_inventory=p.track_inventory,
                is_digital=p.is_digital,
                variants=[ProductVariantResponse.model_validate(pv) for pv in p.variants],
                created_at=p.created_at,
            )
            for p in products
        ]


class CartService:
    @staticmethod
    async def get_or_create_cart(
        db: AsyncSession, tenant_id: uuid.UUID, customer_id: uuid.UUID | None = None
    ) -> Cart:
        if customer_id:
            res = await db.execute(
                select(Cart)
                .where(Cart.tenant_id == tenant_id, Cart.customer_id == customer_id)
                .options(
                    selectinload(Cart.items).selectinload(CartItem.product),
                    selectinload(Cart.items).selectinload(CartItem.variant),
                )
            )
            cart = res.scalar_one_or_none()
            if cart:
                return cart

        cart = Cart(tenant_id=tenant_id, customer_id=customer_id, currency="USD")
        db.add(cart)
        await db.flush()

        res = await db.execute(
            select(Cart).where(Cart.id == cart.id).options(selectinload(Cart.items))
        )
        return res.scalar_one()

    @staticmethod
    async def add_item(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        cart_id: uuid.UUID,
        data: CartItemAddRequest,
    ) -> CartResponse:
        cart_res = await db.execute(
            select(Cart).where(Cart.id == cart_id, Cart.tenant_id == tenant_id)
        )
        cart = cart_res.scalar_one_or_none()
        if not cart:
            raise NotFoundError("Cart", cart_id)

        # Fetch product & determine price
        prod_res = await db.execute(
            select(Product).where(Product.id == data.product_id, Product.tenant_id == tenant_id)
        )
        prod = prod_res.scalar_one_or_none()
        if not prod:
            raise NotFoundError("Product", data.product_id)

        unit_price = prod.base_price
        if data.variant_id:
            var_res = await db.execute(
                select(ProductVariant).where(
                    ProductVariant.id == data.variant_id, ProductVariant.tenant_id == tenant_id
                )
            )
            variant = var_res.scalar_one_or_none()
            if variant and variant.price_override is not None:
                unit_price = variant.price_override

        # Check existing item
        existing_res = await db.execute(
            select(CartItem).where(
                CartItem.cart_id == cart.id,
                CartItem.product_id == prod.id,
                CartItem.variant_id == data.variant_id,
            )
        )
        existing_item = existing_res.scalar_one_or_none()

        if existing_item:
            existing_item.quantity += data.quantity
        else:
            new_item = CartItem(
                tenant_id=tenant_id,
                cart_id=cart.id,
                product_id=prod.id,
                variant_id=data.variant_id,
                quantity=data.quantity,
                unit_price=unit_price,
            )
            db.add(new_item)

        await db.flush()

        # Return full cart response
        full_res = await db.execute(
            select(Cart)
            .where(Cart.id == cart.id)
            .options(
                selectinload(Cart.items).selectinload(CartItem.product),
                selectinload(Cart.items).selectinload(CartItem.variant),
            )
        )
        updated_cart = full_res.scalar_one()

        subtotal = Decimal("0.00")
        item_dtos = []
        for i in updated_cart.items:
            item_total = i.unit_price * i.quantity
            subtotal += item_total
            item_dtos.append(
                CartItemResponse(
                    id=i.id,
                    product_id=i.product_id,
                    variant_id=i.variant_id,
                    product_name=i.product.name,
                    sku=i.variant.sku if i.variant else i.product.sku,
                    unit_price=i.unit_price,
                    quantity=i.quantity,
                    total_price=item_total,
                )
            )

        return CartResponse(
            id=updated_cart.id,
            tenant_id=updated_cart.tenant_id,
            customer_id=updated_cart.customer_id,
            currency=updated_cart.currency,
            subtotal=subtotal,
            items=item_dtos,
        )


class OrderService:
    @staticmethod
    async def checkout(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: CheckoutRequest,
    ) -> OrderResponse:
        # 1. Validate Customer
        cust_res = await db.execute(
            select(Customer).where(Customer.id == data.customer_id, Customer.tenant_id == tenant_id)
        )
        customer = cust_res.scalar_one_or_none()
        if not customer:
            raise NotFoundError("Customer", data.customer_id)

        # 2. Gather Line Items (from cart or direct items)
        line_items_data: list[tuple[Product, ProductVariant | None, int, Decimal]] = []

        if data.cart_id:
            cart_res = await db.execute(
                select(Cart)
                .where(Cart.id == data.cart_id, Cart.tenant_id == tenant_id)
                .options(
                    selectinload(Cart.items).selectinload(CartItem.product),
                    selectinload(Cart.items).selectinload(CartItem.variant),
                )
            )
            cart = cart_res.scalar_one_or_none()
            if not cart or not cart.items:
                raise ValidationAppError("Specified cart is empty or not found.")

            for ci in cart.items:
                line_items_data.append((ci.product, ci.variant, ci.quantity, ci.unit_price))

        elif data.direct_items:
            for di in data.direct_items:
                prod_res = await db.execute(
                    select(Product).where(
                        Product.id == di.product_id, Product.tenant_id == tenant_id
                    )
                )
                prod = prod_res.scalar_one_or_none()
                if not prod:
                    raise NotFoundError("Product", di.product_id)

                var = None
                unit_price = prod.base_price
                if di.variant_id:
                    var_res = await db.execute(
                        select(ProductVariant).where(
                            ProductVariant.id == di.variant_id,
                            ProductVariant.tenant_id == tenant_id,
                        )
                    )
                    var = var_res.scalar_one_or_none()
                    if var and var.price_override is not None:
                        unit_price = var.price_override

                line_items_data.append((prod, var, di.quantity, unit_price))
        else:
            raise ValidationAppError(
                "Either cart_id or direct_items must be provided for checkout."
            )

        # 3. Compute Financial Arithmetic with Decimal precision
        subtotal = Decimal("0.00")
        for _, _, qty, price in line_items_data:
            subtotal += price * Decimal(str(qty))

        taxable_amount = max(Decimal("0.00"), subtotal - data.discount_amount)
        tax_amount = taxable_amount * (data.tax_rate_percent / Decimal("100.00"))
        total_amount = taxable_amount + tax_amount + data.shipping_amount

        order_number = f"ORD-{datetime.now(UTC).strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"

        order = Order(
            tenant_id=tenant_id,
            customer_id=customer.id,
            order_number=order_number,
            status="CREATED",
            payment_status="pending",
            currency="USD",
            subtotal=subtotal,
            discount_amount=data.discount_amount,
            tax_amount=tax_amount,
            shipping_amount=data.shipping_amount,
            total_amount=total_amount,
            shipping_address_id=data.shipping_address_id,
            billing_address_id=data.billing_address_id,
        )
        db.add(order)
        await db.flush()

        # 4. Create Order Items
        order_items = []
        for prod, var, qty, price in line_items_data:
            item_total = price * Decimal(str(qty))
            item = OrderItem(
                tenant_id=tenant_id,
                order_id=order.id,
                product_id=prod.id,
                variant_id=var.id if var else None,
                title=f"{prod.name} ({var.name})" if var else prod.name,
                sku=var.sku if var else prod.sku,
                unit_price=price,
                quantity=qty,
                total_price=item_total,
            )
            db.add(item)
            order_items.append(item)

        await db.flush()

        # 5. Clear Cart if checked out from cart
        if data.cart_id:
            await db.execute(select(CartItem).where(CartItem.cart_id == data.cart_id))
            # Delete items
            for ci in cart.items:
                await db.delete(ci)

        # 6. Audit Log & Domain Event
        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="order:created",
            entity_type="Order",
            entity_id=str(order.id),
            new_values={
                "order_number": order.order_number,
                "total_amount": str(order.total_amount),
            },
        )

        await event_bus.publish(
            DomainEvent(
                event_type="order.created.v1",
                tenant_id=tenant_id,
                aggregate_type="Order",
                aggregate_id=order.id,
                payload={"customer_id": str(customer.id), "total_amount": str(order.total_amount)},
            )
        )

        return OrderResponse(
            id=order.id,
            tenant_id=order.tenant_id,
            customer_id=order.customer_id,
            order_number=order.order_number,
            status=order.status,
            payment_status=order.payment_status,
            currency=order.currency,
            subtotal=order.subtotal,
            discount_amount=order.discount_amount,
            tax_amount=order.tax_amount,
            shipping_amount=order.shipping_amount,
            total_amount=order.total_amount,
            shipping_address_id=order.shipping_address_id,
            billing_address_id=order.billing_address_id,
            items=[
                OrderItemResponse(
                    id=oi.id,
                    product_id=oi.product_id,
                    variant_id=oi.variant_id,
                    title=oi.title,
                    sku=oi.sku,
                    unit_price=oi.unit_price,
                    quantity=oi.quantity,
                    total_price=oi.total_price,
                )
                for oi in order_items
            ],
            payments=[],
            created_at=order.created_at,
        )

    @staticmethod
    async def process_payment(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        order_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: PayOrderRequest,
    ) -> OrderResponse:
        order_res = await db.execute(
            select(Order)
            .where(Order.id == order_id, Order.tenant_id == tenant_id)
            .options(selectinload(Order.items), selectinload(Order.payments))
        )
        order = order_res.scalar_one_or_none()
        if not order:
            raise NotFoundError("Order", order_id)

        if order.payment_status == "paid":
            raise ConflictError("Order is already fully paid.")

        # Create Payment Record
        txn_id = data.provider_transaction_id or f"txn_{secrets.token_hex(8)}"
        payment = Payment(
            tenant_id=tenant_id,
            order_id=order.id,
            provider=data.provider,
            provider_transaction_id=txn_id,
            amount=order.total_amount,
            currency=order.currency,
            status="completed",
        )
        db.add(payment)

        # Update Order State
        order.payment_status = "paid"
        order.status = "PAID"

        # Update Customer Lifetime Value
        cust_res = await db.execute(
            select(Customer).where(
                Customer.id == order.customer_id, Customer.tenant_id == tenant_id
            )
        )
        customer = cust_res.scalar_one_or_none()
        if customer:
            customer.lifetime_value += order.total_amount

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="order:payment_completed",
            entity_type="Order",
            entity_id=str(order.id),
            new_values={"amount": str(payment.amount), "transaction_id": txn_id},
        )

        await event_bus.publish(
            DomainEvent(
                event_type="order.paid.v1",
                tenant_id=tenant_id,
                aggregate_type="Order",
                aggregate_id=order.id,
                payload={
                    "customer_id": str(order.customer_id),
                    "amount": str(order.total_amount),
                    "order_number": order.order_number,
                },
            )
        )

        return await OrderService.get_order(db, tenant_id, order.id)

    @staticmethod
    async def get_order(
        db: AsyncSession, tenant_id: uuid.UUID, order_id: uuid.UUID
    ) -> OrderResponse:
        db.expire_all()
        res = await db.execute(
            select(Order)
            .where(Order.id == order_id, Order.tenant_id == tenant_id)
            .options(selectinload(Order.items), selectinload(Order.payments))
        )
        order = res.scalar_one_or_none()
        if not order:
            raise NotFoundError("Order", order_id)

        return OrderResponse(
            id=order.id,
            tenant_id=order.tenant_id,
            customer_id=order.customer_id,
            order_number=order.order_number,
            status=order.status,
            payment_status=order.payment_status,
            currency=order.currency,
            subtotal=order.subtotal,
            discount_amount=order.discount_amount,
            tax_amount=order.tax_amount,
            shipping_amount=order.shipping_amount,
            total_amount=order.total_amount,
            shipping_address_id=order.shipping_address_id,
            billing_address_id=order.billing_address_id,
            items=[
                OrderItemResponse(
                    id=oi.id,
                    product_id=oi.product_id,
                    variant_id=oi.variant_id,
                    title=oi.title,
                    sku=oi.sku,
                    unit_price=oi.unit_price,
                    quantity=oi.quantity,
                    total_price=oi.total_price,
                )
                for oi in order.items
            ],
            payments=[
                PaymentResponse(
                    id=p.id,
                    order_id=p.order_id,
                    provider=p.provider,
                    provider_transaction_id=p.provider_transaction_id,
                    amount=p.amount,
                    currency=p.currency,
                    status=p.status,
                    created_at=p.created_at,
                )
                for p in order.payments
            ],
            created_at=order.created_at,
        )

    @staticmethod
    async def update_status(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        order_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        new_status: str,
    ) -> OrderResponse:
        res = await db.execute(
            select(Order)
            .where(Order.id == order_id, Order.tenant_id == tenant_id)
            .options(selectinload(Order.items), selectinload(Order.payments))
        )
        order = res.scalar_one_or_none()
        if not order:
            raise NotFoundError("Order", order_id)

        allowed = VALID_ORDER_TRANSITIONS.get(order.status, set())
        if new_status not in allowed:
            raise ValidationAppError(
                f"Cannot transition order from '{order.status}' to '{new_status}'."
            )

        old_status = order.status
        order.status = new_status
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="order:status_updated",
            entity_type="Order",
            entity_id=str(order.id),
            old_values={"status": old_status},
            new_values={"status": new_status},
        )

        return await OrderService.get_order(db, tenant_id, order.id)

    @staticmethod
    async def process_refund(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        order_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: RefundOrderRequest,
    ) -> OrderResponse:
        order_res = await db.execute(
            select(Order)
            .where(Order.id == order_id, Order.tenant_id == tenant_id)
            .options(selectinload(Order.payments))
        )
        order = order_res.scalar_one_or_none()
        if not order:
            raise NotFoundError("Order", order_id)

        if order.payment_status != "paid" or not order.payments:
            raise ValidationAppError("Cannot refund an unpaid order.")

        latest_payment = order.payments[-1]
        refund_amount = data.amount or latest_payment.amount

        refund = Refund(
            tenant_id=tenant_id,
            payment_id=latest_payment.id,
            order_id=order.id,
            amount=refund_amount,
            reason=data.reason,
            status="processed",
        )
        db.add(refund)

        latest_payment.status = "refunded"
        order.payment_status = "refunded"
        order.status = "REFUNDED"

        # Decrement Customer Lifetime Value
        cust_res = await db.execute(
            select(Customer).where(
                Customer.id == order.customer_id, Customer.tenant_id == tenant_id
            )
        )
        customer = cust_res.scalar_one_or_none()
        if customer:
            customer.lifetime_value = max(Decimal("0.00"), customer.lifetime_value - refund_amount)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="order:refunded",
            entity_type="Refund",
            entity_id=str(refund.id),
            new_values={
                "order_id": str(order.id),
                "amount": str(refund_amount),
                "reason": data.reason,
            },
        )

        return await OrderService.get_order(db, tenant_id, order.id)

    @staticmethod
    async def list_orders(db: AsyncSession, tenant_id: uuid.UUID) -> list[OrderResponse]:
        query = (
            select(Order)
            .where(Order.tenant_id == tenant_id)
            .options(selectinload(Order.items), selectinload(Order.payments))
            .order_by(Order.created_at.desc())
        )
        res = await db.execute(query)
        orders = res.scalars().all()
        return [await OrderService.get_order(db, tenant_id, o.id) for o in orders]
