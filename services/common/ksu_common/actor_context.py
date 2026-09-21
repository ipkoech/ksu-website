"""Authenticated caller context for asynchronous sibling-service work."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Any


def sign_actor_context(actor_id: str, secret: str, *, ttl_seconds: int = 300) -> str:
    issued_at = int(time.time())
    payload = {"actor_id": actor_id, "issued_at": issued_at, "expires_at": issued_at + ttl_seconds}
    encoded = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()).rstrip(b"=")
    signature = hmac.new(secret.encode(), encoded, hashlib.sha256).digest()
    return encoded.decode() + "." + base64.urlsafe_b64encode(signature).rstrip(b"=").decode()


def verify_actor_context(value: str, secret: str, *, now: int | None = None) -> dict[str, Any]:
    try:
        encoded, signature = value.split(".", 1)
        expected = hmac.new(secret.encode(), encoded.encode(), hashlib.sha256).digest()
        supplied = base64.urlsafe_b64decode(signature + "=" * (-len(signature) % 4))
        if not hmac.compare_digest(expected, supplied):
            raise ValueError("invalid signature")
        payload = json.loads(base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4)))
        current = int(time.time()) if now is None else now
        if (
            not isinstance(payload, dict)
            or not payload.get("actor_id")
            or int(payload["issued_at"]) > current + 30
            or int(payload["expires_at"]) < current
        ):
            raise ValueError("expired actor context")
        return payload
    except (ValueError, TypeError, KeyError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValueError("invalid actor context") from exc
