"""Automated Test Suite for Pipeline Monte Carlo, Dynamic Promotions, CECL Loss, Finite MRP, HITRUST CSF, and Cold Chain Telemetry."""

import pytest
from decimal import Decimal
from app.domain.crm_intelligence.sales_pipeline_markov_monte_carlo import (
    SalesPipelineMarkovMonteCarloEngine, PipelineDealOpportunity, PipelineStage
)
from app.domain.commerce.promotions_dynamic_cart_rules_evaluator import (
    DynamicCartPromotionsEngine, CartItem, ActivePromotionRule, PromotionRuleType
)
from app.domain.accounting.asc326_cecl_credit_loss_allowance import (
    ASC326CECLCreditLossEngine, ARAgingBucket
)
from app.domain.supply_chain.multi_tier_bom_mrp_finite_capacity import (
    FiniteCapacityMRPEngine, ProductionJobOrder, WorkCenterCapacity, WorkCenterType
)
from app.domain.compliance.hitrust_csf_v11_healthcare_controls import (
    HITRUSTCSFComplianceEngine
)
from app.domain.logistics.cold_chain_realtime_iot_telemetry import (
    RealtimeColdChainTelemetryEngine, TemperatureReadingEvent, TemperatureZoneType
)


def test_pipeline_monte_carlo():
    deals = [
        PipelineDealOpportunity("D-1", "Deal 1", "Acme", Decimal("100000.00"), PipelineStage.SECURITY_LEGAL, "Marcus", "Q3"),
        PipelineDealOpportunity("D-2", "Deal 2", "Beta", Decimal("200000.00"), PipelineStage.BUSINESS_CASE, "Sarah", "Q3"),
    ]
    res = SalesPipelineMarkovMonteCarloEngine.run_monte_carlo_simulation("2026-Q3", deals, runs=1000)
    assert res.total_deals_analyzed == 2
    assert res.p50_expected_median_revenue_usd > Decimal("0.00")
    assert res.p10_conservative_revenue_usd <= res.p50_expected_median_revenue_usd <= res.p90_optimistic_revenue_usd


def test_dynamic_cart_promotions():
    items = [CartItem("SKU-1", "Hardware", Decimal("1000.00"), 5)]
    rules = [ActivePromotionRule("TIER-5K", "Tier 5k", PromotionRuleType.FIXED_AMOUNT_TIERED, Decimal("5000.00"), Decimal("500.00"))]
    eval_res = DynamicCartPromotionsEngine.evaluate_cart_promotions(items, ["TIER-5K"], rules)
    assert eval_res.original_subtotal_usd == Decimal("5000.00")
    assert eval_res.total_discounts_usd == Decimal("500.00")
    assert eval_res.net_order_total_usd == Decimal("4500.00")


def test_cecl_credit_loss():
    ar = {
        ARAgingBucket.CURRENT_0_30: Decimal("1000000.00"),
        ARAgingBucket.PAST_DUE_31_60: Decimal("200000.00"),
    }
    rep = ASC326CECLCreditLossEngine.calculate_cecl_allowance(ar)
    assert rep.total_gross_ar_usd == Decimal("1200000.00")
    assert rep.total_required_allowance_usd > Decimal("0.00")
    assert rep.net_realizable_ar_usd < Decimal("1200000.00")


def test_finite_capacity_mrp():
    jobs = [ProductionJobOrder("JOB-1", "BLD-1", 100, 10, 8.0, 4.0, 6.0)]
    centers = [WorkCenterCapacity("WC-1", "SMT Line", WorkCenterType.SMT_PCB_ASSEMBLY, 16.0, Decimal("100.00"))]
    runs = FiniteCapacityMRPEngine.schedule_production_jobs(jobs, centers)
    assert len(runs) == 1
    assert runs[0].total_manufacturing_hours == 18.0
    assert runs[0].is_capacity_feasible is True


def test_hitrust_csf_compliance():
    rep = HITRUSTCSFComplianceEngine.generate_assessment_report()
    assert rep.total_requirements_assessed == 150
    assert rep.overall_maturity_score_pct > 90.0
    assert rep.is_r2_certified is True


def test_cold_chain_realtime_telemetry():
    readings = [
        TemperatureReadingEvent("2026-08-25T08:00:00Z", 4.5, 98),
        TemperatureReadingEvent("2026-08-25T08:05:00Z", 5.0, 98),
        TemperatureReadingEvent("2026-08-25T08:10:00Z", 4.8, 97),
    ]
    rep = RealtimeColdChainTelemetryEngine.evaluate_shipment_telemetry(
        "SHIP-1", "mRNA Vaccine", TemperatureZoneType.CHILLED_REFRIGERATED, readings
    )
    assert rep.is_potency_intact is True
    assert rep.excursion_events_count == 0
    assert 4.0 < rep.mean_kinetic_temperature_celsius < 6.0
