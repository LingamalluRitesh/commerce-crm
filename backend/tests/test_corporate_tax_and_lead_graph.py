"""Automated Integration Test Suite for Corporate Income Tax Provision and Lead Graph Engine."""

import pytest
from decimal import Decimal
from app.domain.accounting.statutory_corporate_income_tax import (
    StatutoryCorporateTaxEngine
)
from app.domain.crm_intelligence.predictive_lead_enrichment_graph import (
    PredictiveLeadGraphEngine, AccountKnowledgeGraphNode, StakeholderContactNode, BuyingCommitteeRole
)


def test_corporate_tax_asc740_provision():
    summary = StatutoryCorporateTaxEngine.calculate_annual_tax_provision(
        tax_year=2026,
        pre_tax_book_income_usd=Decimal("10000000.00"),
        non_deductible_expenses_usd=Decimal("100000.00"),
        tax_exempt_income_usd=Decimal("20000.00"),
        macrs_depreciation_difference_usd=Decimal("500000.00"),
        warranty_reserve_difference_usd=Decimal("150000.00")
    )
    assert summary.pre_tax_book_income_usd == Decimal("10000000.00")
    assert summary.statutory_tax_rate_pct == 25.0
    assert summary.effective_tax_rate_pct > 20.0
    assert summary.deferred_tax_liability_balance_usd == Decimal("125000.00")
    assert summary.deferred_tax_asset_balance_usd == Decimal("37500.00")


def test_lead_graph_buying_committee_health():
    account = AccountKnowledgeGraphNode(
        account_id="ACC-01",
        legal_name="Apex Silicon Corp",
        parent_company_id=None,
        industry_naics="334413",
        annual_revenue_range="$100M-$500M",
        employee_count_range="1000-5000",
        detected_technologies=["Postgres", "AWS", "Kubernetes"],
        stakeholder_nodes=[
            StakeholderContactNode("C-01", "David", "CTO", "Eng", "url", BuyingCommitteeRole.ECONOMIC_BUYER, 0.9, 1.0),
            StakeholderContactNode("C-02", "Rachel", "VP Eng", "Eng", "url", BuyingCommitteeRole.TECHNICAL_EVALUATOR, 0.7, 0.8),
            StakeholderContactNode("C-03", "Liam", "DevOps", "Eng", "url", BuyingCommitteeRole.CHAMPION_SPONSOR, 1.0, 0.7),
        ]
    )
    summary = PredictiveLeadGraphEngine.evaluate_buying_committee(account)
    assert summary.total_stakeholders_mapped == 3
    assert summary.has_economic_buyer is True
    assert summary.has_technical_evaluator is True
    assert summary.has_champion is True
    assert summary.deal_readiness_grade == "HIGH_WIN_PROBABILITY"
