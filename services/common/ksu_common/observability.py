"""Request correlation, health, and latency instrumentation primitives."""

from __future__ import annotations

import asyncio
import logging
import math
import os
import re
import uuid
from collections.abc import Iterator, Mapping
from contextlib import contextmanager
from contextvars import ContextVar, Token
from dataclasses import dataclass, field
from itertools import islice
from threading import Lock
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
_MAX_TAGS = 32
_MAX_DETAIL_MAPPING_ENTRIES = 32
_MAX_DETAIL_SEQUENCE_ENTRIES = 64
_SENSITIVE_VALUE = re.compile(
    r"""(?ix)
    (?P<authorization>\bauthorization\s*:\s*(?:bearer|basic)\s+)[^\s,;]+ |
    (?P<bearer>\bbearer\s+)[^\s,;]+ |
    (?P<assignment>\b(?:api[-_ ]?key|access[-_ ]?token|refresh[-_ ]?token|id[-_ ]?token|token|secret|password|credential)\s*[:=]\s*(?:bearer\s+)?)[^\s,;]+
    """
)


class MetricsSink(Protocol):
    """Destination for normalized metrics supplied by an application."""

    def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None: ...

    def observe_latency(
        self, name: str, duration_ms: float, *, tags: dict[str, str]
    ) -> None: ...

    def gauge(self, name: str, value: float, *, tags: dict[str, str]) -> None: ...


class CompositeMetricsSink:
    """Forward metrics to all configured sinks without changing their contract."""

    def __init__(self, *sinks: MetricsSink) -> None:
        self._sinks = tuple(sinks)

    def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None:
        for sink in self._sinks:
            sink.increment(name, value, tags=tags)

    def observe_latency(self, name: str, duration_ms: float, *, tags: dict[str, str]) -> None:
        for sink in self._sinks:
            sink.observe_latency(name, duration_ms, tags=tags)

    def gauge(self, name: str, value: float, *, tags: dict[str, str]) -> None:
        for sink in self._sinks:
            sink_gauge = getattr(sink, "gauge", None)
            if callable(sink_gauge):
                sink_gauge(name, value, tags=tags)


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


def _redact_secret_text(value: str) -> str:
    """Remove credential values embedded in otherwise neutral telemetry text."""

    def replacement(match: re.Match[str]) -> str:
        prefix = next(
            group for group in match.group("authorization", "bearer", "assignment") if group is not None
        )
        return f"{prefix}[REDACTED]"

    return _SENSITIVE_VALUE.sub(replacement, value)


def _normalize_tags(tags: Mapping[str, object] | None) -> dict[str, str]:
    if not tags:
        return {}
    normalized: dict[str, str] = {}
    for key, value in islice(tags.items(), _MAX_TAGS):
        normalized_key = _normalize_text(
            key, field_name="metric tag", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH
        )
        normalized[normalized_key] = (
            "[REDACTED]"
            if _SENSITIVE_DETAIL_KEY.search(normalized_key)
            else _redact_secret_text(
                _normalize_text(value, field_name="metric tag value", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH)
            )
        )
    return normalized


def _normalize_details(value: object, *, depth: int = 0) -> object:
    """Produce a bounded JSON-like audit payload without exposing credentials."""

    if depth >= _MAX_DETAIL_DEPTH:
        return "[TRUNCATED]"
    if value is None or isinstance(value, (bool, int, float)):
        return value
    if isinstance(value, str):
        return _redact_secret_text(
            value.replace("\r", " ").replace("\n", " ")[:_MAX_DETAIL_TEXT_LENGTH]
        )
    if isinstance(value, Mapping):
        details: dict[str, object] = {}
        for key, item in islice(value.items(), _MAX_DETAIL_MAPPING_ENTRIES):
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
        return [
            _normalize_details(item, depth=depth + 1)
            for item in islice(value, _MAX_DETAIL_SEQUENCE_ENTRIES)
        ]
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
        normalized_duration = float(duration_ms)
        if not math.isfinite(normalized_duration):
            raise ValueError("duration_ms must be finite")
        metric = Metric(
            name=_normalize_text(name, field_name="metric name", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH),
            value=max(0.0, normalized_duration),
            tags=_normalize_tags(tags),
        )
        if self._sink is not None:
            self._sink.observe_latency(metric.name, float(metric.value), tags=metric.tags)
        return metric

    def gauge(
        self, name: str, value: float, *, tags: Mapping[str, object] | None = None
    ) -> Metric:
        normalized_value = float(value)
        if not math.isfinite(normalized_value):
            raise ValueError("gauge value must be finite")
        metric = Metric(
            name=_normalize_text(name, field_name="metric name", maximum=_MAX_OBSERVABILITY_TEXT_LENGTH),
            value=normalized_value,
            tags=_normalize_tags(tags),
        )
        if self._sink is not None:
            sink_gauge = getattr(self._sink, "gauge", None)
            if callable(sink_gauge):
                sink_gauge(metric.name, float(metric.value), tags=metric.tags)
        return metric


_PROMETHEUS_NAME = re.compile(r"[^a-zA-Z0-9_:]")
_PROMETHEUS_LABEL = re.compile(r"[^a-zA-Z0-9_:]")
_DEFAULT_HISTOGRAM_BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)
_DEFAULT_PROMETHEUS_REGISTRY: PrometheusMetricsRegistry | None = None
_DEFAULT_PROMETHEUS_REGISTRY_LOCK = Lock()


def _prometheus_name(name: str, *, suffix: str = "") -> str:
    normalized = _PROMETHEUS_NAME.sub("_", str(name).strip()).strip("_").lower()
    if not normalized or not (normalized[0].isalpha() or normalized[0] == "_"):
        normalized = f"metric_{normalized}"
    return f"ksu_{normalized}{suffix}"


def _prometheus_labels(tags: Mapping[str, object]) -> tuple[tuple[str, str], ...]:
    labels: list[tuple[str, str]] = []
    for key, value in sorted(tags.items(), key=lambda item: str(item[0])):
        label = _PROMETHEUS_LABEL.sub("_", str(key).strip()).strip("_").lower()
        if not label or not (label[0].isalpha() or label[0] == "_"):
            continue
        normalized_value = (
            "[REDACTED]"
            if _SENSITIVE_DETAIL_KEY.search(label)
            else _redact_secret_text(str(value).replace("\r", " ")[:128])
        )
        labels.append((label[:64], normalized_value))
    return tuple(labels[:32])


def _render_labels(labels: tuple[tuple[str, str], ...], extra: tuple[str, str] | None = None) -> str:
    rendered = list(labels)
    if extra is not None:
        rendered.append(extra)
    if not rendered:
        return ""
    return "{" + ",".join(
        f'{key}="{value.replace(chr(92), chr(92) * 2).replace(chr(34), chr(92) + chr(34)).replace(chr(10), chr(92) + "n")}"'
        for key, value in sorted(rendered)
    ) + "}"


@dataclass
class _Histogram:
    buckets: list[int]
    count: int = 0
    total_seconds: float = 0.0


class PrometheusMetricsRegistry:
    """Bounded, dependency-free Prometheus exposition sink."""

    def __init__(
        self,
        *,
        max_series: int = 2048,
        histogram_buckets: tuple[float, ...] = _DEFAULT_HISTOGRAM_BUCKETS,
    ) -> None:
        if max_series < 1:
            raise ValueError("max_series must be positive")
        if not histogram_buckets or any(not math.isfinite(value) or value <= 0 for value in histogram_buckets):
            raise ValueError("histogram_buckets must contain positive finite values")
        self.max_series = max_series
        self.histogram_buckets = tuple(sorted(set(histogram_buckets)))
        self._counters: dict[tuple[str, tuple[tuple[str, str], ...]], int] = {}
        self._histograms: dict[tuple[str, tuple[tuple[str, str], ...]], _Histogram] = {}
        self._gauges: dict[tuple[str, tuple[tuple[str, str], ...]], float] = {}
        self._series = 0
        self._dropped = 0
        self._lock = Lock()

    def _reserve(self, amount: int) -> bool:
        if self._series + amount > self.max_series:
            self._dropped += 1
            return False
        self._series += amount
        return True

    def increment(self, name: str, value: int = 1, *, tags: dict[str, str]) -> None:
        metric_name = _prometheus_name(name, suffix="" if name.endswith("_total") else "_total")
        key = (metric_name, _prometheus_labels(tags))
        with self._lock:
            if key not in self._counters and not self._reserve(1):
                return
            self._counters[key] = self._counters.get(key, 0) + max(0, int(value))

    def observe_latency(self, name: str, duration_ms: float, *, tags: dict[str, str]) -> None:
        duration_seconds = max(0.0, float(duration_ms)) / 1000
        if not math.isfinite(duration_seconds):
            return
        metric_name = _prometheus_name(name, suffix="_seconds")
        key = (metric_name, _prometheus_labels(tags))
        with self._lock:
            histogram = self._histograms.get(key)
            if histogram is None:
                if not self._reserve(len(self.histogram_buckets) + 2):
                    return
                histogram = _Histogram([0] * len(self.histogram_buckets))
                self._histograms[key] = histogram
            histogram.count += 1
            histogram.total_seconds += duration_seconds
            for index, bucket in enumerate(self.histogram_buckets):
                if duration_seconds <= bucket:
                    histogram.buckets[index] += 1

    def gauge(self, name: str, value: float, *, tags: dict[str, str]) -> None:
        normalized_value = float(value)
        if not math.isfinite(normalized_value):
            return
        metric_name = _prometheus_name(name)
        key = (metric_name, _prometheus_labels(tags))
        with self._lock:
            if key not in self._gauges and not self._reserve(1):
                return
            self._gauges[key] = normalized_value

    def render(self) -> str:
        with self._lock:
            counters = list(self._counters.items())
            histograms = list(self._histograms.items())
            gauges = list(self._gauges.items())
            dropped = self._dropped
        lines: list[str] = []
        rendered_counter_types: set[str] = set()
        for (name, labels), value in sorted(counters):
            if name not in rendered_counter_types:
                lines.append(f"# TYPE {name} counter")
                rendered_counter_types.add(name)
            lines.append(f"{name}{_render_labels(labels)} {value}")
        rendered_histogram_types: set[str] = set()
        for (name, labels), histogram in sorted(histograms):
            if name not in rendered_histogram_types:
                lines.append(f"# TYPE {name} histogram")
                rendered_histogram_types.add(name)
            for bucket, count in zip(self.histogram_buckets, histogram.buckets):
                lines.append(f'{name}_bucket{_render_labels(labels, ("le", _format_number(bucket)))} {count}')
            lines.extend(
                (
                    f'{name}_bucket{_render_labels(labels, ("le", "+Inf"))} {histogram.count}',
                    f"{name}_count{_render_labels(labels)} {histogram.count}",
                    f"{name}_sum{_render_labels(labels)} {_format_number(histogram.total_seconds)}",
                )
            )
        rendered_gauge_types: set[str] = set()
        for (name, labels), value in sorted(gauges):
            if name not in rendered_gauge_types:
                lines.append(f"# TYPE {name} gauge")
                rendered_gauge_types.add(name)
            lines.append(f"{name}{_render_labels(labels)} {_format_number(value)}")
        if dropped:
            lines.extend(("# TYPE ksu_metrics_dropped_series_total counter", f"ksu_metrics_dropped_series_total {dropped}"))
        return "\n".join(lines) + ("\n" if lines else "")


def get_prometheus_registry() -> PrometheusMetricsRegistry:
    """Return the process-wide registry shared by HTTP, DB, and worker code."""

    global _DEFAULT_PROMETHEUS_REGISTRY
    if _DEFAULT_PROMETHEUS_REGISTRY is None:
        with _DEFAULT_PROMETHEUS_REGISTRY_LOCK:
            if _DEFAULT_PROMETHEUS_REGISTRY is None:
                _DEFAULT_PROMETHEUS_REGISTRY = PrometheusMetricsRegistry()
    return _DEFAULT_PROMETHEUS_REGISTRY


def _format_number(value: float) -> str:
    return format(value, ".15g")


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
        except BaseException as exc:
            span.outcome = "cancelled" if isinstance(exc, asyncio.CancelledError) else "error"
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


@contextmanager
def request_context(request_id: str, correlation_id: str | None = None) -> Iterator[None]:
    """Install bounded request correlation for workers and non-HTTP adapters."""

    normalized_request_id = normalize_request_id(request_id)
    if normalized_request_id is None:
        raise ValueError("request_id is invalid")
    normalized_correlation_id = normalize_request_id(correlation_id) or normalized_request_id
    request_token = _request_id.set(normalized_request_id)
    correlation_token = _correlation_id.set(normalized_correlation_id)
    try:
        yield
    finally:
        _correlation_id.reset(correlation_token)
        _request_id.reset(request_token)


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
    metrics: Metrics | None = None,
    route: str | None = None,
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
    if metrics is not None:
        tags = {
            "service": observation.service_name,
            "method": observation.method,
            "route": route or "/__unmatched__",
            "status_code": str(status_code),
        }
        metrics.increment("http.server.requests", tags=tags)
        metrics.observe_latency("http.server.request.duration", duration_ms, tags=tags)


def end_request_observation(observation: RequestObservation) -> None:
    _correlation_id.reset(observation.correlation_token)
    _request_id.reset(observation.request_token)


def health_status(service_name: str) -> dict[str, str]:
    """Return the stable health payload used by all service-owned routes."""

    return {
        "service": service_name,
        "status": "ok",
        "release": os.getenv("KSU_RELEASE", "unknown"),
    }
