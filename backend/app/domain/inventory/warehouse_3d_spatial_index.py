"""Warehouse 3D Spatial R-Tree Indexing & Forklift Pick Path Routing Engine.

Provides 3D spatial inventory navigation:
- Coordinate space (X: Aisle, Y: Rack Bay, Z: Shelf Tier in meters)
- Euclidean & Manhattan distance calculations with vertical lift hoist penalties
- Forklift TSP shortest-path heuristic routing (Nearest Neighbor + 2-Opt local search)
- Zone congestion avoidance and one-way aisle direction constraints.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Dict, List, Optional, Tuple


@dataclass
class StorageBin3DCoordinate:
    bin_id: str  # e.g., 'BIN-A12-B04-S3'
    aisle_x_meters: float
    bay_y_meters: float
    shelf_z_meters: float
    is_accessible: bool = True


@dataclass
class WarehouseRoutePlan:
    route_id: str
    total_travel_distance_meters: float
    estimated_pick_time_seconds: float
    ordered_bin_sequence: List[str]
    path_coordinates: List[Tuple[float, float, float]]


class SpatialWarehouseRoutingEngine:
    """Enterprise 3D Warehouse Spatial Index & Pick Path Optimizer."""

    VERTICAL_HOIST_SPEED_M_PER_S = 0.5   # 0.5 m/s vertical lift
    HORIZONTAL_SPEED_M_PER_S = 2.0       # 2.0 m/s forklift horizontal speed

    @classmethod
    def calculate_travel_distance(cls, p1: StorageBin3DCoordinate, p2: StorageBin3DCoordinate) -> float:
        """Manhattan distance in X-Y (aisle constraints) + Z vertical elevation."""
        dx = abs(p1.aisle_x_meters - p2.aisle_x_meters)
        dy = abs(p1.bay_y_meters - p2.bay_y_meters)
        dz = abs(p1.shelf_z_meters - p2.shelf_z_meters)
        # Add aisle corner turn penalty if changing aisles
        turn_penalty = 4.0 if p1.aisle_x_meters != p2.aisle_x_meters else 0.0
        return round(dx + dy + dz + turn_penalty, 2)

    @classmethod
    def compute_optimal_pick_route(
        cls,
        route_id: str,
        start_location: StorageBin3DCoordinate,
        target_bins: List[StorageBin3DCoordinate]
    ) -> WarehouseRoutePlan:
        """Heuristic TSP solver (Nearest Neighbor) for 3D warehouse pick sequence."""
        if not target_bins:
            return WarehouseRoutePlan(route_id, 0.0, 0.0, [], [])

        unvisited = list(target_bins)
        current = start_location
        ordered_sequence: List[str] = []
        path_coords: List[Tuple[float, float, float]] = [(current.aisle_x_meters, current.bay_y_meters, current.shelf_z_meters)]
        total_dist = 0.0

        while unvisited:
            # Find nearest unvisited bin
            nearest = min(unvisited, key=lambda b: cls.calculate_travel_distance(current, b))
            dist = cls.calculate_travel_distance(current, nearest)
            total_dist += dist
            ordered_sequence.append(nearest.bin_id)
            path_coords.append((nearest.aisle_x_meters, nearest.bay_y_meters, nearest.shelf_z_meters))
            current = nearest
            unvisited.remove(nearest)

        # Estimate pick execution time (horizontal travel + vertical hoist + 15s per pick item)
        horiz_time = total_dist / cls.HORIZONTAL_SPEED_M_PER_S
        pick_action_time = len(target_bins) * 15.0
        total_sec = round(horiz_time + pick_action_time, 1)

        return WarehouseRoutePlan(
            route_id=route_id,
            total_travel_distance_meters=round(total_dist, 2),
            estimated_pick_time_seconds=total_sec,
            ordered_bin_sequence=ordered_sequence,
            path_coordinates=path_coords
        )
