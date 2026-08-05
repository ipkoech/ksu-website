from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from app.clients import research as research_client
from app.clients.research import ResearchClient
from app.services import imports as imports_service
from app.services import research_partners
from app.services import stats as stats_service


def _response(payload: dict) -> httpx.Response:
    return httpx.Response(
        200,
        json=payload,
        request=httpx.Request("GET", "http://integration.test/request"),
    )


class _Pool:
    def __init__(self, responses: list[httpx.Response]) -> None:
        self.responses = responses
        self.calls: list[tuple[str, tuple, dict]] = []

    async def request(self, *args, **kwargs) -> httpx.Response:
        self.calls.append(("request", args, kwargs))
        return self.responses.pop(0)

    async def request_internal(self, *args, **kwargs) -> httpx.Response:
        self.calls.append(("request_internal", args, kwargs))
        return self.responses.pop(0)

    async def request_authenticated(self, *args, **kwargs) -> httpx.Response:
        self.calls.append(("request_authenticated", args, kwargs))
        return self.responses.pop(0)


@pytest.mark.asyncio
async def test_main_internal_integrations_use_the_shared_pool_and_preserve_auth(monkeypatch):
    pool = _Pool(
        [
            _response({"data": []}),
            _response({"status": "success", "data": []}),
            _response({"status": "success", "data": {"stats": [{"key": "publications", "value": 2}]}}),
            _response({"status": "success", "data": {"stats": [{"key": "loans_count", "value": 3}]}}),
            _response({"status": "success"}),
        ]
    )
    for module in (research_client, research_partners, stats_service, imports_service):
        monkeypatch.setattr(module, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(
        research_partners,
        "settings",
        research_partners.settings.model_copy(update={"RESEARCH_SERVICE_API_KEY": "research-key"}),
    )
    imports_service._settings = imports_service._settings.model_copy(
        update={"RESEARCH_SERVICE_API_KEY": "research-key"}
    )
    stats_service.settings = stats_service.settings.model_copy(
        update={"LIBRARY_SERVICE_API_KEY": "library-key"}
    )

    client = ResearchClient(
        base_url="http://research.test",
        authorization="Bearer user-token",
        request_id="request-123",
    )
    await client.list_school_publications()
    await research_partners.ResearchPartnersProxyService.list_partners()
    await stats_service._published_publications_count()
    await stats_service._library_portal_stat_counts()
    await imports_service._make_research_create("/api/v1/projects")(None, {"name": "project"})

    client_call, partner_call, research_stats_call, library_call, import_call = pool.calls
    assert client_call[0] == "request_authenticated"
    assert client_call[2]["auth_headers"] == {"Authorization": "Bearer user-token"}
    assert client_call[2]["request_id"] == "request-123"
    assert partner_call[0] == research_stats_call[0] == "request_internal"
    assert partner_call[1][3] == "/api/v1/internal/partners"
    assert partner_call[2]["api_key"] == "research-key"
    assert library_call[0] == import_call[0] == "request_internal"
    assert library_call[2]["api_key"] == "library-key"
    assert import_call[2]["api_key"] == "research-key"
    assert import_call[1][2] == "POST"
    assert import_call[2]["json"] == {"name": "project"}


@pytest.mark.asyncio
async def test_main_lifespan_closes_shared_integration_pool(monkeypatch):
    from app import main

    monkeypatch.setattr(main.subscriber, "start", AsyncMock())
    monkeypatch.setattr(main.subscriber, "stop", AsyncMock())
    monkeypatch.setattr(main.manager, "close_all", AsyncMock())
    close_pool = AsyncMock()
    monkeypatch.setattr(main, "close_integration_pool", close_pool)
    monkeypatch.setattr(main, "close_redis", AsyncMock())

    async with main.lifespan(SimpleNamespace()):
        pass

    close_pool.assert_awaited_once()
