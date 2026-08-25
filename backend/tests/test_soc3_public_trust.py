"""Automated Integration Test Suite for SOC 3 Public Trust Assertion."""

import pytest
from app.domain.compliance.soc2_soc3_public_trust_report import (
    SOC3PublicReportEngine
)


def test_soc3_public_assertion_generation():
    assertion = SOC3PublicReportEngine.generate_public_soc3_assertion()
    assert assertion.company_legal_name == "CommerceCRM Global Holdings Inc."
    assert assertion.opinion_type == "UNQUALIFIED_CLEAN"
    assert assertion.is_publicly_distributable is True
    assert len(assertion.principles_covered) == 3
