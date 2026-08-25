"""Automated Integration Test Suite for Corporate Hierarchies and Usage Metering."""

import pytest
from decimal import Decimal
from app.domain.crm_intelligence.account_hierarchies_rollup import (
    EnterpriseHierarchyEngine, HierarchyNodeType
)
from app.domain.commerce.subscription_usage_metering import (
    UsageMeteringEngine, UsageMeterDefinition, UsageTierBracket, MeterAggregationMode
)


def test_enterprise_account_hierarchy_rollup():
    engine = EnterpriseHierarchyEngine()
    summary = engine.rollup_hierarchy("ACC-ROOT-001")
    assert summary.root_account_name == "Apex Global Conglomerate Inc"
    assert summary.total_hierarchy_nodes == 5
    assert summary.max_tree_depth == 3
    # Total ARR = 500k + 350k + 120k + 180k + 250k = $1,400,000
    assert summary.total_consolidated_arr_usd == Decimal("1400000.00")
    # Total credit limit = 2M + 800k + 300k + 400k + 600k = $4,100,000
    assert summary.total_credit_limit_exposure_usd == Decimal("4100000.00")


def test_consumption_usage_metering_and_overage():
    meter = UsageMeterDefinition(
        meter_code="API_CALLS",
        display_name="Enterprise API Requests",
        aggregation_mode=MeterAggregationMode.SUM,
        included_monthly_units=1000000,  # 1M included
        overage_tiers=[
            UsageTierBracket(up_to_units=1000000, unit_price_usd=Decimal("0.0001")), # 1st 1M overage @ $0.0001
            UsageTierBracket(up_to_units=None, unit_price_usd=Decimal("0.00008")),    # Beyond that @ $0.00008
        ]
    )
    # Consumed 1,450,000 units -> 450,000 overage units -> 450,000 * $0.0001 = $45.00
    res = UsageMeteringEngine.calculate_billable_overage(meter, 1450000)
    assert res.is_quota_exceeded is True
    assert res.billable_overage_units == 450000
    assert res.total_overage_charge_usd == Decimal("45.00")
    assert res.quota_utilization_pct == 145.0
