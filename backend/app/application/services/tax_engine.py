from decimal import Decimal
from typing import Any


class TaxEngineService:
    """Multi-jurisdiction enterprise tax calculation engine (Sales Tax, VAT, GST)."""

    TAX_JURISDICTIONS = {
        "US_CA": {"name": "California Sales Tax", "rate": Decimal("0.0825"), "type": "sales_tax"},
        "US_NY": {"name": "New York Sales Tax", "rate": Decimal("0.08875"), "type": "sales_tax"},
        "US_TX": {"name": "Texas Sales Tax", "rate": Decimal("0.0825"), "type": "sales_tax"},
        "US_WA": {"name": "Washington Sales Tax", "rate": Decimal("0.0925"), "type": "sales_tax"},
        "EU_DE": {"name": "Germany VAT", "rate": Decimal("0.1900"), "type": "vat"},
        "EU_FR": {"name": "France VAT", "rate": Decimal("0.2000"), "type": "vat"},
        "EU_IE": {"name": "Ireland VAT", "rate": Decimal("0.2300"), "type": "vat"},
        "GB": {"name": "United Kingdom VAT", "rate": Decimal("0.2000"), "type": "vat"},
        "AU": {"name": "Australia GST", "rate": Decimal("0.1000"), "type": "gst"},
        "CA_ON": {"name": "Ontario HST", "rate": Decimal("0.1300"), "type": "sales_tax"},
        "DEFAULT": {"name": "Standard Flat Tax", "rate": Decimal("0.0800"), "type": "sales_tax"},
    }

    @classmethod
    def calculate_tax(
        cls,
        net_amount: Decimal,
        jurisdiction_code: str,
        is_tax_exempt: bool = False,
        exemption_certificate_number: str | None = None,
    ) -> dict[str, Any]:
        """Calculate line-item and aggregate tax liabilities based on customer tax residence."""
        if is_tax_exempt:
            return {
                "jurisdiction_code": jurisdiction_code.upper(),
                "jurisdiction_name": "Tax Exempt",
                "tax_type": "exempt",
                "tax_rate_percentage": Decimal("0.00"),
                "net_amount": net_amount,
                "tax_amount": Decimal("0.00"),
                "gross_amount": net_amount,
                "exemption_verified": bool(exemption_certificate_number),
            }

        jurisdiction = cls.TAX_JURISDICTIONS.get(
            jurisdiction_code.upper(), cls.TAX_JURISDICTIONS["DEFAULT"]
        )
        rate = jurisdiction["rate"]
        tax_amount = (net_amount * rate).quantize(Decimal("0.01"))
        gross_amount = (net_amount + tax_amount).quantize(Decimal("0.01"))

        return {
            "jurisdiction_code": jurisdiction_code.upper(),
            "jurisdiction_name": jurisdiction["name"],
            "tax_type": jurisdiction["type"],
            "tax_rate_percentage": (rate * Decimal("100.00")).quantize(Decimal("0.01")),
            "net_amount": net_amount,
            "tax_amount": tax_amount,
            "gross_amount": gross_amount,
            "exemption_verified": False,
        }
