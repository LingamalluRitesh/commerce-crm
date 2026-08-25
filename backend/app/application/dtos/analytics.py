from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SalesMetrics(BaseModel):
    total_deals: int = 0
    won_deals: int = 0
    lost_deals: int = 0
    total_pipeline_value: Decimal = Decimal("0.00")
    won_pipeline_value: Decimal = Decimal("0.00")
    win_rate_percent: Decimal = Decimal("0.00")
    average_deal_size: Decimal = Decimal("0.00")


class CommerceMetrics(BaseModel):
    total_orders: int = 0
    paid_orders: int = 0
    total_revenue: Decimal = Decimal("0.00")
    average_order_value: Decimal = Decimal("0.00")
    total_refunds: Decimal = Decimal("0.00")


class CustomerMetrics(BaseModel):
    total_customers: int = 0
    active_customers: int = 0
    churned_customers: int = 0
    average_health_score: int = 100
    total_lifetime_value: Decimal = Decimal("0.00")


class SupportMetrics(BaseModel):
    total_tickets: int = 0
    open_tickets: int = 0
    resolved_tickets: int = 0
    average_csat: Decimal = Decimal("0.00")
    resolution_rate_percent: Decimal = Decimal("0.00")


class InventoryMetrics(BaseModel):
    total_warehouses: int = 0
    total_products: int = 0
    total_stock_on_hand: int = 0


class ExecutiveDashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sales: SalesMetrics
    commerce: CommerceMetrics
    customers: CustomerMetrics
    support: SupportMetrics
    inventory: InventoryMetrics


class RevenueTrendItem(BaseModel):
    date: str
    revenue: Decimal
    order_count: int


class FunnelStageMetric(BaseModel):
    stage_name: str
    stage_order: int
    deal_count: int
    total_value: Decimal
    probability: int
