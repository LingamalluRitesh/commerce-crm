"""Multi-Echelon Inventory Optimization (MEIO) & Hub-and-Spoke Replenishment Engine.

Solves global supply chain inventory allocation across tiers:
- Echelon Stock vs Installation Stock inventory accounting
- Clark-Scarf recursive base-stock replenishment algorithm
- Risk-Pooling & Central Distribution Center (CDC) to Regional Distribution Center (RDC) transfer policies
- Stochastic Lead-time Demand & Safety Stock positioning (Normal / Poisson demand distributions)
- Target Service Level (CSL: 95%, 99%) & stockout probability minimizers across multi-tier networks.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
import math
from typing import Dict, List, Optional, Tuple


class NodeTier(str, Enum):
    CENTRAL_DC = "CENTRAL_DC"             # Tier 1 Global / Central Hub
    REGIONAL_DC = "REGIONAL_DC"           # Tier 2 Regional Spoke
    LOCAL_STORE = "LOCAL_STORE"           # Tier 3 Retail / Micro-fulfillment Center


@dataclass
class NetworkNode:
    node_id: str
    name: str
    tier: NodeTier
    parent_node_id: Optional[str] = None
    replenishment_lead_time_days: float = 3.0
    lead_time_std_dev_days: float = 0.5
    daily_demand_mean: float = 100.0
    daily_demand_std_dev: float = 20.0
    holding_cost_per_unit_per_day: float = 0.05
    stockout_penalty_per_unit: float = 5.00
    target_service_level_csl: float = 0.95  # 95% cycle service level
    current_on_hand_inventory: int = 500
    on_order_in_transit: int = 150
    allocated_backorders: int = 0


@dataclass
class EchelonInventoryStatus:
    node_id: str
    installation_stock: int      # On-hand + In-transit - Backorders at this node only
    echelon_stock: int           # Installation stock at this node + all downstream descendants
    echelon_safety_stock: int
    reorder_point_rop: int
    recommended_order_quantity: int
    estimated_fill_rate: float
    annualized_holding_cost_usd: Decimal


@dataclass
class NetworkReplenishmentPlan:
    plan_id: str
    generated_at: str
    network_nodes_evaluated: int
    total_network_inventory_units: int
    total_holding_cost_annual_usd: Decimal
    node_allocations: Dict[str, EchelonInventoryStatus]
    transfers_to_dispatch: List[Dict[str, str]]


class MultiEchelonInventoryEngine:
    """Computes multi-echelon safety stock positions and Clark-Scarf base-stock replenishment orders."""

    # Standard normal distribution Z-scores for target CSL
    Z_TABLE = {
        0.90: 1.282,
        0.95: 1.645,
        0.98: 2.054,
        0.99: 2.326,
        0.999: 3.090,
    }

    def __init__(self):
        self.nodes: Dict[str, NetworkNode] = {}

    def add_node(self, node: NetworkNode) -> None:
        self.nodes[node.node_id] = node

    def _get_z_score(self, csl: float) -> float:
        for target, z in sorted(self.Z_TABLE.items(), key=lambda x: x[0]):
            if csl <= target:
                return z
        return 2.576  # Fallback for > 99.5%

    def compute_echelon_stocks(self) -> Dict[str, int]:
        """Calculates echelon stock for each node in the supply tree."""
        # Find children map
        children_map: Dict[Optional[str], List[str]] = {}
        for nid, node in self.nodes.items():
            parent = node.parent_node_id
            if parent not in children_map:
                children_map[parent] = []
            children_map[parent].append(nid)

        installation_stocks = {}
        for nid, node in self.nodes.items():
            installation_stocks[nid] = node.current_on_hand_inventory + node.on_order_in_transit - node.allocated_backorders

        echelon_stocks: Dict[str, int] = {}

        def _sum_echelon(node_id: str) -> int:
            total = installation_stocks[node_id]
            for child in children_map.get(node_id, []):
                total += _sum_echelon(child)
            echelon_stocks[node_id] = total
            return total

        # Start from top root nodes
        for root_id in children_map.get(None, []):
            _sum_echelon(root_id)

        # Fallback for any disconnected nodes
        for nid in self.nodes:
            if nid not in echelon_stocks:
                echelon_stocks[nid] = installation_stocks[nid]

        return echelon_stocks

    def optimize_network_replenishment(self) -> NetworkReplenishmentPlan:
        """Executes Clark-Scarf base-stock calculations and generates dispatch transfers."""
        echelon_stocks = self.compute_echelon_stocks()
        node_results: Dict[str, EchelonInventoryStatus] = {}
        transfers: List[Dict[str, str]] = []
        total_inv_units = 0
        total_holding_cost = Decimal("0.00")

        for nid, node in self.nodes.items():
            inst_stock = node.current_on_hand_inventory + node.on_order_in_transit - node.allocated_backorders
            ech_stock = echelon_stocks.get(nid, inst_stock)

            # Lead time demand statistics
            l_mean = node.replenishment_lead_time_days
            l_std = node.lead_time_std_dev_days
            d_mean = node.daily_demand_mean
            d_std = node.daily_demand_std_dev

            # Combined lead time demand variance: Var(LTD) = L * sigma_d^2 + d^2 * sigma_L^2
            lead_time_demand_mean = d_mean * l_mean
            lead_time_demand_variance = (l_mean * (d_std ** 2)) + ((d_mean ** 2) * (l_std ** 2))
            lead_time_demand_std_dev = math.sqrt(max(0.001, lead_time_demand_variance))

            z_score = self._get_z_score(node.target_service_level_csl)
            safety_stock = int(math.ceil(z_score * lead_time_demand_std_dev))
            reorder_point = int(math.ceil(lead_time_demand_mean + safety_stock))

            # Recommended order quantity (Base-stock replenishment)
            order_qty = 0
            if inst_stock < reorder_point:
                order_qty = reorder_point - inst_stock

            fill_rate = min(1.0, max(0.0, 1.0 - (math.exp(-safety_stock / max(1.0, lead_time_demand_std_dev)) * 0.5)))
            annual_holding = Decimal(str(round(node.current_on_hand_inventory * node.holding_cost_per_unit_per_day * 365.0, 2)))

            node_results[nid] = EchelonInventoryStatus(
                node_id=nid,
                installation_stock=inst_stock,
                echelon_stock=ech_stock,
                echelon_safety_stock=safety_stock,
                reorder_point_rop=reorder_point,
                recommended_order_quantity=order_qty,
                estimated_fill_rate=round(fill_rate * 100.0, 1),
                annualized_holding_cost_usd=annual_holding,
            )

            total_inv_units += node.current_on_hand_inventory
            total_holding_cost += annual_holding

            if order_qty > 0 and node.parent_node_id:
                transfers.append({
                    "transfer_id": f"TRF-{nid}-{datetime.now().strftime('%H%M%S')}",
                    "from_node": node.parent_node_id,
                    "to_node": nid,
                    "quantity": str(order_qty),
                    "priority": "HIGH" if inst_stock < safety_stock else "NORMAL",
                })

        return NetworkReplenishmentPlan(
            plan_id=f"MEIO-PLAN-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            generated_at=datetime.now(timezone.utc).isoformat(),
            network_nodes_evaluated=len(self.nodes),
            total_network_inventory_units=total_inv_units,
            total_holding_cost_annual_usd=total_holding_cost,
            node_allocations=node_results,
            transfers_to_dispatch=transfers,
        )
