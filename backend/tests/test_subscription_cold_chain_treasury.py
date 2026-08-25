"""Automated Integration Test Suite for Subscription Billing, Cold Chain IoT, Financial Statements & Retention Playbooks."""

import pytest
from decimal import Decimal
from app.domain.commerce.subscription_billing import (
    SubscriptionBillingEngine, SubscriptionAccountState, BillingCadence, SubscriptionStatus, DunningStage
)
from app.domain.logistics.cold_chain_iot import (
    ColdChainIoTEngine, ColdChainZone, TelemetrySensorReading
)
from app.domain.accounting.statutory_balance_sheet import (
    StatutoryFinancialStatementEngine
)
from app.domain.crm_intelligence.churn_retention_playbooks import (
    RetentionPlaybookEngine, PlaybookSeverity
)


def test_subscription_seat_proration_and_dunning():
    sub = SubscriptionAccountState(
        subscription_id="sub-001",
        customer_id="cust-001",
        plan_tier="ENTERPRISE",
        cadence=BillingCadence.MONTHLY,
        unit_price_usd=Decimal("50.00"),
        quantity_seats=10,
        current_period_start="2026-08-01",
        current_period_end="2026-08-31",
        status=SubscriptionStatus.ACTIVE
    )
    # Mid-cycle upgrade to 25 seats
    res = SubscriptionBillingEngine.calculate_midcycle_seat_upgrade_proration(sub, 25)
    assert res.net_immediate_invoice_amount_usd > Decimal("0.00")
    assert res.remaining_days_in_period == 20

    # Dunning failure progression
    stage1, status1, _ = SubscriptionBillingEngine.handle_dunning_payment_failure(sub)
    assert stage1 == DunningStage.ATTEMPT_1_IMMEDIATE
    assert status1 == SubscriptionStatus.PAST_DUE_DUNNING


def test_cold_chain_mkt_and_excursions():
    # Refrigerated +2C to +8C
    temps_normal = [4.0, 4.2, 4.5, 3.8, 5.1, 4.0, 4.4]
    mkt = ColdChainIoTEngine.calculate_mean_kinetic_temperature(temps_normal)
    assert 3.5 <= mkt <= 5.5

    readings = [
        TelemetrySensorReading("S1", "2026-08-25T10:00:00Z", t, 55.0, 98, 120.0)
        for t in temps_normal
    ]
    report = ColdChainIoTEngine.evaluate_shipment_telemetry("SHIP-001", ColdChainZone.REFRIGERATED_COLD, readings)
    assert report.is_spoiled_or_quarantined is False
    assert report.total_excursion_minutes == 0


def test_statutory_balance_sheet_equation():
    stmt = StatutoryFinancialStatementEngine.generate_consolidated_balance_sheet(
        period_ended="2026-06-30",
        cash=Decimal("500000.00"),
        ar=Decimal("150000.00"),
        inventory=Decimal("200000.00"),
        prepaids=Decimal("25000.00"),
        gross_ppe=Decimal("400000.00"),
        accum_depr=Decimal("75000.00"),
        ap=Decimal("120000.00"),
        accrued=Decimal("30000.00"),
        deferred_rev=Decimal("150000.00"),
        long_term_debt=Decimal("200000.00"),
        common_stock=Decimal("500000.00"),
        retained_earnings=Decimal("200000.00")
    )
    # Assets: 500k + 150k + 200k + 25k + (400k - 75k) = 1,200,000
    # Liab + Equity: (120k + 30k + 150k + 200k) + (500k + 200k) = 500k + 700k = 1,200,000
    assert stmt.is_balanced is True
    assert stmt.total_assets_usd == Decimal("1200000.00")


def test_retention_playbook_trigger():
    pb = RetentionPlaybookEngine.trigger_playbook_for_account(
        customer_id="cust-risk",
        account_name="At Risk Enterprise",
        health_score=22,
        mrr_usd=Decimal("15000.00"),
        open_critical_tickets=4,
        past_due_invoices=2
    )
    assert pb.severity == PlaybookSeverity.CRITICAL_ACCOUNT_ESCALATION
    assert len(pb.action_tasks) == 3
