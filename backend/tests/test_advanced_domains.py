"""Automated Integration Test Suite for MRP-II, Global VAT, Multi-Echelon Networks, Fixed Assets, and Territories."""

import pytest
from decimal import Decimal
from app.domain.supply_chain.mrp_scheduler import (
    MRPEngine, TimeBucketMRP
)
from app.domain.tax_engine.global_vat_matrix import (
    GlobalVATRegistry, BusinessRegistrationType
)
from app.domain.supply_chain.multi_echelon_dmt import (
    MultiEchelonNetworkEngine, FacilityTier
)
from app.domain.accounting.fixed_assets_depreciation import (
    FixedAssetDepreciationEngine, FixedAssetMasterRecord, AssetCategory, DepreciationMethod
)
from app.domain.crm_intelligence.territory_management import (
    TerritoryRoutingEngine, TerritoryRegion, SalesRepresentative
)
from app.domain.analytics.rfm_segmentation import (
    RFMAnalyticsEngine, CustomerRFMProfile, RFMSegmentName
)


def test_mrp_gross_to_net_time_phased_netting():
    engine = MRPEngine()
    gross_reqs = [50, 100, 150, 200, 100, 50]
    sched_recs = [0, 50, 0, 0, 0, 0]

    record = engine.calculate_time_phased_mrp(
        sku="SRV-NODE-X9",
        name="Enterprise Compute Node",
        lead_time_buckets=2,
        safety_stock=20,
        initial_inventory=40,
        gross_requirements_by_bucket=gross_reqs,
        scheduled_receipts_by_bucket=sched_recs,
        lot_size_multiplier=50
    )
    assert len(record.buckets) == 6
    assert record.buckets[0].projected_available_balance >= record.safety_stock_level

    # Check RCCP capacity
    cap_report = engine.check_rough_cut_capacity("SRV-NODE-X9", [50, 100, 50, 50])
    assert len(cap_report) > 0


def test_global_vat_and_eu_reverse_charge():
    # 1. Domestic German B2C -> 19% MwSt
    tax_de, rate_de, _, rev_de = GlobalVATRegistry.evaluate_transaction_vat(
        seller_country_iso2="DE",
        buyer_country_iso2="DE",
        buyer_reg_type=BusinessRegistrationType.B2C_CONSUMER,
        buyer_vat_number=None,
        gross_subtotal_usd=Decimal("1000.00")
    )
    assert tax_de == Decimal("190.00")
    assert rate_de == Decimal("19.00")
    assert rev_de is False

    # 2. Cross-border EU B2B (Germany seller to France buyer with valid VAT) -> Reverse Charge 0%
    tax_fr, rate_fr, _, rev_fr = GlobalVATRegistry.evaluate_transaction_vat(
        seller_country_iso2="DE",
        buyer_country_iso2="FR",
        buyer_reg_type=BusinessRegistrationType.B2B_VERIFIED_VAT,
        buyer_vat_number="FR12345678901",
        gross_subtotal_usd=Decimal("1000.00")
    )
    assert tax_fr == Decimal("0.00")
    assert rev_fr is True


def test_multi_echelon_transfer_orders():
    engine = MultiEchelonNetworkEngine()
    transfers = engine.generate_network_rebalancing_transfers("SRV-NODE-X9")
    assert len(transfers) >= 1
    assert transfers[0].transfer_quantity > 0
    assert transfers[0].estimated_freight_cost_usd > Decimal("0.00")


def test_fixed_assets_depreciation_methods():
    # Straight-Line
    sl_sched = FixedAssetDepreciationEngine.calculate_straight_line(
        cost=Decimal("10000.00"),
        salvage=Decimal("1000.00"),
        life_years=5
    )
    assert len(sl_sched) == 5
    assert sl_sched[-1].ending_book_value == Decimal("1000.00")
    assert sum(s.depreciation_expense for s in sl_sched) == Decimal("9000.00")

    # MACRS 5-year
    macrs_sched = FixedAssetDepreciationEngine.calculate_macrs_5year(cost=Decimal("10000.00"))
    assert len(macrs_sched) == 6
    assert sum(s.depreciation_expense for s in macrs_sched) == Decimal("10000.00")


def test_territory_routing_and_accelerators():
    engine = TerritoryRoutingEngine()
    
    # Fortune 500 account -> Global Strategic Accounts
    rep_strat = engine.route_lead_to_representative("Global Mega Corp", "CA", 5000)
    assert rep_strat.assigned_territory == TerritoryRegion.GLOBAL_STRATEGIC_ACCOUNTS

    # Commission with 1.5x accelerator for rep at 100% quota
    rep = SalesRepresentative("rep-acc", "Top Performer", "top@test.com", TerritoryRegion.US_EAST, Decimal("1000000.00"), Decimal("1050000.00"), 10)
    comm_res = TerritoryRoutingEngine.calculate_deal_commission(rep, "DEAL-001", Decimal("50000.00"))
    assert comm_res.accelerator_multiplier == Decimal("1.50")
    # Base 10% on $50k is $5k * 1.5 = $7.5k
    assert comm_res.total_commission_earned_usd == Decimal("7500.00")


def test_rfm_analytics_segmentation():
    champion = CustomerRFMProfile(
        customer_id="CUST-CHAMP",
        account_name="Champion Enterprise",
        recency_days=5,
        frequency_orders_count=30,
        monetary_total_spend_usd=Decimal("200000.00"),
        average_order_value_usd=Decimal("6666.67"),
        first_order_date="2025-01-01",
        latest_order_date="2026-08-20"
    )
    res = RFMAnalyticsEngine.evaluate_customer(champion)
    assert res.rfm_cell == "555"
    assert res.segment == RFMSegmentName.CHAMPIONS
    assert res.predicted_annual_clv_usd > Decimal("100000.00")
