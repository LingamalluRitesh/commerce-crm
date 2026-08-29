"""
Customer Churn Risk Scoring & Lifetime Value (LTV) Prediction Service.
Analyzes Recency, Frequency, Monetary (RFM) distributions and projects cohort customer values.
"""

from typing import Dict, List, Any
import math


class CustomerChurnLtvService:
    """Calculates behavioral churn probabilities and predicts multi-year customer lifetime values."""

    def compute_rfm_metrics(
        self,
        days_since_last_order: int,
        total_orders: int,
        total_spend: float,
        avg_support_tickets_per_month: float = 0.0,
    ) -> Dict[str, Any]:
        # 1. Churn Risk Score (0 to 100)
        recency_risk = min(50.0, (days_since_last_order / 180.0) * 50.0)
        frequency_mitigation = min(30.0, (total_orders / 10.0) * 30.0)
        support_friction = min(20.0, avg_support_tickets_per_month * 10.0)

        churn_score = round(max(0.0, min(100.0, recency_risk - frequency_mitigation + support_friction + 20.0)), 2)

        if churn_score > 70:
            churn_risk_tier = "HIGH_CHURN_RISK"
        elif churn_score > 40:
            churn_risk_tier = "MEDIUM_CHURN_RISK"
        else:
            churn_risk_tier = "LOW_CHURN_RISK"

        # 2. Projected Lifetime Value (LTV)
        avg_order_value = total_spend / max(1, total_orders)
        annual_purchase_frequency = (total_orders / max(1.0, (days_since_last_order + 30) / 365.0))
        customer_retention_rate = max(0.1, (100.0 - churn_score) / 100.0)
        
        # Simple Gordon-Shapiro LTV horizon model: LTV = (AOV * Freq) / (1 - Retention + DiscountRate)
        discount_rate = 0.10
        projected_ltv = (avg_order_value * annual_purchase_frequency) / max(0.15, (1.0 - customer_retention_rate + discount_rate))

        return {
            "days_since_last_order": days_since_last_order,
            "total_orders": total_orders,
            "total_spend": round(total_spend, 2),
            "avg_order_value": round(avg_order_value, 2),
            "churn_score": churn_score,
            "churn_risk_tier": churn_risk_tier,
            "retention_rate": round(customer_retention_rate, 2),
            "projected_ltv": round(projected_ltv, 2),
        }
