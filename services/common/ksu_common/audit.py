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
        details["query"] = dict(request.query_params)

    if request.method.upper() in {"POST", "PUT", "PATCH", "DELETE"}:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                body = await request.json()
            except Exception:
                body = None
            if body is not None:
                details["request_body"] = body

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
    """Persist a request audit log entry."""
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
    entry = AuditLog(
        service_name=service_name,
        action=_semantic_action(request),
        resource_type=resource_type,
        resource_id=resource_id,
        request_method=request.method,
        request_path=str(request.url.path),
        route_name=route_name,
        status_code=status_code,
        status=status_value,
        user_id=user_id,
        session_jti=payload.get("jti"),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        error_message=error_message,
        details=extracted_details,
        changes=changes,
        happened_at=datetime.now(timezone.utc),
    )

    async with session_factory() as session:
        try:
            session.add(entry)
            await session.commit()
        except Exception:
            await session.rollback()


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
