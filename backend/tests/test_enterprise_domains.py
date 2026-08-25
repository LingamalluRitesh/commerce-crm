"""Automated Integration Test Suite for SLA, Lead Scoring, CPQ, Inventory Lots, and Webhook Security."""

import pytest
from datetime import datetime, timezone
from decimal import Decimal
from app.domain.sla_compliance.matrix import (
    SLAMatrixEngine, SLAPlanTier, TicketSeverity
)
from app.domain.crm_intelligence.lead_scoring import (
    LeadScoringEngine, LeadProfileContext, DecisionMakerRole, LeadGrade
)
from app.domain.cpq_pricing.rules_engine import (
    CPQRulesEngine, CPQLineItemRequest, ContractTermYears, ApprovalTierLevel
)
from app.domain.inventory.lot_serial_tracking import (
    LotSerialTraceabilityEngine, InventoryLotBatch, SerializedUnit, SerialStatus, LotQuarantineState
)
from app.domain.tax_engine.jurisdictions import (
    TaxJurisdictionRegistry, ProductTaxabilityCategory
)
from app.domain.payments.gateways import (
    UnifiedPaymentEngine, PaymentMethodType, PaymentTransactionStatus
)
from app.domain.customer_success.health_heuristics import (
    CustomerHealthScorer, CustomerHealthTelemetry, AccountHealthTier
)
from app.domain.developer_webhooks.signature_verifier import (
    WebhookSecurityEngine
)


def test_sla_policy_and_breach_detection():
    created = datetime(2026, 8, 25, 10, 0, tzinfo=timezone.utc)
    # Platinum Sev-1: 15 min response deadline
    res = SLAMatrixEngine.evaluate_sla_performance(
        ticket_id="TICK-SEV1-001",
        plan_tier=SLAPlanTier.TIER_PLATINUM_24X7,
        severity=TicketSeverity.SEV1_CRITICAL,
        created_at=created,
        first_response_at=datetime(2026, 8, 25, 10, 5, tzinfo=timezone.utc), # 5 min < 15 min (OK)
        resolved_at=datetime(2026, 8, 25, 11, 0, tzinfo=timezone.utc) # 60 min < 120 min (OK)
    )
    assert res.is_response_breached is False
    assert res.is_resolution_breached is False


def test_lead_propensity_scoring():
    ctx = LeadProfileContext(
        lead_id="LEAD-001",
        company_name="Acme Health Systems",
        industry="HEALTHCARE_LIFE_SCIENCES",
        employee_count=450,
        annual_revenue_usd=Decimal("50000000.00"),
        contact_role=DecisionMakerRole.VP_DIRECTOR,
        website_visits_last_14d=8,
        whitepaper_downloads=2,
        pricing_page_visits=4,
        api_docs_views=5,
        uses_target_tech_stack=True,
        budget_confirmed=True,
        target_decision_timeframe_months=2
    )
    res = LeadScoringEngine.evaluate_lead(ctx)
    assert res.total_propensity_score >= 75
    assert res.grade in {LeadGrade.GRADE_A_HOT, LeadGrade.GRADE_B_WARM}
    assert res.predicted_win_probability_pct > 60.0


def test_cpq_quotation_rules_and_approval():
    items = [
        CPQLineItemRequest("SKU-SAAS", "Enterprise SaaS", 120, Decimal("500.00"), Decimal("100.00"), Decimal("5.00")),
        CPQLineItemRequest("SKU-HW", "Compute Node", 25, Decimal("4500.00"), Decimal("2200.00"), Decimal("0.00")),
    ]
    quote = CPQRulesEngine.evaluate_quotation(
        quote_id="QUO-001",
        customer_id="CUST-001",
        contract_term=ContractTermYears.THREE_YEARS,
        currency="USD",
        items=items
    )
    assert quote.net_contract_value > Decimal("0.00")
    assert quote.overall_gross_margin_pct > Decimal("40.00")


def test_inventory_fefo_and_quarantine():
    engine = LotSerialTraceabilityEngine()
    lot1 = InventoryLotBatch("LOT-EARLY", "SKU-MED", "WH-01", "2026-01-01", "2026-10-01", 100, 100)
    lot2 = InventoryLotBatch("LOT-LATE", "SKU-MED", "WH-01", "2026-02-01", "2026-12-01", 100, 100)
    engine.register_lot(lot1)
    engine.register_lot(lot2)

    # FEFO should pick from LOT-EARLY first
    plan = engine.get_fefo_allocation("SKU-MED", "WH-01", 50)
    assert plan[0][0] == "LOT-EARLY"
    assert plan[0][1] == 50

    # Recall quarantine
    quarantined = engine.trigger_lot_recall("LOT-EARLY", "Batch contamination test")
    assert lot1.quarantine_state == LotQuarantineState.RECALL_QUARANTINED
    assert lot1.available_quantity == 0


def test_multi_state_tax_calculation():
    # Texas (8.25% combined, SaaS taxable)
    tax_tx, rate_tx, _ = TaxJurisdictionRegistry.calculate_statutory_tax("US-TX", ProductTaxabilityCategory.DIGITAL_SAAS, Decimal("1000.00"))
    assert tax_tx == Decimal("82.50")
    assert rate_tx == Decimal("8.25")

    # California (SaaS is exempt/non-taxable)
    tax_ca, _, _ = TaxJurisdictionRegistry.calculate_statutory_tax("US-CA", ProductTaxabilityCategory.DIGITAL_SAAS, Decimal("1000.00"))
    assert tax_ca == Decimal("0.00")


def test_payment_gateway_routing_and_3ds():
    pm = UnifiedPaymentEngine()
    intent = pm.create_payment_intent(
        customer_id="cust-01",
        amount_usd=Decimal("2500.00"),
        currency="USD",
        payment_method=PaymentMethodType.CREDIT_CARD,
        idempotency_key="idemp-key-test-01"
    )
    assert intent.requires_3ds is True
    assert intent.status == PaymentTransactionStatus.REQUIRES_ACTION_3DS

    # Complete 3DS callback
    settled = pm.complete_3ds_challenge(intent.intent_id, True)
    assert settled.status == PaymentTransactionStatus.SUCCEEDED


def test_customer_360_health_scoring():
    telemetry = CustomerHealthTelemetry(
        customer_id="cust-champion",
        account_name="Champion Enterprise",
        mrr_usd=Decimal("25000.00"),
        licensed_seats=200,
        active_daily_users_30d=190,
        open_critical_tickets=0,
        avg_ticket_resolution_hours=2.0,
        days_sales_outstanding_dso=15,
        past_due_invoices_count=0,
        latest_nps_score=85,
        days_since_last_qbr=30,
        renewal_days_remaining=250
    )
    res = CustomerHealthScorer.calculate_health_score(telemetry)
    assert res.overall_health_score >= 85
    assert res.health_tier == AccountHealthTier.CHAMPION


def test_webhook_signature_generation_and_verification():
    secret = "whsec_super_secret_enterprise_signing_key_2026"
    payload = '{"event":"invoice.paid","amount":5000}'

    header, _ = WebhookSecurityEngine.generate_signature(payload, secret)
    assert WebhookSecurityEngine.verify_signature(payload, header, secret) is True

    # Tampered payload must fail
    tampered = '{"event":"invoice.paid","amount":999999}'
    assert WebhookSecurityEngine.verify_signature(tampered, header, secret) is False
