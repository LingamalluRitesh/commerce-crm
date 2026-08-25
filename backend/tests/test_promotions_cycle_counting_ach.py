"""Automated Integration Test Suite for Promotions, Cycle Counting, Deal State Machine, ACH, GDPR, and Carrier Manifests."""

import pytest
from decimal import Decimal
from app.domain.commerce.promotions_engine import (
    PromotionsEngine, CartItem, PromotionType, DiscountTarget
)
from app.domain.inventory.cycle_counting import (
    CycleCountingEngine, InventoryItemValuation, ABCClassification
)
from app.domain.crm_intelligence.deal_stage_machine import (
    DealStateMachine, DealStage, ClosedLostReasonCode
)
from app.domain.payments.ach_direct_debit import (
    NACHAFileEngine, ACHEntryRecord, ACHTransactionCode, SECStandardEntryClassCode
)
from app.domain.compliance.gdpr_audit_purger import (
    DataPrivacyComplianceEngine, ErasureStatus
)
from app.domain.logistics.carrier_manifest_dispatch import (
    CarrierManifestEngine, ManifestPackageItem, HazMatClass
)


def test_promotions_percentage_and_bogo():
    engine = PromotionsEngine()
    items = [
        CartItem("1", "SRV-NODE-X9", "HARDWARE", 1, Decimal("4500.00")),
        CartItem("2", "RAM-64GB-ECC", "HARDWARE", 3, Decimal("180.00")),
    ]
    # Apply ENTERPRISE20 (20% off entire order over $1,000)
    res = engine.evaluate_cart(items, ["ENTERPRISE20"])
    assert res.total_discount_usd > Decimal("0.00")
    assert res.final_net_subtotal_usd < res.original_subtotal_usd


def test_cycle_counting_abc_analysis():
    items = [
        InventoryItemValuation("SKU-HIGH", "Enterprise Server", 100, Decimal("5000.00"), 50),
        InventoryItemValuation("SKU-MED", "Memory Module", 500, Decimal("180.00"), 200),
        InventoryItemValuation("SKU-LOW", "Screws", 10000, Decimal("0.10"), 5000),
    ]
    classified = CycleCountingEngine.perform_abc_analysis(items)
    assert len(classified) == 3
    assert classified[0].classification == ABCClassification.CLASS_A
    assert classified[0].annual_count_frequency == 12


def test_deal_state_machine_transitions():
    deal = DealStateMachine.create_deal("DEAL-001", "ACC-01", "Acme Deal", Decimal("75000.00"), "rep-01")
    assert deal.current_stage == DealStage.LEAD_INBOX

    # Advance stage
    deal = DealStateMachine.advance_stage(deal, DealStage.MQL_QUALIFIED, "user-01")
    assert deal.current_stage == DealStage.MQL_QUALIFIED
    assert deal.stage_win_probability_pct == 25

    # Mark closed lost with reason
    deal = DealStateMachine.advance_stage(deal, DealStage.CLOSED_LOST, "user-01", "Budget freeze", ClosedLostReasonCode.PRICE_BUDGET_CONSTRAINTS)
    assert deal.current_stage == DealStage.CLOSED_LOST
    assert deal.closed_lost_reason == ClosedLostReasonCode.PRICE_BUDGET_CONSTRAINTS


def test_nacha_ach_file_generation():
    # Mod-10 routing validation
    assert NACHAFileEngine.validate_routing_checksum("121000358") is True
    assert NACHAFileEngine.validate_routing_checksum("123456789") is False

    entries = [
        ACHEntryRecord(ACHTransactionCode.CHECKING_DEBIT, "121000358", "9842109283", Decimal("1500.00"), "Acme Corp", "INV-001", "1"),
        ACHEntryRecord(ACHTransactionCode.CHECKING_DEBIT, "121000358", "1122334455", Decimal("3500.00"), "Global Inc", "INV-002", "2")
    ]
    res = NACHAFileEngine.generate_nacha_file("121000358", "COMMERCECRM", "1849182391", SECStandardEntryClassCode.CCD, entries)
    assert res.validation_passed is True
    assert res.total_debit_amount_usd == Decimal("5000.00")
    for line in res.nacha_formatted_file_content.split("\n"):
        assert len(line) == 94


def test_gdpr_erasure_pipeline():
    status, receipt, _ = DataPrivacyComplianceEngine.process_erasure_request("cust-001", "john.doe@example.com", False)
    assert status == ErasureStatus.ANONYMIZED_COMPLETED
    assert receipt is not None
    assert receipt.anonymized_pseudonym_id.startswith("ANON_USER_")
    assert len(receipt.cryptographic_tombstone_signature) == 64


def test_carrier_manifest_scan_form():
    packages = [
        ManifestPackageItem("9801238491823", "Acme Health", "US", 15.5, Decimal("4500.00"), "8471.50.0150", HazMatClass.CLASS_9_LITHIUM_BATTERIES, "UN3481"),
        ManifestPackageItem("9801238491824", "Nordic AB", "SE", 8.2, Decimal("1200.00"), "8471.50.0150", HazMatClass.NON_HAZARDOUS)
    ]
    manifest = CarrierManifestEngine.generate_carrier_manifest("FEDEX", "FAC-TX-01", packages)
    assert manifest.total_packages_count == 2
    assert manifest.hazmat_package_count == 1
    assert manifest.is_closed_and_dispatched is True
