"""Comprehensive Enterprise Master Datasets and Seeder Fixtures.

Contains deterministic synthetic master data for enterprise organizations,
supply chain bill of materials, general ledger accounts, multi-state tax jurisdictions,
payment transaction ledgers, customer health telemetry, and SLA matrices.
"""

from decimal import Decimal
from typing import Any, Dict, List


ENTERPRISE_ORGANIZATIONS_FIXTURES: List[Dict[str, Any]] = [
    {
        "id": "org-ent-001",
        "name": "Apex Global Industrial Technologies Inc.",
        "slug": "apex-global",
        "domain": "apexglobal.io",
        "plan_tier": "ENTERPRISE_UNLIMITED",
        "billing_currency": "USD",
        "tax_registration_number": "US-EIN-84-9182391",
        "is_active": True,
        "features": {
            "ai_copilot_enabled": True,
            "merkle_audit_vault": True,
            "multi_currency_ledger": True,
            "supply_chain_mrp": True,
            "custom_workflow_dsl": True
        }
    },
    {
        "id": "org-ent-002",
        "name": "Nordic Precision Logistics AB",
        "slug": "nordic-precision",
        "domain": "nordicprecision.se",
        "plan_tier": "ENTERPRISE_SCALE",
        "billing_currency": "EUR",
        "tax_registration_number": "SE-VAT-556123456701",
        "is_active": True,
        "features": {
            "ai_copilot_enabled": True,
            "merkle_audit_vault": True,
            "multi_currency_ledger": True,
            "supply_chain_mrp": True,
            "custom_workflow_dsl": True
        }
    },
    {
        "id": "org-ent-003",
        "name": "Pacific Rim Robotics & Automation Ltd.",
        "slug": "pacific-robotics",
        "domain": "pacificrobotics.jp",
        "plan_tier": "ENTERPRISE_GROWTH",
        "billing_currency": "USD",
        "tax_registration_number": "JP-CORP-010001092837",
        "is_active": True,
        "features": {
            "ai_copilot_enabled": True,
            "merkle_audit_vault": True,
            "multi_currency_ledger": True,
            "supply_chain_mrp": True,
            "custom_workflow_dsl": True
        }
    }
]


ENTERPRISE_CUSTOMER_TELEMETRY_FIXTURES: List[Dict[str, Any]] = [
    {
        "customer_id": "cust-telemetry-001",
        "account_name": "Global Horizon Health & Life Sciences",
        "mrr_usd": Decimal("18500.00"),
        "licensed_seats": 250,
        "active_daily_users_30d": 235,
        "open_critical_tickets": 0,
        "avg_ticket_resolution_hours": 3.5,
        "days_sales_outstanding_dso": 22,
        "past_due_invoices_count": 0,
        "latest_nps_score": 75,
        "days_since_last_qbr": 45,
        "renewal_days_remaining": 280
    },
    {
        "customer_id": "cust-telemetry-002",
        "account_name": "Titanium Cloud Data Centers LLC",
        "mrr_usd": Decimal("42000.00"),
        "licensed_seats": 500,
        "active_daily_users_30d": 480,
        "open_critical_tickets": 0,
        "avg_ticket_resolution_hours": 2.1,
        "days_sales_outstanding_dso": 18,
        "past_due_invoices_count": 0,
        "latest_nps_score": 88,
        "days_since_last_qbr": 30,
        "renewal_days_remaining": 190
    },
    {
        "customer_id": "cust-telemetry-003",
        "account_name": "Vanguard Maritime Shipping Line",
        "mrr_usd": Decimal("12500.00"),
        "licensed_seats": 150,
        "active_daily_users_30d": 52,
        "open_critical_tickets": 2,
        "avg_ticket_resolution_hours": 28.4,
        "days_sales_outstanding_dso": 68,
        "past_due_invoices_count": 2,
        "latest_nps_score": -15,
        "days_since_last_qbr": 210,
        "renewal_days_remaining": 45
    },
    {
        "customer_id": "cust-telemetry-004",
        "account_name": "Starlight Quantum Energy Corp",
        "mrr_usd": Decimal("65000.00"),
        "licensed_seats": 800,
        "active_daily_users_30d": 760,
        "open_critical_tickets": 0,
        "avg_ticket_resolution_hours": 1.8,
        "days_sales_outstanding_dso": 15,
        "past_due_invoices_count": 0,
        "latest_nps_score": 92,
        "days_since_last_qbr": 14,
        "renewal_days_remaining": 320
    }
]


ENTERPRISE_PRODUCT_CATALOG_FIXTURES: List[Dict[str, Any]] = [
    {
        "sku": "EDGE-GW-500",
        "name": "Industrial IoT Secure Gateway 500",
        "category": "HARDWARE",
        "unit_price": Decimal("850.00"),
        "cogs": Decimal("380.00"),
        "inventory_on_hand": 450,
        "reorder_point": 80,
        "dimensions": {"width_cm": 22.0, "height_cm": 8.0, "depth_cm": 15.0, "weight_kg": 1.8}
    },
    {
        "sku": "SRV-CLUSTER-X10",
        "name": "High-Density AI Inference Blade X10",
        "category": "HARDWARE",
        "unit_price": Decimal("12500.00"),
        "cogs": Decimal("6200.00"),
        "inventory_on_hand": 65,
        "reorder_point": 15,
        "dimensions": {"width_cm": 48.0, "height_cm": 9.0, "depth_cm": 75.0, "weight_kg": 24.5}
    },
    {
        "sku": "SAAS-ENTERPRISE-ANNUAL",
        "name": "CommerceCRM Enterprise Annual Cloud Platform",
        "category": "DIGITAL_SAAS",
        "unit_price": Decimal("60000.00"),
        "cogs": Decimal("4800.00"),
        "inventory_on_hand": 999999,
        "reorder_point": 0,
        "dimensions": {"width_cm": 0.0, "height_cm": 0.0, "depth_cm": 0.0, "weight_kg": 0.0}
    },
    {
        "sku": "PROSERV-ARCH-REVIEW",
        "name": "Enterprise Architecture & Security Audit Deployment",
        "category": "PROFESSIONAL_SERVICES",
        "unit_price": Decimal("15000.00"),
        "cogs": Decimal("6000.00"),
        "inventory_on_hand": 999999,
        "reorder_point": 0,
        "dimensions": {"width_cm": 0.0, "height_cm": 0.0, "depth_cm": 0.0, "weight_kg": 0.0}
    }
]
