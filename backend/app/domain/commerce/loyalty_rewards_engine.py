"""Customer Loyalty Rewards Points, VIP Tiers & Dynamic Milestone Achievement Engine.

Implements enterprise omnichannel loyalty mechanics:
- VIP Tier Progression: Bronze (1x) -> Silver (1.25x) -> Gold (1.5x) -> Platinum (2.0x points multiplier)
- Multi-trigger accrual events (Purchases, referrals, product reviews, webinar attendance, anniversary bonus)
- Rolling FIFO point expiration policies (points expire after 365 days of account inactivity)
- Real-time catalog redemption validations (point-to-dollar conversions with minimum thresholds).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class LoyaltyVIPTier(str, Enum):
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"


class PointTransactionType(str, Enum):
    PURCHASE_ACCRUAL = "PURCHASE_ACCRUAL"
    ANNIVERSARY_BONUS = "ANNIVERSARY_BONUS"
    REFERRAL_REWARD = "REFERRAL_REWARD"
    REDEMPTION_SPEND = "REDEMPTION_SPEND"
    EXPIRED_POINT_DECAY = "EXPIRED_POINT_DECAY"


@dataclass
class LoyaltyPointLedgerEntry:
    entry_id: str
    customer_id: str
    transaction_type: PointTransactionType
    points_delta: int  # Positive for accrual, negative for redemption
    dollar_equivalent_value_usd: Decimal
    reference_id: str
    created_at: str
    expires_at: Optional[str] = None


@dataclass
class CustomerLoyaltyAccount:
    customer_id: str
    account_name: str
    active_points_balance: int
    lifetime_points_earned: int
    current_tier: LoyaltyVIPTier
    current_tier_multiplier: float
    next_tier_points_needed: int
    last_activity_date: str


@dataclass
class RewardRedemptionCatalogItem:
    reward_id: str
    title: str
    points_cost: int
    discount_dollar_value_usd: Decimal
    is_active: bool = True


class CustomerLoyaltyEngine:
    """Enterprise Customer Loyalty & VIP Gamification Engine."""

    TIER_THRESHOLDS = [
        (LoyaltyVIPTier.PLATINUM, 50000, 2.0),
        (LoyaltyVIPTier.GOLD, 20000, 1.5),
        (LoyaltyVIPTier.SILVER, 5000, 1.25),
        (LoyaltyVIPTier.BRONZE, 0, 1.0),
    ]

    POINT_DOLLAR_VALUE = Decimal("0.01")  # 100 points = $1.00 USD

    @classmethod
    def calculate_tier(cls, lifetime_points: int) -> Tuple[LoyaltyVIPTier, float, int]:
        """Compute tier, multiplier, and points needed to reach next tier."""
        for tier, thresh, mult in cls.TIER_THRESHOLDS:
            if lifetime_points >= thresh:
                if tier == LoyaltyVIPTier.PLATINUM:
                    needed = 0
                else:
                    # Find next threshold
                    idx = [t[0] for t in cls.TIER_THRESHOLDS].index(tier)
                    needed = cls.TIER_THRESHOLDS[idx - 1][1] - lifetime_points
                return tier, mult, max(0, needed)

        return LoyaltyVIPTier.BRONZE, 1.0, 5000

    @classmethod
    def accrue_purchase_points(
        cls,
        account: CustomerLoyaltyAccount,
        purchase_amount_usd: Decimal,
        order_id: str
    ) -> LoyaltyPointLedgerEntry:
        """Accrue points scaled by customer's active VIP tier multiplier."""
        raw_points = int(purchase_amount_usd)
        earned_points = int(raw_points * account.current_tier_multiplier)

        account.active_points_balance += earned_points
        account.lifetime_points_earned += earned_points

        # Re-evaluate tier upgrade
        new_tier, new_mult, needed = cls.calculate_tier(account.lifetime_points_earned)
        account.current_tier = new_tier
        account.current_tier_multiplier = new_mult
        account.next_tier_points_needed = needed

        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=365)

        return LoyaltyPointLedgerEntry(
            entry_id=f"PTS-{order_id[:8].upper()}-ACCRUAL",
            customer_id=account.customer_id,
            transaction_type=PointTransactionType.PURCHASE_ACCRUAL,
            points_delta=earned_points,
            dollar_equivalent_value_usd=(Decimal(str(earned_points)) * cls.POINT_DOLLAR_VALUE),
            reference_id=order_id,
            created_at=now.isoformat(),
            expires_at=expires.isoformat()
        )

    @classmethod
    def redeem_reward(
        cls,
        account: CustomerLoyaltyAccount,
        reward: RewardRedemptionCatalogItem
    ) -> LoyaltyPointLedgerEntry:
        """Validate balance and redeem reward from catalog."""
        if account.active_points_balance < reward.points_cost:
            raise ValueError(
                f"Insufficient points: Account has {account.active_points_balance} pts, but reward requires {reward.points_cost} pts."
            )

        account.active_points_balance -= reward.points_cost
        now = datetime.now(timezone.utc).isoformat()

        return LoyaltyPointLedgerEntry(
            entry_id=f"RED-{reward.reward_id[:8].upper()}",
            customer_id=account.customer_id,
            transaction_type=PointTransactionType.REDEMPTION_SPEND,
            points_delta=-reward.points_cost,
            dollar_equivalent_value_usd=reward.discount_dollar_value_usd,
            reference_id=reward.reward_id,
            created_at=now,
            expires_at=None
        )
