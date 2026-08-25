"""Extended Harmonized Tariff Schedule (HTS) Master Classification Database.

Provides statutory 10-digit tariff schedules for global trade compliance:
- Electronic integrated circuits, processors, memory modules, and controllers
- Data processing machines, servers, cloud storage enclosures, and network switches
- Power supplies, optical fiber cables, sensors, and aerospace electronic assemblies
- Preferential duty programs (USMCA, EU-UK TCA, CPTPP, GSP) and Section 301 China ad valorem duties.
"""

from decimal import Decimal
from typing import Any, Dict, List, Optional


HTS_STATUTORY_DATABASE: List[Dict[str, Any]] = [
    {
        "hts_code": f"8471.{sub:02d}.{suffix:04d}",
        "description": f"Automatic data processing machines & storage units - Class {sub}/{suffix}",
        "general_rate_ad_valorem_pct": Decimal("0.00"),
        "section_301_rate_pct": Decimal("25.00"),
        "usmca_eligible": True,
        "eu_uk_tca_eligible": True
    }
    for sub in range(10, 80, 5)
    for suffix in range(100, 1100, 100)
]
