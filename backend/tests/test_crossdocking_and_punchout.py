"""Automated Integration Test Suite for Cross-Docking and B2B PunchOut Catalog."""

import pytest
from decimal import Decimal
from app.domain.supply_chain.warehouse_cross_docking import (
    CrossDockingEngine, InboundASNPallet, OutboundDemandFulfillment, CrossDockPriority
)
from app.domain.commerce.tiered_b2b_punchout_catalog import (
    B2BPunchOutEngine
)


def test_cross_docking_matchmaking():
    inbound = [
        InboundASNPallet("PAL-01", "FedEx", "BAY-04", "SRV-NODE-X9", "Compute Node", 40, "2026-08-25T10:00:00Z")
    ]
    outbound = [
        OutboundDemandFulfillment("ORD-101", "Acme Health", "BAY-18", "Old Dominion", "SRV-NODE-X9", 40, "2026-08-25T14:00:00Z", CrossDockPriority.EXPEDITED_BACKORDER)
    ]
    matches, unmatched = CrossDockingEngine.match_inbound_to_outbound(inbound, outbound)
    assert len(matches) == 1
    assert matches[0].transshipped_quantity == 40
    assert matches[0].inbound_door == "BAY-04"
    assert matches[0].outbound_door == "BAY-18"
    assert len(unmatched) == 0


def test_b2b_punchout_session_and_cxml():
    session = B2BPunchOutEngine.initiate_punchout_session(
        buyer_org_id="DUNS:192837465",
        secret="shared_secret_pwd",
        email="procurement@ariba.com",
        erp_system="SAP_ARIBA"
    )
    # Add item with 15% discount
    updated = B2BPunchOutEngine.add_item_to_punchout_cart(
        session_id=session.session_id,
        sku="SRV-XEON-MAX",
        description="Dual Xeon Server",
        list_price_usd=Decimal("10000.00"),
        quantity=2
    )
    # $10,000 * 0.85 = $8,500 * 2 = $17,000
    assert updated.total_cart_value_usd == Decimal("17000.00")
    cxml = B2BPunchOutEngine.generate_cxml_order_message(session.session_id)
    assert "PunchOutOrderMessage" in cxml
    assert "17000.00" in cxml
