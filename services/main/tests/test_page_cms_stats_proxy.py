from __future__ import annotations

from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.services.page_cms_stats import PageCmsStatsProxyService
from app.services.page_cms_sources import PageCmsSourceProviderError


@pytest.mark.asyncio
@pytest.mark.parametrize("scope_type", ["research", "library"])
async def test_stats_proxy_reads_and_validates_public_provider_contract(scope_type):
    response = httpx.Response(
        200,
        request=httpx.Request("GET", f"http://{scope_type}/api/v1/stats"),
        json={
            "status": "success",
            "data": {
                "scope": scope_type,
                "title": "At a glance",
                "stats": [{
                    "key": "records", "label": "Records", "value": 10,
                    "suffix": "+", "description": "Public records", "href": None,
                }],
            },
        },
    )

    with patch("app.services.page_cms_stats.httpx.AsyncClient.get", AsyncMock(return_value=response)) as get:
        payload = await PageCmsStatsProxyService.get_public_stats(scope_type)

    assert get.await_args.args == ("/api/v1/stats",)
    assert payload["scope"] == scope_type
    assert payload["stats"][0]["key"] == "records"


@pytest.mark.asyncio
async def test_stats_proxy_rejects_mismatched_provider_scope():
    response = httpx.Response(
        200,
        request=httpx.Request("GET", "http://research/api/v1/stats"),
        json={"status": "success", "data": {"scope": "library", "title": "Wrong", "stats": []}},
    )
    with patch("app.services.page_cms_stats.httpx.AsyncClient.get", AsyncMock(return_value=response)):
        with pytest.raises(PageCmsSourceProviderError, match="scope"):
            await PageCmsStatsProxyService.get_public_stats("research")
