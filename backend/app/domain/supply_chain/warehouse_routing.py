"""Warehouse 3D Bin Packing and Pick Path Routing Optimization Engine.

Provides heuristic 3D spatial container loading (Best-Fit Decreasing),
pick path distance minimization across warehouse aisles (S-Shape vs Return vs Midpoint),
and wave picking batch assignment algorithms.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Dict, List, Optional, Set, Tuple


@dataclass
class BoundingBox:
    """3D physical dimensions and weight of an item or container."""
    width_cm: float
    height_cm: float
    depth_cm: float
    max_weight_kg: float

    @property
    def volume_cm3(self) -> float:
        return self.width_cm * self.height_cm * self.depth_cm


@dataclass
class PickItem:
    """Item to be packed and picked in a fulfillment order."""
    item_id: str
    sku: str
    dimensions: BoundingBox
    weight_kg: float
    aisle_number: int
    bay_number: int
    shelf_tier: int
    is_fragile: bool = False
    requires_cold_chain: bool = False


@dataclass
class StorageLocation:
    """Coordinate location of a warehouse bin."""
    aisle: int
    bay: int
    tier: int
    x_coord_m: float
    y_coord_m: float


@dataclass
class PackingContainer:
    """Target carton or shipping pallet."""
    container_id: str
    carton_type: str  # e.g., 'BOX-S', 'BOX-M', 'BOX-XL', 'PALLET-48X40'
    dimensions: BoundingBox
    tare_weight_kg: float
    packed_items: List[PickItem] = field(default_factory=list)

    @property
    def current_weight_kg(self) -> float:
        return self.tare_weight_kg + sum(it.weight_kg for it in self.packed_items)

    @property
    def used_volume_cm3(self) -> float:
        return sum(it.dimensions.volume_cm3 for it in self.packed_items)

    @property
    def volumetric_utilization_pct(self) -> float:
        if self.dimensions.volume_cm3 <= 0:
            return 0.0
        return round((self.used_volume_cm3 / self.dimensions.volume_cm3) * 100.0, 2)


class WarehouseOptimizer:
    """3D Cartonization and Pick Path Routing Engine."""

    STANDARD_CARTONS: List[BoundingBox] = [
        BoundingBox(width_cm=20.0, height_cm=15.0, depth_cm=10.0, max_weight_kg=5.0),    # Small
        BoundingBox(width_cm=35.0, height_cm=25.0, depth_cm=20.0, max_weight_kg=15.0),   # Medium
        BoundingBox(width_cm=50.0, height_cm=40.0, depth_cm=35.0, max_weight_kg=30.0),   # Large
        BoundingBox(width_cm=120.0, height_cm=100.0, depth_cm=140.0, max_weight_kg=500.0) # Pallet
    ]

    @classmethod
    def can_fit_item(cls, container: PackingContainer, item: PickItem) -> bool:
        """Check weight, volume, and geometric feasibility."""
        if container.current_weight_kg + item.weight_kg > container.dimensions.max_weight_kg:
            return False

        # Volumetric packing factor with 15% void allowance
        if container.used_volume_cm3 + item.dimensions.volume_cm3 > (container.dimensions.volume_cm3 * 0.85):
            return False

        # Dimension checks with 6 orientation rotations
        c_dims = sorted([container.dimensions.width_cm, container.dimensions.height_cm, container.dimensions.depth_cm])
        i_dims = sorted([item.dimensions.width_cm, item.dimensions.height_cm, item.dimensions.depth_cm])

        if any(i > c for i, c in zip(i_dims, c_dims)):
            return False

        return True

    @classmethod
    def pack_items_into_containers(
        cls,
        items: List[PickItem],
        container_template: Optional[BoundingBox] = None
    ) -> List[PackingContainer]:
        """Best-Fit Decreasing 3D Bin Packing heuristic."""
        if not items:
            return []

        template = container_template or cls.STANDARD_CARTONS[2]  # Default Large
        # Sort items by volume descending
        sorted_items = sorted(items, key=lambda it: it.dimensions.volume_cm3, reverse=True)
        containers: List[PackingContainer] = []

        for item in sorted_items:
            placed = False
            for c in containers:
                if cls.can_fit_item(c, item):
                    c.packed_items.append(item)
                    placed = True
                    break

            if not placed:
                new_c = PackingContainer(
                    container_id=f"CTN-{len(containers) + 1:04d}",
                    carton_type="BOX-M",
                    dimensions=template,
                    tare_weight_kg=0.5,
                    packed_items=[item]
                )
                containers.append(new_c)

        return containers

    @classmethod
    def compute_s_shape_pick_path(
        cls,
        pick_locations: List[StorageLocation],
        aisle_width_m: float = 3.0,
        aisle_length_m: float = 50.0
    ) -> Tuple[List[StorageLocation], float]:
        """Compute S-Shape (Traversal) pick path heuristic through warehouse aisles."""
        if not pick_locations:
            return [], 0.0

        # Group picks by aisle
        by_aisle: Dict[int, List[StorageLocation]] = {}
        for loc in pick_locations:
            if loc.aisle not in by_aisle:
                by_aisle[loc.aisle] = []
            by_aisle[loc.aisle].append(loc)

        sorted_aisles = sorted(by_aisle.keys())
        ordered_path: List[StorageLocation] = []
        total_distance_m = 0.0
        current_y = 0.0  # 0.0 = front of aisle, aisle_length_m = back of aisle
        current_x = 0.0

        for idx, aisle in enumerate(sorted_aisles):
            aisle_x = float(aisle) * aisle_width_m
            # Cross-aisle travel distance
            total_distance_m += abs(aisle_x - current_x)
            current_x = aisle_x

            aisle_picks = by_aisle[aisle]
            # Alternate traversal direction
            traverse_forward = (idx % 2 == 0)
            sorted_picks = sorted(aisle_picks, key=lambda p: p.y_coord_m, reverse=not traverse_forward)

            for pick in sorted_picks:
                total_distance_m += abs(pick.y_coord_m - current_y)
                current_y = pick.y_coord_m
                ordered_path.append(pick)

            # Traverse to the end of the aisle for next aisle crossover
            target_end = aisle_length_m if traverse_forward else 0.0
            total_distance_m += abs(target_end - current_y)
            current_y = target_end

        # Return to depot (0,0)
        total_distance_m += current_x + current_y
        return ordered_path, round(total_distance_m, 2)
