"""Request correlation, health, and latency instrumentation primitives."""

from __future__ import annotations

import logging
import re
import uuid
from contextvars import ContextVar, Token
from dataclasses import dataclass
from time import perf_counter

from fastapi import Request, Response

REQUEST_ID_HEADER = "X-Request-ID"
CORRELATION_ID_HEADER = "X-Correlation-ID"
RESPONSE_TIME_HEADER = "X-Response-Time-Ms"
MAX_REQUEST_ID_LENGTH = 128

_SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}\Z")
_request_id: ContextVar[str | None] = ContextVar("ksu_request_id", default=None)
_correlation_id: ContextVar[str | None] = ContextVar("ksu_correlation_id", default=None)
logger = logging.getLogger("ksu.runtime")


@dataclass(frozen=True)
class RequestObservation:
    service_name: str
    request_id: str
    correlation_id: str
    method: str
    path: str
    started_at: float
    request_token: Token[str | None]
    correlation_token: Token[str | None]


def normalize_request_id(value: str | None) -> str | None:
    """Return a bounded, log-safe request identifier or reject it."""

    if value is None:
        return None
    candidate = value.strip()
    if len(candidate) > MAX_REQUEST_ID_LENGTH or not _SAFE_ID.fullmatch(candidate):
        return None
    return candidate


def current_request_id() -> str | None:
    return _request_id.get()


def current_correlation_id() -> str | None:
    return _correlation_id.get()


def correlation_headers(
    *,
    request_id: str | None = None,
    correlation_id: str | None = None,
) -> dict[str, str]:
    """Build safe outbound correlation headers from explicit or active context."""

    resolved_request_id = normalize_request_id(request_id) or current_request_id()
    resolved_correlation_id = (
        normalize_request_id(correlation_id)
        or current_correlation_id()
        or resolved_request_id
    )
    headers: dict[str, str] = {}
    if resolved_request_id:
        headers[REQUEST_ID_HEADER] = resolved_request_id
    if resolved_correlation_id:
        headers[CORRELATION_ID_HEADER] = resolved_correlation_id
    return headers


def begin_request_observation(request: Request, *, service_name: str) -> RequestObservation:
    request_id = normalize_request_id(request.headers.get(REQUEST_ID_HEADER)) or str(uuid.uuid4())
    correlation_id = (
        normalize_request_id(request.headers.get(CORRELATION_ID_HEADER)) or request_id
    )
    request.state.request_id = request_id
    request.state.correlation_id = correlation_id
    return RequestObservation(
        service_name=service_name,
        request_id=request_id,
        correlation_id=correlation_id,
        method=request.method,
        path=request.url.path,
        started_at=perf_counter(),
        request_token=_request_id.set(request_id),
        correlation_token=_correlation_id.set(correlation_id),
    )


def complete_request_observation(
    observation: RequestObservation,
    *,
    response: Response | None,
    status_code: int,
    error_type: str | None = None,
) -> None:
    duration_ms = round((perf_counter() - observation.started_at) * 1000, 3)
    if response is not None:
        response.headers[REQUEST_ID_HEADER] = observation.request_id
        response.headers[CORRELATION_ID_HEADER] = observation.correlation_id
        response.headers[RESPONSE_TIME_HEADER] = f"{duration_ms:.3f}"

    event = "request.failed" if error_type else "request.complete"
    level = logging.ERROR if error_type else logging.INFO
    extra: dict[str, object] = {
        "service": observation.service_name,
        "request_id": observation.request_id,
        "correlation_id": observation.correlation_id,
        "method": observation.method,
        "path": observation.path,
        "status_code": status_code,
        "duration_ms": duration_ms,
    }
    if error_type:
        extra["error_type"] = error_type
    logger.log(level, event, extra=extra)


def end_request_observation(observation: RequestObservation) -> None:
    _correlation_id.reset(observation.correlation_token)
    _request_id.reset(observation.request_token)


def health_status(service_name: str) -> dict[str, str]:
    """Return the stable health payload used by all service-owned routes."""

    return {"service": service_name, "status": "ok"}
