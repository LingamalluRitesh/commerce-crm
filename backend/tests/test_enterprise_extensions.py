"""Comprehensive Test Suite for Advanced Enterprise Extensions.

Tests:
- Coupon Stacking Matrix & Basket Combinatorial Optimizer
- B2B cXML PunchOut Setup Request & Order Message (POOM) XML
- Reverse Logistics RMA Grading & Refurbishment Matrix
- Cold Chain IoT Telemetry & Mean Kinetic Temperature (MKT)
- Multi-Echelon Inventory Optimization (MEIO)
- Treasury Liquidity Pooling & Zero-Balance Account (ZBA) Sweeps
- IFRS 15 / ASC 606 Revenue Recognition Schedules & Contract Asset Rollforward
- Omnichannel Customer Journey Attribution Models
- Partner Portal PRM Deal Registration Conflict Engine
- GDPR / CCPA Privacy Governance & DSAR Erasure Certificates
- PCI-DSS 4.0 Tokenization Vault & HSM Key Rotation.
"""

from decimal import Decimal
import pytest

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
    DispositionChannel,
)
from app.domain.supply_chain.cold_chain_telemetry_iot import (
    ColdChainTelemetryEngine,
    ColdChainShipmentProfile,
    TelemetrySensorReading,
    PerishableCategory,
    ExcursionSeverity,
)
from app.domain.supply_chain.multi_echelon_replenishment import (
    MultiEchelonInventoryEngine,
    NetworkNode,
    NodeTier,
)
from app.domain.finance.treasury_liquidity_pooling import (
    TreasuryLiquidityPoolingEngine,
    TreasuryBankAccount,
    SweepDirection,
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
    DealRegistrationStatus,
)
from app.domain.compliance.gdpr_ccpa_privacy_governance import (
    PrivacyGovernanceEngine,
    ConsentPurpose,
    DSARType,
    DSARStatus,
)
from app.domain.compliance.pci_dss_tokenization_vault import (
    PCITokenizationVaultEngine,
    CardBrand,
)


def test_coupon_stacking_matrix():
    engine = CouponStackingMatrixEngine(max_stackable_coupons=3)
    engine.register_coupon(CouponRuleDefinition("SAVE10", "10% Off", CouponDiscountType.PERCENTAGE, Decimal("10.0"), StackingPolicy.STACKABLE, Decimal("50.00")))
    engine.register_coupon(CouponRuleDefinition("FREESHIP", "Free Shipping", CouponDiscountType.FREE_SHIPPING, Decimal("0.0"), StackingPolicy.STACKABLE, Decimal("75.00")))

    cart = CartEvaluationContext(
        cart_id="CART-001",
        customer_id="CUST-001",
        customer_order_count=2,
        shipping_fee_usd=Decimal("20.00"),
        items=[
            CartItemContext("IT-1", "PROD-1", "Hardware Item", "CAT-1", Decimal("100.00"), 1),
        ]
    )
    result = engine.optimize_coupon_stack(["SAVE10", "FREESHIP"], cart)
    assert len(result.applied_coupons) == 2
    assert result.total_discount_usd == Decimal("30.00")  # $10 discount + $20 shipping
    assert result.final_payable_usd == Decimal("90.00")


def test_b2b_punchout_cxml_flow():
    engine = B2BPunchoutIntegrationEngine()
    engine.register_buyer_credentials("BUYER_1", "SecretPass123!")

    raw_cxml = """<?xml version="1.0" encoding="UTF-8"?>
<cXML timestamp="2026-08-25T12:00:00Z" payloadID="POSR-1@buyer.internal">
  <Header>
    <Sender>
      <Credential domain="DUNS">
        <Identity>BUYER_1</Identity>
        <SharedSecret>SecretPass123!</SharedSecret>
      </Credential>
    </Sender>
  </Header>
  <Request>
    <PunchOutSetupRequest operation="create">
      <BuyerCookie>COOKIE-XYZ-123</BuyerCookie>
      <BrowserFormPost>
        <URL>https://buyer-erp.internal/return</URL>
      </BrowserFormPost>
    </PunchOutSetupRequest>
  </Request>
</cXML>"""
    ok, resp, session_id = engine.process_cxml_setup_request(raw_cxml, "https://app.commercecrm.internal")
    assert ok is True
    assert "PunchOutSetupResponse" in resp

    add_ok, _ = engine.add_item_to_punchout_cart(session_id, "SKU-TEST-01", 2)
    assert add_ok is True

    poom_ok, poom_cxml, _ = engine.build_punchout_order_message_cxml(session_id)
    assert poom_ok is True
    assert "PunchOutOrderMessage" in poom_cxml


def test_reverse_logistics_rma():
    engine = ReverseLogisticsDispositionEngine()
    ok, msg, rma = engine.create_rma_request(
        order_id="ORD-100",
        customer_id="CUST-100",
        items=[
            ("PROD-1", "SKU-1", "SN-999", Decimal("500.00"), RMAReason.DEFECTIVE_ON_ARRIVAL, "Dead on arrival")
        ],
        days_since_purchase=10,
    )
    assert ok is True
    assert rma is not None

    insp_ok, _ = engine.conduct_inspection_and_route_disposition(
        rma.rma_number,
        [(rma.items[0].line_id, InspectionGrade.GRADE_A_NEW_OPEN_BOX, Decimal("0.00"))]
    )
    assert insp_ok is True
    assert rma.items[0].assigned_disposition == DispositionChannel.RETURN_TO_PRIMARY_INVENTORY
    assert rma.total_recovery_usd == Decimal("475.00")


def test_cold_chain_mkt_calculation():
    engine = ColdChainTelemetryEngine()
    profile = ColdChainShipmentProfile(
        shipment_id="SHIP-01",
        consignment_number="CNG-01",
        category=PerishableCategory.PHARMA_BIOLOGICS_2_8C,
        carrier_id="CARRIER-1",
        origin_hub="HUB-A",
        destination_hub="HUB-B",
        min_temp_limit_celsius=2.0,
        max_temp_limit_celsius=8.0,
        max_allowable_mkt_celsius=7.5,
        total_stability_budget_minutes=60,
    )
    engine.register_shipment(profile)

    # Ingest 4 normal readings
    for i, t in enumerate([4.5, 5.0, 5.2, 4.8]):
        reading = TelemetrySensorReading(f"R-{i}", "S-1", "2026-08-25T12:00:00Z", t, 50.0, 1.0, 100.0, 0.0, 0.0)
        engine.record_telemetry("SHIP-01", reading)

    mkt_res = engine.calculate_mean_kinetic_temperature("SHIP-01")
    assert mkt_res is not None
    assert 4.0 <= mkt_res.mkt_celsius <= 6.0
    assert mkt_res.compliance_status == "FULLY_COMPLIANT_GDP_PASSED"


def test_multi_echelon_inventory_optimization():
    engine = MultiEchelonInventoryEngine()
    engine.add_node(NetworkNode("CDC", "Central Hub", NodeTier.CENTRAL_DC, current_on_hand_inventory=10000, target_service_level_csl=0.99))
    engine.add_node(NetworkNode("RDC-1", "Regional Spoke", NodeTier.REGIONAL_DC, parent_node_id="CDC", current_on_hand_inventory=200, daily_demand_mean=100.0))

    plan = engine.optimize_network_replenishment()
    assert plan.network_nodes_evaluated == 2
    assert "CDC" in plan.node_allocations
    assert "RDC-1" in plan.node_allocations


def test_treasury_liquidity_pooling():
    engine = TreasuryLiquidityPoolingEngine()
    engine.register_account(TreasuryBankAccount("MASTER", "CORP", "Holdings", "JPM", "USD", Decimal("1000000.00"), is_header_master_account=True))
    engine.register_account(TreasuryBankAccount("SUB-1", "SUB-1", "Sub UK", "Barclays", "USD", Decimal("250000.00"), target_residual_balance=Decimal("50000.00")))

    recon = engine.execute_eod_sweep_and_target_balancing()
    assert recon.sweeps_executed_count == 1
    assert recon.master_header_balance_usd == Decimal("1200000.00")
    assert engine.accounts["SUB-1"].current_balance == Decimal("50000.00")


def test_ifrs15_revenue_recognition():
    engine = IFRS15RevenueRecognitionEngine()
    contract = RevenueContract(
        contract_id="CTR-01",
        customer_id="CUST-01",
        customer_name="Alpha Corp",
        contract_start_date="2026-01-01",
        contract_end_date="2026-12-31",
        total_contract_value_usd=Decimal("100000.00"),
        billed_invoiced_to_date_usd=Decimal("60000.00"),
        cash_collected_to_date_usd=Decimal("60000.00"),
        performance_obligations=[
            PerformanceObligation("P-1", "SaaS Core", Decimal("80000.00"), SatisfactionType.OVER_TIME_RATABLE),
            PerformanceObligation("P-2", "Setup Services", Decimal("20000.00"), SatisfactionType.POINT_IN_TIME),
        ]
    )
    allocated = engine.register_and_allocate_contract(contract)
    assert allocated.performance_obligations[0].allocated_transaction_price_usd == Decimal("80000.00")
    assert allocated.performance_obligations[1].allocated_transaction_price_usd == Decimal("20000.00")

    summary = engine.recognize_period_revenue("CTR-01", [("P-1", 50.0), ("P-2", 100.0)])
    assert summary.total_revenue_recognized_usd == Decimal("60000.00")  # (80k * 0.5) + 20k


def test_omnichannel_attribution():
    engine = OmnichannelJourneyAttributionEngine()
    journey = CustomerJourneyPath(
        journey_id="J-1",
        customer_id="C-1",
        touchpoints=[
            TouchpointEvent("E-1", ChannelMedium.PAID_SEARCH_SEM, "Search Ads", "2026-08-01T00:00:00Z"),
            TouchpointEvent("E-2", ChannelMedium.INBOUND_CONTENT_BLOG, "SEO Blog", "2026-08-05T00:00:00Z"),
            TouchpointEvent("E-3", ChannelMedium.EMAIL_NURTURE, "Drip Email", "2026-08-10T00:00:00Z"),
        ],
        is_converted=True,
        conversion_value_usd=Decimal("1000.00"),
    )
    engine.record_journey(journey)
    report = engine.calculate_attribution(AttributionModelType.U_SHAPED_POSITION)
    assert report.total_converted_revenue_usd == Decimal("1000.00")
    assert report.channel_breakdown[ChannelMedium.PAID_SEARCH_SEM.value].attributed_revenue_usd == Decimal("400.00")
    assert report.channel_breakdown[ChannelMedium.EMAIL_NURTURE.value].attributed_revenue_usd == Decimal("400.00")
    assert report.channel_breakdown[ChannelMedium.INBOUND_CONTENT_BLOG.value].attributed_revenue_usd == Decimal("200.00")


def test_partner_prm_deal_registration():
    engine = PartnerRelationshipManagerEngine(protection_window_days=90)
    engine.register_partner(PartnerOrganization("P-1", "Mega IT", PartnerTier.DIAMOND, "contact@megait.com"))

    ok, msg, reg = engine.submit_deal_registration(
        "P-1", "Target Enterprise", "targetenterprise.com", Decimal("100000.00"), "Software"
    )
    assert ok is True
    assert reg.status == DealRegistrationStatus.APPROVED_PROTECTED
    assert reg.partner_margin_usd == Decimal("38000.00")  # 38% Diamond margin


def test_privacy_governance_dsar():
    engine = PrivacyGovernanceEngine(gdpr_sla_days=30)
    dsar = engine.submit_dsar_request("USER-01", "user@example.com", DSARType.RIGHT_TO_BE_FORGOTTEN_ERASURE)
    assert dsar.status == DSARStatus.PENDING_IDENTITY_VERIFICATION
    assert dsar.days_remaining_in_sla == 30

    ok, msg, cert = engine.process_erasure_workflow(dsar.request_id)
    assert ok is True
    assert cert is not None
    assert dsar.status == DSARStatus.ERASURE_COMPLETED


def test_pci_tokenization_vault():
    vault = PCITokenizationVaultEngine()
    # Test Luhn algorithm & tokenization
    # Standard test Visa: 4111 1111 1111 1111 (valid Luhn)
    ok, msg, record = vault.tokenize_pan("4111 1111 1111 1111", 12, 28)
    assert ok is True
    assert record is not None
    assert record.card_brand == CardBrand.VISA
    assert record.last_4 == "1111"
    assert record.masked_display_pan == "411111******1111"

    # Test key rotation
    new_key, rotated_count = vault.rotate_master_encryption_key()
    assert rotated_count == 1
    assert record.vault_key_version == new_key


def test_tiered_volume_discount_matrix():
    from app.domain.commerce.tiered_volume_discount_matrix import (
        TieredVolumePricingEngine,
        ContractPriceBook,
        VolumePriceBracket,
        TierPricingModel,
    )
    engine = TieredVolumePricingEngine()
    book = ContractPriceBook(
        price_book_id="PB-TEST",
        organization_id="ORG-TEST",
        price_book_name="Tiered Volume Test",
        pricing_model=TierPricingModel.TIERED_STEPPED,
        brackets=[
            VolumePriceBracket(1, 9, Decimal("100.00"), Decimal("0.0")),
            VolumePriceBracket(10, 49, Decimal("90.00"), Decimal("10.0")),
            VolumePriceBracket(50, None, Decimal("80.00"), Decimal("20.0")),
        ],
    )
    engine.register_price_book(book)
    quote = engine.generate_enterprise_quote(
        quote_id="Q-1",
        customer_id="CUST-1",
        price_book_id="PB-TEST",
        items=[("SKU-1", "Product 1", Decimal("100.00"), Decimal("50.00"), 50)]
    )
    assert quote.raw_subtotal_usd == Decimal("5000.00")
    assert quote.discounted_subtotal_usd == Decimal("4000.00")  # 50 * $80
    assert quote.total_savings_usd == Decimal("1000.00")


def test_container_3d_bin_packing():
    from app.domain.supply_chain.container_3d_bin_packing import (
        Container3DPackingEngine,
        ContainerType,
        CargoItem3D,
    )
    engine = Container3DPackingEngine()
    items = [
        CargoItem3D("IT-1", "Server Carton", 50.0, 50.0, 50.0, 20.0, 10),
    ]
    res = engine.pack_container(ContainerType.CONTAINER_20FT, items)
    assert res.total_items_packed == 10
    assert res.total_items_unpacked == 0
    assert res.total_cargo_weight_kg == 200.0
    assert res.axle_weight_balanced is True


def test_corporate_tax_nexus():
    from app.domain.finance.corporate_tax_nexus_matrix import (
        CorporateTaxNexusEngine,
        NexusType,
        StateRegistrationStatus,
    )
    engine = CorporateTaxNexusEngine(registered_states=["CA"])
    # California (registered)
    ca_ledger = engine.evaluate_state_nexus("CA", Decimal("600000.00"), 1200)
    assert ca_ledger.registration_status == StateRegistrationStatus.REGISTERED_AND_COLLECTING
    assert ca_ledger.estimated_unremitted_liability_usd == Decimal("0.00")

    # Texas (unregistered, > $500k threshold)
    tx_ledger = engine.evaluate_state_nexus("TX", Decimal("550000.00"), 400)
    assert tx_ledger.registration_status == StateRegistrationStatus.REGISTRATION_MANDATORY_DUE
    assert tx_ledger.estimated_unremitted_liability_usd > Decimal("0.00")


def test_predictive_lead_scoring():
    from app.domain.crm.lead_scoring_propensity_engine import (
        LeadScoringPropensityEngine,
        LeadProfile,
        CompanySizeTier,
        LeadGrade,
    )
    engine = LeadScoringPropensityEngine()
    hot_lead = LeadProfile(
        lead_id="L-1",
        first_name="Alice",
        last_name="Smith",
        work_email="alice@techgiant.com",
        company_name="TechGiant Inc",
        job_title="Chief Information Officer",
        company_size=CompanySizeTier.ENTERPRISE_1000_PLUS,
        industry="FINTECH",
        attended_live_demo=True,
        security_whitepaper_downloaded=True,
        pricing_page_visits_last_7d=4,
    )
    res = engine.evaluate_lead(hot_lead)
    assert res.grade == LeadGrade.GRADE_A_HOT_MQL
    assert res.composite_score >= 80
    assert "Immediate SDR" in res.recommended_sales_action
