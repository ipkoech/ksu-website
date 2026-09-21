"""Audit logging for FastAPI — tracks user actions for compliance.

Usage:
    from ksu_common.audit import audit_action, AuditLogger

    @router.post("/items")
    @audit_action("item.create")
    async def create_item(data: ItemCreate, user: TokenPayload = Depends(get_current_user)):
        ...

    # Or manual logging:
    audit = AuditLogger(db)
    await audit.log("item.delete", user_id=user.sub, target_id=item_id, details={"reason": "..."})
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import uuid
from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
from functools import wraps
from typing import Any

import jwt
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from .audit_metadata import prepare_audit_metadata
from .database import defer_committed_observation
from .security import decode_token

logger = logging.getLogger("audit")


class AuditEntry:
    """Represents an audit log entry."""

    __slots__ = (
        "action",
        "details",
        "id",
        "ip_address",
        "request_method",
        "request_path",
        "service",
        "target_id",
        "target_type",
        "timestamp",
        "user_agent",
        "user_id",
        "user_roles",
    )

    def __init__(
        self,
        action: str,
        *,
        user_id: str | None = None,
        user_roles: list[str] | None = None,
        target_type: str | None = None,
        target_id: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_path: str | None = None,
        request_method: str | None = None,
        details: dict[str, Any] | None = None,
        service: str | None = None,
    ):
        self.id = str(uuid.uuid4())
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.action = action
        self.user_id = user_id
        self.user_roles = user_roles or []
        self.target_type = target_type
        self.target_id = target_id
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.request_path = request_path
        self.request_method = request_method
        self.details = details or {}
        self.service = service or os.getenv("SERVICE_NAME", "unknown")

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "action": self.action,
            "user_id": self.user_id,
            "user_roles": self.user_roles,
            "target_type": self.target_type,
            "target_id": self.target_id,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "request_path": self.request_path,
            "request_method": self.request_method,
            "details": prepare_audit_metadata(self.details),
            "service": self.service,
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict())


class AuditLogger:
    """Audit logger that writes to structured logs and optionally to database/Redis."""

    def __init__(self, db_session=None, redis_client=None):
        self._db = db_session
        self._redis = redis_client

    async def log(
        self,
        action: str,
        *,
        user_id: str | None = None,
        user_roles: list[str] | None = None,
        target_type: str | None = None,
        target_id: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        request_path: str | None = None,
        request_method: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> AuditEntry:
        entry = AuditEntry(
            action,
            user_id=user_id,
            user_roles=user_roles,
            target_type=target_type,
            target_id=target_id,
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=request_path,
            request_method=request_method,
            details=details,
        )

        logger.info(entry.to_json())

        if self._redis:
            try:
                await self._redis.lpush("audit:log", entry.to_json())
                await self._redis.ltrim("audit:log", 0, 9999)
            except Exception:
                pass

        return entry

    @classmethod
    def from_request(
        cls,
        request: Request,
        user=None,
    ) -> dict[str, Any]:
        """Extract audit context from FastAPI request."""
        return {
            "user_id": getattr(user, "sub", None) if user else None,
            "user_roles": getattr(user, "roles", []) if user else [],
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "request_path": str(request.url.path),
            "request_method": request.method,
        }


_default_logger = AuditLogger()


def audit_action(
    action: str,
    *,
    target_type: str | None = None,
    target_id_param: str | None = None,
    include_body: bool = False,
):
    """Decorator to automatically audit endpoint calls.

    Args:
        action: Action name (e.g., "item.create", "order.complete")
        target_type: Type of target entity (e.g., "Library", "Loan")
        target_id_param: Name of path/query param containing target ID
        include_body: Whether to include request body in audit details
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            request: Request | None = kwargs.get("request")
            if request is None:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            user = kwargs.get("user") or kwargs.get("_user")
            target_id = kwargs.get(target_id_param) if target_id_param else None
            if target_id is not None:
                target_id = str(target_id)

            details: dict[str, Any] = {}
            if include_body:
                body_param = None
                for key in ("data", "body", "payload"):
                    if key in kwargs:
                        body_param = kwargs[key]
                        break
                if body_param and hasattr(body_param, "model_dump"):
                    details["body"] = body_param.model_dump()

            result = await func(*args, **kwargs)

            context = AuditLogger.from_request(request, user) if request else {}
            details = prepare_audit_metadata(details)

            async def observe_committed():
                try:
                    await _default_logger.log(
                        action, target_type=target_type, target_id=target_id,
                        details=details or None, **context,
                    )
                except Exception as exc:
                    logger.warning("Audit logging failed", extra={"error_type": type(exc).__name__})

            if not defer_committed_observation(observe_committed):
                await observe_committed()

            return result

        return wrapper

    return decorator


async def get_audit_logger(redis_client=None) -> AuditLogger:
    """Factory for creating AuditLogger with optional Redis."""
    return AuditLogger(redis_client=redis_client)


def _extract_optional_token(
    request: Request,
    *,
    token_key: str | bytes,
    token_algorithm: str,
    token_issuer: str,
    token_audience: str,
    token_key_id: str,
) -> dict[str, Any] | None:
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    try:
        return decode_token(
            token,
            key=token_key,
            algorithm=token_algorithm,
            issuer=token_issuer,
            audience=token_audience,
            key_id=token_key_id,
        )
    except jwt.PyJWTError:
        return None


def _resource_from_path(path: str) -> tuple[str | None, str | None]:
    parts = [part for part in path.strip("/").split("/") if part]
    if len(parts) < 3:
        return (parts[-1] if parts else None, None)

    resource_type = parts[2]
    resource_id = None
    if len(parts) > 3:
        candidate = parts[3]
        if candidate not in {"read", "write", "list", "search"}:
            resource_id = candidate
    return resource_type, resource_id


def _semantic_action(request: Request) -> str:
    route = request.scope.get("route")
    route_name = getattr(route, "name", None) if route else None
    if route_name:
        return route_name.replace("_", ".")
    return f"{request.method.lower()}:{request.url.path}"


_MAX_AUDIT_REQUEST_BODY_BYTES = 16 * 1024
_AUDIT_TEXT_LIMITS = {
    "service_name": 64,
    "action": 128,
    "resource_type": 64,
    "resource_id": 64,
    "request_method": 16,
    "request_path": 512,
    "route_name": 255,
    "session_jti": 64,
    "ip_address": 45,
    "user_agent": 512,
    # ``error_message`` is a Text column, but an unbounded database/provider
    # error can still make every audit capture and relay disproportionately
    # expensive. Keep enough context for operators and hash only the omitted
    # tail through the normal truncation marker.
    "error_message": 4096,
}


def _normalise_audit_text(value: Any, limit: int) -> tuple[str | None, dict[str, Any] | None]:
    """Fit one audit text value to its storage budget and redact invalid text."""

    if value is None:
        return None, None
    if not isinstance(value, str):
        value = str(value)
    retained = value[:limit]
    invalid_characters = sum(
        character == "\x00" or "\ud800" <= character <= "\udfff"
        for character in retained
    )
    if len(value) <= limit and not invalid_characters:
        return value, None
    sanitised = "".join(
        "\ufffd" if character == "\x00" or "\ud800" <= character <= "\udfff" else character
        for character in retained
    )
    marker: dict[str, Any] = {
        "original_characters": len(value),
        "retained_characters": len(retained),
        "sha256": hashlib.sha256(value.encode("utf-8", errors="surrogatepass")).hexdigest(),
    }
    if invalid_characters:
        marker["invalid_characters_replaced"] = invalid_characters
    return sanitised, marker


async def _extract_request_details(request: Request) -> dict[str, Any] | None:
    details: dict[str, Any] = {}
    if request.query_params:
        details["query"] = prepare_audit_metadata(dict(request.query_params))

    if request.method.upper() in {"POST", "PUT", "PATCH", "DELETE"}:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                raw_body = await request.body()
                if len(raw_body) > _MAX_AUDIT_REQUEST_BODY_BYTES:
                    # Keep the event, but do not duplicate document/import JSON
                    # into staging, broker messages and indexed audit storage.
                    details["request_body_omitted"] = {
                        "reason": "size_limit", "bytes": len(raw_body),
                        "limit_bytes": _MAX_AUDIT_REQUEST_BODY_BYTES,
                    }
                    return details
                body = await request.json()
            except Exception:
                body = None
            if body is not None:
                # Login and password-reset bodies land here verbatim otherwise,
                # which wrote plaintext credentials into the audit table.
                details["request_body"] = prepare_audit_metadata(body)

    return details or None


def request_actor_id(
    request: Request,
    *,
    token_key: str | bytes,
    token_algorithm: str,
    token_issuer: str,
    token_audience: str,
    token_key_id: str,
) -> uuid.UUID | None:
    """Best-effort actor UUID extracted from the request's bearer token."""
    payload = _extract_optional_token(
        request,
        token_key=token_key,
        token_algorithm=token_algorithm,
        token_issuer=token_issuer,
        token_audience=token_audience,
        token_key_id=token_key_id,
    ) or {}
    sub = payload.get("sub")
    if not sub:
        return None
    try:
        return uuid.UUID(str(sub))
    except ValueError:
        return None


async def build_audit_payload(
    *,
    service_name: str,
    request: Request,
    status_code: int,
    token_key: str | bytes,
    token_algorithm: str,
    token_issuer: str,
    token_audience: str,
    token_key_id: str,
    error_message: str | None = None,
    details: dict[str, Any] | None = None,
    changes: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Extract everything the audit row needs from a live Request.

    This is the only part that must run inside the request, because the Request
    (and its body) is gone afterwards. The result is plain JSON-serializable data
    so the actual write can be handed to a background worker — see
    :func:`persist_audit_payload`.
    """
    payload = _extract_optional_token(
        request,
        token_key=token_key,
        token_algorithm=token_algorithm,
        token_issuer=token_issuer,
        token_audience=token_audience,
        token_key_id=token_key_id,
    ) or {}
    resource_type, resource_id = _resource_from_path(request.url.path)
    route = request.scope.get("route")
    route_name = getattr(route, "name", None)
    extracted_details = await _extract_request_details(request)
    if details and extracted_details:
        extracted_details.update(details)
    elif details:
        extracted_details = details

    user_id = None
    sub = payload.get("sub")
    if sub:
        try:
            user_id = uuid.UUID(str(sub))
        except ValueError:
            user_id = None

    status_value = "success" if status_code < 400 else "failure"
    truncations: dict[str, dict[str, Any]] = {}
    raw_text = {
        "service_name": service_name,
        "action": _semantic_action(request),
        "resource_type": resource_type,
        "resource_id": str(resource_id) if resource_id is not None else None,
        "request_method": request.method,
        "request_path": str(request.url.path),
        "route_name": route_name,
        "session_jti": payload.get("jti"),
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "error_message": error_message,
    }
    request_text: dict[str, str | None] = {}
    for field, value in raw_text.items():
        normalised, marker = _normalise_audit_text(value, _AUDIT_TEXT_LIMITS[field])
        request_text[field] = normalised
        # Keep the existing detail contract focused on request text and
        # diagnostic errors. Other bounded columns are normalised silently so
        # a long path segment does not turn an otherwise empty detail object
        # into a new response shape.
        if marker is not None and field in {"request_path", "user_agent", "error_message"}:
            truncations[field] = marker
    extracted_details = prepare_audit_metadata(extracted_details)
    if truncations:
        extracted_details = dict(extracted_details or {})
        extracted_details["audit_truncated_fields"] = truncations
        extracted_details = prepare_audit_metadata(extracted_details)
        # If adding the marker exhausted the metadata budget, retain that
        # omission reason together with the small, server-generated marker.
        extracted_details["audit_truncated_fields"] = truncations

    return {
        "id": str(uuid.uuid4()),
        "service_name": request_text["service_name"],
        "action": request_text["action"],
        "resource_type": request_text["resource_type"],
        "resource_id": request_text["resource_id"],
        "request_method": request_text["request_method"],
        "request_path": request_text["request_path"],
        "route_name": request_text["route_name"],
        "status_code": status_code,
        "status": status_value,
        "user_id": str(user_id) if user_id is not None else None,
        "session_jti": request_text["session_jti"],
        "ip_address": request_text["ip_address"],
        "user_agent": request_text["user_agent"],
        "error_message": request_text["error_message"],
        "details": prepare_audit_metadata(extracted_details),
        "changes": prepare_audit_metadata(changes),
        "happened_at": datetime.now(timezone.utc).isoformat(),
    }


def _audit_log_from_payload(payload: dict[str, Any], audit_model: type[Any]) -> Any:
    data = dict(payload)
    # Recheck queued/internal payloads too: old producers may not have applied
    # the current request-side redaction, and retries must not persist secrets.
    # Apply the same storage budgets to legacy and manually supplied payloads;
    # these bypass ``build_audit_payload`` but still enter the same audit table.
    for field, limit in _AUDIT_TEXT_LIMITS.items():
        if field in data:
            data[field], _ = _normalise_audit_text(data[field], limit)
    for field in ("details", "changes"):
        if field in data:
            data[field] = prepare_audit_metadata(data[field])
    raw_id = data.pop("id", None)
    raw_user_id = data.pop("user_id", None)
    raw_happened_at = data.pop("happened_at", None)

    user_id = None
    if raw_user_id:
        try:
            user_id = uuid.UUID(str(raw_user_id))
        except ValueError:
            user_id = None

    happened_at = datetime.now(timezone.utc)
    if isinstance(raw_happened_at, datetime):
        happened_at = raw_happened_at
    elif raw_happened_at:
        try:
            happened_at = datetime.fromisoformat(str(raw_happened_at))
        except ValueError:
            pass

    entry_id = uuid.UUID(str(raw_id)) if raw_id else uuid.uuid4()
    return audit_model(id=entry_id, **data, user_id=user_id, happened_at=happened_at)


async def insert_audit_batch(
    session: AsyncSession,
    payloads: list[dict[str, Any]],
    audit_model: type[Any],
) -> int:
    """Insert at most 100 events in one statement; the caller owns commit.

    Stable IDs make broker redelivery a no-op. A bad row fails the entire batch
    so the caller cannot acknowledge a partially persisted delivery.
    """
    from sqlalchemy.dialects.postgresql import insert

    if not 1 <= len(payloads) <= 100:
        raise ValueError("audit batches must contain between 1 and 100 events")
    rows = []
    columns = [
        column.name for column in audit_model.__table__.columns
        if column.name not in {"created_at", "updated_at", "deleted_at"}
    ]
    for payload in payloads:
        if not payload.get("id"):
            raise ValueError("batched audit events require a stable id")
        entry = _audit_log_from_payload(payload, audit_model)
        row = {name: getattr(entry, name, None) for name in columns}
        row["status"] = payload.get("status", "success")
        rows.append(row)
    statement = insert(audit_model).values(rows).on_conflict_do_nothing(
        index_elements=[audit_model.id],
    ).returning(audit_model.id)
    return len((await session.execute(statement)).all())


async def persist_audit_batch(
    session_factory: async_sessionmaker[AsyncSession],
    payloads: list[dict[str, Any]],
    audit_model: type[Any],
) -> int:
    """Worker boundary: acknowledge a batch only after this commit succeeds."""
    async with session_factory() as session:
        try:
            inserted = await insert_audit_batch(session, payloads, audit_model)
            await session.commit()
            return inserted
        except BaseException:
            await session.rollback()
            raise


async def persist_audit_payload(
    session_factory: async_sessionmaker[AsyncSession],
    payload: dict[str, Any],
    audit_model: type[Any],
    *,
    strict: bool = False,
) -> None:
    """Write a payload built by :func:`build_audit_payload`.

    Safe to run outside the request — in a Celery task or any background worker.
    """
    entry = _audit_log_from_payload(payload, audit_model)
    async with session_factory() as session:
        try:
            session.add(entry)
            await session.commit()
        except Exception as exc:
            await session.rollback()
            from sqlalchemy.exc import IntegrityError

            if isinstance(exc, IntegrityError) and await session.get(audit_model, entry.id) is not None:
                # The payload UUID is stable across broker redelivery.
                return
            logger.error("failed to persist audit entry", extra={"exception_type": type(exc).__name__})
            if strict:
                raise


async def persist_audit_log(
    session_factory: async_sessionmaker[AsyncSession],
    *,
    service_name: str,
    request: Request,
    status_code: int,
    token_key: str | bytes,
    token_algorithm: str,
    token_issuer: str,
    token_audience: str,
    token_key_id: str,
    audit_model: type[Any],
    error_message: str | None = None,
    details: dict[str, Any] | None = None,
    changes: dict[str, Any] | None = None,
) -> None:
    """Build and write an audit entry inline.

    Kept for callers that have not moved the write off the request path.
    """
    payload = await build_audit_payload(
        service_name=service_name,
        request=request,
        status_code=status_code,
        token_key=token_key,
        token_algorithm=token_algorithm,
        token_issuer=token_issuer,
        token_audience=token_audience,
        token_key_id=token_key_id,
        error_message=error_message,
        details=details,
        changes=changes,
    )
    await persist_audit_payload(session_factory, payload, audit_model)


def should_skip_audit(path: str) -> bool:
    """Return True when a path should not be persisted in audit logs."""
    excluded_prefixes = (
        "/api/docs",
        "/api/redoc",
        "/openapi.json",
        "/uploads",
        "/favicon.ico",
    )
    return path.startswith(excluded_prefixes)


#: Cookie names that carry an authenticated session across the platform. A
#: request bearing one of these is treated as authenticated for audit purposes
#: even though the audit layer never validates it.
AUTH_COOKIE_NAMES = ("ksu_access", "access_token")

_READ_METHODS = frozenset({"GET", "HEAD", "OPTIONS"})


def is_anonymous_read(request: Request) -> bool:
    """Return True for a safe-method request that carries no credential at all.

    Public page views are the bulk of traffic on a university site and auditing
    them turns every read into a database write while growing ``audit_logs``
    once per visitor. Anything presenting a credential is still audited, as is
    every unsafe method, so the accountability trail is unchanged.
    """
    if request.method.upper() not in _READ_METHODS:
        return False
    if request.headers.get("authorization"):
        return False
    if request.headers.get("x-internal-key") or request.headers.get("x-internal-api-key"):
        return False
    if request.headers.get("x-api-key"):
        return False
    return not any(name in request.cookies for name in AUTH_COOKIE_NAMES)


async def forward_audit_payload(
    payload: dict[str, Any] | list[dict[str, Any]],
    *,
    base_url: str,
    api_key: str,
) -> None:
    """Forward a bounded batch without giving sibling workers Main DB access."""
    from .internal_client import get_integration_pool

    if isinstance(payload, list):
        if not 1 <= len(payload) <= 100 or any(not event.get("id") for event in payload):
            raise ValueError("audit batches require 1-100 events with stable IDs")
        body = {"events": payload}
        path = "/api/v1/internal/audit/batch"
        # Include the complete content: accidentally changed events must not
        # receive a cached acknowledgement for an earlier batch of these IDs.
        encoded = json.dumps(body, sort_keys=True, separators=(",", ":")).encode()
        if len(encoded) > 256 * 1024:
            raise ValueError("audit batch exceeds 256 KiB")
        key = "audit-batch-" + hashlib.sha256(encoded).hexdigest()
    else:
        body = payload
        path = "/api/v1/internal/audit"
        key = str(payload.get("id") or payload.get("happened_at"))
    response = await get_integration_pool().request_internal(
        "main-audit", base_url, "POST", path,
        api_key=api_key, json=body, headers={"Idempotency-Key": key},
    )
    response.raise_for_status()
    try:
        acknowledgement = response.json()
    except ValueError:
        acknowledgement = None
    accepted = (
        response.status_code == 202
        and isinstance(acknowledgement, dict)
        and acknowledgement.get("status") == "accepted"
    )
    if accepted and isinstance(payload, list):
        received = acknowledgement.get("received")
        inserted = acknowledgement.get("inserted")
        accepted = (
            type(received) is int and received == len(payload)
            and type(inserted) is int and 0 <= inserted <= received
        )
    elif accepted:
        accepted = acknowledgement.get("id") == str(payload.get("id"))
        if not accepted:
            try:
                # Main parses UUID input and returns its canonical spelling.
                # Equivalent accepted spellings must not trigger redelivery.
                accepted = uuid.UUID(str(acknowledgement.get("id"))) == uuid.UUID(str(payload.get("id")))
            except ValueError:
                accepted = False
    if not accepted:
        # Treat ambiguous delivery as retryable; stable IDs make a committed
        # replay harmless. Do not include response bodies or credentials.
        raise ConnectionError("audit receiver returned an invalid acknowledgement")


def build_audit_tasks(
    celery_app: Any,
    session_factory: async_sessionmaker[AsyncSession] | None,
    *,
    task_name: str,
    audit_model: type[Any] | None = None,
    persist_payload: Callable[[dict[str, Any] | list[dict[str, Any]]], Awaitable[None]] | None = None,
) -> tuple[Any, Callable[[dict[str, Any]], Awaitable[None]]]:
    """Build a service's audit persistence task and its request-side dispatcher.

    Every service needs the same pair and they differed only in the Celery task
    name, so the four copies were identical by construction and drifted only in
    their docstrings.

    ``task_name`` stays service-owned because it is routed per service in each
    Celery config and already-queued messages carry it; changing one would
    strand its queue.

    Returns ``(persist_task, dispatch)``. Register the task by importing the
    module that calls this at Celery start-up, and pass ``dispatch`` to
    ``AuditOptions(dispatch=...)``.
    """

    async def _persist(payload: dict[str, Any] | list[dict[str, Any]], *, strict: bool = True) -> None:
        if persist_payload is not None:
            await persist_payload(payload)
            return
        if isinstance(payload, list):
            if session_factory is None or audit_model is None:
                raise ValueError("this audit adapter does not support batch persistence")
            await persist_audit_batch(session_factory, payload, audit_model)
            return
        if session_factory is None or audit_model is None:
            raise RuntimeError("audit persistence is not configured")
        await persist_audit_payload(session_factory, payload, audit_model, strict=strict)

    from httpx import HTTPError, HTTPStatusError
    from .internal_client import retry_after_seconds
    from sqlalchemy.exc import DBAPIError, InterfaceError, OperationalError
    from .task_queue import run_worker_async

    class AuditTask(celery_app.Task):
        def apply_async(self, args=None, kwargs=None, **options):
            # Retries reconstruct publication options and do not retain the
            # request-side argsrepr. Enforce privacy on every publication.
            options.update(argsrepr="(<audit payload>,)", kwargsrepr="{}")
            return super().apply_async(args=args, kwargs=kwargs, **options)

    @celery_app.task(
        name=task_name, ignore_result=True, bind=True, base=AuditTask,
        autoretry_for=(ConnectionError, TimeoutError, OSError, HTTPError, InterfaceError, OperationalError),
        retry_backoff=True, retry_backoff_max=60, retry_kwargs={"max_retries": 5},
        soft_time_limit=30, time_limit=45,
    )
    def persist_audit(self, payload: dict[str, Any] | list[dict[str, Any]]) -> None:
        try:
            run_worker_async(_persist(payload))
        except DBAPIError as exc:
            sqlstate = getattr(exc.orig, "sqlstate", None) or getattr(exc.orig, "pgcode", None)
            if sqlstate in {"40001", "40P01"}:
                # asyncpg maps transaction conflicts to generic DBAPIError.
                # Feed only these recoverable states into bounded autoretry.
                raise ConnectionError(f"transient audit database conflict ({sqlstate})") from None
            raise
        except HTTPStatusError as exc:
            if exc.response.status_code not in {408, 429, 500, 502, 503, 504}:
                # Repeating a rejected payload cannot repair it and consumes
                # receiver capacity. Emit a safe terminal error for operators.
                raise ValueError(f"audit receiver rejected payload (HTTP {exc.response.status_code})") from None
            delay = retry_after_seconds(exc.response.headers.get("Retry-After"))
            if delay is not None:
                # Release the worker while waiting; the ordinary autoretry
                # wrapper must not replace the receiver's advisory with 1s.
                raise self.retry(
                    exc=RuntimeError("audit delivery deferred by receiver"),
                    countdown=max(1.0, delay), max_retries=5,
                )
            raise

    async def dispatch_audit(payload: dict[str, Any]) -> None:
        """Hand the entry to a worker instead of writing it in the request.

        ``apply_async`` publishes to the broker over a blocking socket, so it runs in
        a worker thread to keep the event loop free. A broker outage falls back
        to an inline write — accepting the original cost rather than losing the
        row.
        """
        try:
            await asyncio.to_thread(
                persist_audit.apply_async, args=[payload], argsrepr="(<audit payload>,)", kwargsrepr="{}",
            )
        except Exception as exc:
            logger.error("failed to queue audit entry; writing inline", extra={"error_type": type(exc).__name__})
            await _persist(payload, strict=False)

    return persist_audit, dispatch_audit
