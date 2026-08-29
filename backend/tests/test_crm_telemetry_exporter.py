import pytest
from app.application.services.crm_telemetry_exporter import CrmTelemetryRegistry


def test_crm_telemetry_exporter():
    registry = CrmTelemetryRegistry()
    registry.record_order(status="COMPLETED", order_value=1250.0, latency_ms=85.0)
    registry.record_order(status="COMPLETED", order_value=750.0, latency_ms=65.0)
    registry.record_order(status="FAILED_PAYMENT", order_value=300.0, latency_ms=120.0)

    summary = registry.get_summary()
    assert summary["total_orders"] == 3
    assert summary["gmv_total"] == 2000.0
    assert summary["status_breakdown"]["COMPLETED"] == 2

    prom = registry.export_prometheus()
    assert 'commerce_orders_total{status="COMPLETED"} 2' in prom
    assert "commerce_gmv_total 2000.0" in prom
