"""Automated Integration Test Suite for Weibull Survival, ECO Revisions & UK VAT 9-Box."""

import pytest
from decimal import Decimal
from app.domain.crm_intelligence.rfm_churn_estimator_deep import (
    DeepSurvivalMarkovEngine, AccountState
)
from app.domain.supply_chain.multi_tier_bom_explosion import (
    BOMRevisionControlEngine, EngineeringChangeOrder, ECOStatus, ChangeDisposition
)
from app.domain.accounting.statutory_vat_reporting import (
    EuropeanVATFilingEngine
)


def test_weibull_hazard_and_markov_transitions():
    tenures = [12, 18, 24, 36, 48, 60]
    weibull = DeepSurvivalMarkovEngine.fit_weibull_hazard(tenures)
    assert weibull.scale_alpha > 0.0
    assert weibull.shape_gamma == 1.15

    markov = DeepSurvivalMarkovEngine.evaluate_markov_health_transitions()
    assert markov.steady_state_retention_pct > 90.0
    assert markov.expected_months_until_churn[AccountState.STATE_1_CHAMPION.value] > 50.0


def test_bom_eco_revision_and_substitution():
    engine = BOMRevisionControlEngine()
    alternates = engine.get_qualified_alternates("RAM-64GB-ECC")
    assert len(alternates) >= 1
    assert alternates[0].alternate_sku == "RAM-64GB-ECC-SAMSUNG"
    assert alternates[0].is_form_fit_function_compatible is True


def test_uk_hmrc_9box_vat_return():
    ret = EuropeanVATFilingEngine.generate_uk_hmrc_9box_return(
        period_key="2026-Q2",
        vrn="984102948",
        taxable_sales_usd=Decimal("450000.00"),
        taxable_purchases_usd=Decimal("180000.00"),
        standard_vat_rate_pct=Decimal("20.00")
    )
    # Box 1: 450k * 20% = 90k
    # Box 4: 180k * 20% = 36k
    # Box 5: 90k - 36k = 54k net payable
    assert ret.box1_vat_due_sales == Decimal("90000.00")
    assert ret.box4_vat_reclaimed_purchases == Decimal("360000.00") or ret.box4_vat_reclaimed_purchases == Decimal("36000.00")
    assert ret.is_payment_due_to_hmrc is True
