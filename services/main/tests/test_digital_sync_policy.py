import time
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.api.v1.digital_sync import require_scope
from app.services.digital_lecturers import DigitalLecturerSyncService
from app.services.integration_jobs import authorize_job


@pytest.mark.parametrize("scope,verified,allowed", [("school", True, False), ("global", False, False), ("global", True, True)])
def test_global_sync_rejects_school_authority_and_password_only_session(scope, verified, allowed):
    actor = TokenPayload("real-actor", "session", raw={
        "mfa_enabled": verified, "mfa_verified_at": time.time() if verified else None,
        "scope_grants": [{"scope_type": scope, "scope_id": str(uuid4()) if scope == "school" else None,
                          "permissions": ["academic.manage_programmes"]}],
    })
    guard = require_scope("academic.manage_programmes")
    if allowed:
        assert guard(actor) is actor
    else:
        with pytest.raises(HTTPException) as denied:
            guard(actor)
        assert denied.value.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize("foreign_department", [False, True])
@pytest.mark.parametrize("school_scoped", [False, True])
async def test_programme_sync_preserves_editorial_fields_and_requires_ownership_reconciliation(monkeypatch, foreign_department, school_scoped):
    department = SimpleNamespace(id=uuid4(), school_id=uuid4(), name="Department of Computing Science", school=None)
    programme = SimpleNamespace(department_id=uuid4() if foreign_department else department.id,
                                name="Local display name", about="Local reviewed content",
                                curriculum_overview="Local curriculum", career_prospects="Local prospects",
                                level="undergraduate", external_name="Previous source title")
    monkeypatch.setattr(DigitalLecturerSyncService, "fetch_programmes", AsyncMock(return_value=[{
        "programme_code": "P1", "department": "Computing", "name": "Source title",
        "category": "masters", "details": "Unreviewed replacement", "curriculum_overview": "Source curriculum",
    }]))
    db = AsyncMock()
    db.execute.side_effect = [
        SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: [department])),
        SimpleNamespace(scalar_one_or_none=lambda: programme),
    ]
    result = await DigitalLecturerSyncService.sync_programmes(db, url="https://example.test",
                                                            school_id=department.school_id if school_scoped else None)
    assert programme.name == "Local display name"
    assert programme.about == "Local reviewed content"
    assert programme.curriculum_overview == "Local curriculum"
    assert programme.career_prospects == "Local prospects"
    if foreign_department:
        assert result["skipped"] == 1 and result["updated"] == 0
        assert programme.external_name == "Previous source title"
        assert "ownership conflict" in result["errors"][0]["error"]
    else:
        assert result["updated"] == 1
        assert programme.external_name == "Source title" and programme.level == "masters"
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize("ambiguous", [False, True])
async def test_school_preview_counts_only_unambiguous_owned_source_records(monkeypatch, ambiguous):
    school_id, other_school = uuid4(), uuid4()
    departments = [
        SimpleNamespace(id=uuid4(), school_id=school_id, name="Computing Science"),
        SimpleNamespace(id=uuid4(), school_id=other_school, name="Computing Science" if ambiguous else "History"),
    ]
    monkeypatch.setattr(DigitalLecturerSyncService, "fetch_programmes", AsyncMock(return_value=[
        {"programme_code": "P1", "department": "Computing", "name": "Owned"},
        {"programme_code": "P1", "department": "History", "name": "Foreign"},
    ]))
    db = AsyncMock()
    db.execute.return_value = SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: departments))
    result = await DigitalLecturerSyncService.programme_preview(db, url="https://example.test", school_id=school_id)
    assert result["fetched"] == (0 if ambiguous else 1)
    assert result["duplicate_code_count"] == 0
    assert all(row["name"] == "Owned" and row["school_id"] == str(school_id) for row in result["programmes"])


def test_school_integration_requires_exact_scope_and_separate_sync_capability():
    school_id = uuid4()
    actor = TokenPayload(str(uuid4()), "session", raw={"mfa_enabled": True, "mfa_verified_at": time.time(),
        "scope_grants": [{"scope_type": "school", "scope_id": str(school_id), "permissions": ["school.integrations.programmes.sync"]}],
    })
    authorize_job(actor, "programmes", scope_type="school", scope_id=school_id)
    with pytest.raises(HTTPException):
        authorize_job(actor, "programmes", scope_type="school", scope_id=uuid4())
    with pytest.raises(HTTPException):
        authorize_job(actor, "programmes")
    actor.raw["scope_grants"][0]["permissions"] = ["school.programmes.manage", "school.integrations.programmes.preview"]
    with pytest.raises(HTTPException):
        authorize_job(actor, "programmes", scope_type="school", scope_id=school_id)
