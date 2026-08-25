"""Master Production Scheduling (MPS) and Material Requirements Planning (MRP-II) Engine.

Implements standard APICS MRP-II closed-loop manufacturing logic:
1. Master Production Scheduling (MPS) demand consolidation across sales orders and forecasts
2. Rough-Cut Capacity Planning (RCCP) against work center machine and labor hours
3. Multi-level time-phased MRP netting:
   - Gross Requirements
   - Scheduled Receipts
   - Projected Available Balance (PAB)
   - Net Requirements
   - Planned Order Receipts
   - Planned Order Releases (lead-time offset)
4. Capacity Requirements Planning (CRP) and work center load leveling.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class OrderType(str, Enum):
    SALES_ORDER_FIRM = "SALES_ORDER_FIRM"
    DEMAND_FORECAST = "DEMAND_FORECAST"
    SAFETY_STOCK_REPLENISHMENT = "SAFETY_STOCK_REPLENISHMENT"


@dataclass
class WorkCenterCapacity:
    work_center_id: str
    name: str
    daily_machine_hours_available: float
    daily_labor_hours_available: float
    efficiency_factor_pct: float = 90.0
    utilization_factor_pct: float = 85.0

    @property
    def effective_daily_capacity_hours(self) -> float:
        raw = min(self.daily_machine_hours_available, self.daily_labor_hours_available)
        eff = self.efficiency_factor_pct / 100.0
        util = self.utilization_factor_pct / 100.0
        return round(raw * eff * util, 2)


@dataclass
class RoutingStep:
    step_number: int
    work_center_id: str
    setup_hours: float
    run_hours_per_unit: float
    description: str


@dataclass
class ProductRouting:
    sku: str
    steps: List[RoutingStep] = field(default_factory=list)

    def calculate_capacity_required(self, batch_quantity: int) -> Dict[str, float]:
        reqs: Dict[str, float] = {}
        for s in self.steps:
            tot_hours = s.setup_hours + (s.run_hours_per_unit * batch_quantity)
            reqs[s.work_center_id] = reqs.get(s.work_center_id, 0.0) + tot_hours
        return reqs


@dataclass
class TimeBucketMRP:
    bucket_index: int
    period_start_date: str
    period_end_date: str
    gross_requirements: int = 0
    scheduled_receipts: int = 0
    projected_available_balance: int = 0
    net_requirements: int = 0
    planned_order_receipts: int = 0
    planned_order_releases: int = 0


@dataclass
class MRPScheduleRecord:
    sku: str
    name: str
    lead_time_buckets: int
    safety_stock_level: int
    lot_sizing_rule: str  # 'LFL' (Lot-for-Lot), 'FOQ' (Fixed Order Qty), 'POQ' (Period Order Qty)
    initial_on_hand_inventory: int
    buckets: List[TimeBucketMRP] = field(default_factory=list)


class MRPEngine:
    """Enterprise Master Production Scheduling & Time-Phased MRP Engine."""

    def __init__(self):
        self.work_centers: Dict[str, WorkCenterCapacity] = {}
        self.routings: Dict[str, ProductRouting] = {}
        self._seed_default_manufacturing_setup()

    def _seed_default_manufacturing_setup(self) -> None:
        """Seed industrial assembly work centers."""
        wc1 = WorkCenterCapacity("WC-SMT-LINE1", "High-Speed SMT Surface Mount Line 1", 20.0, 16.0, 92.0, 88.0)
        wc2 = WorkCenterCapacity("WC-FINAL-ASSY", "Manual Precision Server Chassis Integration", 16.0, 32.0, 95.0, 90.0)
        wc3 = WorkCenterCapacity("WC-BURN-IN-QA", "Thermal Environmental Chamber & QA Burn-in", 24.0, 8.0, 98.0, 95.0)

        self.work_centers[wc1.work_center_id] = wc1
        self.work_centers[wc2.work_center_id] = wc2
        self.work_centers[wc3.work_center_id] = wc3

        routing_node = ProductRouting("SRV-NODE-X9", [
            RoutingStep(10, "WC-SMT-LINE1", 1.5, 0.25, "SMT component pick and place for motherboard"),
            RoutingStep(20, "WC-FINAL-ASSY", 0.5, 0.75, "Mechanical chassis mounting, cable harness routing, and PSU install"),
            RoutingStep(30, "WC-BURN-IN-QA", 0.2, 4.00, "72-hour thermal stress testing and memory parity diagnostics")
        ])
        self.routings[routing_node.sku] = routing_node

    def calculate_time_phased_mrp(
        self,
        sku: str,
        name: str,
        lead_time_buckets: int,
        safety_stock: int,
        initial_inventory: int,
        gross_requirements_by_bucket: List[int],
        scheduled_receipts_by_bucket: List[int],
        lot_size_multiplier: int = 50
    ) -> MRPScheduleRecord:
        """Run time-phased gross-to-net MRP explosion across planning horizon buckets."""
        num_buckets = len(gross_requirements_by_bucket)
        record = MRPScheduleRecord(
            sku=sku,
            name=name,
            lead_time_buckets=lead_time_buckets,
            safety_stock_level=safety_stock,
            lot_sizing_rule="FOQ",
            initial_on_hand_inventory=initial_inventory,
            buckets=[]
        )

        current_pab = initial_inventory
        today = date.today()

        for b_idx in range(num_buckets):
            b_start = today + timedelta(weeks=b_idx)
            b_end = b_start + timedelta(days=6)
            gross = gross_requirements_by_bucket[b_idx]
            sched_rec = scheduled_receipts_by_bucket[b_idx] if b_idx < len(scheduled_receipts_by_bucket) else 0

            # Calculate preliminary projected balance
            prelim_pab = current_pab + sched_rec - gross

            net_req = 0
            planned_rec = 0

            if prelim_pab < safety_stock:
                shortfall = safety_stock - prelim_pab
                # Round up to lot size multiple
                batches = math.ceil(shortfall / max(1, lot_size_multiplier))
                planned_rec = batches * lot_size_multiplier
                net_req = shortfall

            final_pab = prelim_pab + planned_rec
            current_pab = final_pab

            bucket = TimeBucketMRP(
                bucket_index=b_idx,
                period_start_date=b_start.isoformat(),
                period_end_date=b_end.isoformat(),
                gross_requirements=gross,
                scheduled_receipts=sched_rec,
                projected_available_balance=final_pab,
                net_requirements=net_req,
                planned_order_receipts=planned_rec,
                planned_order_releases=0  # populated in lead time offset pass
            )
            record.buckets.append(bucket)

        # Pass 2: Offset Planned Order Releases by Lead Time
        for b_idx in range(num_buckets):
            rec = record.buckets[b_idx].planned_order_receipts
            if rec > 0:
                release_bucket_idx = b_idx - lead_time_buckets
                if release_bucket_idx >= 0:
                    record.buckets[release_bucket_idx].planned_order_releases += rec
                else:
                    # Past-due expedite release required
                    record.buckets[0].planned_order_releases += rec

        return record

    def check_rough_cut_capacity(
        self,
        sku: str,
        bucket_production_quantities: List[int]
    ) -> List[Dict[str, Any]]:
        """Validate work center load against available capacity."""
        routing = self.routings.get(sku)
        if not routing:
            return []

        capacity_report: List[Dict[str, Any]] = []

        for b_idx, qty in enumerate(bucket_production_quantities):
            if qty <= 0:
                continue

            reqs = routing.calculate_capacity_required(qty)
            for wc_id, required_hours in reqs.items():
                wc = self.work_centers.get(wc_id)
                avail_hours = (wc.effective_daily_capacity_hours * 5.0) if wc else 40.0
                utilization = round((required_hours / max(1.0, avail_hours)) * 100.0, 1)

                capacity_report.append({
                    "bucket_index": b_idx,
                    "work_center_id": wc_id,
                    "work_center_name": wc.name if wc else wc_id,
                    "required_hours": round(required_hours, 1),
                    "available_weekly_hours": avail_hours,
                    "capacity_utilization_pct": utilization,
                    "is_overloaded": utilization > 100.0
                })

        return capacity_report
