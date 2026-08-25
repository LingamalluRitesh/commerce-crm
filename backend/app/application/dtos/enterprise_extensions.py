"""Pydantic v2 DTO Schemas for Advanced Enterprise Extensions.

Includes request/response schemas for:
- Coupon Stacking Matrix & Basket Optimizer
- B2B cXML PunchOut E-Procurement Gateway
- Reverse Logistics RMA & Refurbishment Matrix
- Cold-Chain IoT Telemetry & Mean Kinetic Temperature (MKT)
- Multi-Echelon Inventory Optimization (MEIO)
- Treasury Liquidity Pooling & Cash Sweeps
- IFRS 15 / ASC 606 Revenue Recognition Schedules
- Omnichannel Customer Journey Attribution
- Partner Portal PRM & Deal Registration
- GDPR / CCPA DSAR & Consent Privacy Ledger
- PCI-DSS Tokenization & Key Rotation Vault.
"""

from __future__ import annotations
from decimal import Decimal
from typing import Dict, List, Optional, Set
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# Coupon Stacking Schemas
# -----------------------------------------------------------------------------
class CartItemInput(BaseModel):
    item_id: str
    product_id: str
    product_name: str
    category_id: str
    unit_price_usd: Decimal
    quantity: int


class CouponStackEvaluationRequest(BaseModel):
    cart_id: str
    customer_id: str
    customer_order_count: int = 0
    shipping_fee_usd: Decimal = Decimal("15.00")
    requested_coupon_codes: List[str]
    items: List[CartItemInput]


class AppliedCouponDTO(BaseModel):
    coupon_code: str
    discount_type: str
    discount_applied_usd: Decimal
    line_item_allocations: Dict[str, Decimal]
    free_shipping_granted: bool
    explanation: str


class CouponStackEvaluationResponse(BaseModel):
    cart_id: str
    original_subtotal_usd: Decimal
    original_shipping_usd: Decimal
    total_discount_usd: Decimal
    final_shipping_usd: Decimal
    final_payable_usd: Decimal
    applied_coupons: List[AppliedCouponDTO]
    rejected_coupons: List[List[str]]
    effective_savings_percentage: float


# -----------------------------------------------------------------------------
# B2B cXML PunchOut Schemas
# -----------------------------------------------------------------------------
class PunchoutSetupRequestDTO(BaseModel):
    sender_identity: str
    shared_secret: str
    buyer_cookie: str
    return_url: str
    store_base_url: str = "https://app.commercecrm.internal"


class PunchoutSetupResponseDTO(BaseModel):
    success: bool
    session_id: str
    redirect_url: str
    cxml_response: str


class PunchoutAddItemRequest(BaseModel):
    session_id: str
    sku: str
    quantity: int
    custom_cost_center: Optional[str] = None


class PunchoutOrderMessageResponseDTO(BaseModel):
    success: bool
    session_id: str
    return_url: str
    total_order_value_usd: Decimal
    cxml_poom_payload: str


# -----------------------------------------------------------------------------
# Reverse Logistics RMA Schemas
# -----------------------------------------------------------------------------
class RMAItemInput(BaseModel):
    product_id: str
    sku: str
    serial_number: Optional[str] = None
    purchase_price_usd: Decimal
    return_reason: str
    customer_notes: str = ""


class RMACreationRequest(BaseModel):
    order_id: str
    customer_id: str
    days_since_purchase: int
    items: List[RMAItemInput]


class RMALineInspectionInput(BaseModel):
    line_id: str
    grade: str
    refurbishment_cost_usd: Decimal = Decimal("0.00")


class RMAInspectionRequest(BaseModel):
    rma_number: str
    inspections: List[RMALineInspectionInput]


# -----------------------------------------------------------------------------
# Cold Chain IoT Schemas
# -----------------------------------------------------------------------------
class ColdChainTelemetryInput(BaseModel):
    shipment_id: str
    sensor_id: str
    timestamp_utc: str
    temperature_celsius: float
    relative_humidity_pct: float
    shock_g_force: float = 1.0
    battery_level_pct: float = 98.0
    gps_latitude: float = 37.7749
    gps_longitude: float = -122.4194


class ColdChainMKTResponse(BaseModel):
    shipment_id: str
    reading_count: int
    min_observed_temp_c: float
    max_observed_temp_c: float
    mean_arithmetic_temp_c: float
    mkt_celsius: float
    total_excursion_duration_minutes: int
    remaining_stability_budget_minutes: int
    compliance_status: str
    cargo_disposition_recommendation: str


# -----------------------------------------------------------------------------
# Multi-Echelon MEIO Schemas
# -----------------------------------------------------------------------------
class NetworkNodeInput(BaseModel):
    node_id: str
    name: str
    tier: str
    parent_node_id: Optional[str] = None
    replenishment_lead_time_days: float = 3.0
    daily_demand_mean: float = 100.0
    daily_demand_std_dev: float = 20.0
    holding_cost_per_unit_per_day: float = 0.05
    target_service_level_csl: float = 0.95
    current_on_hand_inventory: int = 500
    on_order_in_transit: int = 150
    allocated_backorders: int = 0


class MEIOOptimizationRequest(BaseModel):
    nodes: List[NetworkNodeInput]


# -----------------------------------------------------------------------------
# Treasury Liquidity Pooling Schemas
# -----------------------------------------------------------------------------
class TreasuryAccountInput(BaseModel):
    account_id: str
    entity_id: str
    entity_name: str
    bank_name: str
    currency: str = "USD"
    current_balance: Decimal
    target_residual_balance: Decimal = Decimal("50000.00")
    min_sweep_threshold: Decimal = Decimal("1000.00")
    is_header_master_account: bool = False
    jurisdiction_country: str = "US"


class TreasuryPoolSweepRequest(BaseModel):
    pool_id: str
    accounts: List[TreasuryAccountInput]


# -----------------------------------------------------------------------------
# IFRS 15 Revenue Schemas
# -----------------------------------------------------------------------------
class PerformanceObligationInput(BaseModel):
    pob_id: str
    description: str
    standalone_selling_price_usd: Decimal
    satisfaction_type: str
    term_months: int = 12


class RevenueContractInput(BaseModel):
    contract_id: str
    customer_id: str
    customer_name: str
    contract_start_date: str
    contract_end_date: str
    total_contract_value_usd: Decimal
    billed_invoiced_to_date_usd: Decimal
    cash_collected_to_date_usd: Decimal
    performance_obligations: List[PerformanceObligationInput]


# -----------------------------------------------------------------------------
# Omnichannel Journey Attribution Schemas
# -----------------------------------------------------------------------------
class TouchpointInput(BaseModel):
    event_id: str
    channel: str
    campaign_name: str
    timestamp_utc: str
    cost_usd: Decimal = Decimal("0.00")


class CustomerJourneyInput(BaseModel):
    journey_id: str
    customer_id: str
    touchpoints: List[TouchpointInput]
    is_converted: bool
    conversion_value_usd: Decimal = Decimal("0.00")


class MultiTouchAttributionRequest(BaseModel):
    model_type: str = "U_SHAPED_POSITION"
    journeys: List[CustomerJourneyInput]


# -----------------------------------------------------------------------------
# Partner PRM Deal Registration Schemas
# -----------------------------------------------------------------------------
class PartnerRegistrationInput(BaseModel):
    partner_id: str
    company_name: str
    tier: str
    registered_contact_email: str
    geographic_territory: str = "NORTH_AMERICA"


class DealRegistrationRequest(BaseModel):
    partner_id: str
    customer_name: str
    customer_domain: str
    estimated_deal_size_usd: Decimal
    product_category: str


# -----------------------------------------------------------------------------
# Privacy DSAR & Consent Schemas
# -----------------------------------------------------------------------------
class ConsentUpdateInput(BaseModel):
    user_id: str
    purpose: str
    is_granted: bool
    ip_address: str = "127.0.0.1"


class DSARSubmissionRequest(BaseModel):
    user_id: str
    email: str
    request_type: str


# -----------------------------------------------------------------------------
# PCI Tokenization Schemas
# -----------------------------------------------------------------------------
class PCITokenizeRequest(BaseModel):
    primary_account_number: str
    expiry_month: int
    expiry_year: int
    caller_service: str = "CHECKOUT_API"


class PCITokenResponse(BaseModel):
    success: bool
    token_id: Optional[str] = None
    card_brand: Optional[str] = None
    masked_display_pan: Optional[str] = None
    vault_key_version: Optional[str] = None
    message: str
