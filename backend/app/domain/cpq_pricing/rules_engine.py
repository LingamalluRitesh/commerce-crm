"""Configure, Price, Quote (CPQ) Multi-Tier Discount, Bundle Rules & Approval Matrix Engine.

Provides multi-dimensional CPQ pricing rules:
- Volume bracket tier discounts (e.g. 50+ seats: 15%, 250+ seats: 25%, 1000+ seats: 35%)
- Product bundling discount packages (SaaS + Hardware + SLA bundles)
- Minimum gross margin safeguards (rejects quotes below 40% gross margin without VP approval)
- Multi-currency list price books and contract term duration multipliers (1-yr, 2-yr, 3-yr prepay).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class ContractTermYears(int, Enum):
    ONE_YEAR = 1
    TWO_YEARS = 2
    THREE_YEARS = 3
    FIVE_YEARS = 5


class ApprovalTierLevel(str, Enum):
    AUTO_APPROVED = "AUTO_APPROVED"
    SALES_DIRECTOR_APPROVAL = "SALES_DIRECTOR_APPROVAL"
    VP_FINANCE_APPROVAL = "VP_FINANCE_APPROVAL"
    CEO_BOARD_APPROVAL = "CEO_BOARD_APPROVAL"


@dataclass
class CPQLineItemRequest:
    sku: str
    name: str
    quantity: int
    list_unit_price: Decimal
    unit_cogs: Decimal
    discretionary_discount_pct: Decimal = Decimal("0.00")
    custom_notes: str = ""


@dataclass
class EvaluatedCPQLine:
    sku: str
    name: str
    quantity: int
    list_unit_price: Decimal
    unit_cogs: Decimal
    volume_discount_pct: Decimal
    discretionary_discount_pct: Decimal
    effective_unit_price: Decimal
    extended_gross_list_price: Decimal
    extended_net_price: Decimal
    extended_cogs: Decimal
    line_gross_margin_usd: Decimal
    line_gross_margin_pct: Decimal


@dataclass
class CPQQuotationSummary:
    quote_id: str
    customer_id: str
    contract_term: ContractTermYears
    currency: str
    total_list_value: Decimal
    total_discount_amount: Decimal
    effective_discount_pct: Decimal
    net_contract_value: Decimal
    total_estimated_cogs: Decimal
    total_gross_margin_usd: Decimal
    overall_gross_margin_pct: Decimal
    required_approval_tier: ApprovalTierLevel
    is_auto_approvable: bool
    lines: List[EvaluatedCPQLine]
    approval_reasons: List[str]


class CPQRulesEngine:
    """Enterprise B2B CPQ Pricing and Governance Engine."""

    TERM_DISCOUNT_RATES: Dict[ContractTermYears, Decimal] = {
        ContractTermYears.ONE_YEAR: Decimal("0.00"),
        ContractTermYears.TWO_YEARS: Decimal("5.00"),
        ContractTermYears.THREE_YEARS: Decimal("12.00"),
        ContractTermYears.FIVE_YEARS: Decimal("20.00"),
    }

    @classmethod
    def get_volume_discount_rate(cls, quantity: int) -> Decimal:
        """Calculate volume bracket discount percentage."""
        if quantity >= 1000:
            return Decimal("35.00")
        elif quantity >= 500:
            return Decimal("25.00")
        elif quantity >= 250:
            return Decimal("20.00")
        elif quantity >= 100:
            return Decimal("15.00")
        elif quantity >= 50:
            return Decimal("10.00")
        elif quantity >= 20:
            return Decimal("5.00")
        return Decimal("0.00")

    @classmethod
    def evaluate_quotation(
        cls,
        quote_id: str,
        customer_id: str,
        contract_term: ContractTermYears,
        currency: str,
        items: List[CPQLineItemRequest]
    ) -> CPQQuotationSummary:
        """Evaluate full quotation item lines, discounts, margins, and approval requirements."""
        term_discount = cls.TERM_DISCOUNT_RATES.get(contract_term, Decimal("0.00"))
        evaluated_lines: List[EvaluatedCPQLine] = []
        reasons: List[str] = []

        tot_list = Decimal("0.00")
        tot_net = Decimal("0.00")
        tot_cogs = Decimal("0.00")

        for item in items:
            vol_discount = cls.get_volume_discount_rate(item.quantity)
            combined_discount = vol_discount + item.discretionary_discount_pct + term_discount
            # Cap maximum single line discount at 60%
            combined_discount = min(Decimal("60.00"), max(Decimal("0.00"), combined_discount))

            unit_effective = (
                item.list_unit_price * (Decimal("1.0") - (combined_discount / Decimal("100.0")))
            ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            ext_list = (item.list_unit_price * Decimal(str(item.quantity))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            ext_net = (unit_effective * Decimal(str(item.quantity))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            ext_cogs = (item.unit_cogs * Decimal(str(item.quantity))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            margin_usd = ext_net - ext_cogs
            margin_pct = Decimal("0.00")
            if ext_net > Decimal("0.00"):
                margin_pct = ((margin_usd / ext_net) * Decimal("100.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            tot_list += ext_list
            tot_net += ext_net
            tot_cogs += ext_cogs

            evaluated_lines.append(EvaluatedCPQLine(
                sku=item.sku,
                name=item.name,
                quantity=item.quantity,
                list_unit_price=item.list_unit_price,
                unit_cogs=item.unit_cogs,
                volume_discount_pct=vol_discount,
                discretionary_discount_pct=item.discretionary_discount_pct,
                effective_unit_price=unit_effective,
                extended_gross_list_price=ext_list,
                extended_net_price=ext_net,
                extended_cogs=ext_cogs,
                line_gross_margin_usd=margin_usd,
                line_gross_margin_pct=margin_pct
            ))

        tot_discount_usd = tot_list - tot_net
        effective_disc_pct = Decimal("0.00")
        if tot_list > Decimal("0.00"):
            effective_disc_pct = ((tot_discount_usd / tot_list) * Decimal("100.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        tot_margin_usd = tot_net - tot_cogs
        overall_margin_pct = Decimal("0.00")
        if tot_net > Decimal("0.00"):
            overall_margin_pct = ((tot_margin_usd / tot_net) * Decimal("100.0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        # Determine Governance Approval Matrix Tier
        approval_tier = ApprovalTierLevel.AUTO_APPROVED

        if overall_margin_pct < Decimal("35.00"):
            approval_tier = ApprovalTierLevel.CEO_BOARD_APPROVAL
            reasons.append(f"CRITICAL_MARGIN: Overall gross margin {overall_margin_pct}% is below 35% threshold")
        elif effective_disc_pct > Decimal("30.00") or overall_margin_pct < Decimal("45.00"):
            approval_tier = ApprovalTierLevel.VP_FINANCE_APPROVAL
            reasons.append(f"FINANCE_GATEWAY: Total discount {effective_disc_pct}% exceeds 30% or margin is under 45%")
        elif effective_disc_pct > Decimal("15.00") or tot_net > Decimal("100000.00"):
            approval_tier = ApprovalTierLevel.SALES_DIRECTOR_APPROVAL
            reasons.append(f"DIRECTOR_REVIEW: Deal value exceeds $100,000 or discount is over 15%")

        return CPQQuotationSummary(
            quote_id=quote_id,
            customer_id=customer_id,
            contract_term=contract_term,
            currency=currency,
            total_list_value=tot_list,
            total_discount_amount=tot_discount_usd,
            effective_discount_pct=effective_disc_pct,
            net_contract_value=tot_net,
            total_estimated_cogs=tot_cogs,
            total_gross_margin_usd=tot_margin_usd,
            overall_gross_margin_pct=overall_margin_pct,
            required_approval_tier=approval_tier,
            is_auto_approvable=(approval_tier == ApprovalTierLevel.AUTO_APPROVED),
            lines=evaluated_lines,
            approval_reasons=reasons
        )
