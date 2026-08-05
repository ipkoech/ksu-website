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

import json
import logging
import os
import uuid
from datetime import datetime, timezone
from functools import wraps
from typing import Any, Callable

import jwt
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from .field_selection import scrub_sensitive
from .models import AuditLog
from .security import decode_token

logger = logging.getLogger("audit")


class AuditEntry:
    """Represents an audit log entry."""

    __slots__ = (
        "id",
        "timestamp",
        "action",
        "user_id",
        "user_roles",
        "target_type",
        "target_id",
        "ip_address",
        "user_agent",
        "request_path",
        "request_method",
        "details",
        "service",
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
            "details": self.details,
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
        action: Action name (e.g., "library.create", "loan.return")
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

            try:
                context = {}
                if request:
                    context = AuditLogger.from_request(request, user)

                await _default_logger.log(
                    action,
                    target_type=target_type,
                    target_id=target_id,
                    details=details if details else None,
                    **context,
                )
            except Exception as e:
                logger.warning(f"Audit logging failed: {e}")

            return result

        return wrapper

    return decorator


async def get_audit_logger(redis_client=None) -> AuditLogger:
    """Factory for creating AuditLogger with optional Redis."""
    return AuditLogger(redis_client=redis_client)


def _extract_optional_token(request: Request) -> dict[str, Any] | None:
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    secret = os.getenv("JWT_SECRET_KEY")
    if not secret:
        return None

    try:
        return decode_token(
            token,
            secret=secret,
            algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
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


async def _extract_request_details(request: Request) -> dict[str, Any] | None:
    details: dict[str, Any] = {}
    if request.query_params:
        details["query"] = scrub_sensitive(dict(request.query_params))

    if request.method.upper() in {"POST", "PUT", "PATCH", "DELETE"}:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                body = await request.json()
            except Exception:
                body = None
            if body is not None:
                # Login and password-reset bodies land here verbatim otherwise,
                # which wrote plaintext credentials into the audit table.
                details["request_body"] = scrub_sensitive(body)

    return details or None


def request_actor_id(request: Request) -> uuid.UUID | None:
    """Best-effort actor UUID extracted from the request's bearer token."""
    payload = _extract_optional_token(request) or {}
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
    payload = _extract_optional_token(request) or {}
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
    return {
        "service_name": service_name,
        "action": _semantic_action(request),
        "resource_type": resource_type,
        "resource_id": str(resource_id) if resource_id is not None else None,
        "request_method": request.method,
        "request_path": str(request.url.path),
        "route_name": route_name,
        "status_code": status_code,
        "status": status_value,
        "user_id": str(user_id) if user_id is not None else None,
        "session_jti": payload.get("jti"),
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "error_message": error_message,
        "details": extracted_details,
        "changes": changes,
        "happened_at": datetime.now(timezone.utc).isoformat(),
    }


def _audit_log_from_payload(payload: dict[str, Any]) -> AuditLog:
    data = dict(payload)
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

    return AuditLog(**data, user_id=user_id, happened_at=happened_at)


async def persist_audit_payload(
    session_factory: async_sessionmaker[AsyncSession],
    payload: dict[str, Any],
) -> None:
    """Write a payload built by :func:`build_audit_payload`.

    Safe to run outside the request — in a Celery task or any background worker.
    """
    entry = _audit_log_from_payload(payload)
    async with session_factory() as session:
        try:
            session.add(entry)
            await session.commit()
        except Exception:
            await session.rollback()
            logger.exception("failed to persist audit entry for %s", payload.get("request_path"))


async def persist_audit_log(
    session_factory: async_sessionmaker[AsyncSession],
    *,
    service_name: str,
    request: Request,
    status_code: int,
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
        error_message=error_message,
        details=details,
        changes=changes,
    )
    await persist_audit_payload(session_factory, payload)


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
