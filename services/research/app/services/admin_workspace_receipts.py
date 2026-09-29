"""Minimal durable acknowledgements; never return stored business payloads."""
from __future__ import annotations

from datetime import datetime, timezone


def receipt_summary(record) -> dict:
    """The owning user can reconcile an outcome without rereading old PII."""
    state = record.state
    if state not in {"pending", "completed", "failed"}:
        raise ValueError("Unknown durable command state")
    status = record.status_code
    if (state == "pending" and status is not None) or (state != "pending" and (type(status) is not int or not 100 <= status <= 599)):
        raise ValueError("Invalid durable command acknowledgement")
    created = record.created_at
    if isinstance(created, datetime):
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        created = created.isoformat()
    return {"key": record.idempotency_key, "command": record.command_name,
            "state": state, "status_code": status, "created_at": created,
            "outcome": "confirmed" if state == "completed" and 200 <= status < 300 else
                       "recorded_failure" if state != "pending" else "pending"}
