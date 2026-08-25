"""Automated Integration Test Suite for Predictive AI Lead Routing Engine."""

import pytest
from decimal import Decimal
from app.domain.crm_intelligence.sales_territory_ai_routing import (
    PredictiveLeadRoutingEngine, InboundDealLead, CandidateSalesRep
)


def test_predictive_lead_routing_by_industry_specialization():
    reps = [
        CandidateSalesRep("REP-01", "Marcus", "US-West", 110.0, 20, 10, True, ["Enterprise Cloud & SaaS"]),
        CandidateSalesRep("REP-02", "Sarah", "US-East", 92.0, 20, 5, True, ["FinTech / Banking"]),
    ]
    lead = InboundDealLead("LEAD-901", "Goldman Cloud", "FinTech / Banking", Decimal("250000.00"), "US", -5)

    result = PredictiveLeadRoutingEngine.route_inbound_lead(lead, reps)
    assert result.assigned_rep_id == "REP-02"
    assert result.assigned_rep_name == "Sarah"
    assert result.routing_match_score > 90.0
    assert reps[1].current_open_leads == 6
