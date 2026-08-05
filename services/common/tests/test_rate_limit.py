from __future__ import annotations

import importlib
import math

import pytest
from fastapi import FastAPI, HTTPException, Request, Response

from ksu_common.rate_limit import (
    RateLimitExceeded,
    RateLimiter,
    get_rate_limit_metrics,
    rate_limit,
)

rate_limit_module = importlib.import_module("ksu_common.rate_limit")


def test_request_body_limit_middleware_is_available_from_shared_package():
    from ksu_common import install_request_body_limit_middleware

    assert callable(install_request_body_limit_middleware)


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
        self.key = ""
        self.window_start = 0
        self.member = ""
        self.score = 0

    def zremrangebyscore(self, key: str, minimum: int, maximum: int) -> "_FakePipeline":
        self.redis.commands.append(("zremrangebyscore", key, minimum, maximum))
        self.key = key
        self.window_start = maximum
        return self

    def zadd(self, key: str, values: dict[str, int]) -> "_FakePipeline":
        self.redis.commands.append(("zadd", key, values))
        self.key = key
        self.member, self.score = next(iter(values.items()))
        return self

    def zcard(self, key: str) -> "_FakePipeline":
        self.redis.commands.append(("zcard", key))
        return self

    def expire(self, key: str, seconds: int) -> "_FakePipeline":
        self.redis.commands.append(("expire", key, seconds))
        return self

    async def execute(self) -> list[int | bool]:
        bucket = self.redis.records.setdefault(self.key, [])
        bucket[:] = [(member, score) for member, score in bucket if score > self.window_start]
        bucket.append((self.member, self.score))
        return [0, 1, len(bucket), True]


class _FakeRedis:
    def __init__(self) -> None:
        self.commands: list[tuple[object, ...]] = []
        self.pipeline_transactions: list[bool] = []
        self.eval_calls: list[tuple[object, ...]] = []
        self.records: dict[str, list[tuple[str, int]]] = {}

    def pipeline(self, transaction: bool = True) -> _FakePipeline:
        self.pipeline_transactions.append(transaction)
        return _FakePipeline(self)

    async def eval(
        self,
        script: str,
        numkeys: int,
        key: str,
        now: int,
        window: int,
        limit: int,
        member: str,
    ) -> list[int]:
        self.eval_calls.append((script, numkeys, key, now, window, limit, member))
        bucket = self.records.setdefault(key, [])
        window_start = now - window
        bucket[:] = [(entry, score) for entry, score in bucket if score > window_start]

        current_count = len(bucket)
        if current_count >= limit:
            retry_after = max(1, math.ceil(bucket[0][1] + window - now))
            return [0, current_count, retry_after]

        bucket.append((member, now))
        return [1, current_count + 1, 0]

    async def zrange(
        self, key: str, start: int, end: int, *, withscores: bool
    ) -> list[tuple[str, int]]:
        bucket = self.records.get(key, [])
        return bucket[start : end + 1]


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


async def _asgi_post(
    app: FastAPI,
    path: str,
    chunks: list[bytes],
    headers: list[tuple[bytes, bytes]] | None = None,
) -> list[dict[str, object]]:
    request_messages = [
        {"type": "http.request", "body": chunk, "more_body": index < len(chunks) - 1}
        for index, chunk in enumerate(chunks)
    ]
    sent: list[dict[str, object]] = []

    async def receive() -> dict[str, object]:
        if request_messages:
            return request_messages.pop(0)
        return {"type": "http.disconnect"}

    async def send(message: dict[str, object]) -> None:
        sent.append(message)

    await app(
        {
            "type": "http",
            "asgi": {"version": "3.0"},
            "http_version": "1.1",
            "method": "POST",
            "scheme": "http",
            "path": path,
            "raw_path": path.encode(),
            "query_string": b"",
            "headers": [(b"content-type", b"application/json"), *(headers or [])],
            "client": ("203.0.113.10", 1234),
            "server": ("testserver", 80),
        },
        receive,
        send,
    )
    return sent


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
    assert exc_info.value.headers["Retry-After"] == "60"
    assert len(redis.eval_calls) == 3


@pytest.mark.asyncio
async def test_atomic_limiter_does_not_record_rejected_requests(monkeypatch):
    redis = _FakeRedis()
    now = [100]
    monkeypatch.setattr(rate_limit_module.time, "time", lambda: now[0])

    async def get_fake_redis() -> _FakeRedis:
        return redis

    limiter = RateLimiter(
        requests=1,
        window=60,
        prefix="test-rejected-request",
        redis_provider=get_fake_redis,
    )

    assert await limiter.is_allowed("client", "POST:/write") == (True, 0, 0)
    now[0] = 110
    assert await limiter.is_allowed("client", "POST:/write") == (False, 0, 50)
    now[0] = 160

    assert await limiter.is_allowed("client", "POST:/write") == (True, 0, 0)


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
async def test_direct_handler_call_satisfies_required_request_without_using_redis():
    called_with = None

    @rate_limit(requests=1, window=60, prefix="test-direct-call")
    async def endpoint(request: Request):
        nonlocal called_with
        called_with = request
        return {"ok": True}

    assert await endpoint() == {"ok": True}
    assert isinstance(called_with, Request)
    assert called_with.url.path.startswith("/__direct_test__/")


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


@pytest.mark.asyncio
async def test_body_limit_runtime_middleware_rejects_chunked_body_before_parsing(monkeypatch):
    redis = _FakeRedis()

    async def get_fake_redis() -> _FakeRedis:
        return redis

    monkeypatch.setattr(rate_limit_module, "get_redis", get_fake_redis)
    app = FastAPI()
    calls: list[dict[str, object]] = []

    @app.post("/payload")
    @rate_limit(requests=5, window=60, prefix="test-runtime-body", max_body_bytes=4)
    async def endpoint(payload: dict[str, object], request: Request) -> Response:
        calls.append(payload)
        return Response(status_code=204, headers={"X-Existing": "preserved"})

    rate_limit_module.install_request_body_limit_middleware(app)

    allowed = await _asgi_post(app, "/payload", [b"{}"])
    allowed_start = next(message for message in allowed if message["type"] == "http.response.start")
    allowed_headers = dict(allowed_start["headers"])
    assert allowed_start["status"] == 204
    assert allowed_headers[b"x-existing"] == b"preserved"
    assert allowed_headers[b"x-ratelimit-remaining"] == b"4"

    malformed = await _asgi_post(
        app,
        "/payload",
        [b"{}"],
        headers=[(b"content-length", b"not-a-number")],
    )
    malformed_start = next(message for message in malformed if message["type"] == "http.response.start")
    assert malformed_start["status"] == 400

    rejected = await _asgi_post(app, "/payload", [b'{"', b'value":"large"}'])
    rejected_start = next(message for message in rejected if message["type"] == "http.response.start")
    assert rejected_start["status"] == 413
    assert calls == [{}]
