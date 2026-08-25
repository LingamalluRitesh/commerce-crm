"""Automated Integration Test Suite for VMI Consignment and SOC 2 Continuous Auditor Controls."""

import pytest
from decimal import Decimal
from app.domain.compliance.soc2_type2_security_controls import (
    SOC2ContinuousAuditorEngine, ControlStatus
)
from app.domain.supply_chain.vendor_managed_inventory_consignment import (
    VMIConsignmentEngine, VMIConsignmentItem, StockOwnership
)


def test_vmi_consignment_consumption_and_title_transfer():
    item = VMIConsignmentItem(
        sku="RAM-64GB-ECC",
        supplier_id="SUP-001",
        supplier_name="Apex Silicon",
        bin_location="BIN-A01-B08",
        min_buffer_units=200,
        max_buffer_units=800,
        current_on_hand_consignment_units=210,
        unit_cost_usd=Decimal("180.00"),
        ownership=StockOwnership.SUPPLIER_OWNED_CONSIGNMENT
    )
    # Consume 20 units -> drops to 190 (<= 200 min buffer) -> triggers replenishment pull signal
    event, needs_replenishment = VMIConsignmentEngine.process_point_of_use_consumption(
        item=item,
        quantity_consumed=20,
        work_order_id="WO-2026-0891"
    )
    assert event.quantity_consumed == 20
    assert event.total_payable_usd == Decimal("3600.00")
    assert item.current_on_hand_consignment_units == 190
    assert needs_replenishment is True


def test_soc2_continuous_auditor_report():
    report = SOC2ContinuousAuditorEngine.generate_audit_readiness_report()
    assert report.total_controls_evaluated >= 8
    assert report.compliance_score_pct == 100.0
    assert report.is_unqualified_opinion is True
    assert "Schellman" in report.assessor_organization
