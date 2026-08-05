"""Durable idempotency for every Research command route."""

from __future__ import annotations

import base64
import hashlib
import json
from contextvars import ContextVar
from dataclasses import dataclass
from functools import wraps
from typing import Any, Literal

from fastapi import Depends, Header, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.dependencies.utils import get_parameterless_sub_dependant
from fastapi.params import Depends as DependsParam
from fastapi.responses import JSONResponse, Response
from fastapi.routing import APIRoute
from fastapi.routing import request_response
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse

from ..models.idempotency import CommandIdempotency
from ..core.idempotency_context import current_scope, set_authenticated_scope

CommandClaimKind = Literal["started", "replay", "in_progress"]
_IDEMPOTENCY_MARKER = "_research_idempotency_installed"
_MUTATING_METHODS = frozenset({"POST", "PUT", "PATCH", "DELETE"})


@dataclass(frozen=True)
class CommandClaim:
    """The result of atomically reserving a command key."""

    kind: CommandClaimKind
    record: CommandIdempotency


class IdempotencyKeyReuseError(ValueError):
    """Raised when a key is reused for a different command payload."""


async def require_idempotency_key(
    idempotency_key: str = Header(
        ...,
        alias="Idempotency-Key",
        min_length=1,
        max_length=255,
        description="Unique key for this command within the authenticated scope.",
    ),
) -> str:
    """Require and validate the command key before a mutating handler runs."""

    normalized = idempotency_key.strip()
    if not normalized:
        raise HTTPException(status_code=400, detail="Idempotency-Key must not be blank")
    return normalized


def request_fingerprint(payload: Any) -> str:
    """Fingerprint a finite JSON payload using canonical key ordering."""

    canonical = json.dumps(
        jsonable_encoder(payload),
        allow_nan=False,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


async def acquire_command(
    db: AsyncSession,
    *,
    command_name: str,
    scope: str,
    idempotency_key: str,
    request_payload: Any,
) -> CommandClaim:
    """Atomically reserve a command or return its replay state."""

    fingerprint = request_fingerprint(request_payload)
    create = (
        insert(CommandIdempotency)
        .values(
            command_name=command_name,
            scope=scope,
            idempotency_key=idempotency_key,
            request_fingerprint=fingerprint,
        )
        .on_conflict_do_nothing(
            index_elements=[
                CommandIdempotency.command_name,
                CommandIdempotency.scope,
                CommandIdempotency.idempotency_key,
            ]
        )
        .returning(CommandIdempotency)
    )
    created = (await db.execute(create)).scalar_one_or_none()
    if created is not None:
        return CommandClaim(kind="started", record=created)

    existing = (
        await db.execute(
            select(CommandIdempotency)
            .where(
                CommandIdempotency.command_name == command_name,
                CommandIdempotency.scope == scope,
                CommandIdempotency.idempotency_key == idempotency_key,
            )
            .with_for_update()
        )
    ).scalar_one_or_none()
    if existing is None:
        raise RuntimeError("idempotency record disappeared after uniqueness conflict")
    if existing.request_fingerprint != fingerprint:
        raise IdempotencyKeyReuseError(
            "Idempotency-Key was already used with a different request payload"
        )
    if existing.state == "pending":
        return CommandClaim(kind="in_progress", record=existing)
    return CommandClaim(kind="replay", record=existing)


def complete_command(
    record: CommandIdempotency,
    *,
    status_code: int,
    response_body: dict[str, Any],
    state: Literal["completed", "failed"] = "completed",
) -> None:
    """Attach an immutable terminal response to a pending reservation."""

    if record.state != "pending":
        raise ValueError("only pending idempotency records may be completed")
    if not 100 <= status_code <= 599:
        raise ValueError("status_code must be between 100 and 599")
    record.state = state
    record.status_code = status_code
    record.response_body = jsonable_encoder(response_body)


def response_record(*, status_code: int, body: Any, headers: dict[str, str] | None = None) -> dict[str, Any]:
    """Encode a response for JSONB storage, including binary/stream responses."""

    if isinstance(body, bytes):
        return {
            "kind": "response",
            "status_code": status_code,
            "headers": headers or {},
            "body_base64": base64.b64encode(body).decode("ascii"),
        }
    return {"kind": "json", "status_code": status_code, "body": jsonable_encoder(body)}


def replay_response(record: CommandIdempotency) -> Response:
    """Reconstruct a previously stored terminal response."""

    payload = record.response_body or {}
    status_code = record.status_code or 500
    if payload.get("kind") == "response":
        body = base64.b64decode(payload.get("body_base64", ""))
        return Response(
            content=body,
            status_code=status_code,
            headers=payload.get("headers") or {},
        )
    if status_code == 204:
        return Response(status_code=204)
    return JSONResponse(status_code=status_code, content=payload.get("body"))


async def _capture_response(response: Response) -> tuple[Response, dict[str, Any]]:
    """Materialize a response so a streaming command can be replayed safely."""

    if isinstance(response, StreamingResponse):
        chunks: list[bytes] = []
        async for chunk in response.body_iterator:
            chunks.append(chunk if isinstance(chunk, bytes) else str(chunk).encode())
        body = b"".join(chunks)
        headers = dict(response.headers)
        replay = Response(
            content=body,
            status_code=response.status_code,
            headers=headers,
            background=response.background,
        )
        return replay, response_record(
            status_code=response.status_code,
            body=body,
            headers=headers,
        )

    body = getattr(response, "body", b"") or b""
    return response, response_record(
        status_code=response.status_code,
        body=body,
        headers=dict(response.headers),
    )


def _command_payload(kwargs: dict[str, Any]) -> dict[str, Any]:
    ignored = {"db", "user", "access", "request", "idempotency_key"}
    return {
        key: value
        for key, value in kwargs.items()
        if key not in ignored and not isinstance(value, Request)
    }


async def _persist_http_failure(
    db: AsyncSession,
    *,
    command_name: str,
    scope: str,
    idempotency_key: str,
    request_payload: Any,
    exc: HTTPException,
) -> None:
    """Commit a handled command failure after rolling back business changes."""

    await db.rollback()
    claim = await acquire_command(
        db,
        command_name=command_name,
        scope=scope,
        idempotency_key=idempotency_key,
        request_payload=request_payload,
    )
    if claim.kind == "started":
        complete_command(
            claim.record,
            status_code=exc.status_code,
            response_body={"kind": "json", "status_code": exc.status_code, "body": {"detail": exc.detail}},
            state="failed",
        )
        await db.commit()


def _wrap_route(route: APIRoute, *, command_name: str) -> None:
    if getattr(route, _IDEMPOTENCY_MARKER, False):
        return
    original = route.dependant.call
    if original is None:
        return

    @wraps(original)
    async def idempotent_endpoint(*args: Any, **kwargs: Any) -> Any:
        db = kwargs.get("db")
        if not isinstance(db, AsyncSession):
            raise RuntimeError(f"Research command {command_name} must depend on AsyncSession")
        idempotency_key = _current_request_key.get()
        if not idempotency_key:
            raise RuntimeError("Idempotency-Key dependency did not run")
        scope = current_scope()
        payload = _command_payload(kwargs)
        try:
            claim = await acquire_command(
                db,
                command_name=command_name,
                scope=scope,
                idempotency_key=idempotency_key,
                request_payload=payload,
            )
        except IdempotencyKeyReuseError as exc:
            return JSONResponse(status_code=409, content={"detail": str(exc)})

        if claim.kind == "replay":
            return replay_response(claim.record)
        if claim.kind == "in_progress":
            return JSONResponse(
                status_code=409,
                content={"detail": "Command is already in progress"},
                headers={"Retry-After": "1"},
            )

        try:
            result = await original(*args, **kwargs)
            if isinstance(result, Response):
                replayable, stored = await _capture_response(result)
                complete_command(
                    claim.record,
                    status_code=replayable.status_code,
                    response_body=stored,
                )
                return replayable
            status_code = getattr(route, "status_code", None) or 200
            complete_command(
                claim.record,
                status_code=status_code,
                response_body=response_record(status_code=status_code, body=result),
            )
            return result
        except HTTPException as exc:
            await _persist_http_failure(
                db,
                command_name=command_name,
                scope=scope,
                idempotency_key=idempotency_key,
                request_payload=payload,
                exc=exc,
            )
            raise

    dependency = DependsParam(_capture_key_dependency)
    route.dependencies.append(dependency)
    route.dependant.dependencies.append(
        get_parameterless_sub_dependant(depends=dependency, path=route.path)
    )
    route.dependant.call = idempotent_endpoint
    route.endpoint = idempotent_endpoint
    setattr(route, _IDEMPOTENCY_MARKER, True)
    route.app = request_response(route.get_route_handler())


_current_request_key: ContextVar[str | None] = ContextVar(
    "research_idempotency_key", default=None
)


async def _capture_key_dependency(idempotency_key: str = Depends(require_idempotency_key)) -> str:
    _current_request_key.set(idempotency_key)
    return idempotency_key


def install_idempotency_guards(app: Any) -> int:
    """Adopt every Research mutation route and return its exact route count."""

    from ksu_common.response_validation import _iter_route_inspections

    adopted: set[int] = set()
    for inspection in _iter_route_inspections(app.routes):
        route = inspection.route
        if not route.methods or not route.methods.intersection(_MUTATING_METHODS):
            continue
        if id(route) not in adopted:
            _wrap_route(route, command_name=f"{','.join(sorted(route.methods & _MUTATING_METHODS))} {inspection.path}")
            adopted.add(id(route))

    # Included-router contexts cache the endpoint/dependency graph.
    for candidate in app.routes:
        router = getattr(candidate, "original_router", None)
        mark_changed = getattr(router, "_mark_routes_changed", None)
        if callable(mark_changed):
            mark_changed()
    return len(adopted)


__all__ = [
    "CommandClaim",
    "CommandIdempotency",
    "IdempotencyKeyReuseError",
    "acquire_command",
    "complete_command",
    "current_scope",
    "install_idempotency_guards",
    "replay_response",
    "request_fingerprint",
    "require_idempotency_key",
    "response_record",
    "set_authenticated_scope",
]
