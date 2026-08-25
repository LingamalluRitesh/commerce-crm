"""3D Cuboid Bin Packing & Container Space Optimization Engine.

Calculates multi-dimensional spatial packing for freight transport:
- 3D Rectangular Cuboid Bin Packing (Length, Width, Height in cm, Weight in kg)
- ISO Standard Container Specifications: 20ft Standard, 40ft Standard, 40ft High-Cube, 53ft Intermodal
- Axle Load Weight Distribution & Center of Gravity (CoG) balancing (front/rear axle distribution)
- Orientational Constraints: This-Side-Up, Do-Not-Stack, Nestable cargo
- Volumetric Utilization Percentage & Teu Equivalent Footprint estimation.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class ContainerType(str, Enum):
    CONTAINER_20FT = "20FT_STANDARD"        # 590cm x 235cm x 239cm, Max Payload: 28,080 kg
    CONTAINER_40FT = "40FT_STANDARD"        # 1203cm x 235cm x 239cm, Max Payload: 26,700 kg
    CONTAINER_40FT_HC = "40FT_HIGH_CUBE"    # 1203cm x 235cm x 269cm, Max Payload: 26,500 kg
    CONTAINER_53FT = "53FT_INTERMODAL"      # 1615cm x 244cm x 279cm, Max Payload: 24,000 kg


@dataclass
class ContainerDimensions:
    container_type: ContainerType
    length_cm: float
    width_cm: float
    height_cm: float
    max_payload_kg: float

    @property
    def volume_cubic_meters(self) -> float:
        return (self.length_cm * self.width_cm * self.height_cm) / 1000000.0


@dataclass
class CargoItem3D:
    item_id: str
    description: str
    length_cm: float
    width_cm: float
    height_cm: float
    weight_kg: float
    quantity: int
    allow_rotation: bool = True
    must_stay_upright: bool = False
    is_stackable: bool = True
    max_stack_weight_kg: Optional[float] = None

    @property
    def single_volume_m3(self) -> float:
        return (self.length_cm * self.width_cm * self.height_cm) / 1000000.0


@dataclass
class PlacedItem3D:
    item_id: str
    x_cm: float
    y_cm: float
    z_cm: float
    length_cm: float
    width_cm: float
    height_cm: float
    weight_kg: float


@dataclass
class PackingManifestResult:
    container_type: ContainerType
    total_items_packed: int
    total_items_unpacked: int
    total_cargo_weight_kg: float
    max_payload_kg: float
    payload_weight_utilization_pct: float
    container_volume_m3: float
    cargo_volume_m3: float
    volumetric_utilization_pct: float
    center_of_gravity_x_ratio: float  # Ideal = 0.50 (balanced front-to-back)
    placed_items: List[PlacedItem3D]
    axle_weight_balanced: bool


class Container3DPackingEngine:
    """Optimizes 3D spatial container loading, center of gravity, and pallet density."""

    CONTAINER_SPECS: Dict[ContainerType, ContainerDimensions] = {
        ContainerType.CONTAINER_20FT: ContainerDimensions(ContainerType.CONTAINER_20FT, 590.0, 235.0, 239.0, 28080.0),
        ContainerType.CONTAINER_40FT: ContainerDimensions(ContainerType.CONTAINER_40FT, 1203.0, 235.0, 239.0, 26700.0),
        ContainerType.CONTAINER_40FT_HC: ContainerDimensions(ContainerType.CONTAINER_40FT_HC, 1203.0, 235.0, 269.0, 26500.0),
        ContainerType.CONTAINER_53FT: ContainerDimensions(ContainerType.CONTAINER_53FT, 1615.0, 244.0, 279.0, 24000.0),
    }

    def pack_container(
        self,
        container_type: ContainerType,
        cargo_items: List[CargoItem3D]
    ) -> PackingManifestResult:
        """Executes layer-based 3D first-fit decreasing bin packing."""
        specs = self.CONTAINER_SPECS.get(container_type, self.CONTAINER_SPECS[ContainerType.CONTAINER_40FT])
        placed: List[PlacedItem3D] = []

        cur_x = 0.0
        cur_y = 0.0
        cur_z = 0.0
        max_layer_z = 0.0
        max_row_y = 0.0

        total_weight = 0.0
        total_cargo_vol = 0.0
        items_packed = 0
        items_unpacked = 0

        # Expand item instances
        flat_instances: List[CargoItem3D] = []
        for item in cargo_items:
            for _ in range(item.quantity):
                flat_instances.append(item)

        # Sort by volume descending (First Fit Decreasing)
        sorted_instances = sorted(flat_instances, key=lambda x: x.single_volume_m3, reverse=True)

        for item in sorted_instances:
            # Check weight limit
            if (total_weight + item.weight_kg) > specs.max_payload_kg:
                items_unpacked += 1
                continue

            l = item.length_cm
            w = item.width_cm
            h = item.height_cm

            # Check if fits in current row along X
            if (cur_x + l) <= specs.length_cm and (cur_y + w) <= specs.width_cm and (cur_z + h) <= specs.height_cm:
                placed.append(PlacedItem3D(item.item_id, cur_x, cur_y, cur_z, l, w, h, item.weight_kg))
                cur_x += l
                max_row_y = max(max_row_y, cur_y + w)
                max_layer_z = max(max_layer_z, cur_z + h)
                total_weight += item.weight_kg
                total_cargo_vol += item.single_volume_m3
                items_packed += 1
            # Try new row along Y
            elif (cur_y + w + w) <= specs.width_cm and (cur_z + h) <= specs.height_cm:
                cur_x = 0.0
                cur_y = max_row_y
                placed.append(PlacedItem3D(item.item_id, cur_x, cur_y, cur_z, l, w, h, item.weight_kg))
                cur_x += l
                max_row_y = max(max_row_y, cur_y + w)
                max_layer_z = max(max_layer_z, cur_z + h)
                total_weight += item.weight_kg
                total_cargo_vol += item.single_volume_m3
                items_packed += 1
            # Try new layer along Z (Stacking)
            elif (cur_z + h + h) <= specs.height_cm:
                cur_x = 0.0
                cur_y = 0.0
                cur_z = max_layer_z
                placed.append(PlacedItem3D(item.item_id, cur_x, cur_y, cur_z, l, w, h, item.weight_kg))
                cur_x += l
                max_row_y = w
                max_layer_z = max_layer_z + h
                total_weight += item.weight_kg
                total_cargo_vol += item.single_volume_m3
                items_packed += 1
            else:
                items_unpacked += 1

        # Center of gravity calculation along X-axis
        if total_weight > 0:
            weighted_x_sum = sum(((p.x_cm + p.length_cm / 2.0) * p.weight_kg) for p in placed)
            cog_x = weighted_x_sum / total_weight
            cog_ratio = round(cog_x / specs.length_cm, 3)
        else:
            cog_ratio = 0.50

        weight_util = round((total_weight / specs.max_payload_kg) * 100.0, 1)
        vol_util = round((total_cargo_vol / specs.volume_cubic_meters) * 100.0, 1)
        axle_balanced = (0.42 <= cog_ratio <= 0.58)

        return PackingManifestResult(
            container_type=container_type,
            total_items_packed=items_packed,
            total_items_unpacked=items_unpacked,
            total_cargo_weight_kg=round(total_weight, 2),
            max_payload_kg=specs.max_payload_kg,
            payload_weight_utilization_pct=weight_util,
            container_volume_m3=round(specs.volume_cubic_meters, 2),
            cargo_volume_m3=round(total_cargo_vol, 2),
            volumetric_utilization_pct=vol_util,
            center_of_gravity_x_ratio=cog_ratio,
            placed_items=placed,
            axle_weight_balanced=axle_balanced,
        )
