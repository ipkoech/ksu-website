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

import asyncio
import hashlib
import inspect
import json
import os
import secrets
from contextvars import ContextVar, Token
from functools import wraps
from typing import Any, Callable, Sequence

import redis.asyncio as redis
from fastapi import HTTPException, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from .config import is_production_environment

_redis_client: redis.Redis | None = None
_cache_context: ContextVar[dict[str, Any] | None] = ContextVar("ksu_cache_context", default=None)
_SINGLE_FLIGHT_LOCK_TTL_MS = 30_000
_SINGLE_FLIGHT_RENEW_INTERVAL_SECONDS = 10.0
_SINGLE_FLIGHT_WAIT_SECONDS = 60.0
_SINGLE_FLIGHT_POLL_SECONDS = 0.025
_CACHE_REDIS_FAILURE_MODE_ENV = "KSU_CACHE_REDIS_FAILURE_MODE"
_CACHE_REDIS_FAILURE_MODE_FAIL_CLOSED = "fail_closed"
_CACHE_REDIS_FAILURE_MODE_FALLBACK = "fallback"
_LOCK_RELEASE_SCRIPT = """
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
end
return 0
"""
_LOCK_RENEW_SCRIPT = """
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('pexpire', KEYS[1], ARGV[2])
end
return 0
"""
_LOCK_PUBLISH_SCRIPT = """
if redis.call('get', KEYS[2]) == ARGV[3] then
    redis.call('set', KEYS[1], ARGV[1], 'EX', ARGV[2])
    return redis.call('del', KEYS[2])
end
return 0
"""
_CACHE_MISS = object()


class CacheUnavailable(HTTPException):
    """Raised when a decorated route cannot safely make a cache decision."""

    def __init__(self) -> None:
        super().__init__(
            status_code=503,
            detail="cache-unavailable",
            headers={"Retry-After": "5"},
        )


def begin_cache_context(request: Request) -> Token:
    """Provide decorators access to the current request without route coupling."""
    return _cache_context.set({"request": request, "status": None})


def end_cache_context(token: Token) -> None:
    _cache_context.reset(token)


def get_cache_context() -> dict[str, Any] | None:
    return _cache_context.get()


def _cache_result(value: Any, status: str) -> Any:
    context = get_cache_context()
    if context is not None:
        context["status"] = status
        return value
    return JSONResponse(content=value, headers={"X-Cache": status})


def _cache_redis_failure_mode() -> str:
    configured_mode = os.getenv(_CACHE_REDIS_FAILURE_MODE_ENV, "").strip().lower()
    if configured_mode in {
        _CACHE_REDIS_FAILURE_MODE_FAIL_CLOSED,
        _CACHE_REDIS_FAILURE_MODE_FALLBACK,
    }:
        return configured_mode

    try:
        if is_production_environment(os.getenv("APP_ENV", "development")):
            return _CACHE_REDIS_FAILURE_MODE_FAIL_CLOSED
    except ValueError:
        pass

    return _CACHE_REDIS_FAILURE_MODE_FALLBACK


async def _handle_cache_backend_unavailable(loader: Callable[[], Any]) -> Any:
    if _cache_redis_failure_mode() == _CACHE_REDIS_FAILURE_MODE_FAIL_CLOSED:
        raise CacheUnavailable()
    return await loader()


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
    keys = sorted(vary_on or params.keys())
    for key in keys:
        value = params.get(key)
        if value is not None:
            parts.append(f"{key}:{value}")

    key_str = "|".join(parts)
    key_hash = hashlib.sha256(key_str.encode()).hexdigest()[:16]
    normalized_prefix = prefix.strip(":") or "default"
    return f"cache:{normalized_prefix}:{key_hash}"


def _normalize_cache_value(value: Any) -> Any:
    """Convert route arguments into stable, JSON-safe key fragments."""
    try:
        return jsonable_encoder(value)
    except Exception:
        return str(value)


def _cacheable_json_value(value: Any) -> Any | None:
    """Return a JSON-safe endpoint value, or ``None`` when it is not cacheable."""
    if isinstance(value, Response):
        return None
    try:
        encoded = jsonable_encoder(value)
        json.dumps(encoded)
    except (TypeError, ValueError):
        return None
    return encoded


async def _cached_value(client: redis.Redis, cache_key: str) -> Any:
    cached = await client.get(cache_key)
    if cached:
        return _cache_result(json.loads(cached), "HIT")
    return _CACHE_MISS


async def _release_single_flight_lock(client: redis.Redis, lock_key: str, token: str) -> None:
    """Release a lock only when this request still owns its token."""
    try:
        await client.eval(_LOCK_RELEASE_SCRIPT, 1, lock_key, token)
    except redis.RedisError:
        # A lease expiry bounds any lock left behind by a Redis failure.
        pass


async def _renew_single_flight_lock(
    client: redis.Redis,
    lock_key: str,
    token: str,
    stopped: asyncio.Event,
) -> None:
    """Extend an owned lease while a valid loader is still running."""
    while not stopped.is_set():
        try:
            await asyncio.wait_for(
                stopped.wait(),
                timeout=_SINGLE_FLIGHT_RENEW_INTERVAL_SECONDS,
            )
            return
        except TimeoutError:
            pass

        try:
            renewed = await client.eval(
                _LOCK_RENEW_SCRIPT,
                1,
                lock_key,
                token,
                _SINGLE_FLIGHT_LOCK_TTL_MS,
            )
        except redis.RedisError:
            return
        if not renewed:
            return


async def _load_while_holding_single_flight_lock(
    client: redis.Redis,
    cache_key: str,
    lock_key: str,
    token: str,
    timeout: int,
    loader: Callable[[], Any],
) -> Any:
    renewal_stopped = asyncio.Event()
    renewal_task = asyncio.create_task(
        _renew_single_flight_lock(client, lock_key, token, renewal_stopped)
    )
    try:
        result = await loader()
        encoded_result = _cacheable_json_value(result)
        if encoded_result is None:
            return result
        try:
            published = await client.eval(
                _LOCK_PUBLISH_SCRIPT,
                2,
                cache_key,
                lock_key,
                json.dumps(encoded_result),
                timeout,
                token,
            )
        except redis.RedisError:
            # The loader result is still valid when Redis is unavailable.
            return _cache_result(encoded_result, "MISS")
        if not published:
            # The lease expired and another request owns the lock. Never let a
            # stale loader overwrite that request's more recent cache value.
            return _cache_result(encoded_result, "MISS")
        return _cache_result(encoded_result, "MISS")
    finally:
        renewal_stopped.set()
        await renewal_task
        await _release_single_flight_lock(client, lock_key, token)


async def _cached_single_flight(
    client: redis.Redis,
    cache_key: str,
    timeout: int,
    loader: Callable[[], Any],
) -> Any:
    """Serve a cached value or coalesce concurrent cache-miss loaders.

    Redis failures deliberately degrade to the normal uncached endpoint path.
    A bounded wait avoids deadlocking callers when a loader crashes or a lock
    owner disappears before its lease is released.
    """
    try:
        cached = await _cached_value(client, cache_key)
        if cached is not _CACHE_MISS:
            return cached
    except redis.RedisError:
        return await _handle_cache_backend_unavailable(loader)

    lock_key = f"{cache_key}:single-flight"
    deadline = asyncio.get_running_loop().time() + _SINGLE_FLIGHT_WAIT_SECONDS
    while True:
        token = secrets.token_urlsafe(24)
        try:
            acquired = await client.set(
                lock_key,
                token,
                nx=True,
                px=_SINGLE_FLIGHT_LOCK_TTL_MS,
            )
        except redis.RedisError:
            return await _handle_cache_backend_unavailable(loader)

        if acquired:
            try:
                cached = await _cached_value(client, cache_key)
            except redis.RedisError:
                await _release_single_flight_lock(client, lock_key, token)
                return await _handle_cache_backend_unavailable(loader)
            if cached is not _CACHE_MISS:
                await _release_single_flight_lock(client, lock_key, token)
                return cached
            return await _load_while_holding_single_flight_lock(
                client,
                cache_key,
                lock_key,
                token,
                timeout,
                loader,
            )

        if asyncio.get_running_loop().time() >= deadline:
            raise HTTPException(
                status_code=503,
                detail="Cache refresh is still in progress; please retry shortly.",
            )

        await asyncio.sleep(_SINGLE_FLIGHT_POLL_SECONDS)
        try:
            cached = await _cached_value(client, cache_key)
            if cached is not _CACHE_MISS:
                return cached
        except redis.RedisError:
            return await _handle_cache_backend_unavailable(loader)


def _build_function_cache_key(
    prefix: str,
    func: Callable,
    args: tuple[Any, ...],
    kwargs: dict[str, Any],
    vary_on: Sequence[str],
    user_id: str | None = None,
) -> str:
    """Build a cache key when a FastAPI endpoint has no Request parameter."""
    ignored_names = {
        "db",
        "session",
        "request",
        "response",
        "user",
        "_user",
        "current_user",
        "_",
    }
    parts = [prefix, f"{func.__module__}.{func.__qualname__}"]

    if user_id:
        parts.append(f"user:{user_id}")

    try:
        bound = inspect.signature(func).bind_partial(*args, **kwargs)
        values = bound.arguments
    except (TypeError, ValueError):
        values = kwargs

    keys = sorted(vary_on or values.keys())
    for key in keys:
        if key in ignored_names or key not in values:
            continue
        value = values[key]
        if value is None or isinstance(value, (Request, Response)):
            continue
        normalized = _normalize_cache_value(value)
        parts.append(f"{key}:{json.dumps(normalized, sort_keys=True, default=str)}")

    key_str = "|".join(parts)
    key_hash = hashlib.sha256(key_str.encode()).hexdigest()[:16]
    normalized_prefix = prefix.strip(":") or "default"
    return f"cache:{normalized_prefix}:{key_hash}"


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
                context = get_cache_context()
                request = context.get("request") if context else None

            try:
                client = await get_redis()
                cache_key = (
                    _build_cache_key(prefix, request, vary_on)
                    if request is not None
                    else _build_function_cache_key(prefix, func, args, kwargs, vary_on)
                )
            except redis.RedisError:
                return await _handle_cache_backend_unavailable(lambda: func(*args, **kwargs))

            return await _cached_single_flight(
                client,
                cache_key,
                timeout,
                lambda: func(*args, **kwargs),
            )

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
            if request is None:
                context = get_cache_context()
                request = context.get("request") if context else None

            user = kwargs.get("user") or kwargs.get("_user")
            user_id = getattr(user, "sub", None) if user else None

            try:
                client = await get_redis()
                cache_key = (
                    _build_cache_key(prefix, request, vary_on, user_id=user_id)
                    if request is not None
                    else _build_function_cache_key(prefix, func, args, kwargs, vary_on, user_id=user_id)
                )
            except redis.RedisError:
                return await _handle_cache_backend_unavailable(lambda: func(*args, **kwargs))

            return await _cached_single_flight(
                client,
                cache_key,
                timeout,
                lambda: func(*args, **kwargs),
            )

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
