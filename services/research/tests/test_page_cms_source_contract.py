from __future__ import annotations

import uuid
import asyncio
from datetime import date
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.routing import APIRoute
from ksu_common import PaginatedResult

from app.models import PublicMedia, Publication, ResearchProject
from app.routes.v1 import router as v1_router
from app.routes.v1.page_cms_source_contract import router
from app.services.page_cms_source_contract import (
    PageCmsResearchSourceService,
    _is_safe_public_url,
    _safe_thumbnail_url,
)


class _ScalarResult:
    def __init__(self, items):
        self.items = items

    def scalars(self):
        return self

    def all(self):
        return self.items


class _Db:
    def __init__(self, media=()):
        self.media = list(media)
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _ScalarResult(self.media)


def _page(*items):
    return PaginatedResult(
        items=list(items),
        meta={"page": 1, "per_page": 20, "total": len(items), "pages": 1 if items else 0},
    )


def _media(media_id: uuid.UUID) -> PublicMedia:
    media = PublicMedia(
        filename="cover.webp",
        original_filename="cover.webp",
        mime_type="image/webp",
        file_size=512,
        storage_provider="local",
        storage_path="private/cover.webp",
        public_url="/uploads/covers/cover.webp",
        thumbnail_url="https://cdn.example.test/covers/cover-thumb.webp",
        media_type="image",
        is_public=True,
        is_processed=True,
    )
    media.id = media_id
    return media


def _project(*, cover_image_id: uuid.UUID | None = None) -> ResearchProject:
    project = ResearchProject(
        title="Climate Resilience Initiative",
        slug="climate-resilience-initiative",
        code="CRI-24",
        project_type="applied",
        summary="Applied climate research.",
        status="ongoing",
        is_active=True,
        is_public=True,
        start_date=date(2024, 1, 1),
        progress_percentage=60,
        cover_image_id=cover_image_id,
    )
    project.id = uuid.uuid4()
    return project


def _publication(*, cover_image_id: uuid.UUID | None = None) -> Publication:
    publication = Publication(
        title="Climate Adaptation in Western Kenya",
        slug="climate-adaptation-western-kenya",
        publication_type="journal_article",
        journal_name="East African Research Journal",
        status="published",
        is_active=True,
        publication_date=date(2025, 6, 15),
        year=2025,
        cover_image_id=cover_image_id,
    )
    publication.id = uuid.uuid4()
    return publication


def _paths(api_router):
    for route in api_router.routes:
        if isinstance(route, APIRoute):
            yield route.path, route
        elif hasattr(route, "original_router"):
            yield from _paths(route.original_router)


def test_source_contract_routes_are_public_and_registered():
    contract_paths = {(path, method) for path, route in _paths(router) for method in route.methods}
    v1_paths = {path for path, _ in _paths(v1_router)}

    assert ("/page-cms-sources/{source_type}", "GET") in contract_paths
    assert ("/page-cms-sources/{source_type}/resolve", "POST") in contract_paths
    assert "/page-cms-sources/{source_type}" in v1_paths
    assert "/page-cms-sources/{source_type}/resolve" in v1_paths


@pytest.mark.parametrize(
    ("source_type", "model", "expected_status"),
    [
        ("research_project", ResearchProject, "research_projects.status in"),
        ("publication", Publication, "publications.status ="),
    ],
)
def test_search_enforces_public_visibility_and_center_scope(source_type, model, expected_status):
    async def scenario():
        center_id = uuid.uuid4()
        with patch(
            "app.services.page_cms_source_contract.paginate",
            AsyncMock(return_value=_page()),
        ) as paginate:
            await PageCmsResearchSourceService.search(
                _Db(), source_type=source_type, page=1, per_page=20, search="climate", center_id=center_id,
            )

        query = str(paginate.await_args.args[1]).lower()
        assert f"{model.__tablename__}.deleted_at is null" in query
        assert f"{model.__tablename__}.is_active is true" in query
        assert f"{model.__tablename__}.center_id" in query
        assert expected_status in query
        if model is ResearchProject:
            assert "research_projects.is_public is true" in query

    asyncio.run(scenario())


def test_project_summary_exposes_only_human_safe_fields_and_public_media_url():
    async def scenario():
        media_id = uuid.uuid4()
        project = _project(cover_image_id=media_id)

        with patch(
            "app.services.page_cms_source_contract.paginate",
            AsyncMock(return_value=_page(project)),
        ):
            result = await PageCmsResearchSourceService.search(
                _Db([_media(media_id)]), source_type="research_project", page=1, per_page=20,
            )

        summary = result.items[0].model_dump(mode="json")
        assert summary == {
            "id": str(project.id),
            "source_type": "research_project",
            "label": "Climate Resilience Initiative",
            "secondary_label": "CRI-24 | Applied",
            "status": "ongoing",
            "published_at": "2024-01-01",
            "thumbnail_url": "https://cdn.example.test/covers/cover-thumb.webp",
            "metadata": {"project_type": "applied", "progress_percentage": 60},
            "selectable": True,
        }
        assert all(not key.endswith("_id") and key != "id" for key in summary["metadata"])

    asyncio.run(scenario())


@pytest.mark.parametrize(
    ("media_updates", "expected_url"),
    [
        ({"thumbnail_url": "/media/covers/cover-thumb.webp"}, "/media/covers/cover-thumb.webp"),
        ({"thumbnail_url": None, "cdn_url": "https://cdn.example.test/covers/cover.webp"}, "https://cdn.example.test/covers/cover.webp"),
        ({"thumbnail_url": None, "public_url": "/uploads/covers/cover.webp"}, "/uploads/covers/cover.webp"),
    ],
)
def test_safe_thumbnail_url_uses_only_explicit_public_media_urls(media_updates, expected_url):
    media = _media(uuid.uuid4())
    for key, value in media_updates.items():
        setattr(media, key, value)

    assert _safe_thumbnail_url(media) == expected_url


@pytest.mark.parametrize(
    "media_updates",
    [
        {"thumbnail_url": None, "cdn_url": None, "public_url": None},
        {"thumbnail_url": "private/cover-thumb.webp", "cdn_url": None, "public_url": None},
        {"thumbnail_url": "javascript:alert(1)", "cdn_url": None, "public_url": None},
        {"thumbnail_url": "//untrusted.example.test/cover.webp", "cdn_url": None, "public_url": None},
    ],
)
def test_safe_thumbnail_url_never_falls_back_to_private_storage_path_or_unsafe_url(media_updates):
    media = _media(uuid.uuid4())
    media.storage_path = "private/internal/cover.webp"
    for key, value in media_updates.items():
        setattr(media, key, value)

    assert media.url == "/uploads/private/internal/cover.webp"
    assert _safe_thumbnail_url(media) is None


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
        "https://media.local/cover.webp",
        "https://media.internal/cover.webp",
        "https://user:password@cdn.example.test/cover.webp",
        "//cdn.example.test/cover.webp",
    ],
)
def test_safe_thumbnail_url_rejects_nonpublic_external_urls(value):
    assert not _is_safe_public_url(value)


@pytest.mark.parametrize(
    "value",
    [
        "/media/covers/cover.webp",
        "https://cdn.example.test/covers/cover.webp",
        "http://images.example.test/covers/cover.webp",
    ],
)
def test_safe_thumbnail_url_accepts_public_urls(value):
    assert _is_safe_public_url(value)


def test_publication_bulk_resolution_keeps_requested_order_and_omits_nonpublic_records():
    async def scenario():
        visible = _publication()
        hidden = _publication()
        hidden.id = uuid.uuid4()

        with patch.object(
            PageCmsResearchSourceService,
            "_load_records",
            AsyncMock(return_value=[visible]),
        ) as load_records:
            result = await PageCmsResearchSourceService.resolve_many(
                _Db(), source_type="publication", ids=[hidden.id, visible.id], center_id=uuid.uuid4(),
            )

        assert load_records.await_args.kwargs["ids"] == [hidden.id, visible.id]
        assert [summary.id for summary in result] == [visible.id]
        assert result[0].secondary_label == "East African Research Journal"
        assert result[0].published_at == date(2025, 6, 15)

    asyncio.run(scenario())


def test_bulk_resolution_rejects_more_than_one_hundred_ids():
    async def scenario():
        with pytest.raises(ValueError, match="100"):
            await PageCmsResearchSourceService.resolve_many(
                _Db(), source_type="publication", ids=[uuid.uuid4() for _ in range(101)], center_id=None,
            )

    asyncio.run(scenario())


def test_public_contract_schema_forbids_internal_fields():
    schema = PageCmsResearchSourceService.summary_schema()
    properties = schema["properties"]

    assert set(properties) == {
        "id", "source_type", "label", "secondary_label", "status", "published_at", "thumbnail_url", "metadata", "selectable",
    }
    assert "center_id" not in properties
    assert "cover_image_id" not in properties
    assert "storage_path" not in properties
