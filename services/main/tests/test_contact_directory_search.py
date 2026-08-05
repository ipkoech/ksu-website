from __future__ import annotations

import inspect
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, load_only

from app.api.v1 import contacts
from app.models import ContactDirectory
from app.services import ContactService


class _AsyncSessionAdapter:
    def __init__(self, session: Session):
        self._session = session

    def add_all(self, instances):
        self._session.add_all(instances)

    async def flush(self):
        self._session.flush()

    async def execute(self, statement):
        return self._session.execute(statement)


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def db():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    with engine.begin() as connection:
        connection.exec_driver_sql(
            """
            CREATE TABLE contact_directory (
                id UUID PRIMARY KEY,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                deleted_at DATETIME,
                name VARCHAR(255) NOT NULL,
                contact_type VARCHAR(64),
                email VARCHAR(320),
                phone JSON,
                extension VARCHAR(16),
                physical_address VARCHAR(255),
                building VARCHAR(128),
                room_number VARCHAR(64),
                operating_hours JSON,
                contact_person_id UUID,
                scope_type VARCHAR(32),
                scope_id UUID,
                is_main BOOLEAN NOT NULL DEFAULT 0,
                is_public BOOLEAN NOT NULL DEFAULT 1,
                status VARCHAR(32) NOT NULL DEFAULT 'active',
                updated_by_id UUID
            )
            """
        )

    with Session(engine) as session:
        yield _AsyncSessionAdapter(session)


async def _insert(db, *contacts):
    db.add_all(contacts)
    await db.flush()


@pytest.mark.anyio
async def test_contact_search_filters_before_pagination(db):
    await _insert(
        db,
        ContactDirectory(name="Admissions Office", contact_type="admissions", is_public=True, status="active"),
        ContactDirectory(name="Graduate Admissions", contact_type="admissions", is_public=True, status="active"),
        ContactDirectory(name="Student Finance", contact_type="finance", is_public=True, status="active"),
    )

    result = await ContactService.list(
        db,
        page=1,
        per_page=1,
        search="admissions",
        contact_type="admissions",
        sort="name_asc",
    )

    assert result.meta["total"] == 2
    assert len(result.items) == 1
    assert "Admissions" in result.items[0].name


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("search", "field"),
    [
        ("registry", "name"),
        ("registrar", "contact_type"),
        ("records@example.edu", "email"),
        ("4242", "extension"),
        ("campus avenue", "physical_address"),
        ("administration tower", "building"),
        ("b-204", "room_number"),
    ],
)
async def test_contact_search_matches_each_directory_field(db, search, field):
    contact = ContactDirectory(
        name="Academic Registry",
        contact_type="registrar",
        email="records@example.edu",
        extension="4242",
        physical_address="Main Campus Avenue",
        building="Administration Tower",
        room_number="B-204",
        is_public=True,
        status="active",
    )
    await _insert(db, contact)

    result = await ContactService.list(db, search=search)

    assert [item.id for item in result.items] == [contact.id], field


@pytest.mark.anyio
async def test_public_contact_search_excludes_non_public_records(db):
    deleted = ContactDirectory(name="Hidden Deleted", is_public=True, status="active")
    deleted.deleted_at = datetime.now(timezone.utc)
    await _insert(
        db,
        ContactDirectory(name="Hidden Private", is_public=False, status="active"),
        ContactDirectory(name="Hidden Inactive", is_public=True, status="inactive"),
        deleted,
    )

    result = await ContactService.list(db, search="hidden")

    assert result.items == []
    assert result.meta["total"] == 0


@pytest.mark.anyio
async def test_contact_search_supports_descending_name_sort(db):
    await _insert(
        db,
        ContactDirectory(name="Alpha Admissions", is_public=True, status="active"),
        ContactDirectory(name="Zulu Admissions", is_public=True, status="active"),
    )

    result = await ContactService.list(db, search="admissions", sort="name_desc")

    assert [item.name for item in result.items] == ["Zulu Admissions", "Alpha Admissions"]


@pytest.mark.anyio
async def test_contact_search_rejects_unsupported_sort(db):
    with pytest.raises(ValueError, match="Unsupported contact sort"):
        await ContactService.list(db, sort="created_desc")


@pytest.mark.anyio
async def test_admin_contact_scope_authorization_filters_before_pagination(db):
    authorized_scope_id = uuid.uuid4()
    unauthorized_scope_id = uuid.uuid4()
    await _insert(
        db,
        ContactDirectory(name="Alpha", scope_type="wing", scope_id=unauthorized_scope_id),
        ContactDirectory(name="Bravo", scope_type="wing", scope_id=authorized_scope_id),
        ContactDirectory(name="Charlie", scope_type="wing", scope_id=unauthorized_scope_id),
        ContactDirectory(name="Delta", scope_type="wing", scope_id=authorized_scope_id),
        ContactDirectory(name="Echo", scope_type="wing", scope_id=authorized_scope_id),
    )

    async def is_visible(scope_type, scope_id):
        return scope_type == "wing" and scope_id == authorized_scope_id

    result = await ContactService.list_admin_authorized(
        db,
        page=1,
        per_page=2,
        is_visible=is_visible,
    )

    assert [item.name for item in result.items] == ["Bravo", "Delta"]
    assert result.meta == {"page": 1, "per_page": 2, "total": 3, "pages": 2}


@pytest.mark.anyio
async def test_admin_contact_scope_authorization_preserves_field_selection(db):
    scope_id = uuid.uuid4()
    await _insert(db, ContactDirectory(name="Admissions", scope_type="wing", scope_id=scope_id))

    async def is_visible(_scope_type, _scope_id):
        return True

    result = await ContactService.list_admin_authorized(
        db,
        is_visible=is_visible,
        load_options=(load_only(ContactDirectory.id, ContactDirectory.name),),
    )

    assert [item.name for item in result.items] == ["Admissions"]


class _Selector:
    load_options = ()

    def apply(self, value):
        return value


@pytest.mark.anyio
async def test_public_route_forwards_contact_query_parameters():
    page = SimpleNamespace(items=[], meta={"page": 2, "per_page": 5, "total": 0, "pages": 0})
    list_contacts = AsyncMock(return_value=page)

    with (
        patch.object(contacts, "build_selector", return_value=_Selector()),
        patch.object(contacts.ContactService, "list", list_contacts),
    ):
        await contacts.list_contacts.__wrapped__(
            db=None,
            page=2,
            per_page=5,
            q="admissions",
            contact_type="office",
            sort="name_desc",
        )

    list_contacts.assert_awaited_once()
    assert list_contacts.await_args.kwargs["search"] == "admissions"
    assert list_contacts.await_args.kwargs["contact_type"] == "office"
    assert list_contacts.await_args.kwargs["sort"] == "name_desc"


@pytest.mark.anyio
async def test_admin_route_forwards_contact_query_parameters():
    page = SimpleNamespace(items=[], meta={"page": 2, "per_page": 5, "total": 0, "pages": 0})
    list_contacts = AsyncMock(return_value=page)

    with (
        patch.object(contacts, "build_selector", return_value=_Selector()),
        patch.object(contacts.ContactService, "list_admin_authorized", list_contacts),
    ):
        await contacts.list_admin_contacts(
            db=None,
            user=SimpleNamespace(),
            page=2,
            per_page=5,
            q="admissions",
            contact_type="office",
            sort="name_desc",
        )

    list_contacts.assert_awaited_once()
    assert list_contacts.await_args.kwargs["search"] == "admissions"
    assert list_contacts.await_args.kwargs["contact_type"] == "office"
    assert list_contacts.await_args.kwargs["sort"] == "name_desc"


def test_contact_routes_reject_invalid_sort_through_fastapi_typing():
    for path in {"", "/admin"}:
        route = next(route for route in contacts.router.routes if route.path == path)
        sort_field = next(field for field in route.dependant.query_params if field.name == "sort")

        _, errors = sort_field.validate("created_desc", {}, loc=("query", "sort"))

        assert errors


def test_public_contact_cache_varies_on_contact_query_parameters():
    vary_on = inspect.getclosurevars(contacts.list_contacts).nonlocals["vary_on"]

    assert {"q", "contact_type", "sort"}.issubset(vary_on)
