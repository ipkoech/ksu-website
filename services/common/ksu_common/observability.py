"""Request correlation, health, and latency instrumentation primitives."""

from __future__ import annotations

import logging
import re
import uuid
from collections.abc import Iterator, Mapping
from contextlib import contextmanager
from contextvars import ContextVar, Token
from dataclasses import dataclass, field
from time import perf_counter
from typing import Protocol, cast

from fastapi import Request, Response

REQUEST_ID_HEADER = "X-Request-ID"
CORRELATION_ID_HEADER = "X-Correlation-ID"
RESPONSE_TIME_HEADER = "X-Response-Time-Ms"
MAX_REQUEST_ID_LENGTH = 128

_SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}\Z")
_request_id: ContextVar[str | None] = ContextVar("ksu_request_id", default=None)
_correlation_id: ContextVar[str | None] = ContextVar("ksu_correlation_id", default=None)
logger = logging.getLogger("ksu.runtime")

_SENSITIVE_DETAIL_KEY = re.compile(
    r"(?:api[-_]?key|authorization|cookie|credential|password|secret|token)", re.IGNORECASE
)
_MAX_OBSERVABILITY_TEXT_LENGTH = 256
_MAX_DETAIL_TEXT_LENGTH = 1024
_MAX_DETAIL_DEPTH = 8


class MetricsSink(Protocol):
    """Destination for normalized metrics supplied by an application."""

    def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None: ...

    def observe_latency(
        self, name: str, duration_ms: float, *, tags: dict[str, str]
    ) -> None: ...


class SpanSink(Protocol):
    """Destination for completed tracing spans supplied by an application."""

    def __call__(self, span: Span) -> None: ...


class AuditEventSink(Protocol):
    """Destination for normalized audit events supplied by an application."""

    def __call__(self, event: AuditEvent) -> None: ...


def _normalize_text(value: object, *, field_name: str, maximum: int) -> str:
    """Normalize non-secret labels before they reach a telemetry sink."""

    candidate = str(value).replace("\r", " ").replace("\n", " ").strip()
    if not candidate:
        raise ValueError(f"{field_name} must not be empty")
    return candidate[:maximum]


def _normalize_tags(tags: Mapping[str, object] | None) -> dict[str, str]:
    if not tags:
        return {}
    return {
        _normalize_text(key, field_name="metric tag", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH): _normalize_text(
            value, field_name="metric tag value", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH
        )
        for key, value in tags.items()
    }


def _normalize_details(value: object, *, depth: int = 0) -> object:
    """Produce a bounded JSON-like audit payload without exposing credentials."""

    if depth >= _MAX_DETAIL_DEPTH:
        return "[TRUNCATED]"
    if value is None or isinstance(value, (bool, int, float)):
        return value
    if isinstance(value, str):
        return value.replace("\r", " ").replace("\n", " ")[:_MAX_DETAIL_TEXT_LENGTH]
    if isinstance(value, Mapping):
        details: dict[str, object] = {}
        for key, item in value.items():
            normalized_key = _normalize_text(
                key, field_name="audit detail key", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH
            )
            details[normalized_key] = (
                "[REDACTED]"
                if _SENSITIVE_DETAIL_KEY.search(normalized_key)
                else _normalize_details(item, depth=depth + 1)
            )
        return details
    if isinstance(value, (list, tuple, set, frozenset)):
        return [_normalize_details(item, depth=depth + 1) for item in value]
    return f"[{type(value).__name__}]"


@dataclass(frozen=True)
class Metric:
    name: str
    value: int | float
    tags: dict[str, str]


class Metrics:
    """Dependency-free metric facade; it is intentionally a no-op without a sink."""

    def __init__(self, sink: MetricsSink | None = None) -> None:
        self._sink = sink

    def increment(
        self, name: str, value: int = 1, *, tags: Mapping[str, object] | None = None
    ) -> Metric:
        metric = Metric(
            name=_normalize_text(name, field_name="metric name", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH),
            value=max(0, int(value)),
            tags=_normalize_tags(tags),
        )
        if self._sink is not None:
            self._sink.increment(metric.name, int(metric.value), tags=metric.tags)
        return metric

    def observe_latency(
        self, name: str, duration_ms: float, *, tags: Mapping[str, object] | None = None
    ) -> Metric:
        metric = Metric(
            name=_normalize_text(name, field_name="metric name", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH),
            value=max(0.0, float(duration_ms)),
            tags=_normalize_tags(tags),
        )
        if self._sink is not None:
            self._sink.observe_latency(metric.name, float(metric.value), tags=metric.tags)
        return metric


@dataclass
class Span:
    name: str
    trace_id: str
    request_id: str | None
    correlation_id: str | None
    attributes: dict[str, object]
    started_at: float = field(default_factory=perf_counter)
    duration_ms: float | None = None
    outcome: str | None = None
    error_type: str | None = None


class Tracer:
    """Creates completed spans and forwards them only when a sink is configured."""

    def __init__(self, sink: SpanSink | None = None) -> None:
        self._sink = sink

    @contextmanager
    def span(
        self, name: str, *, attributes: Mapping[str, object] | None = None
    ) -> Iterator[Span]:
        request_id = current_request_id()
        correlation_id = current_correlation_id()
        span = Span(
            name=_normalize_text(name, field_name="span name", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH),
            trace_id=correlation_id or request_id or str(uuid.uuid4()),
            request_id=request_id,
            correlation_id=correlation_id,
            attributes=cast(dict[str, object], _normalize_details(attributes or {})),
        )
        try:
            yield span
        except Exception as exc:
            span.outcome = "error"
            span.error_type = type(exc).__name__
            raise
        else:
            span.outcome = "success"
        finally:
            span.duration_ms = round((perf_counter() - span.started_at) * 1000, 3)
            if self._sink is not None:
                self._sink(span)


@dataclass(frozen=True)
class AuditEvent:
    service: str
    action: str
    actor: str | None
    target: str | None
    request_id: str | None
    correlation_id: str | None
    outcome: str
    details: dict[str, object]


def audit_event(
    *,
    service: str,
    action: str,
    actor: str | None = None,
    target: str | None = None,
    outcome: str,
    details: Mapping[str, object] | None = None,
    request_id: str | None = None,
    correlation_id: str | None = None,
    sink: AuditEventSink | None = None,
) -> AuditEvent:
    """Create and optionally transport an audit event; services own its meaning."""

    event = AuditEvent(
        service=_normalize_text(service, field_name="service", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH),
        action=_normalize_text(action, field_name="action", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH),
        actor=(
            _normalize_text(actor, field_name="actor", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH)
            if actor is not None
            else None
        ),
        target=(
            _normalize_text(target, field_name="target", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH)
            if target is not None
            else None
        ),
        request_id=normalize_request_id(request_id) or current_request_id(),
        correlation_id=normalize_request_id(correlation_id) or current_correlation_id(),
        outcome=_normalize_text(outcome, field_name="outcome", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH),
        details=cast(dict[str, object], _normalize_details(details or {})),
    )
    if sink is not None:
        sink(event)
    return event


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
