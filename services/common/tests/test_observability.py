from __future__ import annotations

import asyncio
import json
import logging

import pytest
from fastapi import Request
from ksu_common.logging import JsonFormatter
from ksu_common.observability import (
    AuditEvent,
    Metrics,
    PrometheusMetricsRegistry,
    Span,
    Tracer,
    audit_event,
    begin_request_observation,
    end_request_observation,
    health_status,
    normalize_request_id,
)


def test_prometheus_registry_renders_safe_bounded_counter_and_histogram() -> None:
    registry = PrometheusMetricsRegistry(max_series=16)

    registry.increment(
        "http.server.requests",
        tags={"route": "/items/{item_id}", "method": "GET", "secret": "do-not-export"},
    )
    registry.observe_latency(
        "http.server.request.duration",
        12.5,
        tags={"route": "/items/{item_id}", "method": "GET", "status": "200"},
    )

    rendered = registry.render()

    assert 'ksu_http_server_requests_total{method="GET",route="/items/{item_id}",secret="[REDACTED]"} 1' in rendered
    assert 'ksu_http_server_request_duration_seconds_count{method="GET",route="/items/{item_id}",status="200"} 1' in rendered
    assert 'ksu_http_server_request_duration_seconds_sum{method="GET",route="/items/{item_id}",status="200"} 0.0125' in rendered
    assert "do-not-export" not in rendered
    assert "# TYPE ksu_http_server_requests_total counter" in rendered
    assert "# TYPE ksu_http_server_request_duration_seconds histogram" in rendered


def test_prometheus_registry_emits_one_type_line_per_metric_family() -> None:
    registry = PrometheusMetricsRegistry()

    registry.increment("http.request.count", tags={"route": "/one"})
    registry.increment("http.request.count", tags={"route": "/two"})
    registry.observe_latency("http.request.latency_ms", 5, tags={"route": "/one"})
    registry.observe_latency("http.request.latency_ms", 10, tags={"route": "/two"})

    rendered = registry.render()
    assert rendered.count("# TYPE ksu_http_request_count_total counter") == 1
    assert rendered.count("# TYPE ksu_http_request_latency_ms_seconds histogram") == 1


def test_prometheus_registry_renders_gauge() -> None:
    registry = PrometheusMetricsRegistry()

    Metrics(registry).gauge(
        "database.pool.utilization", 0.4, tags={"driver": "postgresql"}
    )

    assert (
        '# TYPE ksu_database_pool_utilization gauge\n'
        'ksu_database_pool_utilization{driver="postgresql"} 0.4\n'
    ) == registry.render()


def test_prometheus_registry_drops_new_series_after_bound() -> None:
    registry = PrometheusMetricsRegistry(max_series=1)

    registry.increment("requests", tags={"route": "/first"})
    registry.increment("requests", tags={"route": "/second"})

    rendered = registry.render()

    assert 'ksu_requests_total{route="/first"} 1' in rendered
    assert '/second' not in rendered
    assert "ksu_metrics_dropped_series_total 1" in rendered


def test_prometheus_registry_escapes_label_values() -> None:
    registry = PrometheusMetricsRegistry()

    registry.increment("requests", tags={"label": 'quote"slash\\line\nfeed'})

    assert 'label="quote\\"slash\\\\line\\nfeed"' in registry.render()


def test_request_ids_accept_safe_values_and_reject_log_injection() -> None:
    assert normalize_request_id("request-123") == "request-123"
    assert normalize_request_id("request\nAuthorization: Bearer secret") is None
    assert normalize_request_id("x" * 129) is None


def test_health_status_has_one_stable_cross_service_shape() -> None:
    assert health_status("research") == {"service": "research", "status": "ok"}


def test_json_request_timing_is_structured_and_does_not_serialize_secrets() -> None:
    record = logging.LogRecord(
        name="ksu.runtime",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="request.complete",
        args=(),
        exc_info=None,
    )
    record.service = "main"
    record.request_id = "request-123"
    record.correlation_id = "correlation-456"
    record.method = "GET"
    record.path = "/api/v1/health"
    record.status_code = 200
    record.duration_ms = 3.25
    record.authorization = "Bearer must-not-appear"

    payload = json.loads(JsonFormatter().format(record))

    assert payload["event"] == "request.complete"
    assert payload["duration_ms"] == 3.25
    assert payload["request_id"] == "request-123"
    assert "must-not-appear" not in json.dumps(payload)


def test_metrics_are_safe_without_an_exporter() -> None:
    metrics = Metrics()

    metrics.increment("requests.completed", tags={"service": "research"})
    metrics.observe_latency("request.duration", 12.5, tags={"route": "/health"})


def test_metrics_normalize_values_before_passing_them_to_an_injected_sink() -> None:
    observed: list[tuple[str, object]] = []

    class Sink:
        def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None:
            observed.append((name, (value, tags)))

        def observe_latency(self, name: str, duration_ms: float, *, tags: dict[str, str]) -> None:
            observed.append((name, (duration_ms, tags)))

    metrics = Metrics(Sink())
    metrics.increment(" requests.completed ", tags={"service": " research\n"})
    metrics.observe_latency("request.duration", -3, tags={"route": "/health"})

    assert observed == [
        ("requests.completed", (1, {"service": "research"})),
        ("request.duration", (0.0, {"route": "/health"})),
    ]


def test_metrics_redact_secret_like_tag_values_and_bound_tag_cardinality() -> None:
    observed: list[dict[str, str]] = []

    class Sink:
        def increment(self, name: str, value: int, *, tags: dict[str, str]) -> None:
            observed.append(tags)

        def observe_latency(self, name: str, duration_ms: float, *, tags: dict[str, str]) -> None:
            observed.append(tags)

    metrics = Metrics(Sink())
    tags = {
        "request": "Authorization: Bearer super-secret-token",
        "access": "token=another-secret",
        **{f"tag-{index}": str(index) for index in range(40)},
    }

    metrics.increment("requests.completed", tags=tags)

    assert len(observed[0]) <= 32
    assert "super-secret-token" not in json.dumps(observed[0])
    assert "another-secret" not in json.dumps(observed[0])
    assert observed[0]["request"] == "Authorization: Bearer [REDACTED]"
    assert observed[0]["access"] == "token=[REDACTED]"


@pytest.mark.parametrize("duration_ms", [float("nan"), float("inf"), float("-inf")])
def test_metrics_reject_non_finite_latency_values(duration_ms: float) -> None:
    with pytest.raises(ValueError, match="finite"):
        Metrics().observe_latency("request.duration", duration_ms)


def test_tracer_emits_a_completed_span_with_active_request_context() -> None:
    spans: list[Span] = []
    tracer = Tracer(spans.append)
    request = Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/catalog",
            "headers": [
                (b"x-request-id", b"request-123"),
                (b"x-correlation-id", b"correlation-456"),
            ],
        }
    )
    observation = begin_request_observation(request, service_name="library")

    try:
        with tracer.span("library.catalog.search", attributes={"query": "title"}) as span:
            assert span.name == "library.catalog.search"
    finally:
        end_request_observation(observation)

    assert len(spans) == 1
    assert spans[0].outcome == "success"
    assert spans[0].duration_ms >= 0
    assert spans[0].attributes == {"query": "title"}
    assert spans[0].request_id == "request-123"
    assert spans[0].correlation_id == "correlation-456"
    assert spans[0].trace_id == "correlation-456"


def test_tracer_marks_error_spans_and_emits_them() -> None:
    spans: list[Span] = []
    tracer = Tracer(spans.append)

    with pytest.raises(ValueError, match="invalid query"), tracer.span("library.catalog.search"):
        raise ValueError("invalid query")

    assert spans[0].outcome == "error"
    assert spans[0].error_type == "ValueError"


def test_tracer_marks_cancelled_spans_and_emits_them() -> None:
    spans: list[Span] = []
    tracer = Tracer(spans.append)

    with pytest.raises(asyncio.CancelledError), tracer.span("library.catalog.search"):
        raise asyncio.CancelledError()

    assert spans[0].outcome == "cancelled"
    assert spans[0].error_type == "CancelledError"


def test_audit_events_redact_secrets_and_preserve_service_owned_context() -> None:
    events: list[AuditEvent] = []

    event = audit_event(
        service="heri",
        action="editorial.publish",
        actor="user-123",
        target="article-456",
        outcome="success",
        details={
            "title": "Annual report",
            "authorization": "Bearer secret-token",
            "nested": {"api_key": "secret-key", "count": 2},
        },
        sink=events.append,
    )

    assert event is events[0]
    assert event.service == "heri"
    assert event.action == "editorial.publish"
    assert event.details == {
        "title": "Annual report",
        "authorization": "[REDACTED]",
        "nested": {"api_key": "[REDACTED]", "count": 2},
    }
    assert event.request_id is None
    assert event.correlation_id is None


def test_audit_events_redact_neutral_string_secrets_and_bound_containers() -> None:
    details = {
        "message": "upstream Authorization: Bearer super-secret-token failed",
        "note": "token=another-secret",
        "entries": list(range(80)),
    }
    details.update({f"field-{index}": index for index in range(40)})

    event = audit_event(
        service="research",
        action="publication.create",
        outcome="failure",
        details=details,
    )

    serialized = json.dumps(event.details)
    assert "super-secret-token" not in serialized
    assert "another-secret" not in serialized
    assert event.details["message"] == "upstream Authorization: Bearer [REDACTED] failed"
    assert event.details["note"] == "token=[REDACTED]"
    assert len(event.details) <= 32
    assert len(event.details["entries"]) <= 64
