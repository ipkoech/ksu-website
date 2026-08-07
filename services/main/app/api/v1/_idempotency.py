"""Main-wide durable idempotency adoption for replayable commands."""

from __future__ import annotations

import hashlib
import inspect
import json
from contextvars import ContextVar
from functools import wraps
from typing import Any

from fastapi import HTTPException, Request, Response, UploadFile, status
from fastapi.encoders import jsonable_encoder
from fastapi.routing import APIRoute, request_response
from fastapi.responses import JSONResponse
from ksu_common.schemas.responses import error
from ksu_common.audit import request_actor_id
from ksu_common.response_validation import _iter_route_inspections
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import get_settings
from ...core.database import AsyncSessionLocal
from ...services.idempotency import (
    IdempotencyKeyReuseError,
    acquire_command,
    complete_command,
    fail_command,
)

settings = get_settings()

_request_context: ContextVar[Request | None] = ContextVar(
    "main_idempotency_request",
    default=None,
)

NON_REPLAYABLE_MUTATION_PATHS = frozenset(
    {
        "/api/v1/auth/login",
        "/api/v1/auth/refresh",
        "/api/v1/auth/logout",
        "/api/v1/realtime/ticket",
    }
)


def _is_mutation(route: APIRoute, path: str) -> bool:
    return bool(route.methods.intersection({"POST", "PUT", "PATCH", "DELETE"})) and path not in NON_REPLAYABLE_MUTATION_PATHS


def main_mutation_routes(routes: list[object] | tuple[object, ...]) -> list[APIRoute]:
    """Return replay-meaningful Main command routes, including nested routers."""

    found: list[APIRoute] = []
    seen: set[int] = set()
    for inspection in _iter_route_inspections(routes):
        if _is_mutation(inspection.route, inspection.path) and id(inspection.route) not in seen:
            found.append(inspection.route)
            seen.add(id(inspection.route))
    return found


def install_main_idempotency(routes: list[object] | tuple[object, ...]) -> None:
    """Adopt all replayable mutation routes without changing domain handlers."""

    for inspection in _iter_route_inspections(routes):
        route = inspection.route
        path = inspection.path
        if not _is_mutation(route, path) or getattr(route, "main_idempotency_enabled", False):
            continue

        endpoint = route.dependant.call
        if _uses_existing_idempotency(endpoint):
            route.main_idempotency_enabled = True
            route.main_idempotency_mode = "endpoint"
            continue

        adopted = _adopt_endpoint(endpoint, route=route, path=path)
        route.dependant.call = adopted
        route.endpoint = adopted
        route.app = _request_context_app(request_response(route.get_route_handler()))
        route.main_idempotency_enabled = True
        route.main_idempotency_mode = "route"


def _uses_existing_idempotency(endpoint: Any) -> bool:
    current = endpoint
    while current is not None:
        try:
            source = inspect.getsource(current)
        except (OSError, TypeError):
            source = ""
        if "acquire_command" in source or "acquire_json_command" in source:
            return True
        current = getattr(current, "__wrapped__", None)
    return False


def _request_context_app(app: Any) -> Any:
    async def contextual_app(scope: dict[str, Any], receive: Any, send: Any) -> None:
        request = Request(scope, receive)
        token = _request_context.set(request)
        try:
            await app(scope, receive, send)
        finally:
            _request_context.reset(token)

    return contextual_app


def _adopt_endpoint(endpoint: Any, *, route: APIRoute, path: str) -> Any:
    @wraps(endpoint)
    async def adopted_endpoint(*args: Any, **kwargs: Any) -> Any:
        request = _request_context.get()
        if request is None:
            raise RuntimeError("Main idempotency route called outside an HTTP request")

        key = request.headers.get("Idempotency-Key", "").strip()
        if not 8 <= len(key) <= 255:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Idempotency-Key is required and must contain 8 to 255 characters",
            )

        payload = await _request_payload(request, kwargs)
        command_name = _command_name(request.method, path)
        scope = _command_scope(request, path)
        session = _session_from_kwargs(kwargs)
        owned_session = session is None
        if session is None:
            session = AsyncSessionLocal()

        try:
            try:
                claim = await acquire_command(
                    session,
                    command_name=command_name,
                    scope=scope,
                    idempotency_key=key,
                    request_payload=payload,
                )
            except IdempotencyKeyReuseError:
                await _finish_owned_session(session, owned_session, commit=False)
                return JSONResponse(
                    status_code=status.HTTP_409_CONFLICT,
                    content=error(
                        "Idempotency-Key was already used for a different request payload",
                        code="idempotency_key_reused",
                    ),
                )

            if claim.kind == "replay":
                await _finish_owned_session(session, owned_session, commit=True)
                request.state.main_idempotency_status = claim.record.status_code or status.HTTP_200_OK
                return _replay_body(claim.record.response_body or {})

            if claim.kind == "in_progress":
                await _finish_owned_session(session, owned_session, commit=True)
                request.state.main_idempotency_status = status.HTTP_409_CONFLICT
                request.state.main_idempotency_retry_after = "1"
                return {
                    "status": "error",
                    "message": "The command with this Idempotency-Key is still being processed",
                    "code": "idempotency_in_progress",
                }

            try:
                result = endpoint(*args, **kwargs)
                if inspect.isawaitable(result):
                    result = await result
            except HTTPException as exc:
                await _persist_failure(
                    session,
                    owned_session=owned_session,
                    command_name=command_name,
                    scope=scope,
                    idempotency_key=key,
                    payload=payload,
                    status_code=exc.status_code,
                    response_body={"detail": jsonable_encoder(exc.detail)},
                )
                raise
            except Exception:
                await _persist_failure(
                    session,
                    owned_session=owned_session,
                    command_name=command_name,
                    scope=scope,
                    idempotency_key=key,
                    payload=payload,
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    response_body={
                        "status": "error",
                        "message": "Command execution failed",
                        "code": "command_failed",
                    },
                )
                raise

            response_status = _response_status(route, result)
            complete_command(
                claim.record,
                status_code=response_status,
                response_body=_stored_response_body(result, status_code=response_status),
            )
            await _finish_owned_session(session, owned_session, commit=True)
            return result
        except Exception:
            if owned_session:
                await _finish_owned_session(session, owned_session, commit=False)
            raise

    return adopted_endpoint


def _session_from_kwargs(kwargs: dict[str, Any]) -> AsyncSession | None:
    return next((value for value in kwargs.values() if isinstance(value, AsyncSession)), None)


async def _finish_owned_session(session: Any, owned: bool, *, commit: bool) -> None:
    if not owned:
        return
    try:
        if commit:
            await session.commit()
        else:
            await session.rollback()
    finally:
        await session.close()


async def _persist_failure(
    session: Any,
    *,
    owned_session: bool,
    command_name: str,
    scope: str,
    idempotency_key: str,
    payload: dict[str, Any],
    status_code: int,
    response_body: dict[str, Any],
) -> None:
    if owned_session:
        await session.rollback()
        await session.close()
    else:
        await session.rollback()

    failure_session = AsyncSessionLocal()
    try:
        failure_claim = await acquire_command(
            failure_session,
            command_name=command_name,
            scope=scope,
            idempotency_key=idempotency_key,
            request_payload=payload,
        )
        if failure_claim.kind == "started":
            fail_command(
                failure_claim.record,
                status_code=status_code,
                response_body=response_body,
            )
        await failure_session.commit()
    finally:
        await failure_session.close()


async def _request_payload(request: Request, kwargs: dict[str, Any]) -> dict[str, Any]:
    values: dict[str, Any] = {}
    for name, value in kwargs.items():
        if name in {"db", "request", "response"} or name.startswith("_") or name in {"user", "current_user"}:
            continue
        values[name] = await _payload_value(value)
    return {
        "path": request.url.path,
        "query": list(request.query_params.multi_items()),
        "parameters": values,
    }


async def _payload_value(value: Any) -> Any:
    if isinstance(value, UploadFile):
        position = value.file.tell()
        content = await value.read()
        await value.seek(position)
        return {
            "filename": value.filename,
            "content_type": value.content_type,
            "size": len(content),
            "sha256": hashlib.sha256(content).hexdigest(),
        }
    if isinstance(value, (list, tuple)):
        return [await _payload_value(item) for item in value]
    try:
        return jsonable_encoder(value)
    except (TypeError, ValueError):
        return repr(value)


def _command_scope(request: Request, path: str) -> str:
    actor = request_actor_id(
        request,
        token_secret=settings.JWT_SECRET_KEY,
        token_algorithm=settings.JWT_ALGORITHM,
    )
    if actor is not None:
        principal = f"actor:{actor}"
    elif internal_key := request.headers.get("X-Internal-Key"):
        principal = f"internal:{hashlib.sha256(internal_key.encode()).hexdigest()[:24]}"
    else:
        principal = f"anonymous:{request.client.host if request.client else 'unknown'}"
    return f"{path}:{principal}"[:255]


def _command_name(method: str, path: str) -> str:
    value = f"main.{method.lower()}.{path}"
    if len(value) <= 128:
        return value
    return f"main.{method.lower()}.{hashlib.sha256(path.encode()).hexdigest()}"


def _response_status(route: APIRoute, result: Any) -> int:
    if isinstance(result, Response):
        return result.status_code
    return route.status_code or status.HTTP_200_OK


def _stored_response_body(result: Any, *, status_code: int) -> dict[str, Any]:
    if status_code == status.HTTP_204_NO_CONTENT:
        return {}
    if isinstance(result, Response):
        if result.status_code == status.HTTP_204_NO_CONTENT or not result.body:
            return {}
        try:
            value = json.loads(result.body)
        except (TypeError, json.JSONDecodeError):
            value = {"body_sha256": hashlib.sha256(result.body).hexdigest()}
    else:
        value = jsonable_encoder(result)
    if isinstance(value, dict):
        return value
    return {"__main_idempotency_result__": value}


def _replay_body(value: dict[str, Any]) -> Any:
    if set(value) == {"__main_idempotency_result__"}:
        return value["__main_idempotency_result__"]
    return value


__all__ = [
    "NON_REPLAYABLE_MUTATION_PATHS",
    "install_main_idempotency",
    "main_mutation_routes",
]
