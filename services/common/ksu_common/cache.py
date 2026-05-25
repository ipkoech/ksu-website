"""Redis-backed response caching for FastAPI.

Usage:
    from ksu_common.cache import cached_public, cache_response, get_redis

    @router.get("/items")
    @cached_public(timeout=300, vary_on=("page", "per_page", "search"))
    async def list_items(...):
        ...

    @router.get("/my/items")
    @cache_response(timeout=60)  # varies by user automatically
    async def list_my_items(user: TokenPayload = Depends(get_current_user)):
        ...
"""

from __future__ import annotations

import hashlib
import json
import os
from functools import wraps
from typing import Any, Callable, Sequence

import redis.asyncio as redis
from fastapi import Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

_redis_client: redis.Redis | None = None


async def get_redis() -> redis.Redis:
    """Get or create Redis client singleton."""
    global _redis_client
    if _redis_client is None:
        url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        _redis_client = redis.from_url(url, decode_responses=True)
    return _redis_client


async def close_redis() -> None:
    """Close Redis connection — call on app shutdown."""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None


def _build_cache_key(
    prefix: str,
    request: Request,
    vary_on: Sequence[str],
    user_id: str | None = None,
) -> str:
    """Build a unique cache key from request path and query params."""
    parts = [prefix, request.url.path]

    if user_id:
        parts.append(f"user:{user_id}")

    params = request.query_params
    for key in sorted(vary_on):
        value = params.get(key)
        if value is not None:
            parts.append(f"{key}:{value}")

    key_str = "|".join(parts)
    return f"cache:{hashlib.sha256(key_str.encode()).hexdigest()[:16]}"


def cached_public(
    timeout: int = 300,
    vary_on: Sequence[str] = (),
    prefix: str = "public",
):
    """Cache decorator for public endpoints (no user variation).

    Args:
        timeout: Cache TTL in seconds (default 5 minutes)
        vary_on: Query params that affect the response (e.g., page, search)
        prefix: Cache key prefix for namespacing
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Response:
            request: Request | None = kwargs.get("request")
            if request is None:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            if request is None:
                return await func(*args, **kwargs)

            try:
                client = await get_redis()
                cache_key = _build_cache_key(prefix, request, vary_on)

                cached = await client.get(cache_key)
                if cached:
                    return JSONResponse(
                        content=json.loads(cached),
                        headers={"X-Cache": "HIT"},
                    )

                result = await func(*args, **kwargs)

                if isinstance(result, dict):
                    encoded_result = jsonable_encoder(result)
                    await client.setex(cache_key, timeout, json.dumps(encoded_result))
                    return JSONResponse(content=encoded_result, headers={"X-Cache": "MISS"})
                elif isinstance(result, Response):
                    return result

                return result

            except redis.RedisError:
                return await func(*args, **kwargs)

        return wrapper

    return decorator


def cache_response(
    timeout: int = 60,
    vary_on: Sequence[str] = (),
    prefix: str = "user",
):
    """Cache decorator for authenticated endpoints (varies by user).

    The user_id is extracted from the 'user' or '_user' kwarg (TokenPayload).
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Response:
            request: Request | None = kwargs.get("request")
            if request is None:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break

            user = kwargs.get("user") or kwargs.get("_user")
            user_id = getattr(user, "sub", None) if user else None

            if request is None:
                return await func(*args, **kwargs)

            try:
                client = await get_redis()
                cache_key = _build_cache_key(prefix, request, vary_on, user_id=user_id)

                cached = await client.get(cache_key)
                if cached:
                    return JSONResponse(
                        content=json.loads(cached),
                        headers={"X-Cache": "HIT"},
                    )

                result = await func(*args, **kwargs)

                if isinstance(result, dict):
                    encoded_result = jsonable_encoder(result)
                    await client.setex(cache_key, timeout, json.dumps(encoded_result))
                    return JSONResponse(content=encoded_result, headers={"X-Cache": "MISS"})

                return result

            except redis.RedisError:
                return await func(*args, **kwargs)

        return wrapper

    return decorator


async def invalidate_cache(pattern: str = "cache:*") -> int:
    """Delete cache keys matching pattern. Returns count deleted."""
    try:
        client = await get_redis()
        keys = []
        async for key in client.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            return await client.delete(*keys)
        return 0
    except redis.RedisError:
        return 0


async def invalidate_prefix(prefix: str) -> int:
    """Delete all cache keys with given prefix."""
    return await invalidate_cache(f"cache:{prefix}*")
