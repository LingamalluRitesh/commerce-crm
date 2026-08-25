"""Comprehensive Automated Test Suite for Route Optimization, Demand Forecasting, ASC 842, Consolidation CTA, Multi-Touch Attribution, Deal Risk Telemetry, CDR Rating, DOM Routing, and ISO 27001 ISMS."""

import pytest
from decimal import Decimal
from app.domain.supply_chain.advanced_route_optimization import (
    AdvancedRouteOptimizationEngine, GeoCoordinate, FleetVehicle, VehicleType, DeliveryStopDemand, StopPriority
)
from app.domain.supply_chain.stochastic_demand_forecasting import (
    StochasticDemandForecastingEngine, DemandPatternType
)
from app.domain.accounting.asc842_lease_accounting import (
    ASC842LeaseAccountingEngine, LeaseClassification
)
from app.domain.accounting.statutory_consolidation_currency_cta import (
    ASC830ConsolidationCTAEngine, SubsidiaryEntityBalanceSheet
)
from app.domain.crm_intelligence.multi_touch_attribution_markov import (
    MultiTouchAttributionEngine, CustomerJourneyPath, JourneyTouchpoint, ChannelType
)
from app.domain.crm_intelligence.deal_risk_telemetry_nlp import (
    DealRiskTelemetryEngine, ConversationSignalEvent, DealObjectionTaxonomy, RiskSeverity
)
from app.domain.commerce.usage_rating_cdr_mediation import (
    UsageCDRMediationRatingEngine, RawUsageEventRecord, MeteredMetricType
)
from app.domain.commerce.omnichannel_inventory_allocation import (
    OmnichannelDOMRoutingEngine, InventoryNodeLocation, NodeFulfillmentType, OrderLineItem
)
from app.domain.compliance.iso27001_isms_soa_matrix import (
    ISO27001ISMSGovernanceEngine, ImplementationStatus
)


def test_advanced_route_optimization():
    depot = GeoCoordinate(37.7749, -122.4194)  # SF
    vehicles = [
        FleetVehicle("TRK-01", VehicleType.BOX_TRUCK_26FT, 16000.0, 1700.0, Decimal("2.85"), 8.5, 920.0, depot)
    ]
    stops = [
        DeliveryStopDemand("STP-1", "Apex SF", GeoCoordinate(37.7833, -122.4167), 2500.0, 200.0, 480, 720, 20),
        DeliveryStopDemand("STP-2", "Oakland Hub", GeoCoordinate(37.8044, -122.2711), 3200.0, 310.0, 480, 720, 25)
    ]
    routes = AdvancedRouteOptimizationEngine.optimize_fleet_routes(depot, vehicles, stops)
    assert len(routes) == 1
    r = routes[0]
    assert r.total_distance_miles > 0.0
    assert r.total_operating_cost_usd > Decimal("0.00")
    assert r.meets_dot_hos_limits is True


def test_stochastic_demand_forecasting():
    demand_hist = [100.0, 120.0, 150.0, 210.0, 110.0, 130.0, 160.0, 230.0]
    res = StochasticDemandForecastingEngine.fit_holt_winters_forecast("SKU-TEST", demand_hist, season_length=4, horizon=4)
    assert res.sku == "SKU-TEST"
    assert res.mape_accuracy_pct > 70.0
    assert len(res.forecast_points) == 4
    assert res.recommended_safety_stock_units > 0


def test_asc842_lease_accounting():
    summary = ASC842LeaseAccountingEngine.classify_and_amortize_lease(
        lease_id="LSE-01",
        asset_description="Office HQ",
        lessor_name="REIT Corp",
        commencement_date="2026-01-01",
        term_months=36,
        monthly_payment_usd=Decimal("10000.00"),
        discount_rate_annual_pct=6.0,
        asset_fair_market_val_usd=Decimal("500000.00"),
        economic_life_months=120
    )
    assert summary.classification == LeaseClassification.OPERATING_LEASE
    assert summary.initial_lease_liability_usd > Decimal("300000.00")
    assert len(summary.schedule) == 36
    assert summary.schedule[-1].ending_lease_liability_usd == Decimal("0.00")


def test_consolidation_cta_engine():
    sub = SubsidiaryEntityBalanceSheet(
        entity_code="UK_LTD",
        entity_name="UK Sub",
        functional_currency="GBP",
        local_assets=Decimal("1000000.00"),
        local_liabilities=Decimal("400000.00"),
        local_share_capital=Decimal("300000.00"),
        local_retained_earnings=Decimal("200000.00"),
        local_net_income=Decimal("100000.00")
    )
    res = ASC830ConsolidationCTAEngine.translate_foreign_subsidiary(
        sub, spot_rate=Decimal("1.30"), avg_rate=Decimal("1.25"), hist_rate=Decimal("1.20")
    )
    assert res.is_balanced is True
    assert res.translated_assets_usd == Decimal("1300000.00")


def test_multi_touch_attribution_engine():
    journeys = [
        CustomerJourneyPath("C-1", "D-1", Decimal("50000.00"), True, [
            JourneyTouchpoint("T-1", ChannelType.PAID_SEARCH_SEM, "Google", "2026-01-01", Decimal("500.00")),
            JourneyTouchpoint("T-2", ChannelType.LINKEDIN_SPONSORED, "LinkedIn", "2026-01-05", Decimal("800.00")),
        ])
    ]
    spends = {ChannelType.PAID_SEARCH_SEM: Decimal("5000.00"), ChannelType.LINKEDIN_SPONSORED: Decimal("8000.00")}
    res = MultiTouchAttributionEngine.calculate_attribution_matrix(journeys, spends)
    assert len(res) == len(ChannelType)
    sem = next(r for r in res if r.channel == ChannelType.PAID_SEARCH_SEM)
    assert sem.first_touch_revenue_usd == Decimal("50000.00")


def test_deal_risk_telemetry():
    signals = [
        ConversationSignalEvent("2026-01-01", "EMAIL", "VP Engineering", -0.5, DealObjectionTaxonomy.PRICING_BUDGET_FREEZE, True)
    ]
    profile = DealRiskTelemetryEngine.evaluate_deal_risk(
        "DL-1", "Cloud Deal", "Acme", Decimal("100000.00"), "Negotiation", 45, 15, 20, signals
    )
    assert profile.risk_level == RiskSeverity.CRITICAL_DEAL_AT_RISK
    assert profile.overall_health_score < 50.0


def test_cdr_mediation_rating():
    events = [
        RawUsageEventRecord("E-1", "T-100", MeteredMetricType.API_CALLS_VOLUME, 500000, "2026-01-01", False),
        RawUsageEventRecord("E-2", "T-100", MeteredMetricType.API_CALLS_VOLUME, 800000, "2026-01-02", True),
    ]
    billing = UsageCDRMediationRatingEngine.rate_tenant_consumption(
        "T-100", MeteredMetricType.API_CALLS_VOLUME, events, prepaid_credit_balance_usd=Decimal("50.00")
    )
    assert billing.total_consumed_units == 1300000
    assert billing.rated_charge_usd > Decimal("0.00")
    assert billing.prepaid_credit_applied_usd > Decimal("0.00")


def test_dom_order_routing():
    nodes = [
        InventoryNodeLocation("DC-1", "Dallas RDC", NodeFulfillmentType.REGIONAL_DC, 32.7767, -96.7970, Decimal("8.00"), {"SKU-A": 10, "SKU-B": 5}),
        InventoryNodeLocation("MFC-2", "Austin MFC", NodeFulfillmentType.MICRO_FULFILLMENT_MFC, 30.2672, -97.7431, Decimal("5.00"), {"SKU-A": 2, "SKU-B": 0}),
    ]
    items = [OrderLineItem("SKU-A", 2, Decimal("100.00")), OrderLineItem("SKU-B", 1, Decimal("200.00"))]
    result = OmnichannelDOMRoutingEngine.route_order("ORD-1", 30.2672, -97.7431, items, nodes)
    assert result.is_split_shipment is False
    assert result.total_packages_split == 1
    assert result.shipment_packages[0].fulfilling_node_id == "DC-1"


def test_iso27001_isms_governance():
    report = ISO27001ISMSGovernanceEngine.generate_statement_of_applicability()
    assert report.total_controls_count == 93
    assert report.compliance_score_pct == 100.0
    assert len(report.controls) >= 7
