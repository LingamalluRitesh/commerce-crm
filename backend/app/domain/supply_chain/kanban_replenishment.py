"""Dynamic Electronic Kanban (e-Kanban) Bin Size, Supermarket Buffer & Signal Trigger Engine.

Implements Toyota Production System (TPS) pull replenishment heuristics:
- Dynamic Kanban card count formula: K = ceil( (D * (L + S) * (1 + alpha)) / C )
  - D: Average daily demand rate
  - L: Lead time in days
  - S: Safety factor duration in days
  - alpha: Policy volatility buffer (e.g. 10% - 25%)
  - C: Container capacity / standard lot quantity
- Supermarket visual inventory state (Green / Yellow / Red zones)
- Electronic Kanban card lifecycle (IN_PROCESS -> READY_FOR_CONSUMPTION -> EMPTY_TRIGGERED -> IN_PRODUCTION -> REFILLED).
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class KanbanCardState(str, Enum):
    FULL_READY_TO_CONSUME = "FULL_READY_TO_CONSUME"
    IN_CONSUMPTION = "IN_CONSUMPTION"
    EMPTY_TRIGGERED_SIGNAL = "EMPTY_TRIGGERED_SIGNAL"
    IN_REPLENISHMENT_PRODUCTION = "IN_REPLENISHMENT_PRODUCTION"
    IN_TRANSIT_TO_SUPERMARKET = "IN_TRANSIT_TO_SUPERMARKET"


class BufferHealthZone(str, Enum):
    GREEN_OPTIMAL = "GREEN_OPTIMAL"      # Stock > 66% of buffer
    YELLOW_ATTENTION = "YELLOW_ATTENTION"  # Stock 33% - 66%
    RED_CRITICAL_EXPEDITE = "RED_CRITICAL_EXPEDITE" # Stock < 33%


@dataclass
class KanbanLoopDefinition:
    loop_id: str  # e.g., 'KAN-SMT-MB01'
    sku: str
    supplier_work_center_id: str
    consumer_work_center_id: str
    supermarket_location_bin: str
    daily_demand_units: float
    replenishment_lead_time_days: float
    safety_time_days: float
    alpha_volatility_buffer_pct: float
    container_capacity_units: int
    total_calculated_kanban_cards: int


@dataclass
class ActiveKanbanCard:
    card_id: str
    loop_id: str
    sku: str
    container_capacity: int
    state: KanbanCardState
    triggered_at: Optional[str] = None
    replenished_at: Optional[str] = None


@dataclass
class SupermarketBufferStatus:
    loop_id: str
    sku: str
    total_cards_count: int
    full_cards_count: int
    empty_cards_in_replenishment: int
    total_on_hand_units: int
    target_buffer_units: int
    buffer_utilization_pct: float
    health_zone: BufferHealthZone
    requires_emergency_expedite: bool


class DynamicKanbanEngine:
    """Enterprise e-Kanban Sizing & Pull Replenishment Engine."""

    @classmethod
    def calculate_optimal_card_count(
        cls,
        daily_demand: float,
        lead_time_days: float,
        safety_time_days: float,
        alpha_volatility_pct: float,
        container_capacity: int
    ) -> int:
        """Standard TPS Kanban Formula: K = ceil( (D * (L + S) * (1 + alpha)) / C )."""
        if container_capacity <= 0 or daily_demand <= 0:
            return 1

        effective_duration = lead_time_days + safety_time_days
        demand_during_lt = daily_demand * effective_duration
        volatility_factor = 1.0 + (alpha_volatility_pct / 100.0)

        total_required_buffer = demand_during_lt * volatility_factor
        num_cards = math.ceil(total_required_buffer / container_capacity)
        return max(2, num_cards)  # Minimum 2 cards (two-bin system)

    @classmethod
    def evaluate_supermarket_health(
        cls,
        loop: KanbanLoopDefinition,
        cards: List[ActiveKanbanCard]
    ) -> SupermarketBufferStatus:
        """Evaluate visual inventory buffer zone (Green / Yellow / Red)."""
        full_cnt = sum(1 for c in cards if c.state in {KanbanCardState.FULL_READY_TO_CONSUME, KanbanCardState.IN_CONSUMPTION})
        empty_cnt = len(cards) - full_cnt
        on_hand_qty = full_cnt * loop.container_capacity_units
        target_qty = loop.total_calculated_kanban_cards * loop.container_capacity_units

        util_pct = round((on_hand_qty / max(1, target_qty)) * 100.0, 1)

        if util_pct >= 66.6:
            zone = BufferHealthZone.GREEN_OPTIMAL
            expedite = False
        elif util_pct >= 33.3:
            zone = BufferHealthZone.YELLOW_ATTENTION
            expedite = False
        else:
            zone = BufferHealthZone.RED_CRITICAL_EXPEDITE
            expedite = True

        return SupermarketBufferStatus(
            loop_id=loop.loop_id,
            sku=loop.sku,
            total_cards_count=len(cards),
            full_cards_count=full_cnt,
            empty_cards_in_replenishment=empty_cnt,
            total_on_hand_units=on_hand_qty,
            target_buffer_units=target_qty,
            buffer_utilization_pct=util_pct,
            health_zone=zone,
            requires_emergency_expedite=expedite
        )
