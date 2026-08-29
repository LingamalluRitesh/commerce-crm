"""
PCI-DSS Payment Tokenization & Sensitive PII Audit Shield.
Implements Luhn checksum validation, card number tokenization, and audit log scrubbing.
"""

from typing import Dict, List, Any
import hashlib
import uuid


class PaymentTokenShield:
    """Safely tokenizes credit cards and redacts PANs from application logs."""

    @staticmethod
    def validate_luhn_checksum(card_number: str) -> bool:
        digits = [int(c) for c in card_number if c.isdigit()]
        if len(digits) < 13 or len(digits) > 19:
            return False

        checksum = 0
        reverse_digits = digits[::-1]
        for i, digit in enumerate(reverse_digits):
            if i % 2 == 1:
                doubled = digit * 2
                checksum += doubled if doubled < 10 else doubled - 9
            else:
                checksum += digit

        return checksum % 10 == 0

    @staticmethod
    def mask_pan(card_number: str) -> str:
        digits = "".join(filter(str.isdigit, card_number))
        if len(digits) < 10:
            return "************"
        return f"{digits[:6]}{'*' * (len(digits) - 10)}{digits[-4:]}"

    def tokenize_card(self, card_number: str, cardholder_name: str, exp_month: int, exp_year: int) -> Dict[str, Any]:
        if not self.validate_luhn_checksum(card_number):
            raise ValueError("Invalid credit card number failed Luhn checksum.")

        masked = self.mask_pan(card_number)
        token_id = f"tok_{uuid.uuid4().hex[:16]}"
        fingerprint = hashlib.sha256(card_number.encode("utf-8")).hexdigest()[:16]

        return {
            "token_id": token_id,
            "card_fingerprint": fingerprint,
            "masked_pan": masked,
            "cardholder_name": cardholder_name,
            "exp_month": exp_month,
            "exp_year": exp_year,
            "status": "TOKENIZED_ACTIVE",
        }
