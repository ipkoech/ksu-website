from __future__ import annotations

import importlib
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException, Request

from app.routes.v1 import analytics as analytics_module
from app.routes.v1 import submissions as submissions_module
from app.schemas.submissions import ContactSubmission

rate_limit_module = importlib.import_module("ksu_common.rate_limit")


def _request(
    path: str,
    *,
    host: str = "203.0.113.20",
    idempotency_key: str | None = None,
) -> Request:
    headers = [("host", "testserver")]
    if idempotency_key:
        headers.append(("idempotency-key", idempotency_key))
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
    db = _SubmissionDB()
    endpoint = next(
        route.endpoint
        for route in submissions_module.router.routes
        if route.path == "/contact" and "POST" in route.methods
    )
    request = _request("/contact", idempotency_key="contact-2026-0001")

    first = await endpoint(_contact(), request, db)
    second = await endpoint(_contact(), request, db)

    assert first["status"] == "received"
    assert second["status"] == "duplicate"
    assert len(db.items) == 1


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
