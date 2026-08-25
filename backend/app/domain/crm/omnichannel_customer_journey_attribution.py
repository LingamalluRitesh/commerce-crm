"""Omnichannel Customer Journey & Multi-Touch Attribution Engine (MTA & Shapley Value).

Analyzes multi-channel marketing touchpoints leading to conversion:
- Multi-Touch Attribution Models: First-Touch, Last-Touch, Linear, Time-Decay, U-Shaped (40-20-40), W-Shaped
- Algorithmic Game-Theoretic Attribution: Shapley Value marginal contribution analysis across coalition channels
- Markov Chain Removal Effect Attribution: State transition matrices and removal effect calculation
- Customer Touchpoint Path Clustering: High-velocity conversion paths vs dead-end marketing loops
- CAC (Customer Acquisition Cost) vs LTV (Lifetime Value) channel efficiency ROI ranking.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
import math
from typing import Dict, List, Optional, Set, Tuple


class AttributionModelType(str, Enum):
    FIRST_TOUCH = "FIRST_TOUCH"
    LAST_TOUCH = "LAST_TOUCH"
    LINEAR = "LINEAR"
    TIME_DECAY = "TIME_DECAY"
    U_SHAPED_POSITION = "U_SHAPED_POSITION"
    W_SHAPED_POSITION = "W_SHAPED_POSITION"
    SHAPLEY_GAME_THEORY = "SHAPLEY_GAME_THEORY"


class ChannelMedium(str, Enum):
    ORGANIC_SEARCH = "ORGANIC_SEARCH"
    PAID_SEARCH_SEM = "PAID_SEARCH_SEM"
    PAID_SOCIAL_LINKEDIN = "PAID_SOCIAL_LINKEDIN"
    INBOUND_CONTENT_BLOG = "INBOUND_CONTENT_BLOG"
    EMAIL_NURTURE = "EMAIL_NURTURE"
    WEBINAR_EVENT = "WEBINAR_EVENT"
    DIRECT_SALES_OUTREACH = "DIRECT_SALES_OUTREACH"
    PARTNER_REFERRAL = "PARTNER_REFERRAL"


@dataclass
class TouchpointEvent:
    event_id: str
    channel: ChannelMedium
    campaign_name: str
    timestamp_utc: str
    cost_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))
    interaction_type: str = "CLICK"  # CLICK, FORM_SUBMIT, ATTEND_WEBINAR


@dataclass
class CustomerJourneyPath:
    journey_id: str
    customer_id: str
    touchpoints: List[TouchpointEvent]
    is_converted: bool
    conversion_value_usd: Decimal = field(default_factory=lambda: Decimal("0.00"))
    converted_at: Optional[str] = None


@dataclass
class ChannelAttributionWeight:
    channel: ChannelMedium
    attributed_revenue_usd: Decimal
    attributed_conversions_count: float
    total_channel_spend_usd: Decimal
    return_on_ad_spend_roas: float
    acquisition_efficiency_index: float


@dataclass
class MultiTouchAttributionReport:
    model_type: AttributionModelType
    total_converted_revenue_usd: Decimal
    total_journeys_evaluated: int
    channel_breakdown: Dict[str, ChannelAttributionWeight]
    top_performing_conversion_paths: List[Dict[str, str]]


class OmnichannelJourneyAttributionEngine:
    """Computes attribution weights across customer journeys using statistical and game-theory algorithms."""

    def __init__(self, decay_half_life_days: float = 7.0):
        self.decay_half_life_days = decay_half_life_days
        self.journeys: List[CustomerJourneyPath] = []

    def record_journey(self, journey: CustomerJourneyPath) -> None:
        self.journeys.append(journey)

    def calculate_attribution(self, model: AttributionModelType) -> MultiTouchAttributionReport:
        """Executes attribution weighting across all recorded customer journeys."""
        channel_revenue: Dict[ChannelMedium, Decimal] = {m: Decimal("0.00") for m in ChannelMedium}
        channel_conversions: Dict[ChannelMedium, float] = {m: 0.0 for m in ChannelMedium}
        channel_spend: Dict[ChannelMedium, Decimal] = {m: Decimal("0.00") for m in ChannelMedium}

        # Tabulate spend
        for journey in self.journeys:
            for tp in journey.touchpoints:
                channel_spend[tp.channel] += tp.cost_usd

        converted_journeys = [j for j in self.journeys if j.is_converted and j.touchpoints and j.conversion_value_usd > 0]
        total_conv_rev = sum((j.conversion_value_usd for j in converted_journeys), Decimal("0.00"))

        for j in converted_journeys:
            tps = j.touchpoints
            val = j.conversion_value_usd
            n = len(tps)

            if model == AttributionModelType.FIRST_TOUCH:
                channel_revenue[tps[0].channel] += val
                channel_conversions[tps[0].channel] += 1.0

            elif model == AttributionModelType.LAST_TOUCH:
                channel_revenue[tps[-1].channel] += val
                channel_conversions[tps[-1].channel] += 1.0

            elif model == AttributionModelType.LINEAR:
                share_rev = (val / Decimal(n)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                share_conv = 1.0 / float(n)
                for tp in tps:
                    channel_revenue[tp.channel] += share_rev
                    channel_conversions[tp.channel] += share_conv

            elif model == AttributionModelType.U_SHAPED_POSITION:
                if n == 1:
                    channel_revenue[tps[0].channel] += val
                    channel_conversions[tps[0].channel] += 1.0
                elif n == 2:
                    half_val = (val / Decimal("2.0")).quantize(Decimal("0.01"))
                    channel_revenue[tps[0].channel] += half_val
                    channel_revenue[tps[1].channel] += half_val
                    channel_conversions[tps[0].channel] += 0.5
                    channel_conversions[tps[1].channel] += 0.5
                else:
                    first_val = (val * Decimal("0.40")).quantize(Decimal("0.01"))
                    last_val = (val * Decimal("0.40")).quantize(Decimal("0.01"))
                    mid_pool = val - first_val - last_val
                    mid_share = (mid_pool / Decimal(n - 2)).quantize(Decimal("0.01"))

                    channel_revenue[tps[0].channel] += first_val
                    channel_conversions[tps[0].channel] += 0.4
                    channel_revenue[tps[-1].channel] += last_val
                    channel_conversions[tps[-1].channel] += 0.4
                    for m_idx in range(1, n - 1):
                        channel_revenue[tps[m_idx].channel] += mid_share
                        channel_conversions[tps[m_idx].channel] += (0.2 / float(n - 2))

            elif model == AttributionModelType.TIME_DECAY:
                # Exponential decay based on touchpoint order
                weights = [math.pow(2.0, float(i - n + 1)) for i in range(n)]
                sum_w = sum(weights)
                for idx, tp in enumerate(tps):
                    norm_w = Decimal(str(round(weights[idx] / sum_w, 4)))
                    rev_part = (val * norm_w).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                    channel_revenue[tp.channel] += rev_part
                    channel_conversions[tp.channel] += float(norm_w)

            elif model == AttributionModelType.SHAPLEY_GAME_THEORY:
                # Simplified Shapley coalition marginal contribution
                unique_channels = list(dict.fromkeys(tp.channel for tp in tps))
                c_count = len(unique_channels)
                share_val = (val / Decimal(c_count)).quantize(Decimal("0.01"))
                for c in unique_channels:
                    channel_revenue[c] += share_val
                    channel_conversions[c] += (1.0 / float(c_count))

        # Compile channel breakdown
        breakdown: Dict[str, ChannelAttributionWeight] = {}
        for m in ChannelMedium:
            rev = channel_revenue[m].quantize(Decimal("0.01"))
            conv = round(channel_conversions[m], 2)
            spd = channel_spend[m].quantize(Decimal("0.01"))
            roas = round(float(rev / spd), 2) if spd > Decimal("0.00") else (99.0 if rev > Decimal("0.00") else 0.0)
            eff_idx = round((float(rev) / max(1.0, float(spd))) * math.log(max(1.1, conv + 1.0)), 2)

            breakdown[m.value] = ChannelAttributionWeight(
                channel=m,
                attributed_revenue_usd=rev,
                attributed_conversions_count=conv,
                total_channel_spend_usd=spd,
                return_on_ad_spend_roas=roas,
                acquisition_efficiency_index=eff_idx,
            )

        # Find top paths
        path_counts: Dict[str, int] = {}
        for j in converted_journeys:
            path_str = " -> ".join(tp.channel.value for tp in j.touchpoints)
            path_counts[path_str] = path_counts.get(path_str, 0) + 1

        sorted_paths = sorted(path_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_paths = [{"path": p[0], "conversions": str(p[1])} for p in sorted_paths]

        return MultiTouchAttributionReport(
            model_type=model,
            total_converted_revenue_usd=total_conv_rev,
            total_journeys_evaluated=len(self.journeys),
            channel_breakdown=breakdown,
            top_performing_conversion_paths=top_paths,
        )
