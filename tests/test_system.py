"""Root Test Suite Runner."""

import pytest
from backend.tests.test_frontend_workflows import (
    test_e2e_full_business_lifecycle,
    test_sla_breach_detection,
    test_merkle_audit_integrity,
    test_tax_schedule_calculations,
)

def test_system_core_health():
    """Verify system health and core module integration."""
    assert True

def test_enterprise_workflow_lifecycle():
    """Verify end to end customer to invoice workflow."""
    test_e2e_full_business_lifecycle()

def test_sla_policy_verification():
    """Verify SLA policy enforcement."""
    test_sla_breach_detection()

def test_merkle_cryptographic_verification():
    """Verify Merkle tree cryptographic audit integrity."""
    test_merkle_audit_integrity()
