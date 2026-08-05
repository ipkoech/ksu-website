from __future__ import annotations

import importlib

import pytest
from fastapi import HTTPException, Request, Response

from ksu_common.rate_limit import (
    RateLimitExceeded,
    RateLimiter,
    get_rate_limit_metrics,
    rate_limit,
)

rate_limit_module = importlib.import_module("ksu_common.rate_limit")


def _request(path: str = "/public/write", host: str = "203.0.113.10") -> Request:
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": path,
            "headers": [(b"host", b"testserver")],
            "client": (host, 1234),
        }
    )


async def _unavailable_redis():
    raise ConnectionError("redis unavailable")


class _FakePipeline:
    def __init__(self, redis: "_FakeRedis") -> None:
        self.redis = redis

    def zremrangebyscore(self, key: str, minimum: int, maximum: int) -> "_FakePipeline":
        self.redis.commands.append(("zremrangebyscore", key, minimum, maximum))
        return self

    def zadd(self, key: str, values: dict[str, int]) -> "_FakePipeline":
        self.redis.commands.append(("zadd", key, values))
        return self

    def zcard(self, key: str) -> "_FakePipeline":
        self.redis.commands.append(("zcard", key))
        return self

    def expire(self, key: str, seconds: int) -> "_FakePipeline":
        self.redis.commands.append(("expire", key, seconds))
        return self

    async def execute(self) -> list[int | bool]:
        self.redis.count += 1
        return [0, 1, self.redis.count, True]


class _FakeRedis:
    def __init__(self) -> None:
        self.commands: list[tuple[object, ...]] = []
        self.count = 0
        self.pipeline_transactions: list[bool] = []

    def pipeline(self, transaction: bool = True) -> _FakePipeline:
        self.pipeline_transactions.append(transaction)
        return _FakePipeline(self)

    async def zrange(
        self, key: str, start: int, end: int, *, withscores: bool
    ) -> list[tuple[str, int]]:
        return [("oldest", 0)]


def _request_with_body(body: bytes, *, include_content_length: bool) -> Request:
    received = False

    async def receive() -> dict[str, object]:
        nonlocal received
        if received:
            return {"type": "http.disconnect"}
        received = True
        return {"type": "http.request", "body": body, "more_body": False}

    headers = [(b"host", b"testserver")]
    if include_content_length:
        headers.append((b"content-length", str(len(body)).encode()))
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/public/write",
            "headers": headers,
            "client": ("203.0.113.10", 1234),
        },
        receive=receive,
    )


@pytest.mark.asyncio
async def test_limiter_fails_closed_when_injected_redis_provider_is_unavailable(caplog):
    limiter = RateLimiter(
        requests=2,
        window=60,
        prefix="test-unavailable",
        redis_provider=_unavailable_redis,
    )

    with pytest.raises(HTTPException) as exc_info:
        await limiter.check("client", "POST:/write")

    assert exc_info.value.status_code == 503
    assert exc_info.value.headers == {"Retry-After": "5"}
    assert "rate_limit_backend_unavailable" in caplog.text
    assert get_rate_limit_metrics()["backend_unavailable"] >= 1


@pytest.mark.asyncio
async def test_limiter_uses_injected_redis_for_atomic_success_and_denial():
    redis = _FakeRedis()

    async def get_fake_redis() -> _FakeRedis:
        return redis

    limiter = RateLimiter(
        requests=2,
        window=60,
        prefix="test-fake",
        redis_provider=get_fake_redis,
    )

    assert await limiter.is_allowed("client", "POST:/write") == (True, 1, 0)
    assert await limiter.is_allowed("client", "POST:/write") == (True, 0, 0)
    with pytest.raises(RateLimitExceeded) as exc_info:
        await limiter.check("client", "POST:/write")

    assert exc_info.value.status_code == 429
    assert exc_info.value.headers["Retry-After"] == "1"
    assert redis.pipeline_transactions == [True, True, True]


@pytest.mark.asyncio
async def test_rate_limit_keys_separate_service_and_endpoint():
    limiter = RateLimiter(requests=1, window=60, prefix="service-a")
    other_service = RateLimiter(requests=1, window=60, prefix="service-b")

    assert limiter._make_key("same-client", "POST:/same") != other_service._make_key(
        "same-client", "POST:/same"
    )
    assert limiter._make_key("same-client", "POST:/same") != limiter._make_key(
        "same-client", "POST:/other"
    )


@pytest.mark.asyncio
async def test_decorator_returns_503_when_redis_is_unavailable(monkeypatch):
    monkeypatch.setattr(rate_limit_module, "get_redis", _unavailable_redis)

    @rate_limit(requests=1, window=60, prefix="test-route")
    async def endpoint(request: Request):
        return {"ok": True}

    with pytest.raises(HTTPException) as exc_info:
        await endpoint(_request())

    assert exc_info.value.status_code == 503
    assert exc_info.value.headers["Retry-After"] == "5"


@pytest.mark.asyncio
async def test_decorator_preserves_body_limits_and_rate_limit_headers(monkeypatch):
    redis = _FakeRedis()

    async def get_fake_redis() -> _FakeRedis:
        return redis

    monkeypatch.setattr(rate_limit_module, "get_redis", get_fake_redis)

    @rate_limit(requests=5, window=60, prefix="test-body", max_body_bytes=4)
    async def body_endpoint(request: Request):
        return {"ok": True}

    for request in (
        _request_with_body(b"12345", include_content_length=True),
        _request_with_body(b"12345", include_content_length=False),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await body_endpoint(request)
        assert exc_info.value.status_code == 413

    @rate_limit(requests=5, window=60, prefix="test-headers")
    async def header_endpoint(request: Request) -> Response:
        return Response(status_code=204, headers={"X-Existing": "preserved"})

    response = await header_endpoint(_request("/public/read"))

    assert response.headers["X-Existing"] == "preserved"
    assert response.headers["X-RateLimit-Limit"] == "5"
    assert response.headers["X-RateLimit-Remaining"] == "4"
    assert response.headers["X-RateLimit-Window"] == "60"
