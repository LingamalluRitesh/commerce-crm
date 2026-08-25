"""Automated Integration Test Suite for SaaS Revenue Waterfall and Reverse Logistics."""

import pytest
from decimal import Decimal
from app.domain.commerce.subscription_revenue_waterfall import (
    SubscriptionRevenueWaterfallEngine
)
from app.domain.supply_chain.reverse_logistics_disposition import (
    ReverseLogisticsDispositionEngine, RMAGradingDisposition, HarvestedComponentPart
)


def test_saas_deferred_revenue_waterfall():
    sched = SubscriptionRevenueWaterfallEngine.generate_waterfall_schedule(
        contract_id="CNT-2026-900",
        customer_id="CUST-10",
        total_contract_value_usd=Decimal("120000.00"),
        term_months=12
    )
    assert sched.monthly_recognized_rate_usd == Decimal("10000.00")
    assert len(sched.amortization_timeline) == 12
    assert sched.amortization_timeline[-1].deferred_revenue_ending_balance_usd == Decimal("0.00")
    assert sched.current_rpo_usd == Decimal("120000.00")


def test_reverse_logistics_component_harvesting():
    parts = [
        HarvestedComponentPart("PSU-2000W", "Platinum PSU", 2, Decimal("300.00")),
        HarvestedComponentPart("FAN-MOD", "Cooling Module", 4, Decimal("50.00")),
    ]
    report = ReverseLogisticsDispositionEngine.evaluate_returned_asset(
        rma_number="RMA-9083",
        sku="ETH-SW-400G",
        serial_no="SN-891823",
        msrp_usd=Decimal("12000.00"),
        grade=RMAGradingDisposition.GRADE_C_COMPONENT_HARVEST,
        harvested_parts=parts
    )
    # Total parts value = (2 * 300) + (4 * 50) = 600 + 200 = 800
    assert report.total_recovered_salvage_value_usd == Decimal("800.00")
    assert report.disposition_grade == RMAGradingDisposition.GRADE_C_COMPONENT_HARVEST
    assert len(report.harvested_components) == 2
