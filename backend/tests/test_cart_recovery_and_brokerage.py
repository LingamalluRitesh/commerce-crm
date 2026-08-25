"""Automated Integration Test Suite for Cart Recovery, Customs Brokerage & Collaborative Forecasting."""

import pytest
from decimal import Decimal
from app.domain.commerce.cart_abandonment_recovery import (
    CartRecoveryEngine, AbandonedCartSession, AbandonedCartItem, AbandonmentStage, RecoveryChannel
)
from app.domain.logistics.freight_customs_brokerage import (
    CustomsBrokerageComplianceEngine, ContinuousBondRequirement
)
from app.domain.crm_intelligence.deal_collaborative_forecasting import (
    CollaborativeForecastingEngine, ForecastOpportunity, ForecastCategory
)


def test_cart_abandonment_salvage_sequence():
    items = [
        AbandonedCartItem("SRV-NODE-X9", "Enterprise Server", Decimal("4500.00"), 1),
        AbandonedCartItem("RAM-64GB-ECC", "RAM Module", Decimal("180.00"), 4),
    ]
    # Total = 4500 + 720 = $5,220 -> Triggers SDR priority call + Email stages
    session = AbandonedCartSession(
        session_id="SESS-8912",
        customer_email="buyer@apexcloud.com",
        customer_name="Marcus Vance",
        cart_items=items,
        abandonment_stage=AbandonmentStage.PAYMENT_GATEWAY_ABANDONED,
        abandoned_at="2026-08-25T10:00:00Z"
    )
    actions = CartRecoveryEngine.evaluate_abandoned_session(session)
    assert len(actions) == 3  # SDR + Stage 1 + Stage 2
    assert actions[0].channel == RecoveryChannel.SDR_OUTBOUND_CALL
    assert "VIPRECOVER" in actions[0].coupon_code


def test_customs_continuous_import_bond_calculation():
    # $380,000 annual duties -> 10% = $38,000 -> below minimum $50k -> bond is $50,000
    bond1 = CustomsBrokerageComplianceEngine.calculate_continuous_import_bond(Decimal("380000.00"))
    assert bond1.required_continuous_bond_amount_usd == Decimal("50000.00")

    # $1,250,000 annual duties -> 10% = $125,000 -> rounds up to nearest $10k -> $130,000
    bond2 = CustomsBrokerageComplianceEngine.calculate_continuous_import_bond(Decimal("1250000.00"))
    assert bond2.required_continuous_bond_amount_usd == Decimal("130000.00")


def test_collaborative_sales_forecasting():
    deals = [
        ForecastOpportunity("D-01", "Acme Enterprise Rollout", "Acme", Decimal("150000.00"), ForecastCategory.CLOSED_WON, 100.0, "2026-09-15", "Sarah"),
        ForecastOpportunity("D-02", "Global Cloud Deal", "Global", Decimal("200000.00"), ForecastCategory.COMMIT, 90.0, "2026-09-20", "Marcus"),
        ForecastOpportunity("D-03", "Apex Pilot", "Apex", Decimal("80000.00"), ForecastCategory.BEST_CASE, 50.0, "2026-09-30", "Sarah"),
    ]
    summary = CollaborativeForecastingEngine.aggregate_forecast(
        quarter_label="Q3-2026",
        team_quota_usd=Decimal("400000.00"),
        deals=deals,
        historical_slippage_pct=10.0
    )
    assert summary.closed_won_total_usd == Decimal("150000.00")
    assert summary.commit_total_usd == Decimal("200000.00")
    assert summary.best_case_total_usd == Decimal("80000.00")
    assert summary.quota_attainment_pct > 80.0
