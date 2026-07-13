from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, call, patch

from fastapi import FastAPI
import pytest

from app.api.v1 import contact_directory, register_routes
from app.services import PublicContactDirectoryService


def _record(**values):
    now = datetime.now(timezone.utc)
    return SimpleNamespace(id=uuid.uuid4(), created_at=now, updated_at=now, **values)


@pytest.fixture
def db():
    return object()


@pytest.fixture
def empty_db():
    return object()


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_contact_directory_composes_only_public_records(db):
    scope_id = uuid.uuid4()
    institution = _record(
        name="Kisii State University",
        short_name="KSU",
        acronym="KSU",
        email="info@example.edu",
        phone="+254700000000",
        alternate_phone=None,
        website="https://example.edu",
        postal_address="P.O. Box 1",
        physical_address="Main Campus",
        city="Kisii",
        county="Kisii",
        country="Kenya",
        social_links={"x": "https://x.com/ksu"},
        internal_notes="must not be exposed",
    )
    main_contact = _record(
        name="University Switchboard",
        contact_type="switchboard",
        email="switchboard@example.edu",
        phone=["+254700000001"],
        extension=None,
        physical_address="Administration Block",
        building="Administration Block",
        room_number="1",
        operating_hours=None,
        contact_person_id=None,
        scope_type=None,
        scope_id=None,
        is_main=True,
        is_public=True,
        status="active",
        contact_person=object(),
        deleted_at=None,
    )
    contact = _record(
        name="Admissions Office",
        contact_type="admissions",
        email="admissions@example.edu",
        phone=["+254700000002"],
        extension="200",
        physical_address="Academic Block",
        building="Academic Block",
        room_number="2",
        operating_hours=None,
        contact_person_id=None,
        scope_type=None,
        scope_id=None,
        is_main=False,
        is_public=True,
        status="active",
        contact_person=object(),
        deleted_at=None,
    )
    campus = _record(
        name="Main Campus",
        slug="main-campus",
        code="MAIN",
        campus_type="main",
        address="Main Campus Road",
        city="Kisii",
        county="Kisii",
        postal_code="40200",
        gps_latitude=None,
        gps_longitude=None,
        description=None,
        email="campus@example.edu",
        phone="+254700000003",
        cover_image_id=None,
        cover_image=object(),
        schools=[object()],
        is_active=True,
        display_order=1,
    )
    faq = _record(
        question="How do I contact admissions?",
        answer_plain_text="Use the admissions contact.",
        answer_rich_text=None,
        answer_structured=None,
        category="contacts",
        scope_type=None,
        scope_id=None,
        is_main=True,
        is_public=True,
        status="published",
        display_order=1,
        views_count=0,
        helpful_count=0,
        deleted_at=None,
    )
    main_page = SimpleNamespace(items=[main_contact], meta={"page": 1, "per_page": 100, "total": 1, "pages": 1})
    contacts_page = SimpleNamespace(items=[contact], meta={"page": 3, "per_page": 7, "total": 1, "pages": 1})
    faq_page = SimpleNamespace(items=[faq], meta={"page": 1, "per_page": 100, "total": 1, "pages": 1})
    get_institution = AsyncMock(return_value=institution)
    list_contacts = AsyncMock(side_effect=[main_page, contacts_page])
    list_campuses = AsyncMock(return_value=[campus])
    list_faqs = AsyncMock(return_value=faq_page)

    with (
        patch("app.services.public_contact_directory.UniversityInfoService.get_current", get_institution),
        patch("app.services.public_contact_directory.ContactService.list", list_contacts),
        patch("app.services.public_contact_directory.CampusService.list", list_campuses),
        patch("app.services.public_contact_directory.FAQService.list", list_faqs),
    ):
        result = await PublicContactDirectoryService.compose(
            db,
            search="admissions",
            contact_type="office",
            scope_type="wing",
            scope_id=scope_id,
            page=3,
            per_page=7,
        )

    assert result.institution is not None
    assert all(item.is_public and item.status == "active" for item in result.contacts.items)
    assert all(item.is_main for item in result.main_contacts)
    assert all(item.is_public and item.status == "published" for item in result.faqs)
    assert not hasattr(result.institution, "internal_notes")
    assert "contact_person" not in result.main_contacts[0].model_dump()
    assert "contact_person" not in result.contacts.items[0].model_dump()
    assert "cover_image" not in result.campuses[0].model_dump()
    assert "schools" not in result.campuses[0].model_dump()
    get_institution.assert_awaited_once_with(db, public_only=True)
    list_contacts.assert_has_awaits(
        [
            call(db, page=1, per_page=100, is_main=True),
            call(
                db,
                page=3,
                per_page=7,
                search="admissions",
                contact_type="office",
                scope_type="wing",
                scope_id=scope_id,
            ),
        ]
    )
    list_campuses.assert_awaited_once_with(db, is_active=True)
    list_faqs.assert_awaited_once_with(db, page=1, per_page=100, is_main=True)


@pytest.mark.anyio
async def test_contact_directory_empty_state_is_stable(empty_db):
    empty_page = SimpleNamespace(items=[], meta={"page": 1, "per_page": 20, "total": 0, "pages": 0})
    empty_large_page = SimpleNamespace(items=[], meta={"page": 1, "per_page": 100, "total": 0, "pages": 0})

    with (
        patch("app.services.public_contact_directory.UniversityInfoService.get_current", AsyncMock(return_value=None)),
        patch("app.services.public_contact_directory.ContactService.list", AsyncMock(side_effect=[empty_large_page, empty_page])),
        patch("app.services.public_contact_directory.CampusService.list", AsyncMock(return_value=[])),
        patch("app.services.public_contact_directory.FAQService.list", AsyncMock(return_value=empty_large_page)),
    ):
        result = await PublicContactDirectoryService.compose(empty_db, page=1, per_page=20)

    assert result.institution is None
    assert result.main_contacts == []
    assert result.contacts.items == []
    assert result.contacts.meta.total == 0
    assert result.campuses == []
    assert result.faqs == []


@pytest.mark.anyio
async def test_contact_directory_loads_every_main_contact_and_faq_page(db):
    main_contacts = [
        _record(
            name=f"Main contact {index:03d}",
            contact_type="office",
            email=f"main-{index}@example.edu",
            phone=[],
            extension=None,
            physical_address=None,
            building=None,
            room_number=None,
            operating_hours=None,
            contact_person_id=None,
            scope_type=None,
            scope_id=None,
            is_main=True,
            is_public=True,
            status="active",
            deleted_at=None,
        )
        for index in range(101)
    ]
    faqs = [
        _record(
            question=f"Contact question {index:03d}?",
            answer_plain_text=f"Contact answer {index:03d}.",
            answer_rich_text=None,
            answer_structured=None,
            category="contacts",
            scope_type=None,
            scope_id=None,
            is_main=True,
            is_public=True,
            status="published",
            display_order=index,
            views_count=0,
            helpful_count=0,
            deleted_at=None,
        )
        for index in range(101)
    ]
    empty_contacts = SimpleNamespace(
        items=[],
        meta={"page": 1, "per_page": 20, "total": 0, "pages": 0},
    )

    async def list_contacts(_db, **kwargs):
        if not kwargs.get("is_main"):
            return empty_contacts
        page = kwargs["page"]
        return SimpleNamespace(
            items=main_contacts[(page - 1) * 100 : page * 100],
            meta={"page": page, "per_page": 100, "total": 101, "pages": 2},
        )

    async def list_faqs(_db, **kwargs):
        page = kwargs["page"]
        return SimpleNamespace(
            items=faqs[(page - 1) * 100 : page * 100],
            meta={"page": page, "per_page": 100, "total": 101, "pages": 2},
        )

    list_contacts_mock = AsyncMock(side_effect=list_contacts)
    list_faqs_mock = AsyncMock(side_effect=list_faqs)
    with (
        patch(
            "app.services.public_contact_directory.UniversityInfoService.get_current",
            AsyncMock(return_value=None),
        ),
        patch(
            "app.services.public_contact_directory.ContactService.list",
            list_contacts_mock,
        ),
        patch(
            "app.services.public_contact_directory.CampusService.list",
            AsyncMock(return_value=[]),
        ),
        patch(
            "app.services.public_contact_directory.FAQService.list",
            list_faqs_mock,
        ),
    ):
        result = await PublicContactDirectoryService.compose(db)

    assert [item.name for item in result.main_contacts] == [
        item.name for item in main_contacts
    ]
    assert [item.question for item in result.faqs] == [item.question for item in faqs]
    assert list_contacts_mock.await_args_list == [
        call(db, page=1, per_page=100, is_main=True),
        call(db, page=2, per_page=100, is_main=True),
        call(
            db,
            page=1,
            per_page=20,
            search=None,
            contact_type=None,
            scope_type=None,
            scope_id=None,
        ),
    ]
    assert list_faqs_mock.await_args_list == [
        call(db, page=1, per_page=100, is_main=True),
        call(db, page=2, per_page=100, is_main=True),
    ]


@pytest.mark.anyio
async def test_public_contact_directory_route_returns_envelope_and_varies_cache():
    class _Redis:
        def __init__(self):
            self.keys = []
            self.timeouts = []

        async def get(self, key):
            return None

        async def setex(self, key, timeout, _value):
            self.keys.append(key)
            self.timeouts.append(timeout)

    redis = _Redis()
    compose = AsyncMock(return_value={"contacts": []})
    scope_id = uuid.uuid4()
    variants = [
        {},
        {"q": "registry"},
        {"contact_type": "office"},
        {"scope_type": "wing"},
        {"scope_id": scope_id},
        {"page": 2},
        {"per_page": 40},
        {
            "q": "admissions",
            "contact_type": "office",
            "scope_type": "wing",
            "scope_id": scope_id,
            "page": 3,
            "per_page": 7,
        },
    ]

    with (
        patch("ksu_common.cache.get_redis", AsyncMock(return_value=redis)),
        patch.object(contact_directory.PublicContactDirectoryService, "compose", compose),
    ):
        responses = []
        for variant in variants:
            arguments = {
                "db": object(),
                "q": None,
                "contact_type": None,
                "scope_type": None,
                "scope_id": None,
                "page": 1,
                "per_page": 20,
            }
            arguments.update(variant)
            responses.append(await contact_directory.get_public_contact_directory(**arguments))

    assert len(set(redis.keys)) == len(variants)
    assert redis.timeouts == [300] * len(variants)
    assert json.loads(responses[0].body) == {
        "status": "success",
        "message": "ok",
        "data": {"contacts": []},
    }
    assert compose.await_args_list[-1].kwargs == {
        "search": "admissions",
        "contact_type": "office",
        "scope_type": "wing",
        "scope_id": scope_id,
        "page": 3,
        "per_page": 7,
    }


def test_public_contact_directory_route_is_registered_before_contact_detail():
    app = FastAPI()
    register_routes(app)
    prefixes = [
        route.include_context.prefix
        for route in app.routes
        if hasattr(route, "include_context")
    ]

    assert prefixes.index("/api/v1/contact-directory") < prefixes.index(
        "/api/v1/contacts"
    )
