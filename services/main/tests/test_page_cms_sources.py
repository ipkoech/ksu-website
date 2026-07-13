from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from pydantic import ValidationError

from app.models import Department, Event, News, Person, Programme, School, StaffAssignment
from app.schemas.page_cms import PageCmsSourceSummary
from app.services.page_cms_sources import (
    PageCmsSourcePreviewUnsupportedError,
    PageCmsSourceProviderError,
    PageCmsSourceResolutionState,
    PageCmsSourceService,
)
from app.services import page_cms_sources
from ksu_common import PaginatedResult


class _ScalarResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value

    def scalars(self):
        return self

    def all(self):
        if self.value is None:
            return []
        return list(self.value) if isinstance(self.value, (list, tuple)) else [self.value]


class _Db:
    def __init__(self, value=None):
        self.value = value
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _ScalarResult(self.value)


class _PreviewCapability:
    def __init__(self, allowed_scope_type, allowed_scope_id):
        self.allowed_scope_type = allowed_scope_type
        self.allowed_scope_id = allowed_scope_id

    async def allows(self, *, source_scope_type, source_scope_id, destination_scope_type, destination_scope_id):
        return (
            source_scope_type == self.allowed_scope_type
            and source_scope_id == self.allowed_scope_id
            and destination_scope_type == self.allowed_scope_type
            and destination_scope_id == self.allowed_scope_id
        )


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

    item = await PageCmsSourceService.resolve(
        _Db(person), "person", person.id,
        destination_scope_type="university", destination_scope_id=None,
    )

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
            destination_scope_type="university", destination_scope_id=None,
        )

    assert resolved == result.items[0]
    assert resolved.secondary_label == "62+"
    assert resolved.metadata["verified"] is True


@pytest.mark.asyncio
async def test_authorized_preview_can_include_same_scope_unpublished_news():
    school_id = uuid.uuid4()
    news = News(
        title="Draft graduation update",
        slug="draft-graduation-update",
        status="draft",
        workflow_status="draft",
        is_public=False,
        is_published=False,
        scope_type="school",
        scope_id=school_id,
    )
    news.id = uuid.uuid4()

    preview = await PageCmsSourceService.resolve(
        _Db(news), "news", news.id,
        destination_scope_type="school", destination_scope_id=school_id,
        preview_capability=_PreviewCapability("school", school_id),
    )
    public = await PageCmsSourceService.resolve(
        _Db(None), "news", news.id,
        destination_scope_type="school", destination_scope_id=school_id,
    )

    assert preview is not None
    assert preview.selectable is False
    assert public is None


@pytest.mark.asyncio
async def test_preview_resolution_denies_cross_scope_source_even_with_capability():
    source_school_id = uuid.uuid4()
    destination_school_id = uuid.uuid4()
    news = News(
        title="Private school update",
        slug="private-school-update",
        status="draft",
        is_public=False,
        is_published=False,
        scope_type="school",
        scope_id=source_school_id,
    )
    news.id = uuid.uuid4()

    result = await PageCmsSourceService.resolve(
        _Db(news), "news", news.id,
        destination_scope_type="school", destination_scope_id=destination_school_id,
        preview_capability=_PreviewCapability("school", destination_school_id),
    )

    assert result is None


@pytest.mark.asyncio
async def test_public_resolution_keeps_publication_filters_in_database_query():
    now = datetime.now(timezone.utc)
    news = News(
        title="Published update", slug="published-update", status="published",
        is_public=True, is_published=True, published_at=now - timedelta(days=1),
        scope_type="university", scope_id=None,
    )
    news.id = uuid.uuid4()
    db = _Db(news)

    await PageCmsSourceService.resolve(
        db, "news", news.id,
        destination_scope_type="university", destination_scope_id=None,
    )

    sql = str(db.statements[0]).lower()
    assert "news.is_public is true" in sql
    assert "news.is_published is true" in sql
    assert "news.status =" in sql
    assert "news.expires_at is null" in sql


@pytest.mark.asyncio
async def test_stat_ids_are_scope_specific_and_resolve_only_exact_scope():
    school_id = uuid.uuid4()
    school = School(name="School of Computing", slug="computing", code="SOC", is_active=True, is_public=True)
    school.id = school_id
    stat = SimpleNamespace(
        key="programmes", label="Programmes", value=12, suffix="", description="Active programmes", href=None,
    )

    async def stats_for_scope(_db, *, scope, slug=None):
        value = 12 if scope == "school" else 62
        return SimpleNamespace(scope=scope, stats=[SimpleNamespace(**{**stat.__dict__, "value": value})])

    with patch("app.services.page_cms_sources.public_stats", side_effect=stats_for_scope):
        university = await PageCmsSourceService.search(
            _Db(), "public_stat", "", "university", None, 1, 20,
        )
        school_result = await PageCmsSourceService.search(
            _Db(school), "public_stat", "", "school", school_id, 1, 20,
        )
        resolved = await PageCmsSourceService.resolve(
            _Db(school), "public_stat", school_result.items[0].id,
            destination_scope_type="school", destination_scope_id=school_id,
        )
        wrong_scope = await PageCmsSourceService.resolve(
            _Db(), "public_stat", school_result.items[0].id,
            destination_scope_type="university", destination_scope_id=None,
        )

    assert university.items[0].id != school_result.items[0].id
    assert resolved == school_result.items[0]
    assert wrong_scope is None


@pytest.mark.asyncio
async def test_school_stat_id_is_stable_when_slug_changes():
    school_id = uuid.uuid4()
    school = School(name="School of Computing", slug="old-slug", code="SOC", is_active=True, is_public=True)
    school.id = school_id
    stats = SimpleNamespace(scope="school", stats=[SimpleNamespace(
        key="programmes", label="Programmes", value=12, suffix="", description="Active programmes", href=None,
    )])

    with patch("app.services.page_cms_sources.public_stats", AsyncMock(return_value=stats)):
        before = await PageCmsSourceService.search(_Db(school), "public_stat", "", "school", school_id, 1, 20)
        school.slug = "new-slug"
        after = await PageCmsSourceService.search(_Db(school), "public_stat", "", "school", school_id, 1, 20)

    assert before.items[0].id == after.items[0].id
    assert str(school_id) not in str(before.items[0].metadata)


@pytest.mark.asyncio
@pytest.mark.parametrize("scope_type", ["research", "library"])
async def test_remote_public_stats_are_normalized_searched_and_paginated(scope_type):
    scope_id = uuid.uuid4()
    payload = {
        "scope": scope_type,
        "title": f"{scope_type.title()} stats",
        "stats": [
            {"key": "zeta", "label": "<b>Zeta</b>", "value": 2, "suffix": "", "description": "Other", "href": None},
            {"key": "projects", "label": "Projects", "value": 40, "suffix": "+", "description": "Active research projects", "href": "/projects"},
        ],
    }

    with patch("app.services.page_cms_sources.PageCmsStatsProxyService.get_public_stats", AsyncMock(return_value=payload)):
        result = await PageCmsSourceService.search(
            _Db(), "public_stat", "project", scope_type, scope_id, 1, 1,
        )

    assert result.meta == {"page": 1, "per_page": 1, "total": 1, "pages": 1}
    assert result.items[0].label == "Projects"
    assert result.items[0].secondary_label == "40+"
    assert result.items[0].metadata["scope"] == scope_type


@pytest.mark.asyncio
async def test_remote_stats_provider_errors_fail_closed():
    with patch(
        "app.services.page_cms_sources.PageCmsStatsProxyService.get_public_stats",
        AsyncMock(side_effect=PageCmsSourceProviderError("research stats unavailable")),
    ):
        with pytest.raises(PageCmsSourceProviderError, match="unavailable"):
            await PageCmsSourceService.search(
                _Db(), "public_stat", "", "research", uuid.uuid4(), 1, 20,
            )


@pytest.mark.asyncio
async def test_person_summary_uses_assignment_for_destination_scope_only():
    school_id = uuid.uuid4()
    library_id = uuid.uuid4()
    person = Person(first_name="Amina", last_name="Otieno", full_name="Amina Otieno", email="a@x.test", is_active=True, is_public=True)
    person.id = uuid.uuid4()
    school_assignment = StaffAssignment(
        person_id=person.id, entity_type="school", entity_id=school_id, role="dean",
        title="Dean, School of Computing", status="active", is_public=True, is_primary=False,
        start_date=date.today() - timedelta(days=10),
    )
    school_assignment.id = uuid.uuid4()
    library_assignment = StaffAssignment(
        person_id=person.id, entity_type="library", entity_id=library_id, role="director",
        title="Library Director", status="active", is_public=True, is_primary=True,
    )
    library_assignment.id = uuid.uuid4()
    future_assignment = StaffAssignment(
        person_id=person.id, entity_type="school", entity_id=school_id, role="dean",
        title="Future Dean", status="active", is_public=True, is_primary=True,
        start_date=date.today() + timedelta(days=10),
    )
    future_assignment.id = uuid.uuid4()
    person.assignments = [library_assignment, future_assignment, school_assignment]

    result = await PageCmsSourceService.resolve(
        _Db(person), "person", person.id,
        destination_scope_type="school", destination_scope_id=school_id,
    )

    assert result.secondary_label == "Dean, School of Computing"
    assert result.metadata.get("role") == "Dean"
    assert not any(key.endswith("_id") for key in result.metadata)


@pytest.mark.asyncio
async def test_programme_query_requires_public_active_department_and_school():
    with patch("app.services.page_cms_sources.paginate_query", AsyncMock(return_value=_page())) as paginate:
        await PageCmsSourceService.search(_Db(), "programme", "", "university", None, 1, 20)

    sql = str(paginate.await_args.args[1]).lower()
    for predicate in (
        "departments.deleted_at is null", "departments.is_active is true", "departments.is_public is true",
        "schools.deleted_at is null", "schools.is_active is true", "schools.is_public is true",
    ):
        assert predicate in sql


@pytest.mark.asyncio
async def test_event_search_excludes_past_events_and_orders_upcoming():
    with patch("app.services.page_cms_sources.paginate_query", AsyncMock(return_value=_page())) as paginate:
        await PageCmsSourceService.search(_Db(), "event", "", "university", None, 1, 20)

    sql = str(paginate.await_args.args[1]).lower()
    assert "coalesce(events.end_date, events.start_date)" in sql
    assert ">=" in sql
    assert "events.start_date asc" in sql
    assert "events.id asc" in sql


@pytest.mark.asyncio
async def test_partner_pagination_filters_before_local_page_and_reports_accurate_meta():
    valid_id = uuid.uuid4()
    pages = {
        1: {"data": [{"id": str(uuid.uuid4()), "name": "Expired", "status": "active", "is_active": True, "partnership_end": "2020-01-01"}], "meta": {"page": 1, "pages": 2, "total": 2}},
        2: {"data": [{"id": str(valid_id), "name": "Valid", "status": "active", "is_active": True}], "meta": {"page": 2, "pages": 2, "total": 2}},
    }

    async def remote_page(*, page, **_kwargs):
        return pages[page]

    with patch("app.services.page_cms_sources.ResearchPartnersProxyService.list_partners", side_effect=remote_page):
        first = await PageCmsSourceService.search(_Db(), "research_partner", "", "research", uuid.uuid4(), 1, 1)
        empty = await PageCmsSourceService.search(_Db(), "research_partner", "", "research", uuid.uuid4(), 2, 1)

    assert [item.id for item in first.items] == [valid_id]
    assert first.meta == {"page": 1, "per_page": 1, "total": 1, "pages": 1}
    assert empty.items == []
    assert empty.meta == {"page": 2, "per_page": 1, "total": 1, "pages": 1}


@pytest.mark.asyncio
async def test_partner_pagination_deduplicates_remote_records_before_counting():
    partner_id = uuid.uuid4()
    record = {"id": str(partner_id), "name": "One Partner", "status": "active", "is_active": True}
    pages = {
        1: {"data": [record], "meta": {"page": 1, "pages": 2, "total": 2}},
        2: {"data": [record], "meta": {"page": 2, "pages": 2, "total": 2}},
    }

    async def remote_page(*, page, **_kwargs):
        return pages[page]

    with patch("app.services.page_cms_sources.ResearchPartnersProxyService.list_partners", side_effect=remote_page):
        result = await PageCmsSourceService.search(
            _Db(), "research_partner", "", "research", uuid.uuid4(), 1, 20,
        )

    assert [item.id for item in result.items] == [partner_id]
    assert result.meta["total"] == 1


@pytest.mark.asyncio
async def test_partner_pagination_follows_more_than_ten_remote_pages():
    async def remote_page(*, page, **_kwargs):
        return {
            "data": [{"id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"partner:{page}")), "name": f"Partner {page:02d}", "status": "active", "is_active": True}],
            "meta": {"page": page, "pages": 12, "total": 12},
        }

    with patch("app.services.page_cms_sources.ResearchPartnersProxyService.list_partners", side_effect=remote_page) as proxy:
        result = await PageCmsSourceService.search(
            _Db(), "research_partner", "", "research", uuid.uuid4(), 1, 50,
        )

    assert proxy.await_count == 12
    assert result.meta["total"] == 12


@pytest.mark.asyncio
async def test_partner_resolution_follows_more_than_ten_remote_pages():
    target_id = uuid.uuid5(uuid.NAMESPACE_URL, "partner:12")

    async def remote_page(*, page, **_kwargs):
        return {
            "data": [{"id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"partner:{page}")), "name": f"Partner {page:02d}", "status": "active", "is_active": True}],
            "meta": {"page": page, "pages": 12, "total": 12},
        }

    with patch("app.services.page_cms_sources.ResearchPartnersProxyService.list_partners", side_effect=remote_page) as proxy:
        result = await PageCmsSourceService.resolve(
            _Db(), "research_partner", target_id,
            destination_scope_type="university", destination_scope_id=None,
        )

    assert proxy.await_count == 12
    assert result is not None
    assert result.id == target_id


@pytest.mark.asyncio
@pytest.mark.parametrize("scope_type", ["school", "library"])
async def test_partner_adapter_rejects_unsupported_scope(scope_type):
    with pytest.raises(ValueError, match="not available"):
        await PageCmsSourceService.search(
            _Db(), "research_partner", "", scope_type, uuid.uuid4(), 1, 20,
        )


@pytest.mark.asyncio
async def test_partner_search_excludes_future_partnerships():
    payload = {
        "data": [{
            "id": str(uuid.uuid4()), "name": "Future Partner", "status": "active", "is_active": True,
            "partnership_start": (date.today() + timedelta(days=30)).isoformat(),
        }],
        "meta": {"page": 1, "pages": 1, "total": 1},
    }
    with patch("app.services.page_cms_sources.ResearchPartnersProxyService.list_partners", AsyncMock(return_value=payload)):
        result = await PageCmsSourceService.search(
            _Db(), "research_partner", "", "university", None, 1, 20,
        )

    assert result.items == []


@pytest.mark.asyncio
async def test_partner_preview_capability_raises_explicit_unsupported_error():
    with (
        patch.object(PageCmsSourceService, "_load_public_partners", AsyncMock(return_value=[])),
        pytest.raises(PageCmsSourcePreviewUnsupportedError) as error,
    ):
        await PageCmsSourceService.resolve(
            _Db(), "research_partner", uuid.uuid4(),
            destination_scope_type="research", destination_scope_id=uuid.uuid4(),
            preview_capability=_PreviewCapability("research", uuid.uuid4()),
        )

    assert error.value.status_code == 422


@pytest.mark.asyncio
async def test_partner_preview_resolves_public_record_before_requiring_privileged_preview():
    partner_id = uuid.uuid4()
    public_partner = {
        "id": str(partner_id),
        "name": "Public Research Partner",
        "status": "active",
        "is_active": True,
        "is_public": True,
    }

    with patch.object(
        PageCmsSourceService,
        "_load_public_partners",
        AsyncMock(return_value=[public_partner]),
    ) as load:
        result = await PageCmsSourceService.resolve(
            _Db(),
            "research_partner",
            partner_id,
            destination_scope_type="research",
            destination_scope_id=uuid.uuid4(),
            preview_capability=_PreviewCapability("research", uuid.uuid4()),
        )

    assert result is not None
    assert result.id == partner_id
    load.assert_awaited_once_with("")


@pytest.mark.asyncio
async def test_resolve_many_batches_sql_sources_and_returns_typed_states_without_leaking_cross_scope_data():
    destination_school_id = uuid.uuid4()
    accessible = News(
        title="Accessible draft",
        slug="accessible-draft",
        status="draft",
        workflow_status="draft",
        is_public=False,
        is_published=False,
        scope_type="school",
        scope_id=destination_school_id,
    )
    accessible.id = uuid.uuid4()
    inaccessible = News(
        title="Secret cross-scope title",
        slug="secret-cross-scope-title",
        status="draft",
        workflow_status="draft",
        is_public=False,
        is_published=False,
        scope_type="school",
        scope_id=uuid.uuid4(),
    )
    inaccessible.id = uuid.uuid4()
    missing_id = uuid.uuid4()
    db = _Db([accessible, inaccessible])

    resolutions = await PageCmsSourceService.resolve_many(
        db,
        [
            ("news", accessible.id),
            ("news", inaccessible.id),
            ("news", missing_id),
        ],
        destination_scope_type="school",
        destination_scope_id=destination_school_id,
        preview_capability=_PreviewCapability("school", destination_school_id),
    )

    assert len(db.statements) == 1
    assert resolutions[("news", accessible.id)].state is PageCmsSourceResolutionState.RESOLVED
    inaccessible_result = resolutions[("news", inaccessible.id)]
    assert inaccessible_result.state is PageCmsSourceResolutionState.INACCESSIBLE
    assert inaccessible_result.source is None
    assert "Secret" not in inaccessible_result.message
    assert resolutions[("news", missing_id)].state is PageCmsSourceResolutionState.UNAVAILABLE


@pytest.mark.asyncio
async def test_resolve_many_preserves_provider_unsupported_and_preview_taxonomy():
    partner_id = uuid.uuid4()
    unsupported_id = uuid.uuid4()

    with patch.object(
        PageCmsSourceService,
        "_load_public_partners",
        AsyncMock(side_effect=PageCmsSourceProviderError("provider detail must not leak")),
    ) as load:
        resolutions = await PageCmsSourceService.resolve_many(
            _Db(),
            [
                ("research_partner", partner_id),
                ("research_partner", uuid.uuid4()),
                ("intake", unsupported_id),
            ],
            destination_scope_type="research",
            destination_scope_id=uuid.uuid4(),
            preview_capability=_PreviewCapability("research", uuid.uuid4()),
        )

    load.assert_awaited_once_with("")
    assert resolutions[("research_partner", partner_id)].state is PageCmsSourceResolutionState.PROVIDER_ERROR
    assert resolutions[("research_partner", partner_id)].message == "Source provider is unavailable."
    assert resolutions[("intake", unsupported_id)].state is PageCmsSourceResolutionState.UNAVAILABLE


@pytest.mark.asyncio
async def test_resolve_many_fetches_public_partner_provider_once_for_multiple_references():
    first_id = uuid.uuid4()
    second_id = uuid.uuid4()
    records = [
        {"id": str(first_id), "name": "First", "status": "active", "is_active": True, "is_public": True},
        {"id": str(second_id), "name": "Second", "status": "active", "is_active": True, "is_public": True},
    ]

    with patch.object(
        PageCmsSourceService,
        "_load_public_partners",
        AsyncMock(return_value=records),
    ) as load:
        resolutions = await PageCmsSourceService.resolve_many(
            _Db(),
            [("research_partner", first_id), ("research_partner", second_id)],
            destination_scope_type="research",
            destination_scope_id=uuid.uuid4(),
            preview_capability=_PreviewCapability("research", uuid.uuid4()),
        )

    load.assert_awaited_once_with("")
    assert all(result.state is PageCmsSourceResolutionState.RESOLVED for result in resolutions.values())


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "provider_error",
    [
        httpx.ConnectError("research transport unavailable"),
        ValueError("research response was not valid JSON"),
    ],
)
async def test_partner_resolve_many_normalizes_proxy_failures(provider_error):
    partner_id = uuid.uuid4()

    with patch(
        "app.services.page_cms_sources.ResearchPartnersProxyService.list_partners",
        AsyncMock(side_effect=provider_error),
    ):
        resolutions = await PageCmsSourceService.resolve_many(
            _Db(),
            [("research_partner", partner_id)],
            destination_scope_type="research",
            destination_scope_id=uuid.uuid4(),
        )

    result = resolutions[("research_partner", partner_id)]
    assert result.state is PageCmsSourceResolutionState.PROVIDER_ERROR
    assert result.message == "Source provider is unavailable."


@pytest.mark.asyncio
@pytest.mark.parametrize("source_type", ["programme", "news", "event", "person"])
async def test_resolve_many_chunks_large_sql_source_id_sets(source_type):
    source_ids = [uuid.uuid4() for _ in range(1001)]
    db = _Db([])

    resolutions = await PageCmsSourceService.resolve_many(
        db,
        [(source_type, source_id) for source_id in source_ids],
        destination_scope_type="university",
        destination_scope_id=None,
    )

    assert len(db.statements) == 3
    assert list(resolutions) == [(source_type, source_id) for source_id in source_ids]
    assert all(result.state is PageCmsSourceResolutionState.UNAVAILABLE for result in resolutions.values())
    for statement in db.statements:
        parameter_sizes = [
            len(value)
            for value in statement.compile().params.values()
            if isinstance(value, (list, tuple))
        ]
        assert parameter_sizes
        assert max(parameter_sizes) <= page_cms_sources.PAGE_CMS_BULK_CHUNK_SIZE


@pytest.mark.asyncio
async def test_resolve_many_finds_public_stat_beyond_first_catalog_page():
    stats = SimpleNamespace(
        scope="university",
        stats=[
            SimpleNamespace(
                key=f"stat-{index:03d}",
                label=f"Stat {index:03d}",
                value=index,
                suffix="",
                description=None,
                href=None,
            )
            for index in range(75)
        ],
    )

    with patch("app.services.page_cms_sources.public_stats", AsyncMock(return_value=stats)):
        second_page = await PageCmsSourceService.search(
            _Db(), "public_stat", "", "university", None, 2, 50,
        )
        target = second_page.items[-1]
        resolutions = await PageCmsSourceService.resolve_many(
            _Db(),
            [("public_stat", target.id)],
            destination_scope_type="university",
            destination_scope_id=None,
        )

    result = resolutions[("public_stat", target.id)]
    assert result.state is PageCmsSourceResolutionState.RESOLVED
    assert result.source == target


def test_source_summary_strips_html_bounds_text_and_rejects_unsafe_thumbnail():
    summary = PageCmsSourceSummary(
        id=uuid.uuid4(), source_type="news", label="<b>Hello</b><script>alert(1)</script>",
        secondary_label="x" * 2000, status="published", thumbnail_url="/media/image.jpg",
        metadata={"description": "<p>Safe text</p>"},
    )

    assert summary.label == "Hello"
    assert len(summary.secondary_label) <= 500
    assert summary.metadata["description"] == "Safe text"
    with pytest.raises(ValidationError):
        PageCmsSourceSummary(
            id=uuid.uuid4(), source_type="news", label="Unsafe", status="published",
            thumbnail_url="javascript:alert(1)",
        )


@pytest.mark.asyncio
async def test_unknown_source_type_is_rejected():
    with pytest.raises(ValueError, match="Unsupported Page CMS source type"):
        await PageCmsSourceService.search(
            _Db(), "unknown", "", "university", None, 1, 20,
        )
