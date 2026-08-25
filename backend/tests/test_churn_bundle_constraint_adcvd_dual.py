"""Automated Test Suite for Churn Hazard, Dynamic Bundle Pricing, Variable Consideration Constraint, AD/CVD Customs, and Dual Sourcing."""

import pytest
from decimal import Decimal
from app.domain.crm_intelligence.customer_churn_cox_proportional_hazards import (
    CoxProportionalHazardsChurnEngine, CustomerSurvivalCovariates
)
from app.domain.commerce.dynamic_bundle_pricing_submodular import (
    SubmodularBundlePricingEngine, SoftwareModuleSKU
)
from app.domain.accounting.asc606_variable_consideration_constraint import (
    ASC606VariableConsiderationEngine, VariableConsiderationContract, ContingentContractOutcome, EstimationMethod
)
from app.domain.logistics.customs_anti_dumping_countervailing_duty import (
    CustomsADCVDEngine
)
from app.domain.supply_chain.dual_sourcing_supplier_risk_markov import (
    DualSourcingMarkovEngine, SupplierProfile
)


def test_churn_hazard_engine():
    cov = CustomerSurvivalCovariates("CUST-1", "Test Corp", Decimal("100000.00"), 12, 45.0, 3, -20, 30)
    res = CoxProportionalHazardsChurnEngine.evaluate_customer_churn_risk(cov)
    assert res.hazard_ratio > 1.5
    assert res.risk_classification == "CRITICAL_HIGH"
    assert res.projected_churn_probability_12m > 0.20


def test_bundle_pricing_engine():
    modules = [
        SoftwareModuleSKU("MOD-1", "CRM Core", Decimal("1000.00"), Decimal("100.00"), 0.8),
        SoftwareModuleSKU("MOD-2", "CPQ Engine", Decimal("800.00"), Decimal("80.00"), 0.9),
    ]
    bundle = SubmodularBundlePricingEngine.optimize_bundle("BNDL-1", "Sales Suite", modules)
    assert bundle.optimized_bundle_price_usd < Decimal("1800.00")
    assert bundle.projected_gross_margin_pct >= 70.0
    assert bundle.is_margin_gate_satisfied is True


def test_asc606_variable_consideration():
    contract = VariableConsiderationContract(
        contract_id="CNT-1",
        customer_name="Test Enterprise",
        base_fixed_fee_usd=Decimal("200000.00"),
        estimation_method=EstimationMethod.EXPECTED_VALUE,
        reversal_risk_factors_present=True,
        outcomes=[
            ContingentContractOutcome("Tier 1", Decimal("50000.00"), 0.6),
            ContingentContractOutcome("Tier 2", Decimal("100000.00"), 0.4),
        ]
    )
    res = ASC606VariableConsiderationEngine.evaluate_contract_transaction_price(contract)
    assert res.is_constraint_applied is True
    assert res.recognized_transaction_price_usd < Decimal("270000.00")
    assert res.deferred_contingency_reserve_usd > Decimal("0.00")


def test_adcvd_customs_engine():
    res = CustomsADCVDEngine.calculate_customs_duties("ENT-1", "8541.40.60", "CN", Decimal("100000.00"))
    assert res.ad_cash_deposit_usd > Decimal("20000.00")
    assert res.cvd_cash_deposit_usd > Decimal("10000.00")
    assert res.effective_total_duty_rate_pct > 35.0


def test_dual_sourcing_engine():
    p = SupplierProfile("SUP-1", "Primary TSMC", "TW", Decimal("10.00"), 30, 0.90, 0.10, 100000)
    s = SupplierProfile("SUP-2", "Secondary GF", "US", Decimal("13.00"), 15, 0.98, 0.02, 50000)
    prop = DualSourcingMarkovEngine.optimize_sourcing_split("CHIP-1", 10000, p, s)
    assert prop.primary_units == 7000
    assert prop.secondary_units == 3000
    assert prop.is_resilience_criteria_met is True
