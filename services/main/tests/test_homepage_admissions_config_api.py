from __future__ import annotations

import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError

from app.api.v1 import intakes
from app.schemas import IntakeHomepageAdmissionRead, IntakeHomepageAdmissionUpdate


def _config(intake_id: uuid.UUID) -> IntakeHomepageAdmissionRead:
    return IntakeHomepageAdmissionRead(
        intake_id=intake_id,
        intake_name="September 2026 Intake",
        intake_code="SEP-2026",
        is_featured_on_homepage=False,
        homepage_priority=100,
        application_opens_at=datetime(2026, 8, 1, tzinfo=timezone.utc),
        application_closes_at=datetime(2026, 9, 30, tzinfo=timezone.utc),
        late_application_closes_at=None,
        late_applications_enabled=False,
        application_override="automatic",
        override_expires_at=None,
        timezone="Africa/Nairobi",
    )


def test_homepage_action_update_accepts_partial_enabled_field_for_service_merge():
    payload = IntakeHomepageAdmissionUpdate(apply={"enabled": True})

    assert payload.apply is not None
    assert payload.apply.enabled is True
    assert payload.apply.model_fields_set == {"enabled"}


@pytest.mark.parametrize(
    "url", ["javascript:alert(1)", "http://unsafe.example.test", "//unsafe.test"]
)
def test_homepage_action_rejects_unsafe_url(url: str):
    with pytest.raises(ValidationError):
        IntakeHomepageAdmissionUpdate(
            apply={"enabled": True, "label": "Apply Now", "url": url}
        )


def test_homepage_config_rejects_naive_timestamps():
    with pytest.raises(ValidationError, match="timezone-aware"):
        IntakeHomepageAdmissionUpdate(application_opens_at=datetime(2026, 8, 1))


@pytest.mark.parametrize(
    "field_name",
    (
        "is_featured_on_homepage",
        "homepage_priority",
        "application_opens_at",
        "application_closes_at",
        "late_applications_enabled",
        "application_override",
        "timezone",
    ),
)
def test_homepage_config_rejects_explicit_null_for_required_intake_fields(
    field_name: str,
):
    with pytest.raises(ValidationError, match="cannot be null"):
        IntakeHomepageAdmissionUpdate(**{field_name: None})


@pytest.mark.asyncio
async def test_get_homepage_admission_requires_manage_intakes_permission():
    intake_id = uuid.uuid4()
    user = SimpleNamespace(id=uuid.uuid4())
    can_access = AsyncMock(return_value=False)

    with patch.object(intakes, "can_access_scope", can_access):
        with pytest.raises(HTTPException) as exc:
            await intakes.get_homepage_admission(intake_id, db=None, user=user)

    assert exc.value.status_code == 403
    can_access.assert_awaited_once_with(
        None, user, "academic.manage_intakes", "university", None
    )


@pytest.mark.asyncio
async def test_patch_homepage_admission_updates_through_service():
    intake_id = uuid.uuid4()
    user = SimpleNamespace(id=uuid.uuid4())
    intake = SimpleNamespace(id=intake_id)
    payload = IntakeHomepageAdmissionUpdate(
        is_featured_on_homepage=True,
        apply={
            "enabled": True,
            "label": "Apply Now",
            "url": "https://apply.kisiiuniversity.ac.ke",
        },
        admission_letter={
            "enabled": True,
            "label": "Download Admission Letter",
            "url": "https://portal.kisiiuniversity.ac.ke/letters",
        },
        reporting={
            "enabled": True,
            "title": "Reporting Day",
            "starts_at": "2026-10-26T08:00:00+03:00",
        },
    )
    config = _config(intake_id)
    get_intake = AsyncMock(return_value=intake)
    update_config = AsyncMock(return_value=config)

    with (
        patch.object(intakes, "can_access_scope", AsyncMock(return_value=True)),
        patch.object(intakes.IntakeHomepageAdmissionService, "get_intake", get_intake),
        patch.object(
            intakes.IntakeHomepageAdmissionService, "update_config", update_config
        ),
    ):
        response = await intakes.update_homepage_admission(
            intake_id, payload, db=None, user=user
        )

    get_intake.assert_awaited_once_with(None, intake_id)
    update_config.assert_awaited_once_with(None, intake, payload, user.id)
    assert response["data"] == config


@pytest.mark.asyncio
async def test_patch_homepage_admission_returns_422_for_merged_service_validation():
    class _InvalidCandidate(BaseModel):
        value: int

    try:
        _InvalidCandidate(value="invalid")
    except ValidationError as validation_error:
        error = validation_error

    intake_id = uuid.uuid4()
    user = SimpleNamespace(id=uuid.uuid4())
    intake = SimpleNamespace(id=intake_id)

    with (
        patch.object(intakes, "can_access_scope", AsyncMock(return_value=True)),
        patch.object(
            intakes.IntakeHomepageAdmissionService,
            "get_intake",
            AsyncMock(return_value=intake),
        ),
        patch.object(
            intakes.IntakeHomepageAdmissionService,
            "update_config",
            AsyncMock(side_effect=error),
        ),
    ):
        with pytest.raises(HTTPException) as exc:
            await intakes.update_homepage_admission(
                intake_id,
                IntakeHomepageAdmissionUpdate(),
                db=None,
                user=user,
            )

    assert exc.value.status_code == 422


@pytest.mark.asyncio
async def test_get_homepage_admission_returns_404_for_missing_intake():
    intake_id = uuid.uuid4()
    user = SimpleNamespace(id=uuid.uuid4())

    with (
        patch.object(intakes, "can_access_scope", AsyncMock(return_value=True)),
        patch.object(
            intakes.IntakeHomepageAdmissionService,
            "get_config",
            AsyncMock(return_value=None),
        ),
    ):
        with pytest.raises(HTTPException) as exc:
            await intakes.get_homepage_admission(intake_id, db=None, user=user)

    assert exc.value.status_code == 404
