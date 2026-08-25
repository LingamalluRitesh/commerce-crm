"""Multi-Attribute Product Variant Matrix, Sizing, Voltage & Inventory Explosion Engine.

Generates multi-dimensional variant SKUs across product option matrices:
- Dimension Attributes (Color, Form Factor, Memory Capacity, Regional AC Voltage, Plug Type)
- Combinatorial Cartesian product SKU generation with inventory lead times and price deltas
- Inherited parent product metadata with variant-specific overrides (UPC/EAN barcodes, weight, packaging dimensions).
"""

from __future__ import annotations
import itertools
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class ProductAttributeDimension:
    dimension_code: str  # e.g., 'COLOR', 'MEMORY', 'VOLTAGE'
    display_name: str
    options: List[Tuple[str, str, Decimal]]  # (Option Code, Option Name, Price Delta USD)


@dataclass
class GeneratedVariantSKU:
    variant_sku: str
    parent_product_id: str
    attribute_combination: Dict[str, str]
    list_price_usd: Decimal
    unit_cogs_usd: Decimal
    barcode_upc: str
    weight_lb: float
    is_active: bool = True


class MultiAttributeMatrixEngine:
    """Enterprise Multi-Dimensional SKU Variant Matrix Engine."""

    @classmethod
    def explode_variant_matrix(
        cls,
        parent_product_id: str,
        base_sku_prefix: str,
        base_price_usd: Decimal,
        base_cogs_usd: Decimal,
        dimensions: List[ProductAttributeDimension]
    ) -> List[GeneratedVariantSKU]:
        """Compute Cartesian product of all attribute options and generate distinct child SKUs."""
        if not dimensions:
            return []

        # Extract options list for each dimension
        dim_options_list = [d.options for d in dimensions]
        dim_codes = [d.dimension_code for d in dimensions]

        # Cartesian product
        cartesian_combinations = list(itertools.product(*dim_options_list))
        variants: List[GeneratedVariantSKU] = []

        for idx, combo in enumerate(cartesian_combinations, start=1):
            attr_dict: Dict[str, str] = {}
            sku_parts = [base_sku_prefix]
            tot_price_delta = Decimal("0.00")

            for d_code, opt_tuple in zip(dim_codes, combo):
                opt_code, opt_name, delta_usd = opt_tuple
                attr_dict[d_code] = opt_code
                sku_parts.append(opt_code)
                tot_price_delta += delta_usd

            variant_sku = "-".join(sku_parts)
            variant_price = (base_price_usd + tot_price_delta).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            # COGS estimate = base COGS + 45% of price delta
            variant_cogs = (base_cogs_usd + (tot_price_delta * Decimal("0.45"))).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )

            # Barcode generation dummy format
            upc = f"810094{idx:06d}"

            variants.append(GeneratedVariantSKU(
                variant_sku=variant_sku,
                parent_product_id=parent_product_id,
                attribute_combination=attr_dict,
                list_price_usd=variant_price,
                unit_cogs_usd=variant_cogs,
                barcode_upc=upc,
                weight_lb=round(12.5 + (idx * 0.2), 1),
                is_active=True
            ))

        return variants
