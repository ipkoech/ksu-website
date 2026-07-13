from __future__ import annotations

from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
import uuid

import pytest

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
        contact_person=None,
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
        contact_person=None,
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
        cover_image=None,
        schools=None,
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
    contacts_page = SimpleNamespace(items=[contact], meta={"page": 1, "per_page": 20, "total": 1, "pages": 1})
    faq_page = SimpleNamespace(items=[faq], meta={"page": 1, "per_page": 100, "total": 1, "pages": 1})

    with (
        patch("app.services.public_contact_directory.UniversityInfoService.get_current", AsyncMock(return_value=institution)),
        patch("app.services.public_contact_directory.ContactService.list", AsyncMock(side_effect=[main_page, contacts_page])),
        patch("app.services.public_contact_directory.CampusService.list", AsyncMock(return_value=[campus])),
        patch("app.services.public_contact_directory.FAQService.list", AsyncMock(return_value=faq_page)),
    ):
        result = await PublicContactDirectoryService.compose(db, page=1, per_page=20)

    assert result.institution is not None
    assert all(item.is_public and item.status == "active" for item in result.contacts.items)
    assert all(item.is_main for item in result.main_contacts)
    assert all(item.is_public and item.status == "published" for item in result.faqs)
    assert not hasattr(result.institution, "internal_notes")


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
