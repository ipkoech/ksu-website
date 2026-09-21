from __future__ import annotations

from unittest.mock import AsyncMock

import pytest
from starlette.requests import Request
from starlette.responses import Response


def _request(method: str, path: str) -> Request:
    return Request({"type": "http", "method": method, "path": path, "headers": []})


@pytest.mark.asyncio
async def test_main_public_cache_invalidation_is_commit_gated(monkeypatch):
    from app import main

    invalidate = AsyncMock()
    monkeypatch.setattr(main, "invalidate_prefix", invalidate)

    await main._after_response(_request("PATCH", "/api/v1/news/1"), Response(status_code=200))
    await main._after_response(_request("PATCH", "/api/v1/news/2"), Response(status_code=409))
    await main._after_response(_request("GET", "/api/v1/news"), Response(status_code=200))
    await main._after_response(_request("POST", "/api/v1/analytics/events"), Response(status_code=202))
    await main._after_response(_request("POST", "/api/v1/audit"), Response(status_code=202))
    await main._after_response(_request("POST", "/api/v1/internal/audit"), Response(status_code=202))

    invalidate.assert_awaited_once_with("public")
