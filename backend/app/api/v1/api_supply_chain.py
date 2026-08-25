"""REST API Endpoints for Supply Chain, Multi-Level BOM, EOQ, and Warehouse Routing."""

from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.domain.supply_chain.bom_engine import (
    BOMExplosionEngine, ItemMasterRecord, BOMLineItem, CircularDependencyError
)
from app.domain.supply_chain.safety_stock import (
    SafetyStockCalculator, DemandProfile, InventoryBufferRecommendation
)
from app.domain.supply_chain.eoq_calculator import (
    EOQCalculator, PriceBreakTier, EOQOptimizationResult
)
from app.domain.supply_chain.warehouse_routing import (
    WarehouseOptimizer, PickItem, BoundingBox, StorageLocation
)
from app.domain.supply_chain.freight_rate_matrix import (
    FreightRatingEngine, FreightQuoteItem
)

router = APIRouter(prefix="/supply-chain", tags=["Supply Chain & Operations"])


class ItemMasterCreateRequest(BaseModel):
    sku: str
    name: str
    unit_of_measure: str = "EA"
    is_assembly: bool = False
    unit_cost: Decimal = Decimal("100.00")
    lead_time_days: int = 5
    scrap_rate_pct: Decimal = Decimal("0.00")
    description: str = ""
    category: str = "HARDWARE"


class BOMLineCreateRequest(BaseModel):
    parent_sku: str
    component_sku: str
    quantity: Decimal = Decimal("1.0")
    scrap_allowance_pct: Decimal = Decimal("0.00")
    notes: str = ""


class SafetyStockRequest(BaseModel):
    sku: str
    warehouse_id: str
    daily_demand_mean: float
    daily_demand_std_dev: float
    lead_time_days_mean: float
    lead_time_days_std_dev: float
    service_level_target_pct: float = 95.0
    unit_holding_cost_annual: Decimal = Decimal("15.00")
    unit_stockout_penalty_cost: Decimal = Decimal("50.00")
    order_batch_quantity: int = 100


class EOQRequest(BaseModel):
    sku: str
    annual_demand: int
    order_setup_cost: Decimal = Decimal("150.00")
    holding_cost_pct: Decimal = Decimal("20.00")
    tiers: List[Dict[str, Any]] = Field(
        default_factory=lambda: [
            {"tier_number": 1, "min_quantity": 1, "max_quantity": 99, "unit_price": Decimal("100.00")},
            {"tier_number": 2, "min_quantity": 100, "max_quantity": 499, "unit_price": Decimal("90.00")},
            {"tier_number": 3, "min_quantity": 500, "max_quantity": None, "unit_price": Decimal("80.00")},
        ]
    )


class FreightRatingRequest(BaseModel):
    origin_zip: str = "78701"
    dest_zip: str = "10001"
    weight_lb: float = 25.0
    length_in: float = 18.0
    width_in: float = 14.0
    height_in: float = 12.0
    declared_value_usd: Decimal = Decimal("500.00")
    requires_liftgate: bool = False
    is_residential: bool = False


# In-memory singleton BOM engine
_bom_engine = BOMExplosionEngine()

# Seed default items
_default_items = [
    ItemMasterRecord("SRV-NODE-X9", "Enterprise Edge Compute Node X9", "EA", True, Decimal("4500.00"), 14),
    ItemMasterRecord("MB-XEON-D", "Dual-Socket Server Motherboard", "EA", True, Decimal("1200.00"), 10),
    ItemMasterRecord("CPU-XEON-24C", "24-Core Server CPU Processor", "EA", False, Decimal("850.00"), 5),
    ItemMasterRecord("RAM-64GB-ECC", "64GB DDR5 ECC Registered DIMM", "EA", False, Decimal("180.00"), 3),
    ItemMasterRecord("SSD-NVME-3.8T", "3.84TB Enterprise NVMe U.2 Drive", "EA", False, Decimal("320.00"), 4),
    ItemMasterRecord("CHASSIS-2U", "2U Rackmount Server Chassis with 800W Redundant PSU", "EA", False, Decimal("450.00"), 7),
]
for it in _default_items:
    _bom_engine.register_item(it)

_bom_engine.add_bom_line(BOMLineItem("SRV-NODE-X9", "MB-XEON-D", Decimal("1.0")))
_bom_engine.add_bom_line(BOMLineItem("SRV-NODE-X9", "SSD-NVME-3.8T", Decimal("4.0")))
_bom_engine.add_bom_line(BOMLineItem("SRV-NODE-X9", "CHASSIS-2U", Decimal("1.0")))
_bom_engine.add_bom_line(BOMLineItem("MB-XEON-D", "CPU-XEON-24C", Decimal("2.0")))
_bom_engine.add_bom_line(BOMLineItem("MB-XEON-D", "RAM-64GB-ECC", Decimal("8.0")))


@router.post("/items", status_code=status.HTTP_201_CREATED)
async def register_item_master(req: ItemMasterCreateRequest):
    """Register or update an item master record."""
    item = ItemMasterRecord(
        sku=req.sku,
        name=req.name,
        unit_of_measure=req.unit_of_measure,
        is_assembly=req.is_assembly,
        unit_cost=req.unit_cost,
        lead_time_days=req.lead_time_days,
        scrap_rate_pct=req.scrap_rate_pct,
        description=req.description,
        category=req.category
    )
    _bom_engine.register_item(item)
    return {"message": "Item registered successfully", "sku": item.sku}


@router.post("/bom-lines", status_code=status.HTTP_201_CREATED)
async def add_bom_line(req: BOMLineCreateRequest):
    """Add a component relationship line to a Bill of Materials."""
    line = BOMLineItem(
        parent_sku=req.parent_sku,
        component_sku=req.component_sku,
        quantity=req.quantity,
        scrap_allowance_pct=req.scrap_allowance_pct,
        notes=req.notes
    )
    _bom_engine.add_bom_line(line)
    return {"message": "BOM line created", "parent_sku": line.parent_sku, "component_sku": line.component_sku}


@router.get("/bom/explode/{sku}")
async def explode_bom(sku: str, quantity: Decimal = Query(Decimal("1.0"), ge=Decimal("0.01"))):
    """Explode a Bill of Materials assembly into a multi-level costed tree."""
    try:
        tree = _bom_engine.explode_tree(sku, quantity)
        flat_reqs = _bom_engine.flatten_requirements(sku, quantity)
        total_cost = _bom_engine.calculate_total_rollup_cost(sku, quantity)
        crit_lead_time = _bom_engine.calculate_critical_path_lead_time(sku)
        
        return {
            "root_sku": sku,
            "required_quantity": quantity,
            "total_rolled_up_cost": total_cost,
            "critical_path_lead_time_days": crit_lead_time,
            "flattened_raw_materials": [
                {"sku": r[0], "name": r[1], "required_quantity": r[2], "extended_cost": r[3]}
                for r in flat_reqs
            ],
            "hierarchical_tree": tree
        }
    except CircularDependencyError as cde:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(cde))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/safety-stock/optimize")
async def calculate_safety_stock_profile(req: SafetyStockRequest):
    """Calculate statistical safety stock, reorder point, and fill rates."""
    profile = DemandProfile(
        sku=req.sku,
        warehouse_id=req.warehouse_id,
        daily_demand_mean=req.daily_demand_mean,
        daily_demand_std_dev=req.daily_demand_std_dev,
        lead_time_days_mean=req.lead_time_days_mean,
        lead_time_days_std_dev=req.lead_time_days_std_dev,
        service_level_target_pct=req.service_level_target_pct,
        unit_holding_cost_annual=req.unit_holding_cost_annual,
        unit_stockout_penalty_cost=req.unit_stockout_penalty_cost
    )
    res = SafetyStockCalculator.evaluate_buffer_profile(profile, req.order_batch_quantity)
    return res


@router.post("/eoq/optimize")
async def optimize_eoq(req: EOQRequest):
    """Calculate Economic Order Quantity with quantity discount price breaks."""
    tiers = [
        PriceBreakTier(
            tier_number=t["tier_number"],
            min_quantity=t["min_quantity"],
            max_quantity=t.get("max_quantity"),
            unit_price=Decimal(str(t["unit_price"]))
        )
        for t in req.tiers
    ]
    res = EOQCalculator.optimize_with_quantity_discounts(
        sku=req.sku,
        annual_demand=req.annual_demand,
        order_setup_cost=req.order_setup_cost,
        holding_cost_pct=req.holding_cost_pct,
        tiers=tiers
    )
    return res


@router.post("/freight/calculate-rates")
async def calculate_freight_rates(req: FreightRatingRequest):
    """Rate parcel & LTL freight across carrier service levels."""
    quotes = FreightRatingEngine.calculate_rates(
        origin_zip=req.origin_zip,
        dest_zip=req.dest_zip,
        weight_lb=req.weight_lb,
        length_in=req.length_in,
        width_in=req.width_in,
        height_in=req.height_in,
        declared_value_usd=req.declared_value_usd,
        requires_liftgate=req.requires_liftgate,
        is_residential=req.is_residential
    )
    return {"origin_zip": req.origin_zip, "dest_zip": req.dest_zip, "quotes": quotes}
