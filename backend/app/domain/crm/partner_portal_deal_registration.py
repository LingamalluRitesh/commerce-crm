"""Partner Relationship Management (PRM), Deal Registration Conflict Resolution & MDF Ledger.

Manages B2B indirect sales channels and technology partner ecosystems:
- Tiered Partner Programs: Registered, Silver, Gold, Platinum, Diamond (with escalating margin discounts)
- Deal Registration Conflict Arbitration: First-to-register priority locks with 90-day expiration windows
- Channel Conflict Detection: Direct sales collision detection & customer domain matching
- Market Development Funds (MDF) Accrual & Claim Reimbursement Workflow
- Partner Performance Scorecards: Pipeline generated, win-rates, certification badges, and quota attainment.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class PartnerTier(str, Enum):
    REGISTERED = "REGISTERED"
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"
    DIAMOND = "DIAMOND"


class DealRegistrationStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    APPROVED_PROTECTED = "APPROVED_PROTECTED"
    REJECTED_CHANNEL_CONFLICT = "REJECTED_CHANNEL_CONFLICT"
    REJECTED_DOMAIN_DUPLICATE = "REJECTED_DOMAIN_DUPLICATE"
    WON_CLOSED = "WON_CLOSED"
    EXPIRED = "EXPIRED"


class MDFClaimStatus(str, Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_AUDIT = "UNDER_AUDIT"
    APPROVED = "APPROVED"
    PAID_OUT = "PAID_OUT"
    DECLINED = "DECLINED"


@dataclass
class PartnerOrganization:
    partner_id: str
    company_name: str
    tier: PartnerTier
    registered_contact_email: str
    geographic_territory: str = "NORTH_AMERICA"
    contract_discount_margin_pct: Decimal = field(default_factory=lambda: Decimal("15.0"))
    mdf_budget_allocated_usd: Decimal = field(default_factory=lambda: Decimal("25000.00"))
    mdf_budget_claimed_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))
    active_deal_count: int = 0
    annual_revenue_booked_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))


@dataclass
class DealRegistration:
    registration_id: str
    partner_id: str
    end_customer_company: str
    end_customer_domain: str
    estimated_deal_size_usd: Decimal
    product_category: str
    status: DealRegistrationStatus
    submitted_at: str
    protected_until: Optional[str] = None
    direct_rep_collision_flag: bool = False
    rejection_reason: Optional[str] = None
    partner_margin_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))


@dataclass
class MDFClaim:
    claim_id: str
    partner_id: str
    campaign_title: str
    requested_amount_usd: Decimal
    proof_of_performance_docs: List[str]
    status: MDFClaimStatus
    submitted_at: str
    approved_amount_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))


class PartnerRelationshipManagerEngine:
    """Orchestrates partner deal protection, domain conflict arbitration, and MDF budgets."""

    TIER_MARGIN_DEFAULTS = {
        PartnerTier.REGISTERED: Decimal("10.0"),
        PartnerTier.SILVER: Decimal("15.0"),
        PartnerTier.GOLD: Decimal("22.5"),
        PartnerTier.PLATINUM: Decimal("30.0"),
        PartnerTier.DIAMOND: Decimal("38.0"),
    }

    def __init__(self, protection_window_days: int = 90):
        self.protection_window_days = protection_window_days
        self.partners: Dict[str, PartnerOrganization] = {}
        self.deal_registrations: Dict[str, DealRegistration] = {}
        self.mdf_claims: Dict[str, MDFClaim] = {}
        self.active_direct_accounts: Dict[str, str] = {}  # domain -> direct_sales_rep_name

    def register_partner(self, partner: PartnerOrganization) -> None:
        if partner.contract_discount_margin_pct == Decimal("15.0") and partner.tier in self.TIER_MARGIN_DEFAULTS:
            partner.contract_discount_margin_pct = self.TIER_MARGIN_DEFAULTS[partner.tier]
        self.partners[partner.partner_id] = partner

    def add_direct_account(self, domain: str, rep_name: str) -> None:
        self.active_direct_accounts[domain.lower().strip()] = rep_name

    def submit_deal_registration(
        self,
        partner_id: str,
        customer_name: str,
        customer_domain: str,
        estimated_deal_size: Decimal,
        product_category: str
    ) -> Tuple[bool, str, DealRegistration]:
        """Validates and arbitrates a new partner deal registration against conflicts and existing domain locks."""
        partner = self.partners.get(partner_id)
        if not partner:
            raise ValueError(f"Partner {partner_id} not found")

        domain = customer_domain.lower().strip()
        reg_id = f"DLR-{datetime.now().strftime('%Y%m%d')}-{len(self.deal_registrations) + 1001:04d}"
        now = datetime.now(timezone.utc)
        now_iso = now.isoformat()

        # Check direct sales collision
        direct_rep = self.active_direct_accounts.get(domain)
        if direct_rep:
            reg = DealRegistration(
                registration_id=reg_id,
                partner_id=partner_id,
                end_customer_company=customer_name,
                end_customer_domain=domain,
                estimated_deal_size_usd=estimated_deal_size,
                product_category=product_category,
                status=DealRegistrationStatus.REJECTED_CHANNEL_CONFLICT,
                submitted_at=now_iso,
                direct_rep_collision_flag=True,
                rejection_reason=f"Account is actively managed by direct sales team ({direct_rep})",
            )
            self.deal_registrations[reg_id] = reg
            return False, "Channel conflict: Account currently assigned to Direct Enterprise Sales", reg

        # Check existing partner registration on this domain
        for existing in self.deal_registrations.values():
            if existing.end_customer_domain == domain and existing.status == DealRegistrationStatus.APPROVED_PROTECTED:
                if existing.protected_until and existing.protected_until > now_iso:
                    reg = DealRegistration(
                        registration_id=reg_id,
                        partner_id=partner_id,
                        end_customer_company=customer_name,
                        end_customer_domain=domain,
                        estimated_deal_size_usd=estimated_deal_size,
                        product_category=product_category,
                        status=DealRegistrationStatus.REJECTED_DOMAIN_DUPLICATE,
                        submitted_at=now_iso,
                        rejection_reason="Domain currently protected under another approved partner deal registration",
                    )
                    self.deal_registrations[reg_id] = reg
                    return False, "Duplicate registration: Domain already locked by active partner registration", reg

        # Approve and grant exclusivity protection
        protected_until_iso = (now + timedelta(days=self.protection_window_days)).isoformat()
        margin_rate = partner.contract_discount_margin_pct / Decimal("100.00")
        partner_margin = (estimated_deal_size * margin_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        reg = DealRegistration(
            registration_id=reg_id,
            partner_id=partner_id,
            end_customer_company=customer_name,
            end_customer_domain=domain,
            estimated_deal_size_usd=estimated_deal_size,
            product_category=product_category,
            status=DealRegistrationStatus.APPROVED_PROTECTED,
            submitted_at=now_iso,
            protected_until=protected_until_iso,
            partner_margin_usd=partner_margin,
        )
        self.deal_registrations[reg_id] = reg
        partner.active_deal_count += 1

        return True, f"Deal registration approved! Exclusivity protected for {self.protection_window_days} days", reg

    def submit_mdf_claim(self, partner_id: str, campaign_title: str, amount: Decimal, docs: List[str]) -> Tuple[bool, str, MDFClaim]:
        """Submits an MDF reimbursement claim against partner's allocated co-op budget."""
        partner = self.partners.get(partner_id)
        if not partner:
            raise ValueError(f"Partner {partner_id} not found")

        avail = partner.mdf_budget_allocated_usd - partner.mdf_budget_claimed_usd
        if amount > avail:
            return False, f"Insufficient MDF budget available (${avail:.2f} available, ${amount:.2f} requested)", MDFClaim(
                claim_id="ERR", partner_id=partner_id, campaign_title=campaign_title, requested_amount_usd=amount,
                proof_of_performance_docs=docs, status=MDFClaimStatus.DECLINED, submitted_at=datetime.now(timezone.utc).isoformat()
            )

        claim_id = f"MDF-{len(self.mdf_claims)+5001}"
        claim = MDFClaim(
            claim_id=claim_id,
            partner_id=partner_id,
            campaign_title=campaign_title,
            requested_amount_usd=amount,
            proof_of_performance_docs=docs,
            status=MDFClaimStatus.APPROVED,
            submitted_at=datetime.now(timezone.utc).isoformat(),
            approved_amount_usd=amount,
        )
        self.mdf_claims[claim_id] = claim
        partner.mdf_budget_claimed_usd += amount
        return True, "MDF Claim approved for disbursement", claim
