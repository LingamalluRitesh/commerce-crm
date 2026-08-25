"""Automated Integration Test Suite for Sales Territory Capacity and Rep Ramp Modeling."""

import pytest
from decimal import Decimal
from app.domain.crm_intelligence.sales_territory_quota_capacity import (
    SalesCapacityPlanningEngine, SalesRepCapacityProfile, RepTenureTier
)


def test_sales_rep_ramp_productivity_tiers():
    r1 = SalesRepCapacityProfile("R-01", "Alex", "US-West", 2, Decimal("1000000.00"))
    assert r1.ramp_tier == RepTenureTier.RAMPING_PHASE_1_MONTHS_1_3
    assert r1.effective_productivity_pct == 25.0
    assert r1.effective_annual_capacity_usd == Decimal("250000.00")

    r2 = SalesRepCapacityProfile("R-02", "Sarah", "US-East", 14, Decimal("1200000.00"))
    assert r2.ramp_tier == RepTenureTier.FULLY_RAMPED_TENURED
    assert r2.effective_productivity_pct == 100.0
    assert r2.effective_annual_capacity_usd == Decimal("1200000.00")


def test_team_capacity_plan_and_coverage_ratio():
    reps = [
        SalesRepCapacityProfile("R-01", "Marcus", "US-West", 18, Decimal("1200000.00")),
        SalesRepCapacityProfile("R-02", "Sarah", "US-East", 14, Decimal("1200000.00")),
        SalesRepCapacityProfile("R-03", "David", "EMEA", 8, Decimal("1200000.00")), # 75% -> 900k
        SalesRepCapacityProfile("R-04", "Elena", "APAC", 4, Decimal("1200000.00")), # 50% -> 600k
        SalesRepCapacityProfile("R-05", "Alex", "Central", 2, Decimal("1000000.00")), # 25% -> 250k
    ]
    # Total effective capacity = 1.2M + 1.2M + 900k + 600k + 250k = $4,150,000
    summary = SalesCapacityPlanningEngine.evaluate_team_capacity(
        plan_year=2026,
        target_revenue_usd=Decimal("3200000.00"),
        reps=reps
    )
    assert summary.total_effective_quota_capacity_usd == Decimal("4150000.00")
    assert summary.fully_ramped_reps_count == 2
    assert summary.ramping_reps_count == 3
    assert summary.quota_capacity_coverage_ratio >= 1.25
    assert summary.is_adequately_covered is True
