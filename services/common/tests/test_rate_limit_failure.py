import asyncio
from unittest.mock import AsyncMock

import pytest

from ksu_common.rate_limit import RateLimiter, RateLimitUnavailable, get_rate_limit_metrics


@pytest.mark.parametrize("failure_at", ["connect", "eval"])
def test_backend_failure_denies_without_logging_connection_secrets(failure_at, caplog):
    error = OSError("redis://user:secret@private-host/0")
    client = AsyncMock()
    provider = AsyncMock(return_value=client)
    if failure_at == "connect":
        provider.side_effect = error
    else:
        client.eval.side_effect = error
    limiter = RateLimiter(redis_provider=provider)
    before = get_rate_limit_metrics().get("backend_unavailable", 0)
    with pytest.raises(RateLimitUnavailable) as raised:
        asyncio.run(limiter.check("caller", "/items"))
    assert raised.value.status_code == 503
    assert raised.value.headers == {"Retry-After": "5"}
    assert get_rate_limit_metrics()["backend_unavailable"] == before + 1
    assert "OSError" in caplog.text
    assert "secret" not in caplog.text
    assert "private-host" not in caplog.text
    assert all(record.exc_info is None for record in caplog.records)


def test_cancellation_propagates_without_becoming_backend_failure():
    provider = AsyncMock(side_effect=asyncio.CancelledError())
    before = get_rate_limit_metrics().get("backend_unavailable", 0)
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(RateLimiter(redis_provider=provider).check("caller", "/items"))
    assert get_rate_limit_metrics().get("backend_unavailable", 0) == before
