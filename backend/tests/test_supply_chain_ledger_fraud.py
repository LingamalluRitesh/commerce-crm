"""Automated Integration Test Suite for Supply Chain, General Ledger, Fraud, and RMA Engines."""

import pytest
from decimal import Decimal
from app.domain.supply_chain.bom_engine import (
    BOMExplosionEngine, ItemMasterRecord, BOMLineItem, CircularDependencyError
)
from app.domain.supply_chain.safety_stock import (
    SafetyStockCalculator, DemandProfile
)
from app.domain.supply_chain.eoq_calculator import (
    EOQCalculator, PriceBreakTier
)
from app.domain.supply_chain.freight_rate_matrix import (
    FreightRatingEngine
)
from app.domain.ledger.chart_of_accounts import (
    ChartOfAccountsRegistry, AccountNode, AccountType, NormalBalance
)
from app.domain.ledger.double_entry import (
    GeneralLedgerEngine, JournalEntry, JournalLine, UnbalancedJournalEntryError
)
from app.domain.ledger.asc606_revenue_recognition import (
    ASC606RevenueEngine, CustomerContractASC606, PerformanceObligation,
    PerformanceObligationType, RecognitionMethod
)
from app.domain.fraud_engine.rule_engine import (
    FraudRuleEngine, TransactionContext, FraudDecision
)
from app.domain.fulfillment.rma_state_machine import (
    RMAStateMachine, RMALineItem, RMAStatus, ItemReturnCondition, ReturnReason
)
from app.domain.workflow_dsl.expression_parser import (
    DSLExpressionEvaluator, WorkflowDAGScheduler, WorkflowDAGStep
)


# ---------------- 1. BOM Engine Tests ----------------

def test_bom_hierarchical_explosion_and_cost():
    engine = BOMExplosionEngine()
    engine.register_item(ItemMasterRecord("ASSY-ROOT", "Root Server Assembly", "EA", True, Decimal("5000.00"), 10))
    engine.register_item(ItemMasterRecord("SUB-MB", "Motherboard Sub-assembly", "EA", True, Decimal("1000.00"), 8))
    engine.register_item(ItemMasterRecord("RAW-CHIP", "Processor Microchip", "EA", False, Decimal("200.00"), 4))
    engine.register_item(ItemMasterRecord("RAW-RAM", "Memory Stick", "EA", False, Decimal("50.00"), 2))

    engine.add_bom_line(BOMLineItem("ASSY-ROOT", "SUB-MB", Decimal("1.0")))
    engine.add_bom_line(BOMLineItem("SUB-MB", "RAW-CHIP", Decimal("2.0")))
    engine.add_bom_line(BOMLineItem("SUB-MB", "RAW-RAM", Decimal("4.0")))

    tree = engine.explode_tree("ASSY-ROOT", Decimal("2.0"))
    assert tree.sku == "ASSY-ROOT"
    assert len(tree.children) == 1
    assert tree.children[0].sku == "SUB-MB"
    assert len(tree.children[0].children) == 2

    # Verify rollup cost for 2 units: 2 * ( (2 * $200) + (4 * $50) ) = 2 * $600 = $1200
    rollup = engine.calculate_total_rollup_cost("ASSY-ROOT", Decimal("2.0"))
    assert rollup == Decimal("1200.00")

    # Critical path lead time: 10 + 8 + 4 = 22 days
    crit_lt = engine.calculate_critical_path_lead_time("ASSY-ROOT")
    assert crit_lt == 22


def test_bom_circular_dependency_rejection():
    engine = BOMExplosionEngine()
    engine.register_item(ItemMasterRecord("A", "Part A", "EA", True, Decimal("10.00"), 1))
    engine.register_item(ItemMasterRecord("B", "Part B", "EA", True, Decimal("10.00"), 1))
    
    engine.add_bom_line(BOMLineItem("A", "B", Decimal("1.0")))
    engine.add_bom_line(BOMLineItem("B", "A", Decimal("1.0")))  # Cycle A -> B -> A

    with pytest.raises(CircularDependencyError):
        engine.explode_tree("A")


# ---------------- 2. Safety Stock & EOQ Tests ----------------

def test_statistical_safety_stock_calculation():
    profile = DemandProfile(
        sku="SKU-DEMO-01",
        warehouse_id="WH-TX",
        daily_demand_mean=50.0,
        daily_demand_std_dev=8.0,
        lead_time_days_mean=9.0,
        lead_time_days_std_dev=2.0,
        service_level_target_pct=95.0,
        unit_holding_cost_annual=Decimal("12.00"),
        unit_stockout_penalty_cost=Decimal("45.00")
    )
    ss = SafetyStockCalculator.calculate_safety_stock(profile)
    rop = SafetyStockCalculator.calculate_reorder_point(profile, ss)
    assert ss > 0
    assert rop > ss
    assert rop >= (50 * 9 + ss)

    rec = SafetyStockCalculator.evaluate_buffer_profile(profile, 200)
    assert rec.fill_rate_estimated_pct > 90.0


def test_eoq_quantity_discounts_optimization():
    tiers = [
        PriceBreakTier(1, 1, 99, Decimal("100.00")),
        PriceBreakTier(2, 100, 499, Decimal("85.00")),
        PriceBreakTier(3, 500, None, Decimal("70.00")),
    ]
    res = EOQCalculator.optimize_with_quantity_discounts(
        sku="SKU-CHIP",
        annual_demand=2400,
        order_setup_cost=Decimal("150.00"),
        holding_cost_pct=Decimal("20.00"),
        tiers=tiers
    )
    assert res.optimal_order_quantity >= 1
    assert res.total_annual_cost > Decimal("0.00")


# ---------------- 3. Freight Rating Tests ----------------

def test_freight_rate_matrix_calculation():
    quotes = FreightRatingEngine.calculate_rates(
        origin_zip="78701",
        dest_zip="10001",
        weight_lb=30.0,
        length_in=20.0,
        width_in=15.0,
        height_in=10.0,
        declared_value_usd=Decimal("250.00"),
        is_residential=True
    )
    assert len(quotes) >= 3
    ground = next(q for q in quotes if "Ground" in q.service)
    assert ground.total_shipping_cost > Decimal("10.00")
    assert ground.billable_weight_lb >= 30.0


# ---------------- 4. Double-Entry General Ledger Tests ----------------

def test_double_entry_balanced_posting():
    gl = GeneralLedgerEngine()
    entry = JournalEntry(
        entry_id="JE-TEST-001",
        posting_date="2026-08-25",
        source_document="INV-9901",
        description="Customer Invoice Posting",
        lines=[
            JournalLine("11000", Decimal("5000.00"), Decimal("0.00"), memo="AR Debit"),
            JournalLine("40100", Decimal("0.00"), Decimal("5000.00"), memo="SaaS Revenue Credit"),
        ]
    )
    posted = gl.post_entry(entry)
    assert posted.is_posted is True
    assert len(posted.entry_hash) == 64

    # Unbalanced entry must raise error
    unbalanced = JournalEntry(
        entry_id="JE-BAD-002",
        posting_date="2026-08-25",
        source_document="BAD-DOC",
        description="Unbalanced",
        lines=[
            JournalLine("11000", Decimal("5000.00"), Decimal("0.00")),
            JournalLine("40100", Decimal("0.00"), Decimal("4000.00")),  # Diff $1000
        ]
    )
    with pytest.raises(UnbalancedJournalEntryError):
        gl.post_entry(unbalanced)


# ---------------- 5. ASC 606 SaaS RevRec Tests ----------------

def test_asc606_revenue_allocation_and_amortization():
    contract = CustomerContractASC606(
        contract_id="CON-2026-001",
        customer_id="CUST-001",
        contract_start_date="2026-01-01",
        contract_end_date="2026-12-31",
        total_contract_value=Decimal("120000.00"),
        obligations=[
            PerformanceObligation(
                pbo_id="PBO-SAAS",
                obligation_type=PerformanceObligationType.SAAS_SUBSCRIPTION,
                description="Annual SaaS Platform",
                standalone_selling_price=Decimal("100000.00"),
                allocated_transaction_price=Decimal("0.00"),
                recognition_method=RecognitionMethod.OVER_TIME_DAILY,
                service_start_date="2026-01-01",
                service_end_date="2026-12-31"
            ),
            PerformanceObligation(
                pbo_id="PBO-PROSERV",
                obligation_type=PerformanceObligationType.PROFESSIONAL_SERVICES,
                description="Onboarding Deployment",
                standalone_selling_price=Decimal("20000.00"),
                allocated_transaction_price=Decimal("0.00"),
                recognition_method=RecognitionMethod.POINT_IN_TIME_MILESTONE,
                service_start_date="2026-01-01",
                service_end_date="2026-01-31",
                is_satisfied=True,
                satisfied_date="2026-01-15"
            )
        ]
    )
    rec, deferred = ASC606RevenueEngine.calculate_period_revenue_recognition(contract, "2026-06-30")
    assert rec > Decimal("0.00")
    assert deferred > Decimal("0.00")
    assert (rec + deferred) == Decimal("120000.00")


# ---------------- 6. Fraud Prevention Tests ----------------

def test_fraud_heuristic_evaluation():
    engine = FraudRuleEngine()
    # High risk context: CVV mismatch + Geo mismatch + Prior Chargebacks
    ctx = TransactionContext(
        transaction_id="TX-FRAUD-001",
        customer_id="CUST-BAD",
        amount_usd=Decimal("3500.00"),
        card_bin="411111",
        card_last4="1111",
        card_country_code="US",
        ip_address="198.51.100.99",
        ip_country_code="NG",  # High risk country + mismatch
        device_fingerprint_id="dev-suspicious",
        billing_zip="78701",
        shipping_zip="90210",
        avs_result_code="N",
        cvv_result_code="N",
        timestamp_utc="2026-08-25T12:00:00Z",
        customer_account_age_days=1,
        past_chargeback_count=2
    )
    res = engine.evaluate_transaction(ctx)
    assert res.decision == FraudDecision.REJECT
    assert res.total_risk_score >= 65


# ---------------- 7. RMA Return Logistics Tests ----------------

def test_rma_lifecycle_and_grading():
    lines = [
        RMALineItem("L1", "SRV-NODE-X9", Decimal("4500.00"), 1, ReturnReason.BUYERS_REMORSE),
        RMALineItem("L2", "RAM-64GB", Decimal("180.00"), 2, ReturnReason.DEFECTIVE_HARDWARE)
    ]
    rma = RMAStateMachine.create_rma("ORD-100", "CUST-01", lines)
    assert rma.status == RMAStatus.REQUESTED

    RMAStateMachine.approve_rma(rma, "FEDEX_RETURN", "TRACK-998811")
    assert rma.status == RMAStatus.APPROVED

    inspected = RMAStateMachine.record_warehouse_inspection(
        rma=rma,
        line_conditions={"L1": ItemReturnCondition.GRADE_B_OPEN_BOX, "L2": ItemReturnCondition.GRADE_A_PRISTINE},
        inspector_id="INSP-01"
    )
    assert inspected.status == RMAStatus.INSPECTED
    assert inspected.total_refund_approved > Decimal("0.00")


# ---------------- 8. Workflow DSL & DAG Tests ----------------

def test_dsl_expression_evaluator():
    ctx = {
        "order": {"amount": 7500, "status": "APPROVED"},
        "customer": {"tier": "VIP", "country": "US"}
    }
    expr = "order.amount > 5000 and customer.tier == 'VIP' and (customer.country == 'US' or customer.country == 'CA')"
    assert DSLExpressionEvaluator.evaluate(expr, ctx) is True

    expr_false = "order.amount < 1000 or customer.tier == 'BRONZE'"
    assert DSLExpressionEvaluator.evaluate(expr_false, ctx) is False


def test_dag_scheduler_topological_sort():
    steps = [
        WorkflowDAGStep("step_3", "NOTIFY_SLACK", dependencies=["step_2"]),
        WorkflowDAGStep("step_1", "FETCH_ORDER", dependencies=[]),
        WorkflowDAGStep("step_2", "CALC_TAX", dependencies=["step_1"]),
    ]
    waves = WorkflowDAGScheduler.topological_sort(steps)
    assert len(waves) == 3
    assert waves[0][0].step_id == "step_1"
    assert waves[1][0].step_id == "step_2"
    assert waves[2][0].step_id == "step_3"
