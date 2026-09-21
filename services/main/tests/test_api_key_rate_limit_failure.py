from __future__ import annotations

from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app import deps


@pytest.mark.asyncio
async def test_api_key_rate_limit_backend_failure_is_fail_closed(monkeypatch) -> None:
    async def unavailable_redis():
        raise RuntimeError("redis://secret.example.invalid")

    monkeypatch.setattr(deps, "get_redis", unavailable_redis)
    with pytest.raises(HTTPException) as raised:
        await deps._enforce_api_key_rate_limit(SimpleNamespace(id="key-1", rate_limit=10))
    assert raised.value.status_code == 503
    assert raised.value.headers == {"Retry-After": "5"}
    assert "secret.example" not in str(raised.value.detail)
