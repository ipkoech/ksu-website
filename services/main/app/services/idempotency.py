"""Durable command-idempotency helpers."""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any, Literal

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.idempotency import CommandIdempotency

CommandClaimKind = Literal["started", "replay", "in_progress"]


class IdempotencyKeyReuseError(ValueError):
    """Raised when a client reuses a key for a different request payload."""


@dataclass(frozen=True)
class CommandClaim:
    """The outcome of reserving an idempotency key for a command."""

    kind: CommandClaimKind
    record: CommandIdempotency


def request_fingerprint(payload: Any) -> str:
    """Return a stable fingerprint for a finite JSON-compatible payload."""
    canonical_payload = json.dumps(payload, allow_nan=False, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(canonical_payload.encode("utf-8")).hexdigest()


async def acquire_command(db: AsyncSession, *, command_name: str, scope: str, idempotency_key: str, request_payload: Any) -> CommandClaim:
    """Reserve a key or return replay state without committing the caller transaction.

    A concurrent unique-key conflict waits for the original transaction and
    normally becomes a replay. A committed pending record is locked before an
    ``in_progress`` result; callers must return a retryable response and must
    not execute business logic for it.
    """
    _require_non_empty("command_name", command_name, max_length=128)
    _require_non_empty("scope", scope, max_length=255)
    _require_non_empty("idempotency_key", idempotency_key, max_length=255)
    fingerprint = request_fingerprint(request_payload)
    create = (
        insert(CommandIdempotency)
        .values(command_name=command_name, scope=scope, idempotency_key=idempotency_key, request_fingerprint=fingerprint)
        .on_conflict_do_nothing(index_elements=[CommandIdempotency.command_name, CommandIdempotency.scope, CommandIdempotency.idempotency_key])
        .returning(CommandIdempotency)
    )
    created = (await db.execute(create)).scalar_one_or_none()
    if created is not None:
        return CommandClaim(kind="started", record=created)
    existing = (await db.execute(
        select(CommandIdempotency).where(
            CommandIdempotency.command_name == command_name,
            CommandIdempotency.scope == scope,
            CommandIdempotency.idempotency_key == idempotency_key,
        ).with_for_update()
    )).scalar_one_or_none()
    if existing is None:
        raise RuntimeError("Idempotency record disappeared after a uniqueness conflict")
    if existing.request_fingerprint != fingerprint:
        raise IdempotencyKeyReuseError("Idempotency key was already used with a different request payload")
    if existing.state == "pending":
        return CommandClaim(kind="in_progress", record=existing)
    return CommandClaim(kind="replay", record=existing)


def complete_command(record: CommandIdempotency, *, status_code: int, response_body: dict[str, Any]) -> None:
    """Store a successful command response for later replay."""
    _set_response(record, state="completed", status_code=status_code, response_body=response_body)


def fail_command(record: CommandIdempotency, *, status_code: int, response_body: dict[str, Any]) -> None:
    """Store a handled failure response for later replay."""
    _set_response(record, state="failed", status_code=status_code, response_body=response_body)


def _set_response(record: CommandIdempotency, *, state: Literal["completed", "failed"], status_code: int, response_body: dict[str, Any]) -> None:
    if record.state not in (None, "pending"):
        raise ValueError("only pending idempotency records may be completed or failed")
    if not 100 <= status_code <= 599:
        raise ValueError("status_code must be between 100 and 599")
    if not isinstance(response_body, dict):
        raise ValueError("response_body must be an object")
    request_fingerprint(response_body)
    record.state = state
    record.status_code = status_code
    record.response_body = response_body


def _require_non_empty(name: str, value: str, *, max_length: int) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must not be empty")
    if len(value) > max_length:
        raise ValueError(f"{name} must not exceed {max_length} characters")


__all__ = ["CommandClaim", "CommandClaimKind", "IdempotencyKeyReuseError", "acquire_command", "complete_command", "fail_command", "request_fingerprint"]
