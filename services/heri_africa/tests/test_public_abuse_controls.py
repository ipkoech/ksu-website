from __future__ import annotations

import importlib
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from app.models.submissions import CommandIdempotency
from app.routes.v1 import analytics as analytics_module
from app.routes.v1 import submissions as submissions_module
from app.routes.v1.submissions import SubmissionCommandClaim
from app.schemas.submissions import ContactSubmission

rate_limit_module = importlib.import_module("ksu_common.rate_limit")


def _request(
    path: str,
    *,
    host: str = "203.0.113.20",
    idempotency_key: str | None = None,
) -> Request:
    headers = [(b"host", b"testserver")]
    if idempotency_key:
        headers.append((b"idempotency-key", idempotency_key.encode()))
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": path,
            "headers": headers,
            "client": (host, 1234),
        }
    )


class _SubmissionDB:
    def __init__(self) -> None:
        self.items: list[object] = []

    def add(self, item: object) -> None:
        self.items.append(item)

    async def execute(self, query):  # pragma: no cover - exercised by dedupe tests
        return SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: self.items))


def _fake_redis() -> MagicMock:
    redis = MagicMock()
    redis.eval = AsyncMock(return_value=[1, 1, 0])
    return redis


def _contact() -> ContactSubmission:
    return ContactSubmission(
        consent=True,
        name="A Visitor",
        email="visitor@example.com",
        message="Please contact me about the programme.",
    )


@pytest.mark.asyncio
async def test_public_submission_fails_closed_when_redis_is_unavailable(monkeypatch):
    monkeypatch.setattr(
        rate_limit_module,
        "get_redis",
        AsyncMock(side_effect=RuntimeError("redis unavailable")),
    )
    db = _SubmissionDB()
    endpoint = next(
        route.endpoint
        for route in submissions_module.router.routes
        if route.path == "/contact" and "POST" in route.methods
    )

    with pytest.raises(HTTPException) as exc_info:
        await endpoint(_contact(), _request("/contact"), db)

    assert exc_info.value.status_code == 503
    assert exc_info.value.headers["Retry-After"] == "5"


@pytest.mark.asyncio
async def test_submission_idempotency_key_does_not_create_duplicate(monkeypatch):
    redis = _fake_redis()
    monkeypatch.setattr(
        rate_limit_module,
        "get_redis",
        AsyncMock(return_value=redis),
    )
    record = CommandIdempotency(
        command_name="heri.submission.contact",
        scope="email:visitor@example.com",
        idempotency_key="contact-2026-0001",
        request_fingerprint="a" * 64,
    )
    monkeypatch.setattr(
        submissions_module,
        "_acquire_json_submission_command",
        AsyncMock(return_value=SubmissionCommandClaim(kind="started", record=record)),
    )
    db = _SubmissionDB()
    endpoint = next(
        route.endpoint
        for route in submissions_module.router.routes
        if route.path == "/contact" and "POST" in route.methods
    )
    request = _request("/contact", idempotency_key="contact-2026-0001")

    response = await endpoint(_contact(), request, db)

    assert isinstance(response, JSONResponse)
    assert response.status_code == 202
    assert json.loads(response.body)["status"] == "received"
    assert len(db.items) == 1
    assert record.state == "completed"
    assert record.status_code == 202


@pytest.mark.asyncio
async def test_public_submission_requires_explicit_idempotency_key(monkeypatch):
    redis = _fake_redis()
    monkeypatch.setattr(
        rate_limit_module,
        "get_redis",
        AsyncMock(return_value=redis),
    )
    db = _SubmissionDB()
    endpoint = next(
        route.endpoint
        for route in submissions_module.router.routes
        if route.path == "/contact" and "POST" in route.methods
    )

    with pytest.raises(HTTPException) as exc_info:
        await endpoint(_contact(), _request("/contact"), db)

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Idempotency-Key header is required"
    assert db.items == []


@pytest.mark.asyncio
async def test_public_submission_replays_terminal_response_without_creating_again(monkeypatch):
    redis = _fake_redis()
    monkeypatch.setattr(
        rate_limit_module,
        "get_redis",
        AsyncMock(return_value=redis),
    )
    replay = JSONResponse(
        status_code=202,
        content={"status": "received", "message": "Thank you. The HERI Africa team will respond soon."},
    )
    monkeypatch.setattr(
        submissions_module,
        "_acquire_json_submission_command",
        AsyncMock(return_value=replay),
    )
    db = _SubmissionDB()
    endpoint = next(
        route.endpoint
        for route in submissions_module.router.routes
        if route.path == "/contact" and "POST" in route.methods
    )

    response = await endpoint(_contact(), _request("/contact", idempotency_key="contact-2026-0001"), db)

    assert response is replay
    assert db.items == []


@pytest.mark.asyncio
async def test_analytics_route_has_rate_limit_and_body_limit(monkeypatch):
    redis = _fake_redis()
    monkeypatch.setattr(
        rate_limit_module,
        "get_redis",
        AsyncMock(return_value=redis),
    )
    endpoint = next(
        route.endpoint
        for route in analytics_module.router.routes
        if route.path == "/analytics/events" and "POST" in route.methods
    )

    request = _request("/analytics/events")
    payload = SimpleNamespace(
        event_name="cta_click",
        path="/contact",
        session_id="session-1",
        properties={},
        model_dump=lambda: {
            "event_name": "cta_click",
            "path": "/contact",
            "session_id": "session-1",
            "properties": {},
        },
    )
    db = _SubmissionDB()

    response = await endpoint(payload, request, db)
    assert response["status"] == "accepted"
    assert len(db.items) == 1


@pytest.mark.asyncio
async def test_analytics_without_explicit_idempotency_key_records_repeated_events(monkeypatch):
    redis = _fake_redis()
    monkeypatch.setattr(
        rate_limit_module,
        "get_redis",
        AsyncMock(return_value=redis),
    )
    endpoint = next(
        route.endpoint
        for route in analytics_module.router.routes
        if route.path == "/analytics/events" and "POST" in route.methods
    )

    request = _request("/analytics/events")
    payload = SimpleNamespace(
        event_name="cta_click",
        path="/contact",
        session_id="session-1",
        properties={},
    )
    db = _SubmissionDB()

    first = await endpoint(payload, request, db)
    second = await endpoint(payload, request, db)

    assert first == {"status": "accepted"}
    assert second == {"status": "accepted"}
    assert len(db.items) == 2


@pytest.mark.asyncio
async def test_analytics_replays_only_when_client_supplies_idempotency_key(monkeypatch):
    redis = _fake_redis()
    monkeypatch.setattr(
        rate_limit_module,
        "get_redis",
        AsyncMock(return_value=redis),
    )
    endpoint = next(
        route.endpoint
        for route in analytics_module.router.routes
        if route.path == "/analytics/events" and "POST" in route.methods
    )

    request = _request("/analytics/events", idempotency_key="analytics-2026-0001")
    payload = SimpleNamespace(
        event_name="cta_click",
        path="/contact",
        session_id="session-1",
        properties={},
    )
    db = _SubmissionDB()

    first = await endpoint(payload, request, db)
    second = await endpoint(payload, request, db)

    assert first == {"status": "accepted"}
    assert second == {"status": "accepted", "duplicate": True}
    assert len(db.items) == 1
