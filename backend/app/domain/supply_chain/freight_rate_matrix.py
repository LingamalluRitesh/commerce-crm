"""Multi-Carrier Freight Rating, Dimensional Weight, and Fuel Surcharge Engine.

Provides rating matrix calculation across parcel & LTL carriers (FedEx, UPS, DHL, Freight),
origin/destination shipping zone determination, cubic divisor conversions, accessorial fee
computations, and carbon emission estimation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple


@dataclass
class CarrierServiceLevel:
    carrier_code: str  # 'FEDEX', 'UPS', 'DHL', 'FREIGHT_LTL'
    service_code: str  # 'GROUND', 'EXPRESS_2DAY', 'PRIORITY_OVERNIGHT', 'FREIGHT_STANDARD'
    name: str
    dim_divisor: float  # e.g., 139 for domestic parcel, 166 for international
    base_fuel_surcharge_pct: Decimal
    transit_days_guarantee: int


@dataclass
class ZoneRateBracket:
    zone: int
    weight_lb: float
    base_rate_usd: Decimal


@dataclass
class FreightQuoteItem:
    carrier: str
    service: str
    billable_weight_lb: float
    actual_weight_lb: float
    dimensional_weight_lb: float
    base_freight_charge: Decimal
    fuel_surcharge: Decimal
    accessorial_fees: Decimal
    total_shipping_cost: Decimal
    transit_days: int
    estimated_carbon_kg: float


class FreightRatingEngine:
    """Enterprise multi-carrier rate calculation engine."""

    # Postal code prefix to zone lookup matrix (simplified domestic)
    ZONE_MATRIX: Dict[str, Dict[str, int]] = {
        "787": {"100": 6, "900": 7, "606": 4, "750": 2, "303": 4, "981": 8}, # Austin origin
        "100": {"787": 6, "900": 8, "606": 3, "750": 5, "303": 3, "981": 8}, # NYC origin
        "900": {"787": 7, "100": 8, "606": 6, "750": 6, "303": 7, "981": 4}, # LA origin
    }

    # Standard domestic base rates per zone (per 10 lbs)
    BASE_RATE_PER_LB: Dict[str, Decimal] = {
        "GROUND": Decimal("0.85"),
        "EXPRESS_2DAY": Decimal("2.40"),
        "PRIORITY_OVERNIGHT": Decimal("5.10"),
        "FREIGHT_LTL": Decimal("0.45"),
    }

    @classmethod
    def determine_zone(cls, origin_zip: str, dest_zip: str) -> int:
        """Determine domestic shipping zone (2 to 8) based on 3-digit ZIP prefixes."""
        orig_prefix = origin_zip[:3]
        dest_prefix = dest_zip[:3]
        
        if orig_prefix == dest_prefix:
            return 2  # Local intra-zone

        if orig_prefix in cls.ZONE_MATRIX and dest_prefix in cls.ZONE_MATRIX[orig_prefix]:
            return cls.ZONE_MATRIX[orig_prefix][dest_prefix]

        # Default distance heuristic zone based on numerical difference
        diff = abs(int(orig_prefix or "0") - int(dest_prefix or "0"))
        if diff < 100:
            return 3
        elif diff < 300:
            return 4
        elif diff < 500:
            return 5
        elif diff < 700:
            return 6
        elif diff < 850:
            return 7
        return 8

    @classmethod
    def calculate_dimensional_weight(
        cls,
        length_in: float,
        width_in: float,
        height_in: float,
        dim_divisor: float = 139.0
    ) -> float:
        """Calculate IATA / Domestic parcel dimensional weight in pounds (lbs)."""
        cubic_inches = length_in * width_in * height_in
        dim_weight = cubic_inches / max(1.0, dim_divisor)
        return round(dim_weight, 2)

    @classmethod
    def calculate_rates(
        cls,
        origin_zip: str,
        dest_zip: str,
        weight_lb: float,
        length_in: float,
        width_in: float,
        height_in: float,
        declared_value_usd: Decimal = Decimal("0.00"),
        requires_liftgate: bool = False,
        is_residential: bool = False
    ) -> List[FreightQuoteItem]:
        """Compute rating quotes across available carrier service levels."""
        zone = cls.determine_zone(origin_zip, dest_zip)
        quotes: List[FreightQuoteItem] = []

        services: List[CarrierServiceLevel] = [
            CarrierServiceLevel(
                carrier_code="FEDEX",
                service_code="GROUND",
                name="FedEx Commercial Ground",
                dim_divisor=139.0,
                base_fuel_surcharge_pct=Decimal("14.50"),
                transit_days_guarantee=min(5, max(1, zone - 1))
            ),
            CarrierServiceLevel(
                carrier_code="FEDEX",
                service_code="EXPRESS_2DAY",
                name="FedEx 2-Day Air",
                dim_divisor=139.0,
                base_fuel_surcharge_pct=Decimal("17.00"),
                transit_days_guarantee=2
            ),
            CarrierServiceLevel(
                carrier_code="FEDEX",
                service_code="PRIORITY_OVERNIGHT",
                name="FedEx Priority Overnight",
                dim_divisor=139.0,
                base_fuel_surcharge_pct=Decimal("19.50"),
                transit_days_guarantee=1
            ),
            CarrierServiceLevel(
                carrier_code="FREIGHT_LTL",
                service_code="FREIGHT_STANDARD",
                name="National Direct Freight LTL",
                dim_divisor=175.0,
                base_fuel_surcharge_pct=Decimal("22.00"),
                transit_days_guarantee=min(7, max(2, zone))
            ),
        ]

        for svc in services:
            dim_weight = cls.calculate_dimensional_weight(length_in, width_in, height_in, svc.dim_divisor)
            billable_weight = max(weight_lb, dim_weight)

            # Base freight calculation = (Weight * Rate_per_lb) * Zone_multiplier
            rate_per_lb = cls.BASE_RATE_PER_LB.get(svc.service_code, Decimal("1.00"))
            zone_multiplier = Decimal("1.0") + (Decimal(str(zone)) * Decimal("0.12"))
            base_freight = (Decimal(str(billable_weight)) * rate_per_lb * zone_multiplier).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            
            # Minimum baseline floor charge
            min_floor = Decimal("12.50") if svc.service_code == "GROUND" else Decimal("35.00")
            base_freight = max(min_floor, base_freight)

            # Fuel Surcharge
            fuel = (base_freight * (svc.base_fuel_surcharge_pct / Decimal("100.0"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            # Accessorials
            accessorials = Decimal("0.00")
            if is_residential:
                accessorials += Decimal("4.85")
            if requires_liftgate:
                accessorials += Decimal("75.00")
            if declared_value_usd > Decimal("100.00"):
                excess_val = declared_value_usd - Decimal("100.00")
                accessorials += (excess_val * Decimal("0.015")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            total_cost = base_freight + fuel + accessorials
            # Carbon estimation: ~0.15 kg CO2 per ton-mile
            estimated_miles = zone * 350.0
            carbon_kg = round((billable_weight / 2000.0) * estimated_miles * 0.15, 2)

            quotes.append(FreightQuoteItem(
                carrier=svc.carrier_code,
                service=svc.name,
                billable_weight_lb=billable_weight,
                actual_weight_lb=weight_lb,
                dimensional_weight_lb=dim_weight,
                base_freight_charge=base_freight,
                fuel_surcharge=fuel,
                accessorial_fees=accessorials,
                total_shipping_cost=total_cost,
                transit_days=svc.transit_days_guarantee,
                estimated_carbon_kg=carbon_kg
            ))

        return quotes
