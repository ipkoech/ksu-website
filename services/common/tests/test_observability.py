from __future__ import annotations

import json
import logging

from ksu_common.logging import JsonFormatter
from ksu_common.observability import health_status, normalize_request_id


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
