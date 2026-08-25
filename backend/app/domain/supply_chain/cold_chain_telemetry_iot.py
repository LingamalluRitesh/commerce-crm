"""IoT Cold-Chain Telemetry, Mean Kinetic Temperature (MKT) & GDP/HACCP Pharma Compliance.

Processes real-time ambient & payload temperature/humidity telemetry for perishable goods:
- Sensor Time-Series Stream Ingestion (Temperature °C, Relative Humidity %, Shock/Tilt G-force)
- Mean Kinetic Temperature (MKT) calculation using the Arrhenius equation (activation energy Delta H = 83.144 kJ/mol)
- Thermal Excursion Alarm Classifications (Minor Deviation, Critical High Excursion, Freezing Spoilage)
- GDP (Good Distribution Practice) & FDA 21 CFR Part 11 Audit Trail & Stability Budget Consumption
- Carrier SLA penalty attribution & cargo disposition (Acceptable, Accelerated QA Quarantine, Destroy).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
import math
from typing import Dict, List, Optional, Tuple


class PerishableCategory(str, Enum):
    PHARMA_BIOLOGICS_2_8C = "PHARMA_BIOLOGICS_2_8C"           # 2°C to 8°C (Strict Cold)
    PHARMA_CONTROLLED_ROOM_15_25C = "PHARMA_CRT_15_25C"       # 15°C to 25°C (Controlled Room Temp)
    FROZEN_FOOD_MINUS_18C = "FROZEN_FOOD_MINUS_18C"           # <= -18°C (Deep Freeze)
    ULTRA_COLD_MINUS_80C = "ULTRA_COLD_MINUS_80C"             # <= -70°C (Dry Ice / Vaccine)
    PRODUCE_FRESH_4_10C = "PRODUCE_FRESH_4_10C"               # 4°C to 10°C (Fresh Agriculture)


class ExcursionSeverity(str, Enum):
    NOMINAL = "NOMINAL"
    WARNING_THERMAL_DRIFT = "WARNING_THERMAL_DRIFT"
    CRITICAL_HIGH_EXCURSION = "CRITICAL_HIGH_EXCURSION"
    CRITICAL_SUB_FREEZING = "CRITICAL_SUB_FREEZING"
    CONTAINER_TAMPER_OR_SHOCK = "CONTAINER_TAMPER_OR_SHOCK"


@dataclass
class TelemetrySensorReading:
    reading_id: str
    sensor_id: str
    timestamp_utc: str
    temperature_celsius: float
    relative_humidity_pct: float
    shock_g_force: float
    battery_level_pct: float
    gps_latitude: float
    gps_longitude: float


@dataclass
class ColdChainShipmentProfile:
    shipment_id: str
    consignment_number: str
    category: PerishableCategory
    carrier_id: str
    origin_hub: str
    destination_hub: str
    min_temp_limit_celsius: float
    max_temp_limit_celsius: float
    max_allowable_mkt_celsius: float
    total_stability_budget_minutes: int
    consumed_stability_minutes: int = 0
    readings: List[TelemetrySensorReading] = field(default_factory=list)
    excursion_events: List[Dict[str, str]] = field(default_factory=list)
    quarantine_status: bool = False


@dataclass
class MKTAnalysisResult:
    shipment_id: str
    reading_count: int
    min_observed_temp_c: float
    max_observed_temp_c: float
    mean_arithmetic_temp_c: float
    mkt_celsius: float
    total_excursion_duration_minutes: int
    remaining_stability_budget_minutes: int
    compliance_status: str
    cargo_disposition_recommendation: str


class ColdChainTelemetryEngine:
    """Computes Arrhenius Mean Kinetic Temperature (MKT) and verifies real-time cold-chain compliance."""

    # Universal gas constant R = 8.314472 J/(mol*K)
    # Standard activation energy for pharmaceutical stability Delta H = 83.144 kJ/mol = 83144 J/mol
    DELTA_H_OVER_R = 83144.0 / 8.314472  # ~9999.91 K

    def __init__(self):
        self.active_shipments: Dict[str, ColdChainShipmentProfile] = {}

    def register_shipment(self, profile: ColdChainShipmentProfile) -> None:
        self.active_shipments[profile.shipment_id] = profile

    def record_telemetry(self, shipment_id: str, reading: TelemetrySensorReading) -> Tuple[bool, ExcursionSeverity, str]:
        """Ingests a telemetry ping and checks instantaneous thresholds."""
        shipment = self.active_shipments.get(shipment_id)
        if not shipment:
            return False, ExcursionSeverity.NOMINAL, "Shipment not found"

        shipment.readings.append(reading)
        severity = ExcursionSeverity.NOMINAL
        alert_msg = "Nominal temperature reading"

        temp = reading.temperature_celsius
        if temp > shipment.max_temp_limit_celsius:
            severity = ExcursionSeverity.CRITICAL_HIGH_EXCURSION
            alert_msg = f"Critical High Temperature Excursion: {temp:.1f}°C (Limit: {shipment.max_temp_limit_celsius:.1f}°C)"
            shipment.consumed_stability_minutes += 15  # Assume 15 min telemetry interval
            shipment.excursion_events.append({
                "timestamp": reading.timestamp_utc,
                "type": severity.value,
                "temp": f"{temp:.2f}C",
                "message": alert_msg,
            })
        elif temp < shipment.min_temp_limit_celsius:
            severity = ExcursionSeverity.CRITICAL_SUB_FREEZING
            alert_msg = f"Critical Sub-Freezing Excursion: {temp:.1f}°C (Limit: {shipment.min_temp_limit_celsius:.1f}°C)"
            shipment.consumed_stability_minutes += 30
            shipment.excursion_events.append({
                "timestamp": reading.timestamp_utc,
                "type": severity.value,
                "temp": f"{temp:.2f}C",
                "message": alert_msg,
            })
        elif reading.shock_g_force > 4.5:
            severity = ExcursionSeverity.CONTAINER_TAMPER_OR_SHOCK
            alert_msg = f"Physical Shock Detected: {reading.shock_g_force:.2f}G impact"

        if shipment.consumed_stability_minutes > shipment.total_stability_budget_minutes:
            shipment.quarantine_status = True

        return True, severity, alert_msg

    def calculate_mean_kinetic_temperature(self, shipment_id: str) -> Optional[MKTAnalysisResult]:
        """Calculates Mean Kinetic Temperature (MKT) using standard Arrhenius equation:
        
        MKT = (Delta H / R) / ( - ln ( (1/n) * sum( exp(- Delta H / (R * T_k)) ) ) )
        where T_k = temperature in Kelvin (T_c + 273.15)
        """
        shipment = self.active_shipments.get(shipment_id)
        if not shipment or not shipment.readings:
            return None

        temps_c = [r.temperature_celsius for r in shipment.readings]
        n = len(temps_c)
        if n == 0:
            return None

        # Convert to Kelvin and compute sum of exponential decay
        sum_exp = 0.0
        for tc in temps_c:
            tk = tc + 273.15
            if tk <= 0:
                tk = 0.001
            sum_exp += math.exp(-self.DELTA_H_OVER_R / tk)

        mean_exp = sum_exp / float(n)
        if mean_exp <= 0:
            mkt_kelvin = 273.15 + sum(temps_c) / float(n)
        else:
            mkt_kelvin = self.DELTA_H_OVER_R / (-math.log(mean_exp))

        mkt_celsius = round(mkt_kelvin - 273.15, 2)
        min_temp = round(min(temps_c), 2)
        max_temp = round(max(temps_c), 2)
        mean_arithmetic = round(sum(temps_c) / float(n), 2)

        remaining_budget = max(0, shipment.total_stability_budget_minutes - shipment.consumed_stability_minutes)

        if shipment.quarantine_status or mkt_celsius > shipment.max_allowable_mkt_celsius:
            compliance = "NON_COMPLIANT_EXCURSION_LIMIT_EXCEEDED"
            disposition = "HOLD_FOR_STABILITY_BOARD_OR_DESTROY"
        elif len(shipment.excursion_events) > 0:
            compliance = "CONDITIONALLY_ACCEPTABLE_WITH_VARIATION"
            disposition = "RELEASE_WITH_EXPEDITED_LOT_CONSUMPTION"
        else:
            compliance = "FULLY_COMPLIANT_GDP_PASSED"
            disposition = "ACCEPT_AND_RESTOCK_PRIMARY_COLD_VAULT"

        return MKTAnalysisResult(
            shipment_id=shipment_id,
            reading_count=n,
            min_observed_temp_c=min_temp,
            max_observed_temp_c=max_temp,
            mean_arithmetic_temp_c=mean_arithmetic,
            mkt_celsius=mkt_celsius,
            total_excursion_duration_minutes=shipment.consumed_stability_minutes,
            remaining_stability_budget_minutes=remaining_budget,
            compliance_status=compliance,
            cargo_disposition_recommendation=disposition,
        )
