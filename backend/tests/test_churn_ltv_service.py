import pytest
from app.application.services.churn_ltv_service import CustomerChurnLtvService


def test_active_loyal_customer_ltv():
    service = CustomerChurnLtvService()
    # High frequency, low recency (ordered 5 days ago, 25 orders, $5000 spent)
    res = service.compute_rfm_metrics(
        days_since_last_order=5,
        total_orders=25,
        total_spend=5000.0,
        avg_support_tickets_per_month=0.2,
    )
    assert res["churn_risk_tier"] == "LOW_CHURN_RISK"
    assert res["retention_rate"] >= 0.80
    assert res["projected_ltv"] > 5000.0


def test_dormant_churn_risk_customer():
    service = CustomerChurnLtvService()
    # High recency (180 days ago), only 1 order, multiple support issues
    res = service.compute_rfm_metrics(
        days_since_last_order=180,
        total_orders=1,
        total_spend=50.0,
        avg_support_tickets_per_month=2.0,
    )
    assert res["churn_risk_tier"] in ["HIGH_CHURN_RISK", "MEDIUM_CHURN_RISK"]
    assert res["churn_score"] > 50.0
