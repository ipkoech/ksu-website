from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from app.models import Event, News, Person, Programme, StaffAssignment
from app.services.page_cms_sources import PageCmsSourceService
from ksu_common import PaginatedResult


class _ScalarResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


class _Db:
    def __init__(self, value=None):
        self.value = value
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _ScalarResult(self.value)


def _page(*items, per_page=20):
    return PaginatedResult(
        items=list(items),
        meta={"page": 1, "per_page": per_page, "total": len(items), "pages": 1},
    )


@pytest.mark.asyncio
async def test_programme_search_uses_public_school_scope_and_summary_fields():
    school_id = uuid.uuid4()
    programme = Programme(
        name="Bachelor of Software Engineering",
        code="BSE",
        slug="bachelor-software-engineering",
        level="undergraduate",
        duration="4 years",
        department_id=uuid.uuid4(),
        is_active=True,
    )
    programme.id = uuid.uuid4()

    with patch(
        "app.services.page_cms_sources.paginate_query",
        AsyncMock(return_value=_page(programme)),
    ) as paginate:
        result = await PageCmsSourceService.search(
            _Db(), "programme", "software", "school", school_id, 1, 20,
        )

    sql = str(paginate.await_args.args[1]).lower()
    assert "programmes.is_active is true" in sql
    assert "departments.school_id" in sql
    assert result.items[0].label == programme.name
    assert result.items[0].secondary_label == "BSE | Undergraduate"
    assert result.items[0].metadata["duration"] == "4 years"


@pytest.mark.asyncio
@pytest.mark.parametrize("model,source_type", [(News, "news"), (Event, "event")])
async def test_public_content_search_enforces_publication_and_validity_window(model, source_type):
    now = datetime.now(timezone.utc)
    kwargs = {
        "title": "Graduation week",
        "slug": f"graduation-{source_type}",
        "scope_type": "university",
        "scope_id": None,
        "is_public": True,
        "is_published": True,
        "status": "published",
        "published_at": now - timedelta(days=1),
    }
    if model is Event:
        kwargs["start_date"] = now + timedelta(days=7)
    item = model(**kwargs)
    item.id = uuid.uuid4()

    with patch(
        "app.services.page_cms_sources.paginate_query",
        AsyncMock(return_value=_page(item)),
    ) as paginate:
        result = await PageCmsSourceService.search(
            _Db(), source_type, "graduation", "university", None, 1, 20,
        )

    sql = str(paginate.await_args.args[1]).lower()
    assert f"{model.__tablename__}.deleted_at is null" in sql
    assert f"{model.__tablename__}.archived_at is null" in sql
    assert f"{model.__tablename__}.is_public is true" in sql
    assert f"{model.__tablename__}.is_published is true" in sql
    assert f"{model.__tablename__}.status =" in sql
    assert f"{model.__tablename__}.valid_from is null" in sql
    assert f"{model.__tablename__}.valid_to is null" in sql
    assert result.items[0].status == "published"


@pytest.mark.asyncio
async def test_person_summary_uses_name_and_current_title():
    person = Person(
        first_name="Amina",
        last_name="Otieno",
        full_name="Amina Otieno",
        email="amina@example.test",
        is_active=True,
        is_public=True,
    )
    person.id = uuid.uuid4()
    assignment = StaffAssignment(
        person_id=person.id,
        entity_type="university",
        role="director",
        title="Director of Quality Assurance",
        status="active",
        is_public=True,
        is_primary=True,
    )
    assignment.id = uuid.uuid4()
    person.assignments = [assignment]

    item = await PageCmsSourceService.resolve(_Db(person), "person", person.id, preview=True)

    assert item.label == person.full_name
    assert item.secondary_label == assignment.title
    assert item.status == "active"


@pytest.mark.asyncio
async def test_public_person_search_excludes_private_inactive_and_deleted_records():
    with patch(
        "app.services.page_cms_sources.paginate_query",
        AsyncMock(return_value=_page()),
    ) as paginate:
        await PageCmsSourceService.search(
            _Db(), "person", "amina", "library", uuid.uuid4(), 1, 20,
        )

    sql = str(paginate.await_args.args[1]).lower()
    assert "persons.deleted_at is null" in sql
    assert "persons.is_active is true" in sql
    assert "persons.is_public is true" in sql
    assert "staff_assignments.entity_type" in sql
    assert "staff_assignments.entity_id" in sql
    assert "staff_assignments.status =" in sql
    assert "staff_assignments.is_public is true" in sql
    assert "staff_assignments.end_date is null" in sql


@pytest.mark.asyncio
async def test_partner_search_uses_proxy_and_caps_page_size():
    partner_id = uuid.uuid4()
    payload = {
        "data": [{
            "id": str(partner_id),
            "name": "Lake Region Innovation Hub",
            "acronym": "LRIH",
            "partner_type": "industry",
            "country": "Kenya",
            "status": "active",
            "is_active": True,
            "logo_url": "https://example.test/logo.png",
        }],
        "meta": {"page": 1, "per_page": 50, "total": 1, "pages": 1},
    }

    with patch(
        "app.services.page_cms_sources.ResearchPartnersProxyService.list_partners",
        AsyncMock(return_value=payload),
    ) as list_partners:
        result = await PageCmsSourceService.search(
            _Db(), "research_partner", "lake", "research", uuid.uuid4(), 1, 500,
        )

    assert list_partners.await_args.kwargs["per_page"] == 50
    assert list_partners.await_args.kwargs["status"] == "active"
    assert result.items[0].id == partner_id
    assert result.items[0].thumbnail_url == "https://example.test/logo.png"


@pytest.mark.asyncio
async def test_partner_search_excludes_expired_active_records():
    payload = {
        "data": [{
            "id": str(uuid.uuid4()),
            "name": "Expired Partnership",
            "status": "active",
            "is_active": True,
            "partnership_end": "2020-01-01",
        }],
        "meta": {"page": 1, "per_page": 20, "total": 1, "pages": 1},
    }

    with patch(
        "app.services.page_cms_sources.ResearchPartnersProxyService.list_partners",
        AsyncMock(return_value=payload),
    ):
        result = await PageCmsSourceService.search(
            _Db(), "research_partner", "", "research", uuid.uuid4(), 1, 20,
        )

    assert result.items == []


@pytest.mark.asyncio
async def test_public_stat_search_returns_stable_resolvable_summaries():
    stats = SimpleNamespace(
        scope="university",
        stats=[SimpleNamespace(
            key="programmes",
            label="Programmes",
            value=62,
            suffix="+",
            description="Active academic programmes",
            href="/academics/programmes",
        )],
    )

    with patch("app.services.page_cms_sources.public_stats", AsyncMock(return_value=stats)):
        result = await PageCmsSourceService.search(
            _Db(), "public_stat", "programme", "university", None, 1, 20,
        )
        resolved = await PageCmsSourceService.resolve(
            _Db(), "public_stat", result.items[0].id,
        )

    assert resolved == result.items[0]
    assert resolved.secondary_label == "62+"
    assert resolved.metadata["verified"] is True


@pytest.mark.asyncio
async def test_preview_resolution_can_include_unpublished_news_but_public_resolution_cannot():
    news = News(
        title="Draft graduation update",
        slug="draft-graduation-update",
        status="draft",
        workflow_status="draft",
        is_public=False,
        is_published=False,
    )
    news.id = uuid.uuid4()

    preview = await PageCmsSourceService.resolve(_Db(news), "news", news.id, preview=True)
    public = await PageCmsSourceService.resolve(_Db(None), "news", news.id)

    assert preview is not None
    assert preview.selectable is False
    assert public is None


@pytest.mark.asyncio
async def test_unknown_source_type_is_rejected():
    with pytest.raises(ValueError, match="Unsupported Page CMS source type"):
        await PageCmsSourceService.search(
            _Db(), "unknown", "", "university", None, 1, 20,
        )
