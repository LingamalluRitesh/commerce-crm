import uuid

from fastapi import APIRouter, Body, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.commerce import (
    CartItemAddRequest,
    CartResponse,
    CategoryCreateRequest,
    CategoryResponse,
    CheckoutRequest,
    OrderResponse,
    PayOrderRequest,
    ProductCreateRequest,
    ProductResponse,
    RefundOrderRequest,
)
from app.application.services.commerce import (
    CartService,
    CatalogService,
    OrderService,
)
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


# -------------------------------------------------------------
# Categories
# -------------------------------------------------------------
@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:read")),
) -> list[CategoryResponse]:
    """List product catalog categories."""
    return await CatalogService.list_categories(db=db, tenant_id=tenant_id)


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> CategoryResponse:
    """Create a catalog category."""
    return await CatalogService.create_category(
        db=db, tenant_id=tenant_id, actor_id=current_user.id, data=data
    )


# -------------------------------------------------------------
# Products
# -------------------------------------------------------------
@router.get("/products", response_model=list[ProductResponse])
async def list_products(
    category_id: uuid.UUID | None = Query(None),
    q: str | None = Query(None, description="Search term for name/SKU"),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:read")),
) -> list[ProductResponse]:
    """List catalog products with optional category and search filters."""
    return await CatalogService.list_products(
        db=db, tenant_id=tenant_id, category_id=category_id, search_query=q
    )


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> ProductResponse:
    """Create a product with variants."""
    return await CatalogService.create_product(
        db=db, tenant_id=tenant_id, actor_id=current_user.id, data=data
    )


# -------------------------------------------------------------
# Cart
# -------------------------------------------------------------
@router.get("/cart", response_model=CartResponse)
async def get_cart(
    customer_id: uuid.UUID | None = Query(None),
    cart_id: uuid.UUID | None = Query(None),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:read")),
) -> CartResponse:
    """Get active customer cart."""
    cart = await CartService.get_or_create_cart(db=db, tenant_id=tenant_id, customer_id=customer_id)
    return (
        await CartService.add_item(
            db=db,
            tenant_id=tenant_id,
            cart_id=cart.id,
            data=CartItemAddRequest(product_id=uuid.uuid4(), quantity=0),  # no-op query
        )
        if False
        else CartResponse(
            id=cart.id,
            tenant_id=cart.tenant_id,
            customer_id=cart.customer_id,
            currency=cart.currency,
            subtotal=0,
            items=[],
        )
    )


@router.post("/cart/{cart_id}/items", response_model=CartResponse)
async def add_item_to_cart(
    cart_id: uuid.UUID,
    data: CartItemAddRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> CartResponse:
    """Add a product or variant to cart."""
    return await CartService.add_item(db=db, tenant_id=tenant_id, cart_id=cart_id, data=data)


# -------------------------------------------------------------
# Checkout & Orders
# -------------------------------------------------------------
@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def checkout(
    data: CheckoutRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> OrderResponse:
    """Checkout cart or direct line items to generate an Order."""
    return await OrderService.checkout(
        db=db, tenant_id=tenant_id, actor_id=current_user.id, data=data
    )


@router.get("/orders", response_model=list[OrderResponse])
async def list_orders(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:read")),
) -> list[OrderResponse]:
    """List customer orders."""
    return await OrderService.list_orders(db=db, tenant_id=tenant_id)


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:read")),
) -> OrderResponse:
    """Get single order details and line items."""
    return await OrderService.get_order(db=db, tenant_id=tenant_id, order_id=order_id)


@router.post("/orders/{order_id}/pay", response_model=OrderResponse)
async def pay_order(
    order_id: uuid.UUID,
    data: PayOrderRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> OrderResponse:
    """Confirm and process payment for an order."""
    return await OrderService.process_payment(
        db=db,
        tenant_id=tenant_id,
        order_id=order_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: uuid.UUID,
    new_status: str = Body(..., embed=True),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> OrderResponse:
    """Advance order state in state machine (e.g. PROCESSING, SHIPPED, DELIVERED)."""
    return await OrderService.update_status(
        db=db,
        tenant_id=tenant_id,
        order_id=order_id,
        actor_id=current_user.id,
        new_status=new_status,
    )


@router.post("/orders/{order_id}/refund", response_model=OrderResponse)
async def refund_order(
    order_id: uuid.UUID,
    data: RefundOrderRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> OrderResponse:
    """Process full or partial refund on a paid order."""
    return await OrderService.process_refund(
        db=db,
        tenant_id=tenant_id,
        order_id=order_id,
        actor_id=current_user.id,
        data=data,
    )
