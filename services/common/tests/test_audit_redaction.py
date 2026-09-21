import asyncio
import json
import hashlib
import pytest

from starlette.requests import Request

from ksu_common.audit import _audit_log_from_payload, build_audit_payload
from ksu_common.audit import _extract_request_details
from ksu_common.audit import AuditLogger
from ksu_common import audit as audit_module
from unittest.mock import AsyncMock


@pytest.mark.parametrize("length", [512, 513])
@pytest.mark.parametrize("metadata_size", [0, 65500, 100000])
def test_request_text_fits_storage_and_records_truncation(length, metadata_size):
    path = "/" + "x" * (length - 1)
    agent = "a" * length
    request = Request({"type": "http", "method": "GET", "path": path,
                       "headers": [(b"user-agent", agent.encode())], "query_string": b""})
    payload = asyncio.run(build_audit_payload(
        service_name="test", request=request, status_code=200, token_key="test",
        token_algorithm="HS256", token_issuer="test", token_audience="test", token_key_id="test",
        details={"document": "x" * metadata_size} if metadata_size else None,
    ))
    assert payload["request_path"] == path[:512]
    assert payload["user_agent"] == agent[:512]
    if length == 512 and not metadata_size:
        assert payload["details"] is None
    elif length > 512:
        markers = payload["details"]["audit_truncated_fields"]
        for field, original in [("request_path", path), ("user_agent", agent)]:
            assert markers[field] == {"original_characters": length, "retained_characters": 512,
                                      "sha256": hashlib.sha256(original.encode()).hexdigest()}
        assert len(json.dumps(payload["details"]).encode()) <= 65536


@pytest.mark.parametrize("sequence", [list, tuple])
def test_audit_redacts_custom_details_and_field_changes_without_mutating_callers(sequence):
    details = {"context": sequence([{"api_key": "secret-key", "label": "kept"}])}
    changes = {"password": {"from": "old-secret", "to": "new-secret"},
               "title": {"from": "old title", "to": "new title"}}
    request = Request({"type": "http", "method": "POST", "path": "/items",
                       "headers": [], "query_string": b"token=query-secret&sort=name"})
    payload = asyncio.run(build_audit_payload(
        service_name="test", request=request, status_code=200, token_key="test",
        token_algorithm="HS256", token_issuer="test", token_audience="test",
        token_key_id="test", details=details, changes=changes,
    ))
    encoded = json.dumps(payload)
    assert "secret" not in encoded
    assert payload["details"] == {"query": {"sort": "name"}, "context": [{"label": "kept"}]}
    assert payload["changes"] == {"title": {"from": "old title", "to": "new title"}}
    assert details["context"][0]["api_key"] == "secret-key"
    assert changes["password"]["to"] == "new-secret"


@pytest.mark.parametrize("sequence", [list, tuple])
def test_persistence_redacts_legacy_producer_data(sequence):
    payload = {"details": {"nested": sequence([{"refresh_token": "secret", "value": 1}])},
               "changes": {"client_secret": {"from": "secret"}, "enabled": {"to": True}}}
    entry = _audit_log_from_payload(payload, lambda **values: values)
    assert entry["details"] == {"nested": [{"value": 1}]}
    assert entry["changes"] == {"enabled": {"to": True}}
    assert payload["details"]["nested"][0]["refresh_token"] == "secret"


def test_legacy_payload_text_is_bounded_before_storage():
    payload = {
        "service_name": "s" * 100,
        "action": "a" * 200,
        "resource_type": "r" * 100,
        "resource_id": "i" * 100,
        "request_method": "m" * 30,
        "request_path": "p" * 700,
        "route_name": "n" * 300,
        "session_jti": "j" * 100,
        "ip_address": "1" * 60,
        "user_agent": "u" * 700,
        "error_message": "e" * 5000,
    }
    entry = _audit_log_from_payload(payload, lambda **values: values)
    limits = {
        "service_name": 64, "action": 128, "resource_type": 64,
        "resource_id": 64, "request_method": 16, "request_path": 512,
        "route_name": 255, "session_jti": 64, "ip_address": 45,
        "user_agent": 512, "error_message": 4096,
    }
    assert {field: len(entry[field]) for field in limits} == limits
    assert len(payload["error_message"]) == 5000


@pytest.mark.parametrize("size", [16384, 16385])
def test_automatic_request_body_capture_has_explicit_byte_limit(size):
    # An exact byte boundary, including JSON quoting and non-ASCII UTF-8.
    prefix = b'{"text":"'
    suffix = b'"}'
    unicode_text = "é".encode("utf-8")
    body = prefix + unicode_text + b"x" * (size - len(prefix) - len(suffix) - len(unicode_text)) + suffix

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    request = Request({"type": "http", "method": "POST", "path": "/documents",
                       "headers": [(b"content-type", b"application/json")], "query_string": b""}, receive)
    details = asyncio.run(_extract_request_details(request))
    if size == 16384:
        assert details == {"request_body": json.loads(body)}
    else:
        assert details == {"request_body_omitted": {"reason": "size_limit", "bytes": 16385, "limit_bytes": 16384}}


def test_deep_request_body_is_bounded_before_recursive_redaction():
    # Small enough for the body-byte cap, but beyond metadata traversal depth.
    body = b'[' * 100 + b'{"password":"secret"}' + b']' * 100

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    request = Request({"type": "http", "method": "POST", "path": "/documents",
                       "headers": [(b"content-type", b"application/json")], "query_string": b""}, receive)
    payload = asyncio.run(build_audit_payload(
        service_name="test", request=request, status_code=400, token_key="test",
        token_algorithm="HS256", token_issuer="test", token_audience="test", token_key_id="test",
    ))
    assert payload["status_code"] == 400
    assert payload["details"] == {"request_body": {"audit_metadata_omitted": {"reason": "depth_limit"}}}
    assert "secret" not in json.dumps(payload)


@pytest.mark.parametrize("oversized", [False, True])
def test_manual_logger_sanitizes_both_structured_log_and_redis(caplog, oversized):
    client = AsyncMock()
    details = {"api_key": "never-log-this", "label": "kept"}
    if oversized:
        details["document"] = "x" * 100000
    with caplog.at_level("INFO", logger="audit"):
        entry = asyncio.run(AuditLogger(redis_client=client).log("item.change", details=details))
    record = json.loads(caplog.records[-1].message)
    queued = json.loads(client.lpush.call_args.args[1])
    assert record == queued == entry.to_dict()
    assert record["action"] == "item.change"
    if oversized:
        assert record["details"] == {"audit_metadata_omitted": {"reason": "size_limit"}}
    else:
        assert record["details"] == {"label": "kept"}
    assert "never-log-this" not in caplog.text
    assert details["api_key"] == "never-log-this"


def test_decorator_failure_does_not_log_exception_payload(monkeypatch, caplog):
    monkeypatch.setattr(audit_module._default_logger, "log", AsyncMock(
        side_effect=RuntimeError("credential=never-log-this"),
    ))

    @audit_module.audit_action("item.change")
    async def operation():
        return {"id": "kept"}

    assert asyncio.run(operation()) == {"id": "kept"}
    assert "never-log-this" not in caplog.text
    assert caplog.records[-1].error_type == "RuntimeError"
    assert caplog.records[-1].exc_info is None


def test_null_in_user_agent_is_replaced_with_explicit_evidence():
    request = Request({"type": "http", "method": "GET", "path": "/items",
                       "headers": [(b"user-agent", b"bad\x00agent")], "query_string": b""})
    payload = asyncio.run(build_audit_payload(
        service_name="test", request=request, status_code=400, token_key="test",
        token_algorithm="HS256", token_issuer="test", token_audience="test", token_key_id="test",
    ))
    assert payload["user_agent"] == "bad\ufffdagent"
    assert payload["details"]["audit_truncated_fields"]["user_agent"] == {
        "original_characters": 9, "retained_characters": 9, "invalid_characters_replaced": 1,
        "sha256": hashlib.sha256(b"bad\x00agent").hexdigest(),
    }
