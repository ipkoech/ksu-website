from importlib import import_module

import pytest

from ksu_common.rate_limit import RateLimiter, RateLimitUnavailable

# ksu_common re-exports a `rate_limit` decorator, so the attribute of that name on
# the package is the function, not the submodule. Resolve the module explicitly.
rate_limit_module = import_module("ksu_common.rate_limit")


class _BrokenRedis:
    """Stands in for an unreachable Redis backend."""

    def pipeline(self):
        raise ConnectionError("redis unavailable")


@pytest.fixture
def broken_backend(monkeypatch):
    async def _get_redis():
        return _BrokenRedis()

    monkeypatch.setattr(rate_limit_module, "get_redis", _get_redis)


@pytest.mark.asyncio
async def test_limiter_fails_closed_when_backend_is_unreachable(broken_backend):
    limiter = RateLimiter(requests=5, window=60)

    with pytest.raises(RateLimitUnavailable):
        await limiter.is_allowed("10.0.0.1", "POST:/api/v1/auth/login")


@pytest.mark.asyncio
async def test_check_fails_closed_when_backend_is_unreachable(broken_backend):
    limiter = RateLimiter(requests=5, window=60)

    with pytest.raises(RateLimitUnavailable):
        await limiter.check("10.0.0.1", "POST:/api/v1/auth/login")


@pytest.mark.asyncio
async def test_limiter_can_opt_into_failing_open(broken_backend):
    limiter = RateLimiter(requests=5, window=60, fail_open=True)

    allowed, remaining, retry_after = await limiter.is_allowed("10.0.0.1", "GET:/api/v1/news")

    assert allowed is True
    assert remaining == 5
    assert retry_after == 0
