"""Durable command-idempotency helpers."""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from typing import Any, Literal

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
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


async def acquire_json_command(
    db: AsyncSession,
    *,
    command_name: str,
    scope: str,
    idempotency_key: str,
    request_payload: Any,
    in_progress_body: dict[str, Any],
    key_reuse_body: dict[str, Any],
    retry_after: int | str = 1,
) -> CommandClaim | JSONResponse:
    """Reserve a key or return the JSON response that should short-circuit execution."""
    try:
        claim = await acquire_command(
            db,
            command_name=command_name,
            scope=scope,
            idempotency_key=idempotency_key,
            request_payload=request_payload,
        )
    except IdempotencyKeyReuseError:
        return JSONResponse(status_code=409, content=jsonable_encoder(key_reuse_body))

    if claim.kind == "replay":
        return JSONResponse(status_code=claim.record.status_code, content=jsonable_encoder(claim.record.response_body))
    if claim.kind == "in_progress":
        return JSONResponse(
            status_code=409,
            content=jsonable_encoder(in_progress_body),
            headers={"Retry-After": str(retry_after)},
        )
    return claim


def complete_command(record: CommandIdempotency, *, status_code: int, response_body: dict[str, Any]) -> None:
    """Store a successful command response for later replay."""
    _set_response(record, state="completed", status_code=status_code, response_body=response_body)


def fail_command(record: CommandIdempotency, *, status_code: int, response_body: dict[str, Any]) -> None:
    """Store a handled failure response for later replay."""
    _set_response(record, state="failed", status_code=status_code, response_body=response_body)


def complete_json_command(
    record: CommandIdempotency,
    *,
    status_code: int,
    response_body: dict[str, Any],
) -> JSONResponse:
    """Persist and return a JSON terminal success response."""
    body = jsonable_encoder(response_body)
    complete_command(record, status_code=status_code, response_body=body)
    return JSONResponse(status_code=status_code, content=body)


def fail_json_command(
    record: CommandIdempotency,
    *,
    status_code: int,
    response_body: dict[str, Any],
) -> JSONResponse:
    """Persist and return a JSON terminal failure response."""
    body = jsonable_encoder(response_body)
    fail_command(record, status_code=status_code, response_body=body)
    return JSONResponse(status_code=status_code, content=body)


def _set_response(record: CommandIdempotency, *, state: Literal["completed", "failed"], status_code: int, response_body: dict[str, Any]) -> None:
    if record.state not in (None, "pending"):
        raise ValueError("only pending idempotency records may be completed or failed")
    if not 100 <= status_code <= 599:
        raise ValueError("status_code must be between 100 and 599")
    if not isinstance(response_body, dict):
        raise TypeError("response_body must be an object")
    request_fingerprint(response_body)
    record.state = state
    record.status_code = status_code
    record.response_body = response_body


def _require_non_empty(name: str, value: str, *, max_length: int) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must not be empty")
    if len(value) > max_length:
        raise ValueError(f"{name} must not exceed {max_length} characters")


__all__ = [
    "CommandClaim",
    "CommandClaimKind",
    "IdempotencyKeyReuseError",
    "acquire_command",
    "acquire_json_command",
    "complete_command",
    "complete_json_command",
    "fail_command",
    "fail_json_command",
    "request_fingerprint",
]
