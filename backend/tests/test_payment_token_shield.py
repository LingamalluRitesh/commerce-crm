import pytest
from app.application.services.payment_token_shield import PaymentTokenShield


def test_luhn_validation_and_tokenization():
    shield = PaymentTokenShield()
    valid_card = "4111111111111111"  # Standard Visa test card (Luhn valid)
    assert shield.validate_luhn_checksum(valid_card) is True
    assert shield.validate_luhn_checksum("4111111111111112") is False

    token_data = shield.tokenize_card(
        card_number=valid_card,
        cardholder_name="Jane Doe",
        exp_month=12,
        exp_year=2028,
    )
    assert token_data["token_id"].startswith("tok_")
    assert token_data["masked_pan"] == "411111******1111"
    assert token_data["status"] == "TOKENIZED_ACTIVE"
