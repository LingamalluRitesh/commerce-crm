"""Bill of Materials (BOM) Explosion and Cost Rollup Engine.

Provides multi-level hierarchical tree traversal, circular dependency detection,
lead-time offset calculations, component scrap factor adjustments, and aggregated
manufacturing cost rollups across complex engineering assemblies.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Set, Tuple


class CircularDependencyError(Exception):
    """Raised when a circular reference is detected in the BOM tree structure."""
    pass


class ComponentNotFoundError(Exception):
    """Raised when a referenced subcomponent is missing from the item master."""
    pass


@dataclass
class ItemMasterRecord:
    """Master record for an inventory SKU or manufactured assembly."""
    sku: str
    name: str
    unit_of_measure: str  # e.g., 'EA', 'KG', 'METER', 'LITER'
    is_assembly: bool
    unit_cost: Decimal
    lead_time_days: int
    scrap_rate_pct: Decimal = Decimal("0.00")
    description: str = ""
    category: str = "HARDWARE"


@dataclass
class BOMLineItem:
    """Specific line item within a parent assembly's Bill of Materials."""
    parent_sku: str
    component_sku: str
    quantity: Decimal
    scrap_allowance_pct: Decimal = Decimal("0.00")
    engineering_change_order: str = "ECO-2026-INIT"
    is_critical_path: bool = False
    notes: str = ""


@dataclass
class ExplodedBOMNode:
    """Flattened or hierarchical exploded node in a multi-level BOM."""
    sku: str
    name: str
    level: int
    parent_sku: Optional[str]
    gross_quantity: Decimal
    scrap_adjusted_quantity: Decimal
    unit_cost: Decimal
    extended_cost: Decimal
    accumulated_lead_time_days: int
    is_assembly: bool
    children: List[ExplodedBOMNode] = field(default_factory=list)


class BOMExplosionEngine:
    """Multi-level BOM explosion and manufacturing cost accounting engine."""

    def __init__(self):
        self._item_master: Dict[str, ItemMasterRecord] = {}
        self._bom_structure: Dict[str, List[BOMLineItem]] = {}

    def register_item(self, item: ItemMasterRecord) -> None:
        """Register or update an item master record."""
        self._item_master[item.sku] = item
        if item.sku not in self._bom_structure and item.is_assembly:
            self._bom_structure[item.sku] = []

    def add_bom_line(self, line: BOMLineItem) -> None:
        """Add a component relationship to an assembly's BOM structure."""
        if line.parent_sku not in self._bom_structure:
            self._bom_structure[line.parent_sku] = []
        self._bom_structure[line.parent_sku].append(line)

    def detect_circular_dependencies(self, root_sku: str) -> None:
        """Traverse the BOM graph and raise CircularDependencyError if cycles exist."""
        visited: Set[str] = set()
        path: Set[str] = set()

        def dfs(current_sku: str):
            if current_sku in path:
                cycle = " -> ".join(list(path) + [current_sku])
                raise CircularDependencyError(f"Circular dependency detected in BOM: {cycle}")
            if current_sku in visited:
                return

            visited.add(current_sku)
            path.add(current_sku)

            for line in self._bom_structure.get(current_sku, []):
                dfs(line.component_sku)

            path.remove(current_sku)

        dfs(root_sku)

    def explode_tree(
        self,
        root_sku: str,
        required_quantity: Decimal = Decimal("1.0"),
        current_level: int = 0,
        parent_lead_time: int = 0
    ) -> ExplodedBOMNode:
        """Recursively explode a BOM assembly into a full hierarchical tree node."""
        if root_sku not in self._item_master:
            raise ComponentNotFoundError(f"Item SKU '{root_sku}' not found in item master registry.")

        self.detect_circular_dependencies(root_sku)
        item = self._item_master[root_sku]
        accumulated_lead_time = parent_lead_time + item.lead_time_days

        scrap_multiplier = Decimal("1.0") + (item.scrap_rate_pct / Decimal("100.0"))
        adjusted_qty = (required_quantity * scrap_multiplier).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        extended_cost = (adjusted_qty * item.unit_cost).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        node = ExplodedBOMNode(
            sku=item.sku,
            name=item.name,
            level=current_level,
            parent_sku=None,
            gross_quantity=required_quantity,
            scrap_adjusted_quantity=adjusted_qty,
            unit_cost=item.unit_cost,
            extended_cost=extended_cost,
            accumulated_lead_time_days=accumulated_lead_time,
            is_assembly=item.is_assembly,
            children=[]
        )

        for line in self._bom_structure.get(root_sku, []):
            line_scrap_mult = Decimal("1.0") + (line.scrap_allowance_pct / Decimal("100.0"))
            child_req_qty = (adjusted_qty * line.quantity * line_scrap_mult).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
            
            child_node = self.explode_tree(
                root_sku=line.component_sku,
                required_quantity=child_req_qty,
                current_level=current_level + 1,
                parent_lead_time=accumulated_lead_time
            )
            child_node.parent_sku = root_sku
            node.children.append(child_node)

        return node

    def flatten_requirements(
        self,
        root_sku: str,
        order_quantity: Decimal = Decimal("1.0")
    ) -> List[Tuple[str, str, Decimal, Decimal]]:
        """Flatten a multi-level explosion into an aggregated raw materials requirement list."""
        tree = self.explode_tree(root_sku, order_quantity)
        aggregated: Dict[str, Tuple[str, Decimal, Decimal]] = {}

        def walk(n: ExplodedBOMNode):
            if not n.is_assembly:
                if n.sku in aggregated:
                    name, qty, cost = aggregated[n.sku]
                    aggregated[n.sku] = (name, qty + n.scrap_adjusted_quantity, cost + n.extended_cost)
                else:
                    aggregated[n.sku] = (n.name, n.scrap_adjusted_quantity, n.extended_cost)
            for child in n.children:
                walk(child)

        walk(tree)
        return [(sku, data[0], data[1], data[2]) for sku, data in aggregated.items()]

    def calculate_total_rollup_cost(
        self,
        root_sku: str,
        quantity: Decimal = Decimal("1.0")
    ) -> Decimal:
        """Calculate total rolled-up cost including all child components and scrap factors."""
        tree = self.explode_tree(root_sku, quantity)
        total_cost = Decimal("0.00")

        def accumulate(n: ExplodedBOMNode):
            nonlocal total_cost
            if not n.is_assembly:
                total_cost += n.extended_cost
            for child in n.children:
                accumulate(child)

        accumulate(tree)
        return total_cost.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    def calculate_critical_path_lead_time(self, root_sku: str) -> int:
        """Calculate the longest accumulated lead-time path through all dependency branches."""
        tree = self.explode_tree(root_sku, Decimal("1.0"))
        max_days = 0

        def inspect_lead_times(n: ExplodedBOMNode):
            nonlocal max_days
            if n.accumulated_lead_time_days > max_days:
                max_days = n.accumulated_lead_time_days
            for child in n.children:
                inspect_lead_times(child)

        inspect_lead_times(tree)
        return max_days
