import logging
import sys
from typing import Any

import structlog

SENSITIVE_KEYS = {
    "password",
    "hashed_password",
    "secret",
    "secret_key",
    "token",
    "access_token",
    "refresh_token",
    "api_key",
    "authorization",
    "card_number",
    "cvv",
    "two_factor_secret",
}


def censor_sensitive_data(
    logger: logging.Logger, log_method: str, event_dict: dict[str, Any]
) -> dict[str, Any]:
    """Recursively scrub sensitive keys from log event dictionaries."""
    for key in list(event_dict.keys()):
        lower_key = str(key).lower()
        if any(sensitive in lower_key for sensitive in SENSITIVE_KEYS):
            event_dict[key] = "[REDACTED]"
        elif isinstance(event_dict[key], dict):
            event_dict[key] = _censor_dict(event_dict[key])
    return event_dict


def _censor_dict(d: dict[str, Any]) -> dict[str, Any]:
    cleaned = {}
    for k, v in d.items():
        if any(sensitive in str(k).lower() for sensitive in SENSITIVE_KEYS):
            cleaned[k] = "[REDACTED]"
        elif isinstance(v, dict):
            cleaned[k] = _censor_dict(v)
        else:
            cleaned[k] = v
    return cleaned


def setup_logging(debug: bool = False) -> None:
    """Configure structured, production-safe JSON/Console logging."""
    log_level = logging.DEBUG if debug else logging.INFO

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )

    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        censor_sensitive_data,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.ConsoleRenderer() if debug else structlog.processors.JSONRenderer(),
    ]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


logger = structlog.get_logger("commerce_crm")
