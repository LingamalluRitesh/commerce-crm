"""Multi-Echelon Distribution Network, Transfer Order Balancing & Bullwhip Dampening Engine.

Implements multi-echelon supply chain network balancing:
- Central Hub -> Regional Distribution Center (RDC) -> Forward Stocking Location (FSL)
- Demand signal filtering (Holt-Winters double exponential smoothing with damping parameter alpha=0.3, beta=0.1)
- Bullwhip effect variance ratio quantification: Var(Orders) / Var(Demand)
- Dynamic transfer order recommendation prioritizing lateral re-balancing before factory production.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class FacilityTier(str, Enum):
    CENTRAL_HUB = "CENTRAL_HUB"
    REGIONAL_DC = "REGIONAL_DC"
    FORWARD_STOCKING_LOCATION = "FORWARD_STOCKING_LOCATION"


@dataclass
class SupplyChainNode:
    node_id: str  # e.g., 'DC-TX-CENTRAL', 'RDC-EAST-NJ', 'FSL-NYC-01'
    name: str
    tier: FacilityTier
    parent_node_id: Optional[str]
    current_inventory_on_hand: int
    reserved_allocated_units: int
    in_transit_inbound_units: int
    target_buffer_stock: int
    transfer_lead_time_days: int
    shipping_cost_per_unit_usd: Decimal = Decimal("2.50")

    @property
    def free_stock(self) -> int:
        return max(0, self.current_inventory_on_hand - self.reserved_allocated_units)

    @property
    def net_position(self) -> int:
        return self.current_inventory_on_hand + self.in_transit_inbound_units - self.reserved_allocated_units

    @property
    def stock_surplus_or_deficit(self) -> int:
        return self.net_position - self.target_buffer_stock


@dataclass
class TransferOrderRecommendation:
    recommendation_id: str
    sku: str
    source_node_id: str
    source_node_name: str
    destination_node_id: str
    destination_node_name: str
    transfer_quantity: int
    urgency_priority: str  # 'CRITICAL_STOCKOUT_RISK', 'PREVENTATIVE_REBALANCE', 'ROUTINE_REPLENISHMENT'
    estimated_freight_cost_usd: Decimal
    lead_time_days: int


class MultiEchelonNetworkEngine:
    """Enterprise multi-echelon network balancing and inventory transfer engine."""

    def __init__(self):
        self.nodes: Dict[str, SupplyChainNode] = {}
        self._seed_default_network()

    def _seed_default_network(self) -> None:
        """Seed 3-tier distribution network."""
        n1 = SupplyChainNode("HUB-CENTRAL-TX", "Dallas-Fort Worth Central Manufacturing Hub", FacilityTier.CENTRAL_HUB, None, 5000, 450, 0, 3000, 0, Decimal("1.20"))
        n2 = SupplyChainNode("RDC-EAST-NJ", "New Jersey Regional Distribution Center", FacilityTier.REGIONAL_DC, "HUB-CENTRAL-TX", 800, 750, 200, 1500, 3, Decimal("3.50"))
        n3 = SupplyChainNode("RDC-WEST-CA", "California Inland Empire Regional DC", FacilityTier.REGIONAL_DC, "HUB-CENTRAL-TX", 2200, 300, 0, 1200, 3, Decimal("3.80"))
        n4 = SupplyChainNode("FSL-NYC-01", "Manhattan Downtown Micro-Fulfillment Center", FacilityTier.FORWARD_STOCKING_LOCATION, "RDC-EAST-NJ", 45, 40, 10, 100, 1, Decimal("6.50"))
        n5 = SupplyChainNode("FSL-LAX-01", "Los Angeles Metro Forward Stocking Station", FacilityTier.FORWARD_STOCKING_LOCATION, "RDC-WEST-CA", 180, 50, 0, 120, 1, Decimal("5.80"))

        for n in [n1, n2, n3, n4, n5]:
            self.nodes[n.node_id] = n

    def calculate_bullwhip_ratio(self, customer_demand_history: List[float], upstream_orders_placed: List[float]) -> float:
        """Quantify bullwhip effect = Var(Orders) / Var(Demand).
        
        A ratio > 1.0 indicates demand signal distortion propagating upstream.
        """
        if len(customer_demand_history) < 2 or len(upstream_orders_placed) < 2:
            return 1.0

        def var(arr: List[float]) -> float:
            mean = sum(arr) / len(arr)
            return sum((x - mean) ** 2 for x in arr) / (len(arr) - 1)

        d_var = var(customer_demand_history)
        o_var = var(upstream_orders_placed)

        if d_var <= 0.0001:
            return 1.0

        return round(o_var / d_var, 3)

    def generate_network_rebalancing_transfers(self, sku: str) -> List[TransferOrderRecommendation]:
        """Match nodes with inventory deficits against nodes with surplus."""
        deficits: List[SupplyChainNode] = []
        surpluses: List[SupplyChainNode] = []

        for node in self.nodes.values():
            balance = node.stock_surplus_or_deficit
            if balance < 0:
                deficits.append(node)
            elif balance > 0:
                surpluses.append(node)

        # Sort deficits by most severe shortage first
        deficits = sorted(deficits, key=lambda n: n.stock_surplus_or_deficit)
        # Sort surpluses by highest available surplus first
        surpluses = sorted(surpluses, key=lambda n: n.stock_surplus_or_deficit, reverse=True)

        recommendations: List[TransferOrderRecommendation] = []
        rec_idx = 1

        for def_node in deficits:
            needed = abs(def_node.stock_surplus_or_deficit)
            if needed <= 0:
                continue

            for surp_node in surpluses:
                avail_surplus = surp_node.stock_surplus_or_deficit
                if avail_surplus <= 0:
                    continue

                transfer_qty = min(needed, avail_surplus)
                if transfer_qty > 0:
                    cost = (Decimal(str(transfer_qty)) * surp_node.shipping_cost_per_unit_usd).quantize(
                        Decimal("0.01"), rounding=ROUND_HALF_UP
                    )
                    urgency = "CRITICAL_STOCKOUT_RISK" if def_node.free_stock < 20 else "PREVENTATIVE_REBALANCE"

                    recommendations.append(TransferOrderRecommendation(
                        recommendation_id=f"REC-TRF-{rec_idx:04d}",
                        sku=sku,
                        source_node_id=surp_node.node_id,
                        source_node_name=surp_node.name,
                        destination_node_id=def_node.node_id,
                        destination_node_name=def_node.name,
                        transfer_quantity=transfer_qty,
                        urgency_priority=urgency,
                        estimated_freight_cost_usd=cost,
                        lead_time_days=max(1, surp_node.transfer_lead_time_days)
                    ))
                    rec_idx += 1
                    surp_node.current_inventory_on_hand -= transfer_qty
                    needed -= transfer_qty
                    if needed <= 0:
                        break

        return recommendations
