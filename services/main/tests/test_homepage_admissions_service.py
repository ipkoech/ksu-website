from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

import pytest

from app.models import Intake, IntakeMilestone, IntakePublicAction
from app.schemas import IntakeHomepageAdmissionUpdate
from app.services import IntakeHomepageAdmissionService


NOW = datetime(2026, 7, 13, 12, 0, tzinfo=timezone.utc)


class _FakeDb:
    def __init__(self) -> None:
        self.added: list[object] = []
        self.flush_count = 0

    def add(self, record: object) -> None:
        self.added.append(record)

    async def flush(self) -> None:
        self.flush_count += 1


def _intake() -> Intake:
    intake = Intake(
        name="September 2026 Intake",
        code="SEP-2026",
        slug="september-2026",
        academic_calendar_id=uuid.uuid4(),
        application_start=date(2026, 8, 1),
        application_end=date(2026, 9, 30),
        application_opens_at=datetime(2026, 8, 1, tzinfo=timezone.utc),
        application_closes_at=datetime(2026, 9, 30, 20, 59, 59, tzinfo=timezone.utc),
        application_override="automatic",
        late_applications_enabled=False,
        is_featured_on_homepage=False,
        homepage_priority=100,
        timezone="Africa/Nairobi",
        is_active=True,
        is_open=False,
    )
    intake.id = uuid.uuid4()
    intake.public_actions = []
    intake.milestones = []
    return intake


@pytest.mark.asyncio
async def test_update_config_upserts_actions_and_reporting_milestone():
    intake = _intake()
    actor_id = uuid.uuid4()
    db = _FakeDb()
    payload = IntakeHomepageAdmissionUpdate(
        is_featured_on_homepage=True,
        homepage_priority=10,
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
            "location": "Main Campus",
        },
    )

    result = await IntakeHomepageAdmissionService.update_config(
        db, intake, payload, actor_id, now=NOW
    )

    assert result.is_featured_on_homepage is True
    assert result.homepage_priority == 10
    assert result.apply.enabled is True
    assert result.apply.url == "https://apply.kisiiuniversity.ac.ke"
    assert result.admission_letter.enabled is True
    assert result.reporting.enabled is True
    assert result.reporting.location == "Main Campus"
    assert {item.action_type for item in intake.public_actions} == {
        "apply",
        "download_admission_letter",
    }
    assert all(item.status == "published" for item in intake.public_actions)
    assert all(item.workflow_status == "published" for item in intake.public_actions)
    assert all(item.created_by_id == actor_id for item in intake.public_actions)
    assert len(intake.milestones) == 1
    assert intake.milestones[0].milestone_type == "reporting"
    assert intake.milestones[0].workflow_status == "published"
    assert intake.milestones[0].created_by_id == actor_id
    assert db.flush_count == 1


@pytest.mark.asyncio
async def test_update_config_disables_existing_action_without_requiring_old_values():
    intake = _intake()
    action = IntakePublicAction(
        intake_id=intake.id,
        action_type="download_admission_letter",
        label="Download Admission Letter",
        target_url="/admission-letters",
        is_enabled=True,
        status="published",
        workflow_status="published",
    )
    action.id = uuid.uuid4()
    intake.public_actions = [action]
    actor_id = uuid.uuid4()

    result = await IntakeHomepageAdmissionService.update_config(
        _FakeDb(),
        intake,
        IntakeHomepageAdmissionUpdate(admission_letter={"enabled": False}),
        actor_id,
        now=NOW,
    )

    assert action.is_enabled is False
    assert action.label == "Download Admission Letter"
    assert action.target_url == "/admission-letters"
    assert action.updated_by_id == actor_id
    assert result.admission_letter.enabled is False


@pytest.mark.asyncio
async def test_update_config_disables_existing_reporting_milestone():
    intake = _intake()
    milestone = IntakeMilestone(
        intake_id=intake.id,
        milestone_type="reporting",
        title="Reporting Day",
        starts_at=datetime(2026, 10, 26, 5, 0, tzinfo=timezone.utc),
        is_public=True,
        status="published",
        workflow_status="published",
    )
    milestone.id = uuid.uuid4()
    intake.milestones = [milestone]

    result = await IntakeHomepageAdmissionService.update_config(
        _FakeDb(),
        intake,
        IntakeHomepageAdmissionUpdate(reporting={"enabled": False}),
        uuid.uuid4(),
        now=NOW,
    )

    assert milestone.is_public is False
    assert result.reporting.enabled is False


def test_serialize_config_returns_stable_action_and_reporting_defaults():
    intake = _intake()

    result = IntakeHomepageAdmissionService.serialize_config(intake)

    assert result.intake_id == intake.id
    assert result.application_override == "automatic"
    assert result.timezone == "Africa/Nairobi"
    assert result.apply.enabled is False
    assert result.check_requirements.enabled is False
    assert result.explore_programmes.enabled is False
    assert result.admission_letter.enabled is False
    assert result.reporting_instructions.enabled is False
    assert result.reporting.enabled is False
