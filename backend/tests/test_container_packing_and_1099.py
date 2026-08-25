"""Automated Integration Test Suite for Multi-Attribute SKU Matrix, Container Packing & Form 1099 FIRE Generator."""

import pytest
from decimal import Decimal
from app.domain.commerce.multi_attribute_inventory_matrix import (
    MultiAttributeMatrixEngine, ProductAttributeDimension
)
from app.domain.supply_chain.container_load_3d_packing import (
    ContainerPackingEngine, ContainerType
)
from app.domain.accounting.statutory_tax_return_filing import (
    Form1099TaxFilingEngine, Vendor1099PayeeRecord
)


def test_multi_attribute_sku_explosion():
    dims = [
        ProductAttributeDimension("COLOR", "Chassis Color", [("BLK", "Matte Black", Decimal("0.00")), ("SLV", "Anodized Silver", Decimal("50.00"))]),
        ProductAttributeDimension("MEM", "RAM Capacity", [("64G", "64GB DDR5", Decimal("0.00")), ("128G", "128GB DDR5", Decimal("300.00"))]),
        ProductAttributeDimension("VOLT", "Input Voltage", [("120V", "120V North America", Decimal("0.00")), ("240V", "240V International", Decimal("20.00"))]),
    ]
    # 2 * 2 * 2 = 8 combinatorial variant SKUs
    variants = MultiAttributeMatrixEngine.explode_variant_matrix(
        parent_product_id="PROD-SRV-01",
        base_sku_prefix="SRV-X9",
        base_price_usd=Decimal("4500.00"),
        base_cogs_usd=Decimal("2000.00"),
        dimensions=dims
    )
    assert len(variants) == 8
    assert variants[0].variant_sku == "SRV-X9-BLK-64G-120V"
    assert variants[-1].variant_sku == "SRV-X9-SLV-128G-240V"
    assert variants[-1].list_price_usd == Decimal("4870.00")  # 4500 + 50 + 300 + 20


def test_container_3d_packing_and_cog_balance():
    # 40ft High Cube container packing 200 cartons (24" x 18" x 16", 25 lb)
    plan = ContainerPackingEngine.calculate_container_packing_plan(
        container_id="CONT-001",
        container_type=ContainerType.HIGH_CUBE_40FT,
        carton_sku="SRV-NODE-X9",
        carton_length_in=24.0,
        carton_width_in=18.0,
        carton_height_in=16.0,
        carton_weight_lb=25.0,
        quantity_to_pack=200
    )
    assert plan.total_cartons_loaded == 200
    assert plan.total_cargo_weight_lb == 5000.0
    assert plan.is_balanced_within_safe_limits is True
    assert 45.0 <= plan.center_of_gravity_x_pct <= 55.0


def test_irs_form_1099_fire_file_generation():
    payees = [
        Vendor1099PayeeRecord("123456789", "Apex Silicon Semiconductor Ltd", "100 Silicon Way", "Austin", "TX", "78701", Decimal("125000.00")),
        Vendor1099PayeeRecord("987654321", "Precision Sheet Metal Inc", "200 Metal Blvd", "San Jose", "CA", "95134", Decimal("45000.00")),
        Vendor1099PayeeRecord("111223333", "Small Contractor", "10 Elm St", "Chicago", "IL", "60601", Decimal("250.00")), # < $600 -> excluded
    ]
    summary = Form1099TaxFilingEngine.generate_irs_fire_file(
        tax_year=2025,
        tcc="12345",
        payer_tin="184918239",
        payer_name="CommerceCRM Global Holdings Inc",
        payees=payees
    )
    assert summary.is_valid_fire_spec is True
    assert summary.total_payees_count == 2  # Only >= $600
    assert summary.total_compensation_reported_usd == Decimal("170000.00")
    for line in summary.fire_formatted_content.split("\n"):
        assert len(line) == 750
