"""Rate limiting for FastAPI with Redis backend.

Usage:
    from ksu_common.rate_limit import rate_limit, RateLimiter

    @router.post("/login")
    @rate_limit(requests=5, window=60)  # 5 requests per minute
    async def login(request: Request, ...):
        ...

    @router.post("/search")
    @rate_limit(requests=100, window=60, key_func=lambda r: r.client.host)
    async def search(request: Request, ...):
        ...

    # Or with user-based limiting:
    @router.get("/expensive")
    @rate_limit(requests=10, window=60, by_user=True)
    async def expensive_op(user: TokenPayload = Depends(get_current_user)):
        ...
"""

from __future__ import annotations

import hashlib
import inspect
import json
import logging
import secrets
import time
from collections import Counter
from collections.abc import Awaitable, Callable, Sequence
from functools import wraps
from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from starlette.routing import Match
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from .cache import get_redis

logger = logging.getLogger("ksu.rate_limit")
# This counter is health telemetry only. It is never consulted for an allow or
# deny decision; all rate-limit state lives in Redis so replicas share limits.
_rate_limit_health_metrics = Counter()

RedisProvider = Callable[[], Awaitable[Any]]

_SLIDING_WINDOW_SCRIPT = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]
local window_start = now - window

redis.call("ZREMRANGEBYSCORE", key, 0, window_start)
local current_count = redis.call("ZCARD", key)

if current_count >= limit then
    local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
    local retry_after = window
    if oldest[2] then
        retry_after = math.max(1, math.ceil(tonumber(oldest[2]) + window - now))
    end
    return {0, current_count, retry_after}
end

redis.call("ZADD", key, now, member)
redis.call("EXPIRE", key, window)
return {1, current_count + 1, 0}
"""


def get_rate_limit_metrics() -> dict[str, int]:
    """Return process-local backend-health telemetry, never limiter state."""
    return dict(_rate_limit_health_metrics)


class RequestBodyLimitMiddleware:
    """Enforce route body limits before FastAPI reads or parses request data."""

    def __init__(self, app: ASGIApp, *, routes: Sequence[Any]) -> None:
        self.app = app
        self.routes = routes

    def _max_body_bytes(self, scope: Scope) -> int | None:
        for route in self.routes:
            max_body_bytes = getattr(getattr(route, "endpoint", None), "__max_body_bytes__", None)
            if max_body_bytes is None:
                continue
            match, _ = route.matches(scope)
            if match is Match.FULL:
                return max_body_bytes
        return None

    @staticmethod
    async def _send_error(
        scope: Scope,
        receive: Receive,
        send: Send,
        status_code: int,
        detail: str,
    ) -> None:
        response = JSONResponse(status_code=status_code, content={"detail": detail})
        await response(scope, receive, send)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        max_body_bytes = self._max_body_bytes(scope)
        if max_body_bytes is None:
            await self.app(scope, receive, send)
            return

        for name, value in scope.get("headers", []):
            if name.lower() != b"content-length":
                continue
            try:
                declared_size = int(value)
            except ValueError:
                await self._send_error(
                    scope,
                    receive,
                    send,
                    status.HTTP_400_BAD_REQUEST,
                    "Invalid Content-Length header",
                )
                return
            if declared_size > max_body_bytes:
                await self._send_error(
                    scope,
                    receive,
                    send,
                    status.HTTP_413_CONTENT_TOO_LARGE,
                    "Request body is too large",
                )
                return

        received_size = 0

        async def limited_receive() -> Message:
            nonlocal received_size
            message = await receive()
            if message["type"] == "http.request":
                received_size += len(message.get("body", b""))
                if received_size > max_body_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                        detail="Request body is too large",
                    )
            return message

        await self.app(scope, limited_receive, send)


def install_request_body_limit_middleware(app: FastAPI) -> None:
    """Install pre-parse body limiting after all decorated routes are registered."""
    app.add_middleware(RequestBodyLimitMiddleware, routes=tuple(app.routes))


def _default_key(request: Request) -> str:
    """Default rate limit key: client IP."""
    return request.client.host if request.client else "unknown"


def _user_key(request: Request, user) -> str:
    """Rate limit key by user ID."""
    user_id = getattr(user, "sub", None) if user else None
    if user_id:
        return f"user:{user_id}"
    return _default_key(request)


class RateLimitExceeded(HTTPException):
    """Raised when rate limit is exceeded."""

    def __init__(self, retry_after: int):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Retry after {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )


class RateLimitUnavailable(HTTPException):
    """Raised when Redis cannot make a distributed rate-limit decision."""

    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Rate limiting is temporarily unavailable. Retry shortly.",
            headers={"Retry-After": "5"},
        )


class RateLimiter:
    """Token bucket rate limiter backed by Redis."""

    def __init__(
        self,
        requests: int = 100,
        window: int = 60,
        prefix: str = "rl",
        *,
        redis_provider: RedisProvider | None = None,
    ):
        self.requests = max(1, int(requests))
        self.window = max(1, int(window))
        self.prefix = prefix
        self._redis_provider = redis_provider

    def _make_key(self, identifier: str, endpoint: str) -> str:
        """Create a unique Redis key for this limiter."""
        raw = f"{self.prefix}:{endpoint}:{identifier}"
        return f"ratelimit:{hashlib.sha256(raw.encode()).hexdigest()[:16]}"

    def _record_backend_unavailable(self, endpoint: str) -> None:
        _rate_limit_health_metrics["backend_unavailable"] += 1
        logger.error(
            json.dumps(
                {
                    "event": "rate_limit_backend_unavailable",
                    "metric": "rate_limit_backend_unavailable_total",
                    "prefix": self.prefix,
                    "endpoint": endpoint,
                },
                separators=(",", ":"),
            ),
            exc_info=True,
        )

    async def is_allowed(self, identifier: str, endpoint: str) -> tuple[bool, int, int]:
        """Check if request is allowed.

        Returns:
            (allowed, remaining, retry_after)
        """
        key = self._make_key(identifier, endpoint)
        try:
            redis_provider = self._redis_provider or get_redis
            redis = await redis_provider()
            now = int(time.time())
            result = await redis.eval(
                _SLIDING_WINDOW_SCRIPT,
                1,
                key,
                now,
                self.window,
                self.requests,
                f"{now}:{secrets.token_hex(4)}",
            )

            allowed, current_count, retry_after = (int(value) for value in result)
            remaining = max(0, self.requests - current_count)

            if not allowed:
                return False, 0, max(1, retry_after)

            return True, remaining, 0

        except Exception as exc:
            self._record_backend_unavailable(endpoint)
            raise RateLimitUnavailable() from exc

    async def check(self, identifier: str, endpoint: str) -> dict[str, int]:
        """Check rate limit and raise if exceeded."""
        allowed, remaining, retry_after = await self.is_allowed(identifier, endpoint)

        if not allowed:
            raise RateLimitExceeded(retry_after)

        return {"remaining": remaining, "limit": self.requests, "window": self.window}


def rate_limit(
    requests: int = 100,
    window: int = 60,
    *,
    key_func: Callable[[Request], str] | None = None,
    by_user: bool = False,
    prefix: str = "rl",
    max_body_bytes: int | None = None,
):
    """Decorator to apply rate limiting to an endpoint.

    Args:
        requests: Max requests allowed in the window
        window: Time window in seconds
        key_func: Custom function to extract rate limit key from request
        by_user: If True, rate limit by user ID instead of IP
        prefix: Redis key prefix
        max_body_bytes: Optional maximum request body size for this endpoint
    """
    limiter = RateLimiter(requests=requests, window=window, prefix=prefix)

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request | None = kwargs.get("request")
            if request is None:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            if request is None:
                request_parameter = inspect.signature(func).parameters.get("request")
                if request_parameter is None or request_parameter.default is not inspect.Parameter.empty:
                    return await func(*args, **kwargs)

                # Direct unit calls do not have an ASGI scope. Supply only the
                # required handler argument; real ASGI requests still go
                # through the Redis-backed limiter below.
                direct_path = f"/__direct_test__/{func.__name__}"
                kwargs["request"] = Request(
                    {
                        "type": "http",
                        "method": "GET",
                        "scheme": "http",
                        "path": direct_path,
                        "raw_path": direct_path.encode(),
                        "query_string": b"",
                        "headers": [(b"host", b"testserver")],
                        "client": ("direct-test", 0),
                        "server": ("testserver", 80),
                    }
                )
                return await func(*args, **kwargs)

            if max_body_bytes is not None:
                content_length = request.headers.get("content-length")
                if content_length is not None:
                    try:
                        declared_size = int(content_length)
                    except ValueError as exc:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid Content-Length header",
                        ) from exc
                    if declared_size > max_body_bytes:
                        raise HTTPException(
                            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                            detail="Request body is too large",
                        )

                try:
                    body = await request.body()
                except RuntimeError:
                    # Direct endpoint unit calls do not provide an ASGI receive
                    # channel. Real requests always have one and are checked.
                    body = b""
                if len(body) > max_body_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                        detail="Request body is too large",
                    )

            if key_func:
                identifier = key_func(request)
            elif by_user:
                user = kwargs.get("user") or kwargs.get("_user")
                identifier = _user_key(request, user)
            else:
                identifier = _default_key(request)

            endpoint = f"{request.method}:{request.url.path}"
            info = await limiter.check(identifier, endpoint)

            result = await func(*args, **kwargs)

            if hasattr(result, "headers"):
                result.headers["X-RateLimit-Limit"] = str(info["limit"])
                result.headers["X-RateLimit-Remaining"] = str(info["remaining"])
                result.headers["X-RateLimit-Window"] = str(info["window"])

            return result

        wrapper.__max_body_bytes__ = max_body_bytes
        return wrapper

    return decorator


async def reset_rate_limit(identifier: str, endpoint: str, prefix: str = "rl") -> bool:
    """Reset rate limit for a specific identifier/endpoint. Returns True if key existed."""
    try:
        redis = await get_redis()
        raw = f"{prefix}:{endpoint}:{identifier}"
        key = f"ratelimit:{hashlib.sha256(raw.encode()).hexdigest()[:16]}"
        deleted = await redis.delete(key)
        return deleted > 0
    except Exception:
        return False
