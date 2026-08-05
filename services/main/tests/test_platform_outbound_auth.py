from __future__ import annotations

import pytest
from app.services import imports as imports_service
from app.services import stats as stats_service


class _Response:
    def __init__(self, payload):
        self.payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self.payload


class _Pool:
    def __init__(self):
        self.calls = []

    async def request(self, *args, **kwargs):
        self.calls.append(("request", args, kwargs))
        return _Response({"status": "success", "data": {"stats": [{"key": "publications", "value": 1}]}})

    async def request_internal(self, *args, **kwargs):
        self.calls.append(("request_internal", args, kwargs))
        return _Response({"status": "success", "data": {"stats": [{"key": "loans", "value": 1}]}})


@pytest.mark.asyncio
async def test_research_import_uses_internal_key_and_separate_proxy_header(monkeypatch):
    pool = _Pool()
    monkeypatch.setattr(imports_service, "get_integration_pool", lambda: pool)
    imports_service._settings = imports_service._settings.model_copy(
        update={"RESEARCH_SERVICE_API_KEY": "research-key"}
    )

    await imports_service._make_research_create("/api/v1/projects")(None, {"name": "x"})

    _, args, kwargs = pool.calls[0]
    assert args[:3] == ("research-imports", imports_service._settings.RESEARCH_SERVICE_URL.rstrip("/"), "POST")
    assert kwargs["api_key"] == "research-key"
    assert kwargs["headers"] == {"X-KSU-Proxy": "main-imports"}


@pytest.mark.asyncio
async def test_cross_service_stats_use_internal_key_and_separate_proxy_header(monkeypatch):
    pool = _Pool()
    monkeypatch.setattr(stats_service, "get_integration_pool", lambda: pool)
    stats_service.settings = stats_service.settings.model_copy(
        update={
            "LIBRARY_SERVICE_API_KEY": "library-key",
            "RESEARCH_SERVICE_URL": "http://research",
            "LIBRARY_SERVICE_URL": "http://library",
        }
    )

    await stats_service._published_publications_count()
    await stats_service._library_portal_stat_counts()

    assert pool.calls[0][0] == "request"
    assert pool.calls[0][2]["headers"] == {"X-KSU-Proxy": "main-stats"}
    assert pool.calls[1][0] == "request_internal"
    assert pool.calls[1][2]["api_key"] == "library-key"
    assert pool.calls[1][2]["headers"] == {"X-KSU-Proxy": "main-stats"}
