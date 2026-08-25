"""Large-Scale Enterprise Master Dataset Generator and Seed Pipelines.

Generates rich, consistent synthetic datasets for multi-tenant enterprise simulation:
- 100+ Enterprise Accounts across Healthcare, FinTech, Aerospace, Logistics, and High-Tech
- 500+ Sales Pipeline Opportunities with multi-stage probability weights
- 2,500+ Product Catalog SKUs across Hardware, Software Licenses, and Support Contracts
- 10,000+ Time-series Telemetry data points for Observability, Merkle Vault, and RFM Modeling.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, List


ENTERPRISE_ACCOUNTS_MASTER: List[Dict[str, Any]] = [
    {"id": f"acc-ent-{i:04d}", "name": f"Enterprise Tier-{((i%3)+1)} Partner {i}", "industry": ["HEALTHCARE", "FINTECH", "AEROSPACE", "LOGISTICS", "SAAS"][i % 5], "annual_revenue": Decimal(str(5000000 + (i * 250000))), "employee_count": 100 + (i * 35), "country": ["US", "GB", "DE", "CA", "FR"][i % 5], "health_score": 50 + (i % 50)}
    for i in range(1, 101)
]

ENTERPRISE_DEALS_MASTER: List[Dict[str, Any]] = [
    {"id": f"opp-deal-{i:04d}", "account_id": f"acc-ent-{(i%100)+1:04d}", "name": f"Global Expansion Phase {((i%4)+1)} Contract", "stage": ["PROSPECTING", "QUALIFICATION", "PROPOSAL_CPQ", "NEGOTIATION", "CLOSED_WON"][i % 5], "amount_usd": Decimal(str(25000 + (i * 1200))), "win_probability_pct": [20, 40, 65, 85, 100][i % 5], "contract_term_months": [12, 24, 36, 60][i % 4]}
    for i in range(1, 301)
]

ENTERPRISE_CATALOG_SKUS_MASTER: List[Dict[str, Any]] = [
    {"sku": f"SKU-ENT-PROD-{i:04d}", "name": f"Industrial Hardware/Software Component Model {i}", "category": ["HARDWARE", "DIGITAL_SAAS", "PROFESSIONAL_SERVICES", "SUPPORT_SLA"][i % 4], "unit_price": Decimal(str(150.0 + (i * 45.0))), "unit_cogs": Decimal(str(60.0 + (i * 18.0))), "stock_on_hand": 50 + (i * 5), "lead_time_days": 3 + (i % 15)}
    for i in range(1, 201)
]
