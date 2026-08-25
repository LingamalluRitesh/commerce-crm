"""FastAPI REST Endpoints for Advanced Enterprise Extensions.

Exposes endpoints for:
- Coupon Stacking Matrix & Basket Optimization
- B2B cXML PunchOut Setup & Order Message Processing
- Reverse Logistics RMA & Inspection Matrix
- Cold Chain Telemetry & Mean Kinetic Temperature (MKT)
- Multi-Echelon Inventory Optimization (MEIO)
- Treasury Liquidity Pooling & Cash Sweeps
- IFRS 15 / ASC 606 Revenue Recognition Schedules
- Omnichannel Customer Journey Attribution
- Partner Portal PRM Deal Registration & MDF
- GDPR / CCPA DSAR & Consent Privacy Ledger
- PCI-DSS Tokenization & Key Rotation Vault.
"""

from decimal import Decimal
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status

from app.application.dtos.enterprise_extensions import (
    CouponStackEvaluationRequest,
    CouponStackEvaluationResponse,
    AppliedCouponDTO,
    PunchoutSetupRequestDTO,
    PunchoutSetupResponseDTO,
    PunchoutAddItemRequest,
    PunchoutOrderMessageResponseDTO,
    RMACreationRequest,
    RMAInspectionRequest,
    ColdChainTelemetryInput,
    ColdChainMKTResponse,
    MEIOOptimizationRequest,
    TreasuryPoolSweepRequest,
    RevenueContractInput,
    MultiTouchAttributionRequest,
    PartnerRegistrationInput,
    DealRegistrationRequest,
    ConsentUpdateInput,
    DSARSubmissionRequest,
    PCITokenizeRequest,
    PCITokenResponse,
)

from app.domain.commerce.promotions_coupon_redemption_matrix import (
    CouponStackingMatrixEngine,
    CouponRuleDefinition,
    CouponDiscountType,
    StackingPolicy,
    CartEvaluationContext,
    CartItemContext,
)
from app.domain.commerce.b2b_punchout_cxml_integration import (
    B2BPunchoutIntegrationEngine,
    PunchoutCatalogItem,
)
from app.domain.supply_chain.reverse_logistics_disposition_matrix import (
    ReverseLogisticsDispositionEngine,
    RMAReason,
    InspectionGrade,
)
from app.domain.supply_chain.cold_chain_telemetry_iot import (
    ColdChainTelemetryEngine,
    ColdChainShipmentProfile,
    TelemetrySensorReading,
    PerishableCategory,
)
from app.domain.supply_chain.multi_echelon_replenishment import (
    MultiEchelonInventoryEngine,
    NetworkNode,
    NodeTier,
)
from app.domain.finance.treasury_liquidity_pooling import (
    TreasuryLiquidityPoolingEngine,
    TreasuryBankAccount,
)
from app.domain.finance.ifrs15_contract_assets_liabilities import (
    IFRS15RevenueRecognitionEngine,
    RevenueContract,
    PerformanceObligation,
    SatisfactionType,
)
from app.domain.crm.omnichannel_customer_journey_attribution import (
    OmnichannelJourneyAttributionEngine,
    CustomerJourneyPath,
    TouchpointEvent,
    AttributionModelType,
    ChannelMedium,
)
from app.domain.crm.partner_portal_deal_registration import (
    PartnerRelationshipManagerEngine,
    PartnerOrganization,
    PartnerTier,
)
from app.domain.compliance.gdpr_ccpa_privacy_governance import (
    PrivacyGovernanceEngine,
    ConsentPurpose,
    DSARType,
)
from app.domain.compliance.pci_dss_tokenization_vault import (
    PCITokenizationVaultEngine,
)


router = APIRouter(prefix="/enterprise", tags=["Advanced Enterprise Suite"])

# Initialize domain singletons
coupon_engine = CouponStackingMatrixEngine()
# Register default promotional coupons
coupon_engine.register_coupon(CouponRuleDefinition("WELCOME15", "First Order 15% Off", CouponDiscountType.PERCENTAGE, Decimal("15.0"), StackingPolicy.STACKABLE, Decimal("50.00"), first_time_customer_only=False))
coupon_engine.register_coupon(CouponRuleDefinition("FREESHIP", "Free Priority Ground Shipping", CouponDiscountType.FREE_SHIPPING, Decimal("0.0"), StackingPolicy.STACKABLE, Decimal("75.00")))
coupon_engine.register_coupon(CouponRuleDefinition("VIPEXCLUSIVE", "VIP 25% Off Exclusive Deal", CouponDiscountType.PERCENTAGE, Decimal("25.0"), StackingPolicy.EXCLUSIVE, Decimal("100.00"), max_discount_cap_usd=Decimal("500.00")))

punchout_engine = B2BPunchoutIntegrationEngine()
punchout_engine.register_buyer_credentials("ACME_CORP_BUYER", "SecureSecretKey123!")

rma_engine = ReverseLogisticsDispositionEngine()
cold_chain_engine = ColdChainTelemetryEngine()
meio_engine = MultiEchelonInventoryEngine()
treasury_engine = TreasuryLiquidityPoolingEngine()
ifrs15_engine = IFRS15RevenueRecognitionEngine()
attribution_engine = OmnichannelJourneyAttributionEngine()
prm_engine = PartnerRelationshipManagerEngine()
privacy_engine = PrivacyGovernanceEngine()
pci_vault_engine = PCITokenizationVaultEngine()


# -----------------------------------------------------------------------------
# 1. Coupon Stacking Matrix
# -----------------------------------------------------------------------------
@router.post("/coupons/evaluate-stack", response_model=CouponStackEvaluationResponse)
async def evaluate_coupon_stack(req: CouponStackEvaluationRequest):
    cart_items = [
        CartItemContext(
            item_id=it.item_id,
            product_id=it.product_id,
            product_name=it.product_name,
            category_id=it.category_id,
            unit_price_usd=it.unit_price_usd,
            quantity=it.quantity,
        )
        for it in req.items
    ]
    cart_ctx = CartEvaluationContext(
        cart_id=req.cart_id,
        customer_id=req.customer_id,
        customer_order_count=req.customer_order_count,
        items=cart_items,
        shipping_fee_usd=req.shipping_fee_usd,
    )
    result = coupon_engine.optimize_coupon_stack(req.requested_coupon_codes, cart_ctx)

    applied_dtos = [
        AppliedCouponDTO(
            coupon_code=a.coupon_code,
            discount_type=a.discount_type.value,
            discount_applied_usd=a.discount_applied_usd,
            line_item_allocations=a.line_item_allocations,
            free_shipping_granted=a.free_shipping_granted,
            explanation=a.explanation,
        )
        for a in result.applied_coupons
    ]

    return CouponStackEvaluationResponse(
        cart_id=result.cart_id,
        original_subtotal_usd=result.original_subtotal_usd,
        original_shipping_usd=result.original_shipping_usd,
        total_discount_usd=result.total_discount_usd,
        final_shipping_usd=result.final_shipping_usd,
        final_payable_usd=result.final_payable_usd,
        applied_coupons=applied_dtos,
        rejected_coupons=[[r[0], r[1]] for r in result.rejected_coupons],
        effective_savings_percentage=result.effective_savings_percentage,
    )


# -----------------------------------------------------------------------------
# 2. B2B cXML PunchOut
# -----------------------------------------------------------------------------
@router.post("/punchout/setup", response_model=PunchoutSetupResponseDTO)
async def setup_punchout_session(dto: PunchoutSetupRequestDTO):
    raw_cxml = f"""<?xml version="1.0" encoding="UTF-8"?>
<cXML timestamp="2026-08-25T12:00:00Z" payloadID="POSR-999@buyer.internal">
  <Header>
    <Sender>
      <Credential domain="DUNS">
        <Identity>{dto.sender_identity}</Identity>
        <SharedSecret>{dto.shared_secret}</SharedSecret>
      </Credential>
    </Sender>
  </Header>
  <Request>
    <PunchOutSetupRequest operation="create">
      <BuyerCookie>{dto.buyer_cookie}</BuyerCookie>
      <BrowserFormPost>
        <URL>{dto.return_url}</URL>
      </BrowserFormPost>
    </PunchOutSetupRequest>
  </Request>
</cXML>"""
    ok, cxml_resp, session_id = punchout_engine.process_cxml_setup_request(raw_cxml, dto.store_base_url)
    if not ok:
        raise HTTPException(status_code=400, detail=cxml_resp)

    redirect = f"{dto.store_base_url}/b2b/punchout?sessionId={session_id}"
    return PunchoutSetupResponseDTO(
        success=True,
        session_id=session_id,
        redirect_url=redirect,
        cxml_response=cxml_resp,
    )


@router.post("/punchout/cart/add-item")
async def add_item_to_punchout(req: PunchoutAddItemRequest):
    ok, msg = punchout_engine.add_item_to_punchout_cart(req.session_id, req.sku, req.quantity, req.custom_cost_center)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg}


@router.get("/punchout/checkout/{session_id}", response_model=PunchoutOrderMessageResponseDTO)
async def checkout_punchout_cart(session_id: str):
    ok, poom_cxml, ret_url = punchout_engine.build_punchout_order_message_cxml(session_id)
    if not ok:
        raise HTTPException(status_code=400, detail=poom_cxml)
    session = punchout_engine.active_sessions.get(session_id)
    val = session.total_order_value if session else Decimal("0.00")
    return PunchoutOrderMessageResponseDTO(
        success=True,
        session_id=session_id,
        return_url=ret_url,
        total_order_value_usd=val,
        cxml_poom_payload=poom_cxml,
    )


# -----------------------------------------------------------------------------
# 3. Reverse Logistics RMA
# -----------------------------------------------------------------------------
@router.post("/rma/create")
async def create_rma(req: RMACreationRequest):
    item_tuples = [
        (it.product_id, it.sku, it.serial_number, it.purchase_price_usd, RMAReason(it.return_reason), it.customer_notes)
        for it in req.items
    ]
    ok, msg, rma = rma_engine.create_rma_request(req.order_id, req.customer_id, item_tuples, req.days_since_purchase)
    if not ok or not rma:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg, "rma_number": rma.rma_number, "status": rma.status.value, "tracking": rma.carrier_tracking_number}


@router.post("/rma/inspect")
async def inspect_rma(req: RMAInspectionRequest):
    inspections = [(ins.line_id, InspectionGrade(ins.grade), ins.refurbishment_cost_usd) for ins in req.inspections]
    ok, msg = rma_engine.conduct_inspection_and_route_disposition(req.rma_number, inspections)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"success": True, "message": msg}


# -----------------------------------------------------------------------------
# 4. Cold Chain IoT
# -----------------------------------------------------------------------------
@router.post("/cold-chain/telemetry")
async def record_cold_chain_telemetry(req: ColdChainTelemetryInput):
    if req.shipment_id not in cold_chain_engine.active_shipments:
        cold_chain_engine.register_shipment(
            ColdChainShipmentProfile(
                shipment_id=req.shipment_id,
                consignment_number=f"CNG-{req.shipment_id}",
                category=PerishableCategory.PHARMA_BIOLOGICS_2_8C,
                carrier_id="CARRIER-CRYOLINK",
                origin_hub="BOS-HUB-01",
                destination_hub="FRA-HUB-02",
                min_temp_limit_celsius=2.0,
                max_temp_limit_celsius=8.0,
                max_allowable_mkt_celsius=7.5,
                total_stability_budget_minutes=120,
            )
        )

    reading = TelemetrySensorReading(
        reading_id=f"RDG-{req.sensor_id}",
        sensor_id=req.sensor_id,
        timestamp_utc=req.timestamp_utc,
        temperature_celsius=req.temperature_celsius,
        relative_humidity_pct=req.relative_humidity_pct,
        shock_g_force=req.shock_g_force,
        battery_level_pct=req.battery_level_pct,
        gps_latitude=req.gps_latitude,
        gps_longitude=req.gps_longitude,
    )
    ok, severity, msg = cold_chain_engine.record_telemetry(req.shipment_id, reading)
    return {"success": ok, "severity": severity.value, "message": msg}


@router.get("/cold-chain/mkt/{shipment_id}", response_model=ColdChainMKTResponse)
async def get_cold_chain_mkt(shipment_id: str):
    res = cold_chain_engine.calculate_mean_kinetic_temperature(shipment_id)
    if not res:
        raise HTTPException(status_code=404, detail="Shipment or telemetry not found")
    return ColdChainMKTResponse(
        shipment_id=res.shipment_id,
        reading_count=res.reading_count,
        min_observed_temp_c=res.min_observed_temp_c,
        max_observed_temp_c=res.max_observed_temp_c,
        mean_arithmetic_temp_c=res.mean_arithmetic_temp_c,
        mkt_celsius=res.mkt_celsius,
        total_excursion_duration_minutes=res.total_excursion_duration_minutes,
        remaining_stability_budget_minutes=res.remaining_stability_budget_minutes,
        compliance_status=res.compliance_status,
        cargo_disposition_recommendation=res.cargo_disposition_recommendation,
    )


# -----------------------------------------------------------------------------
# 5. Multi-Echelon Inventory (MEIO)
# -----------------------------------------------------------------------------
@router.post("/meio/optimize")
async def optimize_meio(req: MEIOOptimizationRequest):
    engine = MultiEchelonInventoryEngine()
    for n in req.nodes:
        engine.add_node(
            NetworkNode(
                node_id=n.node_id,
                name=n.name,
                tier=NodeTier(n.tier),
                parent_node_id=n.parent_node_id,
                replenishment_lead_time_days=n.replenishment_lead_time_days,
                daily_demand_mean=n.daily_demand_mean,
                daily_demand_std_dev=n.daily_demand_std_dev,
                holding_cost_per_unit_per_day=n.holding_cost_per_unit_per_day,
                target_service_level_csl=n.target_service_level_csl,
                current_on_hand_inventory=n.current_on_hand_inventory,
                on_order_in_transit=n.on_order_in_transit,
                allocated_backorders=n.allocated_backorders,
            )
        )
    plan = engine.optimize_network_replenishment()
    return plan


# -----------------------------------------------------------------------------
# 6. Treasury Liquidity Pooling
# -----------------------------------------------------------------------------
@router.post("/treasury/sweeps/execute")
async def execute_treasury_sweeps(req: TreasuryPoolSweepRequest):
    engine = TreasuryLiquidityPoolingEngine(pool_id=req.pool_id)
    for a in req.accounts:
        engine.register_account(
            TreasuryBankAccount(
                account_id=a.account_id,
                entity_id=a.entity_id,
                entity_name=a.entity_name,
                bank_name=a.bank_name,
                currency=a.currency,
                current_balance=a.current_balance,
                target_residual_balance=a.target_residual_balance,
                min_sweep_threshold=a.min_sweep_threshold,
                is_header_master_account=a.is_header_master_account,
                jurisdiction_country=a.jurisdiction_country,
            )
        )
    recon = engine.execute_eod_sweep_and_target_balancing()
    return recon


# -----------------------------------------------------------------------------
# 7. IFRS 15 Revenue Schedules
# -----------------------------------------------------------------------------
@router.post("/revenue/contracts/register")
async def register_revenue_contract(req: RevenueContractInput):
    pobs = [
        PerformanceObligation(
            pob_id=p.pob_id,
            description=p.description,
            standalone_selling_price_usd=p.standalone_selling_price_usd,
            satisfaction_type=SatisfactionType(p.satisfaction_type),
            term_months=p.term_months,
        )
        for p in req.performance_obligations
    ]
    contract = RevenueContract(
        contract_id=req.contract_id,
        customer_id=req.customer_id,
        customer_name=req.customer_name,
        contract_start_date=req.contract_start_date,
        contract_end_date=req.contract_end_date,
        total_contract_value_usd=req.total_contract_value_usd,
        billed_invoiced_to_date_usd=req.billed_invoiced_to_date_usd,
        cash_collected_to_date_usd=req.cash_collected_to_date_usd,
        performance_obligations=pobs,
    )
    saved = ifrs15_engine.register_and_allocate_contract(contract)
    summary = ifrs15_engine.recognize_period_revenue(saved.contract_id, [])
    return summary


# -----------------------------------------------------------------------------
# 8. Omnichannel Journey Attribution
# -----------------------------------------------------------------------------
@router.post("/attribution/evaluate")
async def evaluate_attribution(req: MultiTouchAttributionRequest):
    engine = OmnichannelJourneyAttributionEngine()
    for j in req.journeys:
        tps = [
            TouchpointEvent(
                event_id=tp.event_id,
                channel=ChannelMedium(tp.channel),
                campaign_name=tp.campaign_name,
                timestamp_utc=tp.timestamp_utc,
                cost_usd=tp.cost_usd,
            )
            for tp in j.touchpoints
        ]
        engine.record_journey(
            CustomerJourneyPath(
                journey_id=j.journey_id,
                customer_id=j.customer_id,
                touchpoints=tps,
                is_converted=j.is_converted,
                conversion_value_usd=j.conversion_value_usd,
            )
        )
    model = AttributionModelType(req.model_type)
    report = engine.calculate_attribution(model)
    return report


# -----------------------------------------------------------------------------
# 9. Partner PRM Deal Registration
# -----------------------------------------------------------------------------
@router.post("/prm/partners/register")
async def register_partner(req: PartnerRegistrationInput):
    p = PartnerOrganization(
        partner_id=req.partner_id,
        company_name=req.company_name,
        tier=PartnerTier(req.tier),
        registered_contact_email=req.registered_contact_email,
        geographic_territory=req.geographic_territory,
    )
    prm_engine.register_partner(p)
    return {"success": True, "partner_id": p.partner_id, "tier": p.tier.value, "margin_pct": str(p.contract_discount_margin_pct)}


@router.post("/prm/deals/submit")
async def submit_deal_reg(req: DealRegistrationRequest):
    ok, msg, reg = prm_engine.submit_deal_registration(
        req.partner_id, req.customer_name, req.customer_domain, req.estimated_deal_size_usd, req.product_category
    )
    return {"success": ok, "message": msg, "registration_id": reg.registration_id, "status": reg.status.value, "margin_usd": str(reg.partner_margin_usd)}


# -----------------------------------------------------------------------------
# 10. Privacy GDPR & Consent
# -----------------------------------------------------------------------------
@router.post("/privacy/consent/record")
async def record_consent(req: ConsentUpdateInput):
    rec = privacy_engine.record_consent_update(req.user_id, ConsentPurpose(req.purpose), req.is_granted, req.ip_address)
    return {"success": True, "consent_id": rec.consent_id, "is_granted": rec.is_granted, "timestamp": rec.timestamp_utc}


@router.post("/privacy/dsar/submit")
async def submit_dsar(req: DSARSubmissionRequest):
    dsar = privacy_engine.submit_dsar_request(req.user_id, req.email, DSARType(req.request_type))
    return {"success": True, "request_id": dsar.request_id, "sla_deadline": dsar.sla_deadline_at, "days_remaining": dsar.days_remaining_in_sla}


# -----------------------------------------------------------------------------
# 11. PCI Tokenization
# -----------------------------------------------------------------------------
@router.post("/pci/tokenize", response_model=PCITokenResponse)
async def tokenize_card(req: PCITokenizeRequest):
    ok, msg, record = pci_vault_engine.tokenize_pan(req.primary_account_number, req.expiry_month, req.expiry_year, req.caller_service)
    if not ok or not record:
        return PCITokenResponse(success=False, message=msg)
    return PCITokenResponse(
        success=True,
        token_id=record.token_id,
        card_brand=record.card_brand.value,
        masked_display_pan=record.masked_display_pan,
        vault_key_version=record.vault_key_version,
        message=msg,
    )
