from __future__ import annotations

from copy import deepcopy
import uuid
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.services.page_cms_source_errors import PageCmsSourceProviderError
from app.services.research_content_sources import (
    ResearchContentSourcesProxyService,
    _is_safe_public_url,
)


def _summary(source_type: str, source_id: uuid.UUID) -> dict:
    summary = {
        "id": str(source_id),
        "source_type": source_type,
        "label": "Climate Resilience Initiative",
        "secondary_label": "CRI-24 | Applied",
        "status": "ongoing" if source_type == "research_project" else "published",
        "published_at": "2024-01-01",
        "thumbnail_url": "https://cdn.example.test/cover.webp",
        "metadata": (
            {"project_type": "applied", "progress_percentage": 60}
            if source_type == "research_project"
            else {"publication_type": "journal_article", "journal_name": "East African Research Journal", "year": 2024, "is_open_access": True}
        ),
        "selectable": True,
    }
    return summary


@pytest.mark.asyncio
async def test_proxy_search_uses_public_contract_and_bounds_pagination():
    source_id = uuid.uuid4()
    response = httpx.Response(
        200,
        request=httpx.Request("GET", "http://research/api/v1/page-cms-sources/research_project"),
        json={
            "status": "success",
            "data": [],
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
    assert result["meta"] == {"page": 100, "per_page": 50, "total": 1, "pages": 1}


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


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "meta",
    [
        {"page": 0, "per_page": 20, "total": 1, "pages": 1},
        {"page": 1, "per_page": 0, "total": 1, "pages": 1},
        {"page": 1, "per_page": 51, "total": 1, "pages": 1},
        {"page": 1, "per_page": 20, "total": -1, "pages": 0},
        {"page": 1, "per_page": 20, "total": 21, "pages": 1},
        {"page": 1, "per_page": 20, "total": 0, "pages": 1},
        {"page": 101, "per_page": 20, "total": 0, "pages": 0},
    ],
)
async def test_proxy_rejects_malformed_provider_pagination(meta):
    payload = {"status": "success", "data": [_summary("research_project", uuid.uuid4())], "meta": meta}

    with pytest.raises(PageCmsSourceProviderError, match="pagination"):
        ResearchContentSourcesProxyService._validate_page_payload("research_project", payload)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("data", "meta"),
    [
        ([_summary("research_project", uuid.uuid4()) for _ in range(2)], {"page": 1, "per_page": 1, "total": 2, "pages": 2}),
        ([_summary("research_project", uuid.uuid4()) for _ in range(2)], {"page": 2, "per_page": 20, "total": 1, "pages": 1}),
        ([_summary("research_project", uuid.uuid4())], {"page": 1, "per_page": 20, "total": 0, "pages": 0}),
    ],
)
async def test_proxy_rejects_provider_pages_with_impossible_item_counts(data, meta):
    payload = {"status": "success", "data": data, "meta": meta}

    with pytest.raises(PageCmsSourceProviderError, match="pagination"):
        ResearchContentSourcesProxyService._validate_page_payload("research_project", payload)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("meta", "data"),
    [
        ({"page": 2, "per_page": 20, "total": 1, "pages": 1}, []),
        ({"page": 100, "per_page": 20, "total": 0, "pages": 0}, []),
    ],
)
async def test_proxy_accepts_empty_pages_beyond_provider_total(meta, data):
    payload = {"status": "success", "data": data, "meta": meta}

    assert ResearchContentSourcesProxyService._validate_page_payload("research_project", payload) == {
        "data": data,
        "meta": meta,
    }


@pytest.mark.asyncio
async def test_proxy_rejects_nonempty_pages_beyond_provider_total():
    payload = {
        "status": "success",
        "data": [_summary("research_project", uuid.uuid4())],
        "meta": {"page": 2, "per_page": 20, "total": 1, "pages": 1},
    }

    with pytest.raises(PageCmsSourceProviderError, match="pagination"):
        ResearchContentSourcesProxyService._validate_page_payload("research_project", payload)


@pytest.mark.parametrize(
    "value",
    [
        "http://127.0.0.1/cover.webp",
        "https://10.0.0.1/cover.webp",
        "https://169.254.1.1/cover.webp",
        "https://224.0.0.1/cover.webp",
        "https://0.0.0.0/cover.webp",
        "https://[::1]/cover.webp",
        "https://[fc00::1]/cover.webp",
        "https://[fe80::1]/cover.webp",
        "https://[ff00::1]/cover.webp",
        "https://[::]/cover.webp",
        "https://localhost/cover.webp",
        "https://localhost./cover.webp",
        "https://media.local/cover.webp",
        "https://media.internal/cover.webp",
        "https://media.internal./cover.webp",
        "https://2130706433/cover.webp",
        "https://0x7f000001/cover.webp",
        "https://0177.0.0.1/cover.webp",
        "https://127.1/cover.webp",
        "https://0x7f.0.0.1/cover.webp",
        "https://127.0.0.1./cover.webp",
        "https://user:password@cdn.example.test/cover.webp",
        "//cdn.example.test/cover.webp",
    ],
)
def test_proxy_rejects_nonpublic_external_urls(value):
    assert not _is_safe_public_url(value)


@pytest.mark.parametrize(
    "value",
    [
        "/media/covers/cover.webp",
        "https://cdn.example.test/covers/cover.webp",
        "http://images.example.test/covers/cover.webp",
        "https://8.8.8.8/covers/cover.webp",
    ],
)
def test_proxy_accepts_public_media_urls(value):
    assert _is_safe_public_url(value)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("source_type", "updates"),
    [
        ("research_project", {"id": "not-a-uuid"}),
        ("research_project", {"label": "   "}),
        ("research_project", {"status": "draft"}),
        ("publication", {"status": "ongoing"}),
        ("research_project", {"published_at": "not-a-date"}),
        ("research_project", {"published_at": "2024-01-01T00:00:00Z"}),
        ("research_project", {"thumbnail_url": "private/cover.webp"}),
        ("research_project", {"thumbnail_url": "javascript:alert(1)"}),
        ("research_project", {"thumbnail_url": "//untrusted.example.test/cover.webp"}),
        ("research_project", {"selectable": 1}),
        ("research_project", {"metadata": {"storage_path": "private/cover.webp"}}),
        ("research_project", {"metadata": {"provider": "s3"}}),
        ("research_project", {"metadata": {"public_url": "/uploads/cover.webp"}}),
        ("research_project", {"metadata": {"cdn_url": "https://cdn.example.test/cover.webp"}}),
        ("research_project", {"metadata": {"unexpected": "value"}}),
        ("publication", {"metadata": {"project_type": "applied"}}),
        ("research_project", {"metadata": {"project_type": {"unsafe": "nested"}}}),
        ("research_project", {"metadata": {"project_type": ["safe", {"unsafe": "nested"}]}}),
    ],
)
async def test_proxy_rejects_malformed_provider_summary_fields(source_type, updates):
    summary = _summary(source_type, uuid.uuid4())
    summary.update(deepcopy(updates))

    with pytest.raises(PageCmsSourceProviderError, match="invalid source summary"):
        ResearchContentSourcesProxyService._validate_summary(source_type, summary)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("source_type", "metadata"),
    [
        ("research_project", {"project_type": "applied", "progress_percentage": [25, 50]}),
        ("publication", {"publication_type": "journal_article", "journal_name": None, "year": 2025, "is_open_access": True}),
    ],
)
async def test_proxy_accepts_whitelisted_primitive_and_list_metadata(source_type, metadata):
    summary = _summary(source_type, uuid.uuid4())
    summary["metadata"] = metadata

    assert ResearchContentSourcesProxyService._validate_summary(source_type, summary) == summary
