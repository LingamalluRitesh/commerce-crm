import uuid
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.analytics import (
    CommerceMetrics,
    CustomerMetrics,
    ExecutiveDashboardResponse,
    FunnelStageMetric,
    InventoryMetrics,
    SalesMetrics,
    SupportMetrics,
)
from app.infrastructure.models.commerce import Order, Product
from app.infrastructure.models.customer import Customer
from app.infrastructure.models.inventory import StockItem, Warehouse
from app.infrastructure.models.sales import Deal, Pipeline, PipelineStage
from app.infrastructure.models.support import Ticket


class AnalyticsService:
    @staticmethod
    async def get_dashboard(db: AsyncSession, tenant_id: uuid.UUID) -> ExecutiveDashboardResponse:
        # 1. Sales Metrics
        deals_res = await db.execute(
            select(
                func.count(Deal.id).label("total"),
                func.count(Deal.id).filter(Deal.status == "won").label("won"),
                func.count(Deal.id).filter(Deal.status == "lost").label("lost"),
                func.coalesce(func.sum(Deal.value), 0).label("total_val"),
                func.coalesce(func.sum(Deal.value).filter(Deal.status == "won"), 0).label(
                    "won_val"
                ),
            ).where(Deal.tenant_id == tenant_id)
        )
        s_row = deals_res.one()
        s_total = s_row.total or 0
        s_won = s_row.won or 0
        s_lost = s_row.lost or 0
        s_tot_val = Decimal(str(s_row.total_val))
        s_won_val = Decimal(str(s_row.won_val))
        win_rate = (
            (Decimal(str(s_won)) / Decimal(str(s_total)) * Decimal("100.00"))
            if s_total > 0
            else Decimal("0.00")
        )
        avg_deal = (s_tot_val / Decimal(str(s_total))) if s_total > 0 else Decimal("0.00")

        sales_metrics = SalesMetrics(
            total_deals=s_total,
            won_deals=s_won,
            lost_deals=s_lost,
            total_pipeline_value=s_tot_val,
            won_pipeline_value=s_won_val,
            win_rate_percent=win_rate,
            average_deal_size=avg_deal,
        )

        # 2. Commerce Metrics
        orders_res = await db.execute(
            select(
                func.count(Order.id).label("total"),
                func.count(Order.id).filter(Order.payment_status == "paid").label("paid"),
                func.coalesce(
                    func.sum(Order.total_amount).filter(Order.payment_status == "paid"), 0
                ).label("revenue"),
                func.coalesce(
                    func.sum(Order.total_amount).filter(Order.payment_status == "refunded"), 0
                ).label("refunds"),
            ).where(Order.tenant_id == tenant_id)
        )
        o_row = orders_res.one()
        o_total = o_row.total or 0
        o_paid = o_row.paid or 0
        o_rev = Decimal(str(o_row.revenue))
        o_ref = Decimal(str(o_row.refunds))
        aov = (o_rev / Decimal(str(o_paid))) if o_paid > 0 else Decimal("0.00")

        commerce_metrics = CommerceMetrics(
            total_orders=o_total,
            paid_orders=o_paid,
            total_revenue=o_rev,
            average_order_value=aov,
            total_refunds=o_ref,
        )

        # 3. Customer Metrics
        custs_res = await db.execute(
            select(
                func.count(Customer.id).label("total"),
                func.count(Customer.id).filter(Customer.status == "active").label("active"),
                func.count(Customer.id).filter(Customer.status == "churned").label("churned"),
                func.coalesce(func.avg(Customer.health_score), 100).label("avg_health"),
                func.coalesce(func.sum(Customer.lifetime_value), 0).label("total_ltv"),
            ).where(Customer.tenant_id == tenant_id)
        )
        c_row = custs_res.one()
        customer_metrics = CustomerMetrics(
            total_customers=c_row.total or 0,
            active_customers=c_row.active or 0,
            churned_customers=c_row.churned or 0,
            average_health_score=int(c_row.avg_health),
            total_lifetime_value=Decimal(str(c_row.total_ltv)),
        )

        # 4. Support Metrics
        tck_res = await db.execute(
            select(
                func.count(Ticket.id).label("total"),
                func.count(Ticket.id).filter(Ticket.status == "open").label("open"),
                func.count(Ticket.id).filter(Ticket.status == "resolved").label("resolved"),
                func.coalesce(
                    func.avg(Ticket.satisfaction_score).filter(
                        Ticket.satisfaction_score.isnot(None)
                    ),
                    0,
                ).label("avg_csat"),
            ).where(Ticket.tenant_id == tenant_id)
        )
        t_row = tck_res.one()
        t_total = t_row.total or 0
        t_res = t_row.resolved or 0
        res_rate = (
            (Decimal(str(t_res)) / Decimal(str(t_total)) * Decimal("100.00"))
            if t_total > 0
            else Decimal("0.00")
        )

        support_metrics = SupportMetrics(
            total_tickets=t_total,
            open_tickets=t_row.open or 0,
            resolved_tickets=t_res,
            average_csat=Decimal(str(round(t_row.avg_csat, 2))),
            resolution_rate_percent=res_rate,
        )

        # 5. Inventory Metrics
        wh_cnt_res = await db.execute(
            select(func.count(Warehouse.id)).where(Warehouse.tenant_id == tenant_id)
        )
        prod_cnt_res = await db.execute(
            select(func.count(Product.id)).where(Product.tenant_id == tenant_id)
        )
        stock_cnt_res = await db.execute(
            select(func.coalesce(func.sum(StockItem.quantity_on_hand), 0)).where(
                StockItem.tenant_id == tenant_id
            )
        )

        inventory_metrics = InventoryMetrics(
            total_warehouses=wh_cnt_res.scalar_one(),
            total_products=prod_cnt_res.scalar_one(),
            total_stock_on_hand=stock_cnt_res.scalar_one(),
        )

        return ExecutiveDashboardResponse(
            sales=sales_metrics,
            commerce=commerce_metrics,
            customers=customer_metrics,
            support=support_metrics,
            inventory=inventory_metrics,
        )

    @staticmethod
    async def get_sales_funnel(db: AsyncSession, tenant_id: uuid.UUID) -> list[FunnelStageMetric]:
        query = (
            select(
                PipelineStage.name.label("stage_name"),
                PipelineStage.order_index.label("stage_order"),
                PipelineStage.probability.label("probability"),
                func.count(Deal.id).label("deal_count"),
                func.coalesce(func.sum(Deal.value), 0).label("total_value"),
            )
            .join(Pipeline, Pipeline.id == PipelineStage.pipeline_id)
            .outerjoin(Deal, Deal.stage_id == PipelineStage.id)
            .where(PipelineStage.tenant_id == tenant_id)
            .group_by(
                PipelineStage.id,
                PipelineStage.name,
                PipelineStage.order_index,
                PipelineStage.probability,
            )
            .order_by(PipelineStage.order_index.asc())
        )
        res = await db.execute(query)
        rows = res.all()

        return [
            FunnelStageMetric(
                stage_name=r.stage_name,
                stage_order=r.stage_order,
                deal_count=r.deal_count,
                total_value=Decimal(str(r.total_value)),
                probability=r.probability,
            )
            for r in rows
        ]
