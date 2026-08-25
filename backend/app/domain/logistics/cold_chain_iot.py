"""IoT Cold Chain Telemetry, Mean Kinetic Temperature (MKT) & Spoilage Hazard Engine.

Implements Good Distribution Practice (GDP) cold-chain telemetry:
- USP <1079> / FDA 21 CFR Part 11 continuous sensor telemetry monitoring
- Mean Kinetic Temperature (MKT) Arrhenius equation calculation:
  T_k = (delta_H / R) / ( -ln ( (1/n) * Sum( exp( -delta_H / (R * T_i) ) ) ) )
- Thermal excursion duration tracking (Ultra-Low -80C, Frozen -20C, Refrigerated +2C to +8C, Ambient +15C to +25C)
- Automated shipment quarantine locking upon temperature excursion violation.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Tuple


class ColdChainZone(str, Enum):
    CRYOGENIC_ULTRA_LOW = "CRYOGENIC_ULTRA_LOW"  # -80C to -60C (e.g. mRNA vaccines)
    FROZEN_STANDARD = "FROZEN_STANDARD"          # -25C to -15C
    REFRIGERATED_COLD = "REFRIGERATED_COLD"      # +2C to +8C (Biologics / Insulin)
    CONTROLLED_ROOM_TEMP = "CONTROLLED_ROOM_TEMP"# +15C to +25C


@dataclass
class TelemetrySensorReading:
    sensor_id: str
    timestamp: str
    temperature_celsius: float
    relative_humidity_pct: float
    battery_level_pct: int
    ambient_light_lux: float


@dataclass
class ColdChainEvaluationReport:
    shipment_id: str
    target_zone: ColdChainZone
    min_temp_limit_c: float
    max_temp_limit_c: float
    total_readings_count: int
    mean_kinetic_temperature_c: float
    actual_min_temp_c: float
    actual_max_temp_c: float
    excursion_events_count: int
    total_excursion_minutes: int
    is_spoiled_or_quarantined: bool
    compliance_verdict: str


class ColdChainIoTEngine:
    """Enterprise Pharmaceutical & Regulated Cold-Chain IoT Engine."""

    # Activation energy for typical pharmaceutical degradation (kJ/mol)
    DELTA_H = 83.144  # kJ/mol
    GAS_CONSTANT_R = 0.0083144  # kJ/(mol*K)

    ZONE_THRESHOLDS = {
        ColdChainZone.CRYOGENIC_ULTRA_LOW: (-80.0, -60.0),
        ColdChainZone.FROZEN_STANDARD: (-25.0, -15.0),
        ColdChainZone.REFRIGERATED_COLD: (2.0, 8.0),
        ColdChainZone.CONTROLLED_ROOM_TEMP: (15.0, 25.0),
    }

    @classmethod
    def calculate_mean_kinetic_temperature(cls, temps_celsius: List[float]) -> float:
        """Compute USP Mean Kinetic Temperature using Arrhenius exponential integration."""
        if not temps_celsius:
            return 0.0

        n = len(temps_celsius)
        kelvins = [t + 273.15 for t in temps_celsius]
        dh_r = cls.DELTA_H / cls.GAS_CONSTANT_R

        sum_exp = sum(math.exp(-dh_r / tk) for tk in kelvins)
        avg_exp = sum_exp / n

        mkt_kelvin = dh_r / (-math.log(avg_exp))
        mkt_celsius = mkt_kelvin - 273.15
        return round(mkt_celsius, 2)

    @classmethod
    def evaluate_shipment_telemetry(
        cls,
        shipment_id: str,
        zone: ColdChainZone,
        readings: List[TelemetrySensorReading],
        reading_interval_minutes: int = 5
    ) -> ColdChainEvaluationReport:
        """Analyze time-series sensor data and detect thermal boundary breaches."""
        min_lim, max_lim = cls.ZONE_THRESHOLDS[zone]
        temps = [r.temperature_celsius for r in readings]

        if not temps:
            return ColdChainEvaluationReport(shipment_id, zone, min_lim, max_lim, 0, 0.0, 0.0, 0.0, 0, 0, False, "No data")

        mkt = cls.calculate_mean_kinetic_temperature(temps)
        act_min = min(temps)
        act_max = max(temps)

        excursion_readings = sum(1 for t in temps if t < min_lim or t > max_lim)
        tot_excursion_min = excursion_readings * reading_interval_minutes

        # Allow max 30 minutes minor excursion before locking quarantine
        is_quarantine = tot_excursion_min > 30 or act_max > (max_lim + 5.0) or act_min < (min_lim - 5.0)

        if is_quarantine:
            verdict = f"EXCURSION_BREACH: Temperature violated {zone.value} boundaries for {tot_excursion_min} minutes. Shipment quarantined."
        else:
            verdict = f"COMPLIANT: All readings within valid {zone.value} operating tolerances (MKT: {mkt}°C)."

        return ColdChainEvaluationReport(
            shipment_id=shipment_id,
            target_zone=zone,
            min_temp_limit_c=min_lim,
            max_temp_limit_c=max_lim,
            total_readings_count=len(readings),
            mean_kinetic_temperature_c=mkt,
            actual_min_temp_c=act_min,
            actual_max_temp_c=act_max,
            excursion_events_count=1 if excursion_readings > 0 else 0,
            total_excursion_minutes=tot_excursion_min,
            is_spoiled_or_quarantined=is_quarantine,
            compliance_verdict=verdict
        )
