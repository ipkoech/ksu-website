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
import time
from functools import wraps
from typing import Callable

from fastapi import HTTPException, Request, status

from .cache import get_redis


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


class RateLimiter:
    """Token bucket rate limiter backed by Redis."""

    def __init__(
        self,
        requests: int = 100,
        window: int = 60,
        prefix: str = "rl",
    ):
        self.requests = requests
        self.window = window
        self.prefix = prefix

    def _make_key(self, identifier: str, endpoint: str) -> str:
        """Create a unique Redis key for this limiter."""
        raw = f"{self.prefix}:{endpoint}:{identifier}"
        return f"ratelimit:{hashlib.sha256(raw.encode()).hexdigest()[:16]}"

    async def is_allowed(self, identifier: str, endpoint: str) -> tuple[bool, int, int]:
        """Check if request is allowed.

        Returns:
            (allowed, remaining, retry_after)
        """
        try:
            redis = await get_redis()
            key = self._make_key(identifier, endpoint)
            now = int(time.time())
            window_start = now - self.window

            pipe = redis.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, self.window)
            results = await pipe.execute()

            current_count = results[2]
            remaining = max(0, self.requests - current_count)

            if current_count > self.requests:
                oldest = await redis.zrange(key, 0, 0, withscores=True)
                if oldest:
                    retry_after = int(oldest[0][1]) + self.window - now
                    return False, 0, max(1, retry_after)
                return False, 0, self.window

            return True, remaining, 0

        except Exception:
            return True, self.requests, 0

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
):
    """Decorator to apply rate limiting to an endpoint.

    Args:
        requests: Max requests allowed in the window
        window: Time window in seconds
        key_func: Custom function to extract rate limit key from request
        by_user: If True, rate limit by user ID instead of IP
        prefix: Redis key prefix
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
                return await func(*args, **kwargs)

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
