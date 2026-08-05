from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.services import imports as imports_service
from app.services import stats as stats_service


class _Client:
    def __init__(self, **options):
        self.options = options

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return False

    async def post(self, *_args, **_kwargs):
        return SimpleNamespace(raise_for_status=lambda: None)

    async def get(self, *_args, **_kwargs):
        return SimpleNamespace(
            raise_for_status=lambda: None,
            json=lambda: {
                "status": "success",
                "data": {"stats": [{"key": "publications", "value": 1}]},
            },
        )


@pytest.mark.asyncio
async def test_research_import_uses_internal_key_and_separate_proxy_header(monkeypatch):
    client = None

    def build_client(**options):
        nonlocal client
        client = _Client(**options)
        return client

    monkeypatch.setattr(imports_service, "outbound_client", _outbound_client_factory(build_client))
    imports_service._settings = imports_service._settings.model_copy(
        update={"RESEARCH_SERVICE_API_KEY": "research-key"}
    )

    await imports_service._make_research_create("/api/v1/projects")(None, {"name": "x"})

    assert client.options["headers"]["X-Internal-Key"] == "research-key"
    assert client.options["headers"]["X-KSU-Proxy"] == "main-imports"


@pytest.mark.asyncio
async def test_cross_service_stats_use_internal_key_and_separate_proxy_header(monkeypatch):
    clients = []

    def build_client(**options):
        client = _Client(**options)
        clients.append(client)
        return client

    monkeypatch.setattr(stats_service, "outbound_client", _outbound_client_factory(build_client))
    stats_service.settings = stats_service.settings.model_copy(
        update={
            "LIBRARY_SERVICE_API_KEY": "library-key",
            "RESEARCH_SERVICE_URL": "http://research",
            "LIBRARY_SERVICE_URL": "http://library",
        }
    )

    await stats_service._published_publications_count()
    await stats_service._library_portal_stat_counts()

    assert clients[0].options["headers"] == {"X-KSU-Proxy": "main-stats"}
    assert clients[1].options["headers"] == {
        "X-Internal-Key": "library-key",
        "X-KSU-Proxy": "main-stats",
    }


def _outbound_client_factory(builder):
    from contextlib import asynccontextmanager

    @asynccontextmanager
    async def outbound_client(*_args, headers=None, **kwargs):
        yield builder(headers=headers or {}, **kwargs)

    return outbound_client
