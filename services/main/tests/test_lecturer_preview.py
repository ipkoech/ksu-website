from contextlib import nullcontext
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest

from app.services.digital_lecturers import DigitalLecturerSyncService


@pytest.mark.asyncio
@pytest.mark.parametrize("existing", [False, True])
async def test_lecturer_preview_does_not_mutate_entities_or_caller_transaction(monkeypatch, existing):
    department = SimpleNamespace(id=uuid4(), name="Computing Science", external_source=None,
                                 external_source_id=None, external_name="Local department name")
    person = SimpleNamespace(id=uuid4(), full_name="Local name", bio="Local biography",
                             department_id=department.id, external_source=None, external_source_id=None) if existing else None
    monkeypatch.setattr(DigitalLecturerSyncService, "fetch", AsyncMock(return_value=[{
        "id": 7, "name": "Source Name", "email": "source@example.test",
        "department": {"id": 42, "name": "Computing"},
        "personal_details": {"biography": "Source biography"},
        "work_experience": [{"id": 10, "organization": "Example"}],
    }]))
    db = Mock()
    db.no_autoflush = nullcontext()
    result_rows = [
        SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: [department])),
        SimpleNamespace(scalar_one_or_none=lambda: person),
    ]
    if not existing:
        result_rows.append(SimpleNamespace(scalar_one_or_none=lambda: None))
    db.execute = AsyncMock(side_effect=result_rows)
    db.scalar = AsyncMock(return_value=None)
    db.flush = AsyncMock()
    db.commit = AsyncMock()
    db.rollback = AsyncMock()
    result = await DigitalLecturerSyncService.sync(db, url="https://example.test", dry_run=True)
    assert result["created"] == int(not existing)
    assert result["updated"] == int(existing)
    assert result["work_experience"] == 1
    assert next(step for step in result["workflow"] if step["step"] == "persist")["records"] == 0
    assert department.external_source is None and department.external_name == "Local department name"
    if person:
        assert person.full_name == "Local name" and person.bio == "Local biography"
    db.add.assert_not_called()
    db.flush.assert_not_awaited()
    db.commit.assert_not_awaited()
    db.rollback.assert_not_awaited()
