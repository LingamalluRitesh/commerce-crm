"""Automated Test Suite for Withholding Tax, Shapley Co-Selling, Dunning Waterfall, Cross-Docking Bay SLA, and FedRAMP Moderate."""

import pytest
from decimal import Decimal
from app.domain.accounting.statutory_wht_withholding_tax import (
    StatutoryWithholdingTaxEngine, IncomeCategory
)
from app.domain.crm_intelligence.sales_territory_shapley_fair_attribution import (
    ShapleyCoSellingAttributionEngine, CoSellingParticipant, SalesRole
)
from app.domain.commerce.subscription_dunning_waterfall_markov import (
    SubscriptionDunningRecoveryEngine, PaymentDeclineCategory, DunningState
)
from app.domain.supply_chain.warehouse_cross_docking_sla import (
    CrossDockingSLAMonitorEngine
)
from app.domain.compliance.fedramp_moderate_security_controls import (
    FedRAMPModerateComplianceEngine
)


def test_withholding_tax_engine():
    res = StatutoryWithholdingTaxEngine.calculate_wht_settlement(
        "INV-1", "IN", "US", IncomeCategory.SOFTWARE_ROYALTY_LICENSE, Decimal("100000.00"), True
    )
    assert res.applicable_wht_rate_pct == 15.0
    assert res.withholding_tax_retained_usd == Decimal("15000.00")
    assert res.net_disbursed_amount_usd == Decimal("85000.00")
    assert res.is_treaty_rate_applied is True


def test_shapley_coselling_attribution():
    team = [
        CoSellingParticipant("U1", "Marcus", SalesRole.ACCOUNT_EXECUTIVE, 40.0),
        CoSellingParticipant("U2", "Sarah", SalesRole.SOLUTIONS_ARCHITECT, 30.0),
        CoSellingParticipant("U3", "David", SalesRole.BUSINESS_DEV_REP, 15.0),
    ]
    res = ShapleyCoSellingAttributionEngine.compute_fair_commission_split(
        "DEAL-1", "Cloud Enterprise", Decimal("100000.00"), team
    )
    assert len(res.participants) == 3
    sum_pct = sum(p.shapley_attribution_pct for p in res.participants)
    assert abs(sum_pct - 100.0) < 0.5
    ae = next(p for p in res.participants if p.role == SalesRole.ACCOUNT_EXECUTIVE)
    assert ae.shapley_attribution_pct > 35.0


def test_dunning_waterfall_recovery():
    case = SubscriptionDunningRecoveryEngine.execute_smart_dunning_waterfall(
        "SUB-1", "Acme Corp", Decimal("5000.00"), PaymentDeclineCategory.INSUFFICIENT_FUNDS
    )
    assert case.current_dunning_state == DunningState.RECOVERED_SUCCESS
    assert case.total_recovered_amount_usd == Decimal("5000.00")
    assert len(case.retry_history) == 2


def test_cross_docking_sla_detention():
    appt = CrossDockingSLAMonitorEngine.evaluate_bay_operation(
        "APT-1", "JB Hunt", "TRL-1", 12, 28, dwell_minutes=180
    )
    assert appt.is_sla_met is True
    assert appt.carrier_detention_fee_usd == Decimal("75.00")  # 1 hr past 120m free time


def test_fedramp_moderate_conmon():
    report = FedRAMPModerateComplianceEngine.generate_conmon_report()
    assert report.total_baseline_controls == 325
    assert report.compliance_percentage == 100.0
    assert report.poam_open_items_count == 0
