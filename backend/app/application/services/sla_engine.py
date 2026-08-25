import datetime
from typing import Any


class SLAEngineService:
    """Enterprise multi-tier SLA calculation and policy evaluation engine."""

    SLA_POLICIES = {
        "platinum": {
            "urgent": datetime.timedelta(hours=1),
            "high": datetime.timedelta(hours=4),
            "medium": datetime.timedelta(hours=8),
            "low": datetime.timedelta(hours=24),
            "business_hours_only": False,
        },
        "gold": {
            "urgent": datetime.timedelta(hours=2),
            "high": datetime.timedelta(hours=8),
            "medium": datetime.timedelta(hours=16),
            "low": datetime.timedelta(hours=36),
            "business_hours_only": False,
        },
        "standard": {
            "urgent": datetime.timedelta(hours=4),
            "high": datetime.timedelta(hours=12),
            "medium": datetime.timedelta(hours=24),
            "low": datetime.timedelta(hours=48),
            "business_hours_only": True,
        },
    }

    @classmethod
    def calculate_deadline(
        cls,
        tier: str,
        priority: str,
        created_at: datetime.datetime | None = None,
    ) -> datetime.datetime:
        """Calculate guaranteed SLA resolution target timestamp based on support tier."""
        tier_config = cls.SLA_POLICIES.get(tier.lower(), cls.SLA_POLICIES["standard"])
        duration = tier_config.get(priority.lower(), datetime.timedelta(hours=24))
        start_time = created_at or datetime.datetime.now(datetime.UTC)
        return start_time + duration

    @classmethod
    def evaluate_compliance(
        cls,
        target_deadline: datetime.datetime,
        resolved_at: datetime.datetime | None = None,
    ) -> dict[str, Any]:
        """Determine if a support ticket or order was fulfilled within SLA thresholds."""
        check_time = resolved_at or datetime.datetime.now(datetime.UTC)
        if target_deadline.tzinfo is None:
            target_deadline = target_deadline.replace(tzinfo=datetime.UTC)
        if check_time.tzinfo is None:
            check_time = check_time.replace(tzinfo=datetime.UTC)

        is_breached = check_time > target_deadline
        time_diff = (
            (check_time - target_deadline).total_seconds()
            if is_breached
            else (target_deadline - check_time).total_seconds()
        )

        return {
            "is_breached": is_breached,
            "status": "breached" if is_breached else "compliant",
            "time_delta_seconds": int(time_diff),
            "time_delta_human": f"{int(time_diff // 3600)}h {int((time_diff % 3600) // 60)}m",
        }
