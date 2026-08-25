"""Automated Integration Test Suite for Real-Time OLAP Multi-Dimensional Aggregation."""

import pytest
from decimal import Decimal
from app.domain.analytics.realtime_olap_cube import (
    RealTimeOLAPEngine
)


def test_realtime_olap_aggregation_by_territory():
    engine = RealTimeOLAPEngine()
    results = engine.aggregate_by_dimension("territory")
    assert len(results) == 3
    keys = {r.group_by_key for r in results}
    assert keys == {"NORTH_AMERICA", "EMEA", "APAC"}
    for r in results:
        assert r.total_revenue_usd > Decimal("0.00")
        assert r.blended_margin_pct > 0.0
