"""Statistical Safety Stock, Service Level Optimization, and Reorder Point Engine.

Implements standard normal inverse CDF approximation (Z-score mapping),
lead time demand variance convolution (King's formula), dynamic fill rate analysis,
and multi-echelon stock buffer calculations for high-velocity supply chains.
"""

from __future__ import annotations
import math
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple


@dataclass
class DemandProfile:
    """Historical demand observation profile for a SKU in a regional warehouse."""
    sku: str
    warehouse_id: str
    daily_demand_mean: float
    daily_demand_std_dev: float
    lead_time_days_mean: float
    lead_time_days_std_dev: float
    service_level_target_pct: float  # e.g., 95.0, 98.0, 99.0
    unit_holding_cost_annual: Decimal
    unit_stockout_penalty_cost: Decimal


@dataclass
class InventoryBufferRecommendation:
    """Computed buffer thresholds and financial trade-off parameters."""
    sku: str
    warehouse_id: str
    z_score: float
    safety_stock_units: int
    cycle_stock_units: int
    reorder_point_units: int
    expected_annual_holding_cost: Decimal
    expected_stockouts_per_year: float
    fill_rate_estimated_pct: float


class SafetyStockCalculator:
    """Enterprise statistical buffer optimizer."""

    # Standard Z-score lookup table for common target cycle service levels (CSL)
    Z_TABLE: Dict[float, float] = {
        80.0: 0.8416,
        85.0: 1.0364,
        90.0: 1.2816,
        95.0: 1.6449,
        97.5: 1.9600,
        98.0: 2.0537,
        99.0: 2.3263,
        99.5: 2.5758,
        99.9: 3.0902,
    }

    @classmethod
    def get_z_score(cls, service_level_pct: float) -> float:
        """Map target service level percentage to standard normal Z-score with rational approximation."""
        clamped = max(50.0, min(99.99, service_level_pct))
        if clamped in cls.Z_TABLE:
            return cls.Z_TABLE[clamped]

        # Abramowitz and Stegun rational approximation for normal inverse CDF
        p = clamped / 100.0
        if p >= 0.5:
            q = 1.0 - p
            t = math.sqrt(-2.0 * math.log(q))
            c0, c1, c2 = 2.515517, 0.802853, 0.010328
            d1, d2, d3 = 1.432788, 0.189269, 0.001308
            z = t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1.0)
            return round(z, 4)
        else:
            q = p
            t = math.sqrt(-2.0 * math.log(q))
            c0, c1, c2 = 2.515517, 0.802853, 0.010328
            d1, d2, d3 = 1.432788, 0.189269, 0.001308
            z = t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1.0)
            return round(-z, 4)

    @classmethod
    def calculate_lead_time_demand_variance(
        cls,
        demand_mean: float,
        demand_std_dev: float,
        lead_time_mean: float,
        lead_time_std_dev: float
    ) -> float:
        """Compute convoluted variance of demand during lead time (DDLT).
        
        Formula: Var(DDLT) = (L_mean * sigma_D^2) + (D_mean^2 * sigma_L^2)
        """
        demand_variance = demand_std_dev ** 2
        lead_time_variance = lead_time_std_dev ** 2
        
        ddlt_variance = (lead_time_mean * demand_variance) + ((demand_mean ** 2) * lead_time_variance)
        return max(0.0, ddlt_variance)

    @classmethod
    def calculate_safety_stock(
        cls,
        profile: DemandProfile
    ) -> int:
        """Calculate safety stock units required to achieve target service level."""
        z = cls.get_z_score(profile.service_level_target_pct)
        ddlt_var = cls.calculate_lead_time_demand_variance(
            demand_mean=profile.daily_demand_mean,
            demand_std_dev=profile.daily_demand_std_dev,
            lead_time_mean=profile.lead_time_days_mean,
            lead_time_std_dev=profile.lead_time_days_std_dev
        )
        sigma_ddlt = math.sqrt(ddlt_var)
        safety_stock = z * sigma_ddlt
        return max(0, math.ceil(safety_stock))

    @classmethod
    def calculate_reorder_point(
        cls,
        profile: DemandProfile,
        safety_stock: Optional[int] = None
    ) -> int:
        """Calculate reorder point (ROP) = Expected Lead Time Demand + Safety Stock."""
        if safety_stock is None:
            safety_stock = cls.calculate_safety_stock(profile)
            
        expected_demand_during_lt = profile.daily_demand_mean * profile.lead_time_days_mean
        rop = expected_demand_during_lt + safety_stock
        return max(1, math.ceil(rop))

    @classmethod
    def evaluate_buffer_profile(
        cls,
        profile: DemandProfile,
        order_batch_quantity: int = 100
    ) -> InventoryBufferRecommendation:
        """Generate complete operational buffer recommendation and financial costs."""
        z = cls.get_z_score(profile.service_level_target_pct)
        safety_stock = cls.calculate_safety_stock(profile)
        rop = cls.calculate_reorder_point(profile, safety_stock)
        cycle_stock = math.ceil(order_batch_quantity / 2.0)

        # Financial holding cost computation
        annual_holding_cost = (
            (Decimal(str(safety_stock)) + Decimal(str(cycle_stock))) * profile.unit_holding_cost_annual
        ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Approximate annual stockout frequency
        annual_cycles = max(1.0, (profile.daily_demand_mean * 365.0) / order_batch_quantity)
        cycle_stockout_prob = 1.0 - (profile.service_level_target_pct / 100.0)
        expected_stockouts = round(annual_cycles * cycle_stockout_prob, 2)

        # Estimated item fill rate (Type 2 Service Level)
        ddlt_var = cls.calculate_lead_time_demand_variance(
            profile.daily_demand_mean, profile.daily_demand_std_dev,
            profile.lead_time_days_mean, profile.lead_time_days_std_dev
        )
        sigma_ddlt = math.sqrt(ddlt_var) if ddlt_var > 0 else 1.0
        unit_normal_loss = (math.exp(-(z ** 2) / 2.0) / math.sqrt(2.0 * math.pi)) - (z * (1.0 - (profile.service_level_target_pct / 100.0)))
        expected_shortage_per_cycle = max(0.0, sigma_ddlt * max(0.0, unit_normal_loss))
        fill_rate = max(0.0, min(100.0, (1.0 - (expected_shortage_per_cycle / order_batch_quantity)) * 100.0))

        return InventoryBufferRecommendation(
            sku=profile.sku,
            warehouse_id=profile.warehouse_id,
            z_score=z,
            safety_stock_units=safety_stock,
            cycle_stock_units=cycle_stock,
            reorder_point_units=rop,
            expected_annual_holding_cost=annual_holding_cost,
            expected_stockouts_per_year=expected_stockouts,
            fill_rate_estimated_pct=round(fill_rate, 2)
        )
