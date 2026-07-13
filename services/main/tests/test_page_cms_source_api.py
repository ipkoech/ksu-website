from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

from app.api.v1 import page_cms
from app.deps import get_db
from app.helpers.jwt import create_access_token
from app.services.page_cms_sources import PageCmsSourceProviderError
from ksu_common import PaginatedResult


class _ScalarResult:
    def __init__(self, user):
        self.user = user

    def scalar_one_or_none(self):
        return self.user


class _AuthDb:
    def __init__(self, user):
        self.user = user

    async def execute(self, _statement):
        return _ScalarResult(self.user)


def _permission(name):
    return SimpleNamespace(name=name, is_active=True)


def _user(*permissions):
    role = SimpleNamespace(
        name="page-editor",
        is_active=True,
        role_permissions=[SimpleNamespace(permission=_permission(name)) for name in permissions],
    )
    return SimpleNamespace(
        id=uuid.uuid4(),
        is_active=True,
        deleted_at=None,
        role_assignments=[SimpleNamespace(
            is_active=True,
            role=role,
            scope_type=None,
            scope_id=None,
        )],
        person=None,
    )


def _client(user):
    app = FastAPI()
    app.include_router(page_cms.router, prefix="/api/v1")

    async def override_db():
        yield _AuthDb(user)

    app.dependency_overrides[get_db] = override_db
    token, _ = create_access_token(str(user.id), ["page-editor"], permissions=[])
    return TestClient(app), {"Authorization": f"Bearer {token}"}


def test_source_catalog_requires_authentication():
    user = _user("section_items.manage")
    client, _headers = _client(user)

    response = client.get("/api/v1/page-section-sources/news")

    assert response.status_code == 401


def test_unknown_source_type_returns_422():
    user = _user("section_items.manage")
    client, headers = _client(user)

    response = client.get(
        "/api/v1/page-section-sources/not-a-source",
        headers=headers,
    )

    assert response.status_code == 422


def test_source_type_must_be_compatible_with_layout_variant():
    user = _user("section_items.manage")
    client, headers = _client(user)

    response = client.get(
        "/api/v1/page-section-sources/event",
        params={"layout_variant": "news_grid"},
        headers=headers,
    )

    assert response.status_code == 422


@pytest.mark.parametrize(
    ("source_type", "layout_variant", "scope_type"),
    [
        ("intake", "hero_admissions", "university"),
        ("programme", "programme_finder", "university"),
        ("academic_calendar", "date_timeline", "university"),
        ("person", "leadership_activity", "university"),
        ("staff_assignment", "leadership_activity", "school"),
        ("research_project", "research_cards", "research"),
        ("publication", "research_cards", "research"),
        ("news", "news_grid", "university"),
        ("event", "events_list", "university"),
        ("research_partner", "featured_partnership", "university"),
        ("alumni", "alumni_story", "university"),
        ("testimonial", "alumni_story", "university"),
        ("public_stat", "facts_strip", "university"),
        ("club_activity", "leadership_activity", "school"),
    ],
)
def test_all_canonical_source_types_are_accepted_for_their_canonical_layouts(source_type, layout_variant, scope_type):
    user = _user("section_items.manage")
    client, headers = _client(user)
    scope_id = uuid.uuid4() if scope_type != "university" else None

    with (
        patch("app.api.v1._scoped._can_access_scope", return_value=True),
        patch.object(page_cms.PageCmsSourceService, "search", AsyncMock(return_value=PaginatedResult(
            items=[], meta={"page": 1, "per_page": 20, "total": 0, "pages": 0},
        ))) as search,
    ):
        response = client.get(
            f"/api/v1/page-section-sources/{source_type}",
            params={
                "layout_variant": layout_variant,
                "scope_type": scope_type,
                **({"scope_id": str(scope_id)} if scope_id else {}),
            },
            headers=headers,
        )

    assert response.status_code == 200
    search.assert_awaited_once()


def test_layout_variant_is_required():
    user = _user("section_items.manage")
    client, headers = _client(user)

    response = client.get("/api/v1/page-section-sources/news", headers=headers)

    assert response.status_code == 422


def test_layout_variant_scope_must_be_compatible():
    user = _user("section_items.manage")
    client, headers = _client(user)

    response = client.get(
        "/api/v1/page-section-sources/programme",
        params={"layout_variant": "programme_finder", "scope_type": "research", "scope_id": str(uuid.uuid4())},
        headers=headers,
    )

    assert response.status_code == 422


def test_university_scope_rejects_scope_id():
    user = _user("section_items.manage")
    client, headers = _client(user)

    response = client.get(
        "/api/v1/page-section-sources/news",
        params={"layout_variant": "news_grid", "scope_id": str(uuid.uuid4())},
        headers=headers,
    )

    assert response.status_code == 422


def test_per_page_over_50_returns_422_before_service_call():
    user = _user("section_items.manage")
    client, headers = _client(user)
    search = AsyncMock()

    with patch.object(page_cms.PageCmsSourceService, "search", search):
        response = client.get(
            "/api/v1/page-section-sources/news?layout_variant=news_grid&per_page=51",
            headers=headers,
        )

    assert response.status_code == 422
    search.assert_not_awaited()


def test_inaccessible_scoped_catalog_returns_403():
    user = _user("section_items.manage")
    client, headers = _client(user)
    search = AsyncMock()

    for scope_type in ("school", "library", "research"):
        with (
            patch("app.api.v1._scoped._can_access_scope", return_value=False),
            patch.object(page_cms.PageCmsSourceService, "search", search),
        ):
            response = client.get(
                "/api/v1/page-section-sources/news",
                params={"layout_variant": "news_grid", "scope_type": scope_type, "scope_id": str(uuid.uuid4())},
                headers=headers,
            )

        assert response.status_code == 403

    search.assert_not_awaited()


def test_source_catalog_returns_standard_paginated_envelope():
    user = _user("section_items.manage")
    client, headers = _client(user)
    item = {
        "id": str(uuid.uuid4()),
        "source_type": "news",
        "label": "Graduation ceremony",
        "secondary_label": "Main campus",
        "status": "published",
        "published_at": None,
        "thumbnail_url": None,
        "metadata": {},
        "selectable": True,
    }
    result = PaginatedResult(
        items=[item],
        meta={"page": 1, "per_page": 20, "total": 1, "pages": 1},
    )

    with (
        patch("app.api.v1._scoped._can_access_scope", return_value=True),
        patch.object(page_cms.PageCmsSourceService, "search", AsyncMock(return_value=result)) as search,
    ):
        response = client.get(
            "/api/v1/page-section-sources/news?q=graduation&layout_variant=news_grid",
            headers=headers,
        )

    assert response.status_code == 200
    assert response.json()["data"] == [item]
    assert response.json()["meta"] == result.meta
    assert search.await_args.kwargs["query"] == "graduation"


def test_stats_provider_failure_returns_502():
    user = _user("section_items.manage")
    client, headers = _client(user)

    with (
        patch("app.api.v1._scoped._can_access_scope", return_value=True),
        patch.object(
            page_cms.PageCmsSourceService,
            "search",
            AsyncMock(side_effect=PageCmsSourceProviderError("research stats unavailable")),
        ),
    ):
        response = client.get(
            "/api/v1/page-section-sources/public_stat",
            params={
                "layout_variant": "facts_strip",
                "scope_type": "research",
                "scope_id": str(uuid.uuid4()),
            },
            headers=headers,
        )

    assert response.status_code == 502


def test_research_content_provider_failure_returns_stable_502():
    user = _user("section_items.manage")
    client, headers = _client(user)

    with (
        patch("app.api.v1._scoped._can_access_scope", return_value=True),
        patch.object(
            page_cms.PageCmsSourceService,
            "search",
            AsyncMock(side_effect=PageCmsSourceProviderError("Research content provider is unavailable")),
        ),
    ):
        response = client.get(
            "/api/v1/page-section-sources/research_project",
            params={
                "layout_variant": "research_cards",
                "scope_type": "research",
                "scope_id": str(uuid.uuid4()),
            },
            headers=headers,
        )

    assert response.status_code == 502
    assert response.json()["detail"] == "Research content provider is unavailable"
