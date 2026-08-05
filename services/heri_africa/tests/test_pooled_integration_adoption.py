from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from app.routes.v1 import admin_resources


def _response(payload: object, status_code: int = 200) -> httpx.Response:
    return httpx.Response(
        status_code,
        json=payload,
        request=httpx.Request("GET", "http://research.test/request"),
    )


class _Pool:
    def __init__(self) -> None:
        self.calls: list[tuple[str, tuple[object, ...], dict[str, object]]] = []
        self.responses = [
            _response({"data": []}),
            _response({"data": [{"id": "center-1", "slug": "center"}]}),
            _response({"data": []}),
        ]

    async def request_internal(self, *args: object, **kwargs: object) -> httpx.Response:
        self.calls.append(("request_internal", args, kwargs))
        return self.responses.pop(0)


@pytest.mark.asyncio
async def test_heri_partner_sync_uses_shared_authenticated_pool(monkeypatch: pytest.MonkeyPatch) -> None:
    pool = _Pool()
    settings = SimpleNamespace(RESEARCH_SERVICE_URL="http://research.test/", RESEARCH_SERVICE_API_KEY="research-key")
    monkeypatch.setattr(admin_resources, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(admin_resources, "get_settings", lambda: settings)
    monkeypatch.setattr(admin_resources, "record_audit", AsyncMock())

    result = await admin_resources.sync_partners_from_research(
        SimpleNamespace(client=None),
        SimpleNamespace(),
        SimpleNamespace(sub="editor-1"),
    )

    assert result == {"created": 0, "updated": 0, "total": 0}
    assert [call[0] for call in pool.calls] == ["request_internal", "request_internal", "request_internal"]
    assert pool.calls[0][1][:4] == ("research-heri-partner-sync", "http://research.test", "GET", "/api/v1/internal/partners")
    assert pool.calls[0][2]["api_key"] == "research-key"
    assert pool.calls[1][1][3] == "/api/v1/internal/centers"
    assert pool.calls[2][1][3] == "/api/v1/internal/centers/center-1/partners"


@pytest.mark.asyncio
async def test_heri_lifespan_closes_shared_integration_pool(monkeypatch: pytest.MonkeyPatch) -> None:
    from app import main

    close_pool = AsyncMock()
    monkeypatch.setattr(main, "close_integration_pool", close_pool)

    async with main.lifespan(SimpleNamespace()):
        pass

    close_pool.assert_awaited_once()
