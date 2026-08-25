"""Automated Integration Test Suite for Deal Insights, Supplier Scorecards, FX Engine, MPT, and 3D Warehouse Routing."""

import pytest
from decimal import Decimal
from app.domain.crm_intelligence.predictive_deal_insights import (
    PredictiveDealInsightsEngine, CompetitorTier
)
from app.domain.supply_chain.supplier_scorecard import (
    SupplierScorecardEngine, SupplierPOReceiptRecord, SupplierTier
)
from app.domain.accounting.multi_currency_forex_engine import (
    ForeignExchangeEngine
)
from app.domain.compliance.audit_merkle_patricia import (
    MerklePatriciaTrieEngine
)
from app.domain.inventory.warehouse_3d_spatial_index import (
    SpatialWarehouseRoutingEngine, StorageBin3DCoordinate
)


def test_competitor_battlecard_and_margin_leakage():
    card = PredictiveDealInsightsEngine.get_battlecard("SALESFORCE")
    assert card is not None
    assert card.tier == CompetitorTier.LEGACY_ENTERPRISE
    assert len(card.winning_kill_shots) > 0

    # Margin leakage evaluation: 25% discount, Net-60 terms, custom SLA
    analysis = PredictiveDealInsightsEngine.evaluate_margin_leakage(
        deal_id="DEAL-001",
        base_amount_usd=Decimal("100000.00"),
        discount_pct=Decimal("25.00"),
        payment_terms_days=60,
        requires_custom_sla=True
    )
    assert analysis.is_suboptimal is True
    assert analysis.discretionary_discount_usd == Decimal("25000.00")
    assert len(analysis.remediation_recommendations) >= 2


def test_supplier_scorecard_evaluation():
    receipts = [
        SupplierPOReceiptRecord("PO-1", "SUP-1", "2026-08-01", "2026-08-01", 1000, 1000, 2, Decimal("50.00"), Decimal("50.00")),
        SupplierPOReceiptRecord("PO-2", "SUP-1", "2026-08-10", "2026-08-09", 500, 500, 0, Decimal("50.00"), Decimal("50.00")),
    ]
    summary = SupplierScorecardEngine.evaluate_supplier_performance("SUP-1", "Apex Silicon Ltd", receipts)
    assert summary.on_time_delivery_pct == 100.0
    assert summary.in_full_delivery_pct == 100.0
    assert summary.otif_composite_pct == 100.0
    assert summary.assigned_tier == SupplierTier.PREFERRED_TIER_1


def test_foreign_exchange_triangulation_and_revaluation():
    # Convert 1,000 EUR to USD
    usd_val = ForeignExchangeEngine.convert_currency(Decimal("1000.00"), "EUR", "USD")
    assert usd_val > Decimal("1000.00")

    # Convert 100 USD to GBP
    gbp_val = ForeignExchangeEngine.convert_currency(Decimal("100.00"), "USD", "GBP")
    assert gbp_val == Decimal("78.50")

    # ASC 830 Revaluation
    items = [
        ("11000", "AR - EUR Account", "EUR", Decimal("10000.00"), Decimal("1.0500")) # Historical was 1.05, current is ~1.081
    ]
    reval = ForeignExchangeEngine.revalue_monetary_balances(items)
    assert len(reval) == 1
    assert reval[0].is_gain is True
    assert reval[0].unrealized_gain_loss_usd > Decimal("0.00")


def test_merkle_patricia_trie_tamper_evidence():
    mpt = MerklePatriciaTrieEngine()
    root1 = mpt.insert("account:cust-001", {"name": "Acme Corp", "balance": 50000})
    assert len(root1) == 64

    # Verify state membership
    assert mpt.verify_state_membership("account:cust-001", {"name": "Acme Corp", "balance": 50000}) is True
    # Tampered state fails
    assert mpt.verify_state_membership("account:cust-001", {"name": "Acme Corp", "balance": 999999}) is False


def test_warehouse_3d_spatial_pick_route():
    start = StorageBin3DCoordinate("START-DOCK", 0.0, 0.0, 0.0)
    bins = [
        StorageBin3DCoordinate("BIN-A-01", 10.0, 5.0, 1.5),
        StorageBin3DCoordinate("BIN-A-02", 10.0, 12.0, 3.0),
        StorageBin3DCoordinate("BIN-B-05", 25.0, 8.0, 0.5),
    ]
    route = SpatialWarehouseRoutingEngine.compute_optimal_pick_route("ROUTE-01", start, bins)
    assert len(route.ordered_bin_sequence) == 3
    assert route.total_travel_distance_meters > 0.0
    assert route.estimated_pick_time_seconds > 0.0
