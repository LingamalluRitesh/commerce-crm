"""Automated Integration Test Suite for Loyalty Rewards and Extended Customs HTS."""

import pytest
from decimal import Decimal
from app.domain.commerce.loyalty_rewards_engine import (
    CustomerLoyaltyEngine, CustomerLoyaltyAccount, LoyaltyVIPTier, RewardRedemptionCatalogItem, PointTransactionType
)
from app.domain.logistics.customs_harmonized_tariff_schedules import (
    HTS_STATUTORY_DATABASE
)


def test_loyalty_points_accrual_and_vip_tier_upgrade():
    account = CustomerLoyaltyAccount(
        customer_id="cust-001",
        account_name="Acme Corp",
        active_points_balance=4500,
        lifetime_points_earned=4500,
        current_tier=LoyaltyVIPTier.BRONZE,
        current_tier_multiplier=1.0,
        next_tier_points_needed=500,
        last_activity_date="2026-08-01"
    )
    # Accrue $1,000 purchase -> 1,000 points -> total 5,500 points -> upgrades to SILVER (1.25x)
    entry = CustomerLoyaltyEngine.accrue_purchase_points(account, Decimal("1000.00"), "ORD-001")
    assert entry.points_delta == 1000
    assert account.current_tier == LoyaltyVIPTier.SILVER
    assert account.current_tier_multiplier == 1.25
    assert account.active_points_balance == 5500


def test_loyalty_points_redemption():
    account = CustomerLoyaltyAccount(
        customer_id="cust-002",
        account_name="Global Inc",
        active_points_balance=10000,
        lifetime_points_earned=10000,
        current_tier=LoyaltyVIPTier.SILVER,
        current_tier_multiplier=1.25,
        next_tier_points_needed=10000,
        last_activity_date="2026-08-01"
    )
    reward = RewardRedemptionCatalogItem("REW-50-OFF", "$50 Off Next Invoice", 5000, Decimal("50.00"), True)
    redemption_entry = CustomerLoyaltyEngine.redeem_reward(account, reward)
    assert redemption_entry.points_delta == -5000
    assert account.active_points_balance == 5000


def test_extended_customs_database():
    assert len(HTS_STATUTORY_DATABASE) > 50
    item = HTS_STATUTORY_DATABASE[0]
    assert "hts_code" in item
    assert item["section_301_rate_pct"] == Decimal("25.00")
