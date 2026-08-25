import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_current_tenant_id,
    get_current_user,
    require_permission,
)
from app.application.dtos.inventory import (
    FulfillmentCreateRequest,
    FulfillmentResponse,
    PurchaseOrderCreateRequest,
    PurchaseOrderResponse,
    StockAdjustRequest,
    StockItemResponse,
    StockTransferCreateRequest,
    StockTransferResponse,
    SupplierCreateRequest,
    SupplierResponse,
    WarehouseCreateRequest,
    WarehouseResponse,
)
from app.application.services.inventory import (
    FulfillmentService,
    InventoryService,
    PurchaseOrderService,
    TransferService,
    WarehouseService,
)
from app.core.database import get_db
from app.infrastructure.models.identity import User

router = APIRouter()


# -------------------------------------------------------------
# Warehouses
# -------------------------------------------------------------
@router.get("/warehouses", response_model=list[WarehouseResponse])
async def list_warehouses(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:read")),
) -> list[WarehouseResponse]:
    """List all warehouses."""
    return await WarehouseService.list_warehouses(db=db, tenant_id=tenant_id)


@router.post(
    "/warehouses",
    response_model=WarehouseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_warehouse(
    data: WarehouseCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> WarehouseResponse:
    """Create a new warehouse facility."""
    return await WarehouseService.create_warehouse(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


# -------------------------------------------------------------
# Stock Management & Adjustments
# -------------------------------------------------------------
@router.get("/stock", response_model=list[StockItemResponse])
async def list_stock(
    warehouse_id: uuid.UUID | None = Query(None),
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:read")),
) -> list[StockItemResponse]:
    """List stock levels across warehouses."""
    return await InventoryService.list_stock(db=db, tenant_id=tenant_id, warehouse_id=warehouse_id)


@router.post("/stock/adjust", response_model=StockItemResponse)
async def adjust_stock(
    data: StockAdjustRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> StockItemResponse:
    """Perform inventory stock adjustment and create ledger movement."""
    return await InventoryService.adjust_stock(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


# -------------------------------------------------------------
# Stock Transfers
# -------------------------------------------------------------
@router.post(
    "/transfers",
    response_model=StockTransferResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_transfer(
    data: StockTransferCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> StockTransferResponse:
    """Initiate an inter-warehouse stock transfer."""
    return await TransferService.create_transfer(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post("/transfers/{transfer_id}/receive", response_model=StockTransferResponse)
async def receive_transfer(
    transfer_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> StockTransferResponse:
    """Receive in-transit stock transfer at target warehouse."""
    return await TransferService.receive_transfer(
        db=db,
        tenant_id=tenant_id,
        transfer_id=transfer_id,
        actor_id=current_user.id,
    )


# -------------------------------------------------------------
# Suppliers & Purchase Orders
# -------------------------------------------------------------
@router.get("/suppliers", response_model=list[SupplierResponse])
async def list_suppliers(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:read")),
) -> list[SupplierResponse]:
    """List suppliers."""
    return await PurchaseOrderService.list_suppliers(db=db, tenant_id=tenant_id)


@router.post(
    "/suppliers",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_supplier(
    data: SupplierCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> SupplierResponse:
    """Create a new supplier account."""
    return await PurchaseOrderService.create_supplier(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post(
    "/purchase-orders",
    response_model=PurchaseOrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_purchase_order(
    data: PurchaseOrderCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> PurchaseOrderResponse:
    """Create a procurement purchase order."""
    return await PurchaseOrderService.create_po(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )


@router.post(
    "/purchase-orders/{po_id}/receive",
    response_model=PurchaseOrderResponse,
)
async def receive_purchase_order(
    po_id: uuid.UUID,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("product:write")),
) -> PurchaseOrderResponse:
    """Receive ordered inventory from purchase order."""
    return await PurchaseOrderService.receive_po(
        db=db,
        tenant_id=tenant_id,
        po_id=po_id,
        actor_id=current_user.id,
    )


# -------------------------------------------------------------
# Fulfillments
# -------------------------------------------------------------
@router.post(
    "/fulfillments",
    response_model=FulfillmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_fulfillment(
    data: FulfillmentCreateRequest,
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_permission("order:write")),
) -> FulfillmentResponse:
    """Fulfill and ship an order from warehouse."""
    return await FulfillmentService.create_fulfillment(
        db=db,
        tenant_id=tenant_id,
        actor_id=current_user.id,
        data=data,
    )
