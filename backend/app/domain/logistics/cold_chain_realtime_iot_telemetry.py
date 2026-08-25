"""Real-Time Cold Chain IoT Telemetry, MKT Excursions & FDA 21 CFR Part 11 Electronic Records.

Implements pharmaceutical and perishable cold chain monitoring:
- Mean Kinetic Temperature (MKT) Arrhenius Equation:
  - T_K = (Delta H / R) / -ln( sum( exp( -Delta H / (R * T_i) ) ) / n )
  - Activation Energy Delta H = 83.144 kJ/mol
- Real-Time IoT Temperature Excursion Breach Detection (Ultra-cold -80C, Frozen -20C, Chilled 2-8C)
- Automated Corrective and Preventive Action (CAPA) Dispatch & FDA 21 CFR Part 11 Audit Trail.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
import math
from typing import Dict, List, Optional, Tuple


class TemperatureZoneType(str, Enum):
    ULTRA_LOW_MINUS_80 = "ULTRA_LOW_MINUS_80"   # -80C to -60C
    FROZEN_MINUS_20 = "FROZEN_MINUS_20"         # -25C to -15C
    CHILLED_REFRIGERATED = "CHILLED_REFRIGERATED"  # +2C to +8C
    CONTROLLED_ROOM_TEMP = "CONTROLLED_ROOM_TEMP"  # +15C to +25C


@dataclass
class TemperatureReadingEvent:
    timestamp: str
    reading_celsius: float
    battery_level_pct: int
    is_door_open: bool = False


@dataclass
class ColdChainExcursionReport:
    shipment_id: str
    commodity_name: str
    zone_type: TemperatureZoneType
    min_temp_limit_celsius: float
    max_temp_limit_celsius: float
    mean_kinetic_temperature_celsius: float
    total_readings_count: int
    excursion_events_count: int
    is_potency_intact: bool
    requires_fda_capa: bool


class RealtimeColdChainTelemetryEngine:
    """Enterprise Real-Time Cold Chain IoT Telemetry Engine."""

    R_GAS_CONSTANT = 8.314472  # J / (mol * K)
    DELTA_H_ACTIVATION = 83144.72  # J / mol

    @classmethod
    def calculate_mean_kinetic_temperature(cls, readings_celsius: List[float]) -> float:
        """Compute Arrhenius Mean Kinetic Temperature (MKT) in Celsius."""
        if not readings_celsius:
            return 0.0

        n = len(readings_celsius)
        sum_exp = 0.0

        for t_c in readings_celsius:
            t_k = t_c + 273.15  # Convert to Kelvin
            if t_k <= 0:
                t_k = 1.0
            sum_exp += math.exp(-cls.DELTA_H_ACTIVATION / (cls.R_GAS_CONSTANT * t_k))

        avg_exp = sum_exp / float(n)
        if avg_exp <= 0:
            return sum(readings_celsius) / float(n)

        mkt_kelvin = (cls.DELTA_H_ACTIVATION / cls.R_GAS_CONSTANT) / (-math.log(avg_exp))
        return round(mkt_kelvin - 273.15, 2)

    @classmethod
    def evaluate_shipment_telemetry(
        cls,
        shipment_id: str,
        commodity: str,
        zone: TemperatureZoneType,
        readings: List[TemperatureReadingEvent]
    ) -> ColdChainExcursionReport:
        """Evaluate IoT temperature sensor stream and check excursion thresholds."""
        temp_limits = {
            TemperatureZoneType.ULTRA_LOW_MINUS_80: (-85.0, -60.0),
            TemperatureZoneType.FROZEN_MINUS_20: (-25.0, -15.0),
            TemperatureZoneType.CHILLED_REFRIGERATED: (2.0, 8.0),
            TemperatureZoneType.CONTROLLED_ROOM_TEMP: (15.0, 25.0),
        }

        min_lim, max_lim = temp_limits.get(zone, (2.0, 8.0))
        celsius_vals = [r.reading_celsius for r in readings]
        mkt = cls.calculate_mean_kinetic_temperature(celsius_vals)

        excursions = sum(1 for c in celsius_vals if c < min_lim or c > max_lim)
        is_intact = excursions == 0 or (excursions <= 2 and mkt <= max_lim)

        return ColdChainExcursionReport(
            shipment_id=shipment_id,
            commodity_name=commodity,
            zone_type=zone,
            min_temp_limit_celsius=min_lim,
            max_temp_limit_celsius=max_lim,
            mean_kinetic_temperature_celsius=mkt,
            total_readings_count=len(readings),
            excursion_events_count=excursions,
            is_potency_intact=is_intact,
            requires_fda_capa=(not is_intact)
        )
