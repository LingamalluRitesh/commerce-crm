"""Automated Integration Test Suite for Multi-Carrier Rate Shopping and SOC 2 Monitoring."""

import pytest
from decimal import Decimal
from app.domain.logistics.multi_carrier_rate_shopping_engine import (
    MultiCarrierRateShoppingEngine, ParcelDimensions, CarrierServiceLevel
)
from app.domain.compliance.soc2_type2_continuous_monitoring import (
    SOC2ContinuousMonitoringEngine, DriftRemediationStatus
)


def test_multi_carrier_rate_shopping():
    dims = ParcelDimensions(length_inches=12.0, width_inches=10.0, height_inches=8.0, actual_weight_lbs=5.0)
    quotes = MultiCarrierRateShoppingEngine.get_rate_quotes("90210", "10001", dims, is_residential=True)
    assert len(quotes) >= 4
    best_value = next(q for q in quotes if q.is_best_value)
    assert best_value.service_level == CarrierServiceLevel.GROUND_STANDARD
    assert best_value.total_rate_usd > Decimal("0.00")
    assert best_value.carbon_offset_usd > Decimal("0.00")


def test_soc2_continuous_monitoring_report():
    report = SOC2ContinuousMonitoringEngine.evaluate_compliance_posture()
    assert report.total_resources_scanned == 480
    assert report.posture_score_pct == 100.0
    assert "8f9a2b4e" in report.cryptographic_evidence_seal_sha256
    for f in report.active_findings:
        assert f.status == DriftRemediationStatus.REMEDIATED_VERIFIED
