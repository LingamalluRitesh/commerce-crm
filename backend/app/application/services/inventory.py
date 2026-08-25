import secrets
import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.application.dtos.inventory import (
    FulfillmentCreateRequest,
    FulfillmentResponse,
    PurchaseOrderCreateRequest,
    PurchaseOrderItemResponse,
    PurchaseOrderResponse,
    StockAdjustRequest,
    StockItemResponse,
    StockTransferCreateRequest,
    StockTransferItemResponse,
    StockTransferResponse,
    SupplierCreateRequest,
    SupplierResponse,
    WarehouseCreateRequest,
    WarehouseResponse,
)
from app.application.services.audit import AuditService
from app.core.errors import ConflictError, NotFoundError, ValidationAppError
from app.infrastructure.models.commerce import Order
from app.infrastructure.models.inventory import (
    Fulfillment,
    PurchaseOrder,
    PurchaseOrderItem,
    StockItem,
    StockMovement,
    StockTransfer,
    StockTransferItem,
    Supplier,
    Warehouse,
)


class WarehouseService:
    @staticmethod
    async def create_warehouse(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: WarehouseCreateRequest,
    ) -> WarehouseResponse:
        code_upper = data.code.strip().upper()
        existing = await db.execute(
            select(Warehouse).where(Warehouse.tenant_id == tenant_id, Warehouse.code == code_upper)
        )
        if existing.scalar_one_or_none():
            raise ConflictError(f"Warehouse with code '{code_upper}' already exists.")

        warehouse = Warehouse(
            tenant_id=tenant_id,
            name=data.name.strip(),
            code=code_upper,
            address_line1=data.address_line1,
            city=data.city,
            state=data.state,
            postal_code=data.postal_code,
            country=data.country,
            is_primary=data.is_primary,
            is_active=True,
        )
        db.add(warehouse)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="warehouse:created",
            entity_type="Warehouse",
            entity_id=str(warehouse.id),
            new_values={"name": warehouse.name, "code": warehouse.code},
        )

        return WarehouseResponse.model_validate(warehouse)

    @staticmethod
    async def list_warehouses(db: AsyncSession, tenant_id: uuid.UUID) -> list[WarehouseResponse]:
        res = await db.execute(
            select(Warehouse)
            .where(Warehouse.tenant_id == tenant_id, Warehouse.is_active.is_(True))
            .order_by(Warehouse.name)
        )
        return [WarehouseResponse.model_validate(w) for w in res.scalars().all()]


class InventoryService:
    @staticmethod
    async def get_or_create_stock_item(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        warehouse_id: uuid.UUID,
        product_id: uuid.UUID,
        variant_id: uuid.UUID | None = None,
    ) -> StockItem:
        query = select(StockItem).where(
            StockItem.tenant_id == tenant_id,
            StockItem.warehouse_id == warehouse_id,
            StockItem.product_id == product_id,
            StockItem.variant_id == variant_id,
        )
        res = await db.execute(query)
        stock_item = res.scalar_one_or_none()

        if not stock_item:
            stock_item = StockItem(
                tenant_id=tenant_id,
                warehouse_id=warehouse_id,
                product_id=product_id,
                variant_id=variant_id,
                quantity_on_hand=0,
                quantity_reserved=0,
            )
            db.add(stock_item)
            await db.flush()

        return stock_item

    @staticmethod
    async def adjust_stock(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: StockAdjustRequest,
    ) -> StockItemResponse:
        stock_item = await InventoryService.get_or_create_stock_item(
            db, tenant_id, data.warehouse_id, data.product_id, data.variant_id
        )

        new_qty = stock_item.quantity_on_hand + data.quantity_delta
        if new_qty < 0:
            raise ValidationAppError(
                f"Cannot reduce stock below 0. Current: {stock_item.quantity_on_hand}, "
                f"Requested delta: {data.quantity_delta}"
            )

        stock_item.quantity_on_hand = new_qty

        # Record Ledger Movement
        movement = StockMovement(
            tenant_id=tenant_id,
            warehouse_id=data.warehouse_id,
            product_id=data.product_id,
            variant_id=data.variant_id,
            quantity_delta=data.quantity_delta,
            movement_type=data.movement_type,
            reference_type=data.reference_type,
            reference_id=data.reference_id,
            note=data.note,
        )
        db.add(movement)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="stock:adjusted",
            entity_type="StockItem",
            entity_id=str(stock_item.id),
            new_values={
                "quantity_on_hand": stock_item.quantity_on_hand,
                "delta": data.quantity_delta,
            },
        )

        return StockItemResponse(
            id=stock_item.id,
            tenant_id=stock_item.tenant_id,
            warehouse_id=stock_item.warehouse_id,
            product_id=stock_item.product_id,
            variant_id=stock_item.variant_id,
            quantity_on_hand=stock_item.quantity_on_hand,
            quantity_reserved=stock_item.quantity_reserved,
            quantity_available=stock_item.quantity_available,
            reorder_threshold=stock_item.reorder_threshold,
            reorder_quantity=stock_item.reorder_quantity,
        )

    @staticmethod
    async def list_stock(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        warehouse_id: uuid.UUID | None = None,
    ) -> list[StockItemResponse]:
        query = select(StockItem).where(StockItem.tenant_id == tenant_id)
        if warehouse_id:
            query = query.where(StockItem.warehouse_id == warehouse_id)

        res = await db.execute(query)
        items = res.scalars().all()
        return [
            StockItemResponse(
                id=si.id,
                tenant_id=si.tenant_id,
                warehouse_id=si.warehouse_id,
                product_id=si.product_id,
                variant_id=si.variant_id,
                quantity_on_hand=si.quantity_on_hand,
                quantity_reserved=si.quantity_reserved,
                quantity_available=si.quantity_available,
                reorder_threshold=si.reorder_threshold,
                reorder_quantity=si.reorder_quantity,
            )
            for si in items
        ]


class TransferService:
    @staticmethod
    async def create_transfer(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: StockTransferCreateRequest,
    ) -> StockTransferResponse:
        if data.source_warehouse_id == data.target_warehouse_id:
            raise ValidationAppError("Source and target warehouses cannot be the same.")

        transfer_number = (
            f"TRF-{datetime.now(UTC).strftime('%Y%m%d')}-{secrets.token_hex(2).upper()}"
        )

        transfer = StockTransfer(
            tenant_id=tenant_id,
            source_warehouse_id=data.source_warehouse_id,
            target_warehouse_id=data.target_warehouse_id,
            transfer_number=transfer_number,
            status="in_transit",
            shipped_at=datetime.now(UTC),
        )
        db.add(transfer)
        await db.flush()

        transfer_items = []
        for it in data.items:
            # Deduct from source warehouse
            src_stock = await InventoryService.get_or_create_stock_item(
                db, tenant_id, data.source_warehouse_id, it.product_id, it.variant_id
            )
            if src_stock.quantity_available < it.quantity:
                raise ValidationAppError(
                    f"Insufficient stock for product {it.product_id}. "
                    f"Available: {src_stock.quantity_available}, Requested: {it.quantity}"
                )

            src_stock.quantity_on_hand -= it.quantity

            # Ledger movement
            db.add(
                StockMovement(
                    tenant_id=tenant_id,
                    warehouse_id=data.source_warehouse_id,
                    product_id=it.product_id,
                    variant_id=it.variant_id,
                    quantity_delta=-it.quantity,
                    movement_type="transfer_out",
                    reference_type="transfer",
                    reference_id=transfer.transfer_number,
                )
            )

            t_item = StockTransferItem(
                tenant_id=tenant_id,
                transfer_id=transfer.id,
                product_id=it.product_id,
                variant_id=it.variant_id,
                quantity=it.quantity,
            )
            db.add(t_item)
            transfer_items.append(t_item)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="transfer:created",
            entity_type="StockTransfer",
            entity_id=str(transfer.id),
            new_values={"transfer_number": transfer.transfer_number},
        )

        return StockTransferResponse(
            id=transfer.id,
            tenant_id=transfer.tenant_id,
            source_warehouse_id=transfer.source_warehouse_id,
            target_warehouse_id=transfer.target_warehouse_id,
            transfer_number=transfer.transfer_number,
            status=transfer.status,
            shipped_at=transfer.shipped_at,
            received_at=transfer.received_at,
            items=[StockTransferItemResponse.model_validate(ti) for ti in transfer_items],
            created_at=transfer.created_at,
        )

    @staticmethod
    async def receive_transfer(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        transfer_id: uuid.UUID,
        actor_id: uuid.UUID | None,
    ) -> StockTransferResponse:
        res = await db.execute(
            select(StockTransfer)
            .where(StockTransfer.id == transfer_id, StockTransfer.tenant_id == tenant_id)
            .options(selectinload(StockTransfer.items))
        )
        transfer = res.scalar_one_or_none()
        if not transfer:
            raise NotFoundError("StockTransfer", transfer_id)

        if transfer.status == "received":
            raise ConflictError("Transfer has already been received.")

        # Increment target warehouse stock
        for it in transfer.items:
            tgt_stock = await InventoryService.get_or_create_stock_item(
                db, tenant_id, transfer.target_warehouse_id, it.product_id, it.variant_id
            )
            tgt_stock.quantity_on_hand += it.quantity

            db.add(
                StockMovement(
                    tenant_id=tenant_id,
                    warehouse_id=transfer.target_warehouse_id,
                    product_id=it.product_id,
                    variant_id=it.variant_id,
                    quantity_delta=it.quantity,
                    movement_type="transfer_in",
                    reference_type="transfer",
                    reference_id=transfer.transfer_number,
                )
            )

        transfer.status = "received"
        transfer.received_at = datetime.now(UTC)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="transfer:received",
            entity_type="StockTransfer",
            entity_id=str(transfer.id),
            new_values={"status": "received"},
        )

        return StockTransferResponse(
            id=transfer.id,
            tenant_id=transfer.tenant_id,
            source_warehouse_id=transfer.source_warehouse_id,
            target_warehouse_id=transfer.target_warehouse_id,
            transfer_number=transfer.transfer_number,
            status=transfer.status,
            shipped_at=transfer.shipped_at,
            received_at=transfer.received_at,
            items=[StockTransferItemResponse.model_validate(ti) for ti in transfer.items],
            created_at=transfer.created_at,
        )


class PurchaseOrderService:
    @staticmethod
    async def create_supplier(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: SupplierCreateRequest,
    ) -> SupplierResponse:
        supplier = Supplier(
            tenant_id=tenant_id,
            name=data.name.strip(),
            contact_name=data.contact_name,
            email=data.email.lower(),
            phone=data.phone,
            payment_terms=data.payment_terms,
            currency=data.currency,
            is_active=True,
        )
        db.add(supplier)
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="supplier:created",
            entity_type="Supplier",
            entity_id=str(supplier.id),
            new_values={"name": supplier.name},
        )

        return SupplierResponse.model_validate(supplier)

    @staticmethod
    async def list_suppliers(db: AsyncSession, tenant_id: uuid.UUID) -> list[SupplierResponse]:
        res = await db.execute(
            select(Supplier).where(Supplier.tenant_id == tenant_id).order_by(Supplier.name)
        )
        return [SupplierResponse.model_validate(s) for s in res.scalars().all()]

    @staticmethod
    async def create_po(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: PurchaseOrderCreateRequest,
    ) -> PurchaseOrderResponse:
        # Compute Total
        total_amount = Decimal("0.00")
        for it in data.items:
            total_amount += it.unit_cost * Decimal(str(it.quantity_ordered))

        po_number = f"PO-{datetime.now(UTC).strftime('%Y%m%d')}-{secrets.token_hex(2).upper()}"

        po = PurchaseOrder(
            tenant_id=tenant_id,
            supplier_id=data.supplier_id,
            warehouse_id=data.warehouse_id,
            po_number=po_number,
            status="ordered",
            total_amount=total_amount,
            expected_delivery_date=data.expected_delivery_date,
        )
        db.add(po)
        await db.flush()

        po_items = []
        for it in data.items:
            po_item = PurchaseOrderItem(
                tenant_id=tenant_id,
                purchase_order_id=po.id,
                product_id=it.product_id,
                variant_id=it.variant_id,
                quantity_ordered=it.quantity_ordered,
                unit_cost=it.unit_cost,
                total_cost=it.unit_cost * Decimal(str(it.quantity_ordered)),
            )
            db.add(po_item)
            po_items.append(po_item)

        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="po:created",
            entity_type="PurchaseOrder",
            entity_id=str(po.id),
            new_values={"po_number": po.po_number, "total_amount": str(po.total_amount)},
        )

        return PurchaseOrderResponse(
            id=po.id,
            tenant_id=po.tenant_id,
            supplier_id=po.supplier_id,
            warehouse_id=po.warehouse_id,
            po_number=po.po_number,
            status=po.status,
            total_amount=po.total_amount,
            currency=po.currency,
            expected_delivery_date=po.expected_delivery_date,
            items=[PurchaseOrderItemResponse.model_validate(pi) for pi in po_items],
            created_at=po.created_at,
        )

    @staticmethod
    async def receive_po(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        po_id: uuid.UUID,
        actor_id: uuid.UUID | None,
    ) -> PurchaseOrderResponse:
        res = await db.execute(
            select(PurchaseOrder)
            .where(PurchaseOrder.id == po_id, PurchaseOrder.tenant_id == tenant_id)
            .options(selectinload(PurchaseOrder.items))
        )
        po = res.scalar_one_or_none()
        if not po:
            raise NotFoundError("PurchaseOrder", po_id)

        if po.status == "received":
            raise ConflictError("Purchase order is already received.")

        for it in po.items:
            it.quantity_received = it.quantity_ordered
            stock_item = await InventoryService.get_or_create_stock_item(
                db, tenant_id, po.warehouse_id, it.product_id, it.variant_id
            )
            stock_item.quantity_on_hand += it.quantity_ordered

            db.add(
                StockMovement(
                    tenant_id=tenant_id,
                    warehouse_id=po.warehouse_id,
                    product_id=it.product_id,
                    variant_id=it.variant_id,
                    quantity_delta=it.quantity_ordered,
                    movement_type="inbound",
                    reference_type="purchase_order",
                    reference_id=po.po_number,
                )
            )

        po.status = "received"
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="po:received",
            entity_type="PurchaseOrder",
            entity_id=str(po.id),
            new_values={"status": "received"},
        )

        return PurchaseOrderResponse(
            id=po.id,
            tenant_id=po.tenant_id,
            supplier_id=po.supplier_id,
            warehouse_id=po.warehouse_id,
            po_number=po.po_number,
            status=po.status,
            total_amount=po.total_amount,
            currency=po.currency,
            expected_delivery_date=po.expected_delivery_date,
            items=[PurchaseOrderItemResponse.model_validate(pi) for pi in po.items],
            created_at=po.created_at,
        )


class FulfillmentService:
    @staticmethod
    async def create_fulfillment(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        actor_id: uuid.UUID | None,
        data: FulfillmentCreateRequest,
    ) -> FulfillmentResponse:
        order_res = await db.execute(
            select(Order).where(Order.id == data.order_id, Order.tenant_id == tenant_id)
        )
        order = order_res.scalar_one_or_none()
        if not order:
            raise NotFoundError("Order", data.order_id)

        tracking_num = data.tracking_number or f"TRK-{secrets.token_hex(6).upper()}"

        fulfillment = Fulfillment(
            tenant_id=tenant_id,
            order_id=order.id,
            warehouse_id=data.warehouse_id,
            carrier=data.carrier,
            tracking_number=tracking_num,
            status="shipped",
            shipped_at=datetime.now(UTC),
        )
        db.add(fulfillment)

        order.status = "SHIPPED"
        await db.flush()

        await AuditService.log_action(
            db=db,
            tenant_id=tenant_id,
            user_id=actor_id,
            action="fulfillment:created",
            entity_type="Fulfillment",
            entity_id=str(fulfillment.id),
            new_values={"tracking_number": tracking_num, "carrier": data.carrier},
        )

        return FulfillmentResponse.model_validate(fulfillment)
