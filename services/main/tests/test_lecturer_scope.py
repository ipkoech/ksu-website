from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest

from app.security.scopes import assignment_permissions
from app.models import Person, StaffAssignment
from app.services.digital_lecturers import DigitalLecturerSyncService, SOURCE


@pytest.mark.asyncio
@pytest.mark.parametrize("conflict", [False, True])
async def test_school_sync_filters_foreign_rows_and_preserves_local_profile_fields(monkeypatch, conflict):
    own = SimpleNamespace(id=uuid4(), school_id=uuid4(), name="Computing Science", external_source=SOURCE,
                          external_source_id="42", external_name="Computing")
    foreign = SimpleNamespace(id=uuid4(), school_id=uuid4(), name="History", external_source=SOURCE,
                              external_source_id="43", external_name="History")
    person = SimpleNamespace(id=uuid4(), department_id=foreign.id if conflict else own.id,
                             full_name="Local name", bio="Reviewed biography", qualifications=[{"degree": "Reviewed"}],
                             research_interests=["Reviewed interest"], publication_records=[{"title": "Reviewed publication"}],
                             publications_count=1, external_source=SOURCE, external_source_id="7", user_id=uuid4())
    linked_account = person.user_id
    monkeypatch.setattr(DigitalLecturerSyncService, "fetch", AsyncMock(return_value=[
        {"id": 7, "name": "Source Name", "email": "source@example.test", "department": {"id": 42, "name": "Computing"},
         "personal_details": {"biography": "Unreviewed biography"}, "publications": [{"title": "Source publication"}]},
        {"id": 8, "name": "Foreign Name", "email": "foreign@example.test", "department": {"id": 43, "name": "History"}},
    ]))
    db = Mock()
    results = [SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: [own, foreign])),
               SimpleNamespace(scalar_one_or_none=lambda: person)]
    if not conflict:
        results.append(SimpleNamespace(scalar_one_or_none=lambda: object()))
    db.execute = AsyncMock(side_effect=results)
    db.flush = AsyncMock()
    result = await DigitalLecturerSyncService.sync(db, url="https://example.test", school_id=own.school_id)
    assert result["fetched"] == 1
    assert result["updated"] == (0 if conflict else 1)
    assert person.full_name == ("Local name" if conflict else "Source Name")
    assert person.bio == "Reviewed biography"
    assert person.qualifications == [{"degree": "Reviewed"}]
    assert person.research_interests == ["Reviewed interest"]
    assert person.publication_records == [{"title": "Reviewed publication"}]
    assert person.publications_count == 1 and person.user_id == linked_account
    assert person.department_id == (foreign.id if conflict else own.id)
    db.add.assert_not_called()


def test_imported_lecturer_assignment_has_no_workspace_privileges():
    assert assignment_permissions("department", "lecturer") == frozenset()


@pytest.mark.asyncio
async def test_new_lecturer_import_is_private_and_cannot_import_a_privileged_role(monkeypatch):
    department = SimpleNamespace(id=uuid4(), school_id=uuid4(), name="Computing Science",
                                 external_source=SOURCE, external_source_id="42", external_name="Computing")
    monkeypatch.setattr(DigitalLecturerSyncService, "fetch", AsyncMock(return_value=[{
        "id": 7, "name": "Source Person", "email": "source@example.test",
        "department": {"id": 42, "name": "Computing"}, "role": "dean",
    }]))
    db = Mock()
    absent = SimpleNamespace(scalar_one_or_none=lambda: None)
    db.execute = AsyncMock(side_effect=[SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: [department])),
                                       absent, absent, absent])

    async def flush():
        for call in db.add.call_args_list:
            if isinstance(call.args[0], Person) and call.args[0].id is None:
                call.args[0].id = uuid4()
    db.flush = AsyncMock(side_effect=flush)
    result = await DigitalLecturerSyncService.sync(db, url="https://example.test", school_id=department.school_id)
    assert result["created"] == 1 and not result["errors"]
    created = [call.args[0] for call in db.add.call_args_list]
    assert len(created) == 2
    person = next(item for item in created if isinstance(item, Person))
    assignment = next(item for item in created if isinstance(item, StaffAssignment))
    assert person.is_public is False and person.user_id is None
    assert assignment.is_public is False and assignment.role == "lecturer"
