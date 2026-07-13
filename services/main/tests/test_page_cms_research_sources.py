from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, patch

import pytest

from app.services.page_cms_source_errors import PageCmsSourcePreviewUnsupportedError, PageCmsSourceProviderError
from app.services.page_cms_sources import PageCmsSourceResolutionState, PageCmsSourceService


def _summary(source_type: str, source_id: uuid.UUID, *, metadata=None) -> dict:
    return {
        "id": str(source_id),
        "source_type": source_type,
        "label": "<b>Public research record</b>",
        "secondary_label": "<i>Safe display detail</i>",
        "status": "published" if source_type == "publication" else "approved",
        "published_at": "2026-07-01",
        "thumbnail_url": "/media/research.jpg",
        "metadata": metadata or {"project_type": "Applied research"},
        "selectable": True,
    }


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("source_type", "scope_type"),
    [
        ("research_project", "research"),
        ("publication", "university"),
    ],
)
async def test_research_content_search_delegates_public_catalog_with_destination_scope(source_type, scope_type):
    center_id = uuid.uuid4() if scope_type == "research" else None
    source_id = uuid.uuid4()
    payload = {
        "data": [_summary(source_type, source_id, metadata={"project_type": "<b>Applied</b>", "hidden_id": "ignored"})],
        "meta": {"page": 2, "per_page": 10, "total": 11, "pages": 2},
    }

    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.search",
        AsyncMock(return_value=payload),
    ) as search:
        result = await PageCmsSourceService.search(
            object(), source_type, " climate ", scope_type, center_id, 2, 10,
        )

    search.assert_awaited_once_with(source_type, search="climate", page=2, per_page=10, center_id=center_id)
    assert result.meta == payload["meta"]
    assert result.items[0].label == "Public research record"
    assert result.items[0].metadata == {"project_type": "Applied"}


@pytest.mark.anyio
@pytest.mark.parametrize("scope_type", ["school", "library"])
async def test_research_content_search_returns_empty_page_for_unsupported_ownership(scope_type):
    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.search",
        AsyncMock(),
    ) as search:
        result = await PageCmsSourceService.search(
            object(), "research_project", "climate", scope_type, uuid.uuid4(), 3, 10,
        )

    search.assert_not_awaited()
    assert result.items == []
    assert result.meta == {"page": 3, "per_page": 10, "total": 0, "pages": 0}


@pytest.mark.anyio
async def test_research_content_bulk_resolution_deduplicates_preserves_reference_order_and_avoids_n_plus_one():
    project_id = uuid.uuid4()
    publication_id = uuid.uuid4()
    responses = {
        "research_project": [_summary("research_project", project_id)],
        "publication": [_summary("publication", publication_id, metadata={"publication_type": "Journal article"})],
    }

    async def resolve_many(source_type, ids, *, center_id):
        assert center_id is None
        expected_ids = [project_id] if source_type == "research_project" else [publication_id]
        assert ids == expected_ids
        return responses[source_type]

    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.resolve_many",
        side_effect=resolve_many,
    ) as resolve_many:
        results = await PageCmsSourceService.resolve_many(
            object(),
            [
                ("publication", publication_id),
                ("research_project", project_id),
                ("publication", publication_id),
            ],
            destination_scope_type="university",
            destination_scope_id=None,
        )

    assert list(results) == [("publication", publication_id), ("research_project", project_id)]
    assert all(result.state is PageCmsSourceResolutionState.RESOLVED for result in results.values())
    assert resolve_many.await_count == 2


@pytest.mark.anyio
async def test_research_content_resolution_maps_provider_failure_and_preview_missing_to_typed_states():
    project_id = uuid.uuid4()
    publication_id = uuid.uuid4()
    center_id = uuid.uuid4()

    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.resolve_many",
        AsyncMock(side_effect=PageCmsSourceProviderError("provider detail must not leak")),
    ):
        failed = await PageCmsSourceService.resolve_many(
            object(), [("research_project", project_id)],
            destination_scope_type="research", destination_scope_id=center_id,
        )

    assert failed[("research_project", project_id)].state is PageCmsSourceResolutionState.PROVIDER_ERROR
    assert failed[("research_project", project_id)].message == "Source provider is unavailable."

    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.resolve_many",
        AsyncMock(return_value=[]),
    ):
        preview = await PageCmsSourceService.resolve_many(
            object(), [("publication", publication_id)],
            destination_scope_type="research", destination_scope_id=center_id,
            preview_capability=object(),
        )

    assert preview[("publication", publication_id)].state is PageCmsSourceResolutionState.PREVIEW_UNSUPPORTED
    assert preview[("publication", publication_id)].source is None


@pytest.mark.anyio
async def test_research_content_single_preview_resolution_is_explicitly_unsupported_when_public_provider_cannot_find_record():
    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.resolve_many",
        AsyncMock(return_value=[]),
    ):
        with pytest.raises(PageCmsSourcePreviewUnsupportedError, match="Research content preview is unsupported"):
            await PageCmsSourceService.resolve(
                object(), "research_project", uuid.uuid4(),
                destination_scope_type="research", destination_scope_id=uuid.uuid4(),
                preview_capability=object(),
            )


@pytest.mark.anyio
async def test_research_content_search_preserves_stable_provider_error():
    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.search",
        AsyncMock(side_effect=PageCmsSourceProviderError("provider detail must not leak")),
    ):
        with pytest.raises(PageCmsSourceProviderError, match="Research content provider is unavailable"):
            await PageCmsSourceService.search(
                object(), "publication", "", "university", None, 1, 20,
            )


@pytest.mark.anyio
async def test_research_content_search_maps_overlong_thumbnail_to_a_stable_provider_error():
    source_id = uuid.uuid4()
    unsafe_payload = _summary("research_project", source_id)
    unsafe_payload["thumbnail_url"] = "/" + ("a" * 1024)

    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.search",
        AsyncMock(return_value={
            "data": [unsafe_payload],
            "meta": {"page": 1, "per_page": 20, "total": 1, "pages": 1},
        }),
    ):
        with pytest.raises(PageCmsSourceProviderError, match="Research content provider is unavailable") as exc_info:
            await PageCmsSourceService.search(
                object(), "research_project", "", "university", None, 1, 20,
            )

    assert "a" * 64 not in str(exc_info.value)


@pytest.mark.anyio
async def test_research_content_single_resolution_bounds_overlong_provider_labels():
    source_id = uuid.uuid4()
    provider_payload = _summary("research_project", source_id)
    provider_payload["label"] = "Research " * 100

    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.resolve_many",
        AsyncMock(return_value=[provider_payload]),
    ):
        result = await PageCmsSourceService.resolve(
            object(), "research_project", source_id,
            destination_scope_type="university", destination_scope_id=None,
        )

    assert result is not None
    assert result.label == ("Research " * 100)[:255].strip()


@pytest.mark.anyio
async def test_research_content_bulk_resolution_marks_every_requested_reference_as_provider_error_for_invalid_metadata():
    valid_id = uuid.uuid4()
    invalid_id = uuid.uuid4()
    invalid_payload = _summary("research_project", invalid_id)
    invalid_payload["metadata"] = {1: "not a string key"}

    with patch(
        "app.services.page_cms_sources.ResearchContentSourcesProxyService.resolve_many",
        AsyncMock(return_value=[_summary("research_project", valid_id), invalid_payload]),
    ):
        results = await PageCmsSourceService.resolve_many(
            object(),
            [("research_project", valid_id), ("research_project", invalid_id)],
            destination_scope_type="university",
            destination_scope_id=None,
        )

    assert all(result.state is PageCmsSourceResolutionState.PROVIDER_ERROR for result in results.values())
    assert all(result.source is None for result in results.values())
    assert all(result.message == "Source provider is unavailable." for result in results.values())
