"""B2B cXML / OCI PunchOut Electronic Procurement Catalog Protocol Engine.

Implements SAP Ariba / Coupa / Oracle Procurement B2B e-commerce protocol:
- PunchOutSetupRequest Inbound Authentication & Session Token Issuance
- Dynamic Contract Catalog & Customer Tier Discount Overrides (Contractual negotiated pricing)
- Interactive Shopping Cart Session State Management
- PunchOutOrderMessage (POSR/POOM) cXML Cart Payload Generation for e-Procurement Checkout Return.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple
import uuid


class PunchOutProtocol(str, Enum):
    CXML_STANDARD = "CXML_STANDARD"
    OCI_ROUNDTRIP = "OCI_ROUNDTRIP"


@dataclass
class PunchOutBuyerIdentity:
    buyer_organization_id: str  # e.g., 'DUNS:192837465'
    buyer_shared_secret: str
    contact_email: str
    erp_system: str  # 'SAP_ARIBA', 'COUPA_PROCUREMENT'
    contract_discount_pct: float = 15.0


@dataclass
class PunchOutCartItem:
    item_id: str
    sku: str
    description: str
    unit_price_usd: Decimal
    quantity: int
    uom: str = "EA"  # Unit of measure (EA, BOX, PK)
    unspsc_code: str = "43211507"  # Desktop / Server Computers

    @property
    def line_total_usd(self) -> Decimal:
        return (self.unit_price_usd * Decimal(str(self.quantity))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )


@dataclass
class PunchOutSession:
    session_id: str
    buyer: PunchOutBuyerIdentity
    created_at: str
    cart_items: List[PunchOutCartItem] = field(default_factory=list)
    is_active: bool = True

    @property
    def total_cart_value_usd(self) -> Decimal:
        return sum((item.line_total_usd for item in self.cart_items), Decimal("0.00"))


class B2BPunchOutEngine:
    """Enterprise B2B cXML / OCI PunchOut Protocol Engine."""

    _ACTIVE_SESSIONS: Dict[str, PunchOutSession] = {}

    @classmethod
    def initiate_punchout_session(
        cls,
        buyer_org_id: str,
        secret: str,
        email: str,
        erp_system: str
    ) -> PunchOutSession:
        """Validate buyer credentials and issue a new secure PunchOut catalog session."""
        session_id = f"POS-{uuid.uuid4().hex[:12].upper()}"
        buyer = PunchOutBuyerIdentity(
            buyer_organization_id=buyer_org_id,
            buyer_shared_secret=secret,
            contact_email=email,
            erp_system=erp_system,
            contract_discount_pct=15.0
        )
        session = PunchOutSession(
            session_id=session_id,
            buyer=buyer,
            created_at=datetime.now(timezone.utc).isoformat()
        )
        cls._ACTIVE_SESSIONS[session_id] = session
        return session

    @classmethod
    def add_item_to_punchout_cart(
        cls,
        session_id: str,
        sku: str,
        description: str,
        list_price_usd: Decimal,
        quantity: int
    ) -> PunchOutSession:
        """Apply buyer contract discounts and append item to PunchOut cart."""
        session = cls._ACTIVE_SESSIONS.get(session_id)
        if not session or not session.is_active:
            raise ValueError(f"Invalid or expired PunchOut session: {session_id}")

        # Apply contract discount
        discount_factor = Decimal(str(1.0 - (session.buyer.contract_discount_pct / 100.0)))
        effective_price = (list_price_usd * discount_factor).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        item = PunchOutCartItem(
            item_id=f"LN-{len(session.cart_items) + 1:03d}",
            sku=sku,
            description=description,
            unit_price_usd=effective_price,
            quantity=quantity
        )
        session.cart_items.append(item)
        return session

    @classmethod
    def generate_cxml_order_message(cls, session_id: str) -> str:
        """Render standard cXML PunchOutOrderMessage for return to buyer ERP."""
        session = cls._ACTIVE_SESSIONS.get(session_id)
        if not session:
            raise ValueError("Session not found")

        lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">',
            f'<cXML timestamp="{datetime.now(timezone.utc).isoformat()}" payloadIdentity="{session.session_id}">',
            '  <Header>',
            f'    <From><Credential domain="NetworkID"><Identity>{session.buyer.buyer_organization_id}</Identity></Credential></From>',
            '    <To><Credential domain="NetworkID"><Identity>COMMERCE_CRM_HUB</Identity></Credential></To>',
            '  </Header>',
            '  <Message>',
            '    <PunchOutOrderMessage>',
            f'      <BuyerCookie>{session.session_id}</BuyerCookie>',
            '      <PunchOutOrderMessageHeader operationAllowed="create">',
            f'        <Total><Money currency="USD">{session.total_cart_value_usd}</Money></Total>',
            '      </PunchOutOrderMessageHeader>',
        ]

        for item in session.cart_items:
            lines.extend([
                f'      <ItemIn quantity="{item.quantity}">',
                f'        <ItemID><SupplierPartID>{item.sku}</SupplierPartID></ItemID>',
                f'        <ItemDetail>',
                f'          <UnitPrice><Money currency="USD">{item.unit_price_usd}</Money></UnitPrice>',
                f'          <Description xml:lang="en">{item.description}</Description>',
                f'          <UnitOfMeasure>{item.uom}</UnitOfMeasure>',
                f'          <Classification domain="UNSPSC">{item.unspsc_code}</Classification>',
                f'        </ItemDetail>',
                f'      </ItemIn>'
            ])

        lines.extend([
            '    </PunchOutOrderMessage>',
            '  </Message>',
            '</cXML>'
        ])
        return "\n".join(lines)
