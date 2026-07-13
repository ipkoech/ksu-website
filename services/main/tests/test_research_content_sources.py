from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.services.page_cms_source_errors import PageCmsSourceProviderError
from app.services.research_content_sources import ResearchContentSourcesProxyService


def _summary(source_type: str, source_id: uuid.UUID) -> dict:
    return {
        "id": str(source_id),
        "source_type": source_type,
        "label": "Climate Resilience Initiative",
        "secondary_label": "CRI-24 | Applied",
        "status": "ongoing",
        "published_at": "2024-01-01",
        "thumbnail_url": "https://cdn.example.test/cover.webp",
        "metadata": {"project_type": "applied", "progress_percentage": 60},
    }


@pytest.mark.asyncio
async def test_proxy_search_uses_public_contract_and_bounds_pagination():
    source_id = uuid.uuid4()
    response = httpx.Response(
        200,
        request=httpx.Request("GET", "http://research/api/v1/page-cms-sources/research_project"),
        json={
            "status": "success",
            "data": [_summary("research_project", source_id)],
            "meta": {"page": 100, "per_page": 50, "total": 1, "pages": 1},
        },
    )
    with patch(
        "app.services.research_content_sources.httpx.AsyncClient.get",
        AsyncMock(return_value=response),
    ) as get:
        result = await ResearchContentSourcesProxyService.search(
            "research_project", page=500, per_page=500, search="climate", center_id=uuid.uuid4(),
        )

    assert get.await_args.args == ("/api/v1/page-cms-sources/research_project",)
    assert get.await_args.kwargs["params"]["page"] == 100
    assert get.await_args.kwargs["params"]["per_page"] == 50
    assert get.await_args.kwargs["params"]["search"] == "climate"
    assert result["data"][0]["id"] == str(source_id)


@pytest.mark.asyncio
async def test_proxy_resolve_many_uses_bounded_uuid_payload_and_validates_provider_summary():
    source_id = uuid.uuid4()
    response = httpx.Response(
        200,
        request=httpx.Request("POST", "http://research/api/v1/page-cms-sources/publication/resolve"),
        json={"status": "success", "data": [_summary("publication", source_id)]},
    )
    with patch(
        "app.services.research_content_sources.httpx.AsyncClient.post",
        AsyncMock(return_value=response),
    ) as post:
        result = await ResearchContentSourcesProxyService.resolve_many("publication", [source_id])

    assert post.await_args.args == ("/api/v1/page-cms-sources/publication/resolve",)
    assert post.await_args.kwargs["json"] == {"ids": [str(source_id)], "center_id": None}
    assert result == [_summary("publication", source_id)]


@pytest.mark.asyncio
async def test_proxy_fails_closed_for_transport_and_invalid_provider_payloads():
    with patch(
        "app.services.research_content_sources.httpx.AsyncClient.get",
        AsyncMock(side_effect=httpx.ConnectTimeout("timed out")),
    ):
        with pytest.raises(PageCmsSourceProviderError, match="unavailable"):
            await ResearchContentSourcesProxyService.search("publication")

    invalid_response = httpx.Response(
        200,
        request=httpx.Request("GET", "http://research/api/v1/page-cms-sources/publication"),
        json={"status": "success", "data": [{"id": str(uuid.uuid4()), "source_type": "publication"}], "meta": {}},
    )
    with patch(
        "app.services.research_content_sources.httpx.AsyncClient.get",
        AsyncMock(return_value=invalid_response),
    ):
        with pytest.raises(PageCmsSourceProviderError, match="invalid"):
            await ResearchContentSourcesProxyService.search("publication")


@pytest.mark.asyncio
async def test_proxy_rejects_unsupported_source_types_and_excessive_ids():
    with pytest.raises(PageCmsSourceProviderError, match="Unsupported"):
        await ResearchContentSourcesProxyService.search("research_partner")

    with pytest.raises(PageCmsSourceProviderError, match="100"):
        await ResearchContentSourcesProxyService.resolve_many(
            "publication", [uuid.uuid4() for _ in range(101)],
        )
