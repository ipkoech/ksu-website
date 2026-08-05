from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app.api.v1 import contacts
from app.models import Department, Division, Person, School, Wing
from app.schemas import ContactDirectoryCreate
from app.services import ContactReferenceError, ContactService


class _ScalarResult:
    def __init__(self, value):
        self._value = value

    def scalar_one_or_none(self):
        return self._value


class _ReferenceDb:
    def __init__(self, existing_model=None, existing_id=None):
        self.existing_model = existing_model
        self.existing_id = existing_id
        self.queried_model = None
        self.statement = None

    async def execute(self, statement):
        self.statement = statement
        self.queried_model = statement.column_descriptions[0]["entity"]
        value = self.existing_id if self.queried_model is self.existing_model else None
        return _ScalarResult(value)

    async def flush(self):
        pass


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("scope_type", "model"),
    [
        ("division", Division),
        ("wing", Wing),
        ("school", School),
        ("department", Department),
    ],
)
async def test_contact_owner_accepts_existing_organizational_scope(scope_type, model):
    scope_id = uuid.uuid4()
    db = _ReferenceDb(model, scope_id)

    await ContactService.validate_references(db, scope_type=scope_type, scope_id=scope_id)

    assert db.queried_model is model


@pytest.mark.anyio
async def test_contact_owner_accepts_university_without_scope_id():
    db = _ReferenceDb()

    await ContactService.validate_references(db, scope_type="university", scope_id=None)

    assert db.queried_model is None


@pytest.mark.anyio
async def test_contact_owner_accepts_existing_directorate_division():
    scope_id = uuid.uuid4()
    db = _ReferenceDb(Division, scope_id)

    await ContactService.validate_references(db, scope_type="directorate", scope_id=scope_id)

    assert db.queried_model is Division
    query = str(db.statement)
    assert "divisions.division_type" in query
    assert "directorate" in db.statement.compile().params.values()


@pytest.mark.anyio
async def test_contact_owner_rejects_division_that_is_not_a_directorate():
    with pytest.raises(ContactReferenceError, match="Directorate not found"):
        await ContactService.validate_references(
            _ReferenceDb(Division, None),
            scope_type="directorate",
            scope_id=uuid.uuid4(),
        )


@pytest.mark.anyio
@pytest.mark.parametrize(
    ("scope_type", "scope_id", "message"),
    [
        ("library", uuid.uuid4(), "Unsupported contact owner type"),
        ("university", uuid.uuid4(), "must not be set"),
        ("school", None, "scope_id is required"),
        (None, None, "scope_type is required"),
    ],
)
async def test_contact_owner_rejects_invalid_type_and_id_combinations(scope_type, scope_id, message):
    with pytest.raises(ContactReferenceError, match=message):
        await ContactService.validate_references(_ReferenceDb(), scope_type=scope_type, scope_id=scope_id)


@pytest.mark.anyio
async def test_contact_owner_rejects_nonexistent_organizational_record():
    with pytest.raises(ContactReferenceError, match="School not found"):
        await ContactService.validate_references(
            _ReferenceDb(),
            scope_type="school",
            scope_id=uuid.uuid4(),
        )


@pytest.mark.anyio
async def test_contact_person_accepts_existing_person():
    person_id = uuid.uuid4()
    db = _ReferenceDb(Person, person_id)

    await ContactService.validate_references(
        db,
        scope_type="university",
        scope_id=None,
        contact_person_id=person_id,
    )

    assert db.queried_model is Person


@pytest.mark.anyio
async def test_contact_person_rejects_nonexistent_person():
    with pytest.raises(ContactReferenceError, match="Contact person not found"):
        await ContactService.validate_references(
            _ReferenceDb(),
            scope_type="university",
            scope_id=None,
            contact_person_id=uuid.uuid4(),
        )


@pytest.mark.anyio
@pytest.mark.parametrize("legacy_scope_type", ["library", "student_life"])
async def test_contact_update_preserves_unchanged_legacy_owner(legacy_scope_type):
    contact = SimpleNamespace(
        name="Legacy contact",
        scope_type=legacy_scope_type,
        scope_id=uuid.uuid4(),
        contact_person_id=None,
    )

    updated = await ContactService.update(_ReferenceDb(), contact, name="Updated contact")

    assert updated.name == "Updated contact"
    assert updated.scope_type == legacy_scope_type


@pytest.mark.anyio
async def test_create_contact_returns_clean_validation_error_for_bad_reference():
    user = SimpleNamespace(id=uuid.uuid4())
    payload = ContactDirectoryCreate(name="Registry", scope_type="school", scope_id=uuid.uuid4())

    with (
        patch("app.api.v1._scoped._can_access_scope", return_value=True),
        patch.object(
            contacts.ContactService,
            "create",
            side_effect=ContactReferenceError("School not found"),
        ),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await contacts.create_contact(payload, db=None, user=user)

    assert exc_info.value.status_code == 422
    assert exc_info.value.detail == "School not found"


def _managed_contact(status="active", is_public=True):
    return SimpleNamespace(
        name="Registry office",
        scope_type="school",
        scope_id=uuid.uuid4(),
        contact_person_id=None,
        status=status,
        is_public=is_public,
    )


@pytest.mark.anyio
async def test_archive_contact_sets_archived_status_and_hides_from_public():
    user = SimpleNamespace(id=uuid.uuid4())
    contact = _managed_contact()

    with (
        patch.object(contacts.ContactService, "get_by_id", return_value=contact),
        patch("app.api.v1._scoped._can_access_scope", return_value=True),
    ):
        response = await contacts.archive_contact(uuid.uuid4(), db=_ReferenceDb(), user=user)

    assert contact.status == "archived"
    assert contact.is_public is False
    assert response["data"] is contact


@pytest.mark.anyio
async def test_unarchive_contact_restores_active_status():
    user = SimpleNamespace(id=uuid.uuid4())
    contact = _managed_contact(status="archived", is_public=False)

    with (
        patch.object(contacts.ContactService, "get_by_id", return_value=contact),
        patch("app.api.v1._scoped._can_access_scope", return_value=True),
    ):
        response = await contacts.unarchive_contact(uuid.uuid4(), db=_ReferenceDb(), user=user)

    assert contact.status == "active"
    assert response["data"] is contact


@pytest.mark.anyio
async def test_archive_contact_rejects_unowned_scope():
    user = SimpleNamespace(id=uuid.uuid4())
    contact = _managed_contact()

    with (
        patch.object(contacts.ContactService, "get_by_id", return_value=contact),
        patch("app.api.v1._scoped._can_access_scope", return_value=False),
    ):
        with pytest.raises(HTTPException) as exc_info:
            await contacts.archive_contact(uuid.uuid4(), db=_ReferenceDb(), user=user)

    assert exc_info.value.status_code == 403
    assert contact.status == "active"


@pytest.mark.anyio
async def test_archive_contact_missing_returns_404():
    user = SimpleNamespace(id=uuid.uuid4())

    with patch.object(contacts.ContactService, "get_by_id", return_value=None):
        with pytest.raises(HTTPException) as exc_info:
            await contacts.archive_contact(uuid.uuid4(), db=_ReferenceDb(), user=user)

    assert exc_info.value.status_code == 404
