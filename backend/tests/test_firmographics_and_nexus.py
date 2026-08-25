"""Automated Integration Test Suite for Firmographic Enrichment & US Tax Nexus Monitors."""

import pytest
from decimal import Decimal
from app.domain.crm_intelligence.lead_enrichment_firmographics import (
    FirmographicEnrichmentEngine, FundingStage
)
from app.domain.commerce.tax_nexus_calculator import (
    TaxNexusEngine, NexusStatus
)


def test_firmographic_domain_enrichment():
    profile = FirmographicEnrichmentEngine.enrich_domain("sarah@acmehealth.com")
    assert profile.legal_company_name == "Acme Health Systems Inc."
    assert profile.naics_code == "622110"
    assert profile.funding_stage == FundingStage.SERIES_C_PLUS
    assert profile.employee_headcount > 500


def test_economic_tax_nexus_evaluation():
    # Safe harbor in California ($250k < $500k)
    res_safe = TaxNexusEngine.evaluate_state_nexus("CA", Decimal("250000.00"), 50)
    assert res_safe.status == NexusStatus.SAFE_HARBOR_BELOW_THRESHOLD

    # Nexus established in Illinois ($120k > $100k)
    res_breach = TaxNexusEngine.evaluate_state_nexus("IL", Decimal("120000.00"), 150)
    assert res_breach.status == NexusStatus.NEXUS_ESTABLISHED_REGISTRATION_REQUIRED

    # Approaching warning in Florida ($85k is 85% of $100k)
    res_warn = TaxNexusEngine.evaluate_state_nexus("FL", Decimal("85000.00"), 30)
    assert res_warn.status == NexusStatus.APPROACHING_NEXUS_WARNING
