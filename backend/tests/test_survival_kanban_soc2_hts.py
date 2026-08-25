"""Automated Integration Test Suite for Survival Analysis, e-Kanban, Intercompany Eliminations, SOC-2, and Customs HTS."""

import pytest
from decimal import Decimal
from app.domain.crm_intelligence.rfm_churn_estimator import (
    CustomerSurvivalEngine, SurvivalDataPoint
)
from app.domain.supply_chain.kanban_replenishment import (
    DynamicKanbanEngine, KanbanLoopDefinition, ActiveKanbanCard, KanbanCardState, BufferHealthZone
)
from app.domain.accounting.intercompany_elimination import (
    IntercompanyEliminationEngine, IntercompanyTradeRecord, IntercompanyTransactionType
)
from app.domain.compliance.soc2_audit_evidence import (
    SOC2ContinuousComplianceEngine
)
from app.domain.logistics.customs_hts_classification import (
    CustomsHTSEngine, TradeAgreementProgram
)


def test_kaplan_meier_survival_analysis():
    data = [
        SurvivalDataPoint("C1", 6, True),
        SurvivalDataPoint("C2", 12, False),
        SurvivalDataPoint("C3", 18, True),
        SurvivalDataPoint("C4", 24, False),
        SurvivalDataPoint("C5", 36, False),
    ]
    model = CustomerSurvivalEngine.fit_kaplan_meier(data)
    assert model.total_customers_analyzed == 5
    assert model.total_churn_events == 2
    assert len(model.intervals) >= 3
    assert model.projected_12_month_retention_pct > 50.0


def test_kanban_card_count_and_supermarket_health():
    # SMT Loop: 100 units/day, 2 days LT, 1 day safety, 20% alpha, 50 units/bin
    cards_count = DynamicKanbanEngine.calculate_optimal_card_count(
        daily_demand=100.0,
        lead_time_days=2.0,
        safety_time_days=1.0,
        alpha_volatility_pct=20.0,
        container_capacity=50
    )
    assert cards_count == 8  # ceil((100 * 3 * 1.2) / 50) = ceil(360/50) = 8

    loop = KanbanLoopDefinition("LOOP-01", "SRV-NODE-X9", "WC-01", "WC-02", "BIN-A", 100.0, 2.0, 1.0, 20.0, 50, 8)
    cards = [
        ActiveKanbanCard(f"C-{i}", "LOOP-01", "SRV-NODE-X9", 50, KanbanCardState.FULL_READY_TO_CONSUME)
        for i in range(7)
    ] + [
        ActiveKanbanCard("C-8", "LOOP-01", "SRV-NODE-X9", 50, KanbanCardState.EMPTY_TRIGGERED_SIGNAL)
    ]
    status = DynamicKanbanEngine.evaluate_supermarket_health(loop, cards)
    assert status.health_zone == BufferHealthZone.GREEN_OPTIMAL
    assert status.requires_emergency_expedite is False


def test_intercompany_elimination_entries():
    engine = IntercompanyEliminationEngine()
    trades = [
        IntercompanyTradeRecord("TR-01", "ENT-US-PARENT", "ENT-UK-SUB", IntercompanyTransactionType.INTERCOMPANY_INVENTORY_SALE, Decimal("100000.00"), Decimal("20.00"), Decimal("50.00"))
    ]
    eliminations = engine.generate_elimination_entries(trades)
    assert len(eliminations) == 3
    # Check unrealized profit elimination ($100k * 50% * 20% = $10k)
    unrealized_entry = next(e for e in eliminations if "unrealized" in e.description.lower())
    assert unrealized_entry.elimination_amount_usd == Decimal("10000.00")


def test_soc2_audit_readiness_report():
    report = SOC2ContinuousComplianceEngine.evaluate_live_system_compliance()
    assert report.is_audit_ready is True
    assert report.overall_compliance_score_pct >= 90.0
    assert report.total_controls_evaluated == 6


def test_customs_hts_tariff_duties():
    res = CustomsHTSEngine.calculate_customs_duties(
        hts_code="8471.50.0150",
        customs_value_usd=Decimal("50000.00"),
        origin_country="US",
        destination_country="US",
        trade_program=TradeAgreementProgram.USMCA_NORTH_AMERICA
    )
    assert res.base_duty_rate_pct == Decimal("0.00")
    assert res.merchandise_processing_fee_usd > Decimal("0.00")
    assert res.total_customs_duties_usd > Decimal("0.00")
