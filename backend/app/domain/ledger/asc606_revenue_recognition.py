"""ASC 606 / IFRS 15 SaaS Revenue Recognition & Deferred Revenue Engine.

Implements the 5-Step Revenue Recognition standard:
1. Identify customer contracts
2. Identify distinct performance obligations (PBO)
3. Determine transaction price
4. Allocate transaction price to standalone selling prices (SSP)
5. Recognize revenue over time (daily straight-line amortization) or at a point in time (milestone).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


class PerformanceObligationType(str, Enum):
    SAAS_SUBSCRIPTION = "SAAS_SUBSCRIPTION"
    PROFESSIONAL_SERVICES = "PROFESSIONAL_SERVICES"
    HARDWARE_DELIVERY = "HARDWARE_DELIVERY"
    PREMIUM_SUPPORT_SLA = "PREMIUM_SUPPORT_SLA"


class RecognitionMethod(str, Enum):
    OVER_TIME_DAILY = "OVER_TIME_DAILY"
    POINT_IN_TIME_MILESTONE = "POINT_IN_TIME_MILESTONE"


@dataclass
class PerformanceObligation:
    """Individual distinct performance obligation under contract."""
    pbo_id: str
    obligation_type: PerformanceObligationType
    description: str
    standalone_selling_price: Decimal
    allocated_transaction_price: Decimal
    recognition_method: RecognitionMethod
    service_start_date: str  # YYYY-MM-DD
    service_end_date: str    # YYYY-MM-DD
    is_satisfied: bool = False
    satisfied_date: Optional[str] = None
    recognized_revenue_to_date: Decimal = Decimal("0.00")


@dataclass
class CustomerContractASC606:
    """Multi-element commercial enterprise customer contract."""
    contract_id: str
    customer_id: str
    contract_start_date: str
    contract_end_date: str
    total_contract_value: Decimal
    obligations: List[PerformanceObligation] = field(default_factory=list)


@dataclass
class MonthlyAmortizationScheduleRow:
    """Scheduled monthly revenue realization row."""
    period_year_month: str  # '2026-08'
    pbo_id: str
    obligation_type: str
    beginning_deferred_balance: Decimal
    recognized_revenue: Decimal
    ending_deferred_balance: Decimal


class ASC606RevenueEngine:
    """SaaS Revenue Recognition and Deferred Revenue Amortization Engine."""

    @classmethod
    def allocate_standalone_selling_prices(
        cls,
        contract: CustomerContractASC606
    ) -> None:
        """Step 4: Proportionately allocate total contract price to obligations by SSP."""
        total_ssp = sum(pbo.standalone_selling_price for pbo in contract.obligations)
        if total_ssp <= Decimal("0.00"):
            return

        for pbo in contract.obligations:
            ratio = pbo.standalone_selling_price / total_ssp
            pbo.allocated_transaction_price = (
                contract.total_contract_value * ratio
            ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @classmethod
    def generate_daily_amortization_schedule(
        cls,
        pbo: PerformanceObligation
    ) -> List[Tuple[str, Decimal]]:
        """Calculate daily revenue recognition schedule for over-time obligations."""
        if pbo.recognition_method != RecognitionMethod.OVER_TIME_DAILY:
            return []

        start_dt = date.fromisoformat(pbo.service_start_date)
        end_dt = date.fromisoformat(pbo.service_end_date)
        total_days = (end_dt - start_dt).days + 1

        if total_days <= 0:
            return [(pbo.service_start_date, pbo.allocated_transaction_price)]

        daily_rate = (pbo.allocated_transaction_price / Decimal(str(total_days))).quantize(
            Decimal("0.0001"), rounding=ROUND_HALF_UP
        )

        schedule: List[Tuple[str, Decimal]] = []
        accumulated = Decimal("0.00")

        for d in range(total_days):
            current_day = start_dt + timedelta(days=d)
            if d == total_days - 1:
                # Catch penny rounding on final day
                day_revenue = pbo.allocated_transaction_price - accumulated
            else:
                day_revenue = daily_rate.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                accumulated += day_revenue

            schedule.append((current_day.isoformat(), day_revenue))

        return schedule

    @classmethod
    def calculate_period_revenue_recognition(
        cls,
        contract: CustomerContractASC606,
        as_of_date_str: str
    ) -> Tuple[Decimal, Decimal]:
        """Compute (Total Recognized Revenue, Remaining Deferred Revenue) as of specific date."""
        cls.allocate_standalone_selling_prices(contract)
        as_of_dt = date.fromisoformat(as_of_date_str)
        
        total_recognized = Decimal("0.00")
        total_deferred = Decimal("0.00")

        for pbo in contract.obligations:
            if pbo.recognition_method == RecognitionMethod.POINT_IN_TIME_MILESTONE:
                if pbo.is_satisfied and pbo.satisfied_date:
                    sat_dt = date.fromisoformat(pbo.satisfied_date)
                    if sat_dt <= as_of_dt:
                        total_recognized += pbo.allocated_transaction_price
                    else:
                        total_deferred += pbo.allocated_transaction_price
                else:
                    total_deferred += pbo.allocated_transaction_price

            elif pbo.recognition_method == RecognitionMethod.OVER_TIME_DAILY:
                start_dt = date.fromisoformat(pbo.service_start_date)
                end_dt = date.fromisoformat(pbo.service_end_date)
                total_days = (end_dt - start_dt).days + 1

                if as_of_dt < start_dt:
                    total_deferred += pbo.allocated_transaction_price
                elif as_of_dt >= end_dt:
                    total_recognized += pbo.allocated_transaction_price
                else:
                    elapsed_days = (as_of_dt - start_dt).days + 1
                    fraction = Decimal(str(elapsed_days)) / Decimal(str(total_days))
                    rec = (pbo.allocated_transaction_price * fraction).quantize(
                        Decimal("0.01"), rounding=ROUND_HALF_UP
                    )
                    total_recognized += rec
                    total_deferred += (pbo.allocated_transaction_price - rec)

        return total_recognized, total_deferred
