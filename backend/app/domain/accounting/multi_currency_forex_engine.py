"""Foreign Exchange (FX) Multi-Currency Triangulation & ASC 830 Revaluation Engine.

Implements GAAP ASC 830 / IAS 21 foreign currency accounting:
- Spot exchange rate matrix for major global currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, SGD, INR)
- Cross-rate triangulation via base currency (USD)
- Period-end monetary balance sheet revaluation (Accounts Receivable / Accounts Payable)
- Automated unrealized foreign exchange gain/loss journal posting calculations.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Tuple


@dataclass
class FXRateRecord:
    from_currency: str
    to_currency: str
    rate: Decimal
    effective_date: str  # YYYY-MM-DD
    source: str = "ECB_CENTRAL_BANK"


@dataclass
class MonetaryAssetRevaluationItem:
    account_id: str
    account_name: str
    foreign_currency: str
    foreign_amount: Decimal
    historical_exchange_rate: Decimal
    historical_usd_value: Decimal
    current_spot_exchange_rate: Decimal
    revalued_usd_value: Decimal
    unrealized_gain_loss_usd: Decimal
    is_gain: bool


class ForeignExchangeEngine:
    """Enterprise FX Multi-Currency & Period-End Revaluation Engine."""

    # Benchmark spot rates against base currency USD (1 USD = X Currency)
    _SPOT_RATES: Dict[str, Decimal] = {
        "USD": Decimal("1.0000"),
        "EUR": Decimal("0.9250"),   # 1 USD = 0.925 EUR (1 EUR = ~1.081 USD)
        "GBP": Decimal("0.7850"),   # 1 USD = 0.785 GBP (1 GBP = ~1.274 USD)
        "JPY": Decimal("154.2000"), # 1 USD = 154.20 JPY
        "CAD": Decimal("1.3650"),   # 1 USD = 1.365 CAD
        "AUD": Decimal("1.5150"),   # 1 USD = 1.515 AUD
        "CHF": Decimal("0.9020"),   # 1 USD = 0.902 CHF
        "SGD": Decimal("1.3480"),   # 1 USD = 1.348 SGD
        "INR": Decimal("83.4500"),  # 1 USD = 83.45 INR
    }

    @classmethod
    def get_cross_rate(cls, from_curr: str, to_curr: str) -> Decimal:
        """Compute triangular exchange cross-rate via USD base."""
        from_c = from_curr.upper()
        to_c = to_curr.upper()

        if from_c == to_c:
            return Decimal("1.0000")

        usd_to_from = cls._SPOT_RATES.get(from_c)
        usd_to_to = cls._SPOT_RATES.get(to_c)

        if not usd_to_from or not usd_to_to:
            raise ValueError(f"Unsupported currency pair: {from_curr}/{to_curr}")

        # Cross rate: (1 / usd_to_from) * usd_to_to = usd_to_to / usd_to_from
        rate = (usd_to_to / usd_to_from).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        return rate

    @classmethod
    def convert_currency(cls, amount: Decimal, from_curr: str, to_curr: str) -> Decimal:
        rate = cls.get_cross_rate(from_curr, to_curr)
        return (amount * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @classmethod
    def revalue_monetary_balances(
        cls,
        items: List[Tuple[str, str, str, Decimal, Decimal]]  # (acc_id, acc_name, curr, amount, hist_rate)
    ) -> List[MonetaryAssetRevaluationItem]:
        """Perform ASC 830 period-end balance sheet monetary revaluation."""
        revaluations: List[MonetaryAssetRevaluationItem] = []

        for acc_id, name, curr, f_amt, hist_rate in items:
            curr_spot = cls.get_cross_rate(curr, "USD")
            hist_usd = (f_amt * hist_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            curr_usd = (f_amt * curr_spot).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            gain_loss = curr_usd - hist_usd
            is_gain = gain_loss >= Decimal("0.00")

            revaluations.append(MonetaryAssetRevaluationItem(
                account_id=acc_id,
                account_name=name,
                foreign_currency=curr,
                foreign_amount=f_amt,
                historical_exchange_rate=hist_rate,
                historical_usd_value=hist_usd,
                current_spot_exchange_rate=curr_spot,
                revalued_usd_value=curr_usd,
                unrealized_gain_loss_usd=gain_loss,
                is_gain=is_gain
            ))

        return revaluations
