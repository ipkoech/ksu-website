from __future__ import annotations

import json
import logging

from ksu_common.logging import JsonFormatter
from ksu_common.observability import (
    AuditEvent,
    Metrics,
    Span,
    Tracer,
    audit_event,
    health_status,
    normalize_request_id,
)


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


def test_tracer_emits_a_completed_span_with_correlation_context() -> None:
    spans: list[Span] = []
    tracer = Tracer(spans.append)

    with tracer.span("library.catalog.search", attributes={"query": "title"}) as span:
        assert span.name == "library.catalog.search"

    assert len(spans) == 1
    assert spans[0].outcome == "success"
    assert spans[0].duration_ms >= 0
    assert spans[0].attributes == {"query": "title"}


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
