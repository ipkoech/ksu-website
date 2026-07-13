from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.admissions import (
    IntakeMilestoneCreate,
    IntakeMilestoneUpdate,
    IntakePublicActionCreate,
    IntakePublicActionUpdate,
    IntakeUpdate,
)


AWARE = datetime(2026, 9, 1, tzinfo=timezone.utc)
NAIVE = datetime(2026, 9, 1)


def test_public_action_rejects_unsafe_external_url():
    with pytest.raises(ValidationError):
        IntakePublicActionCreate(
            action_type="apply",
            label="Apply Now",
            target_url="javascript:alert(1)",
        )


@pytest.mark.parametrize("target_url", ["/programmes", "https://apply.kisiiuniversity.ac.ke"])
def test_public_action_accepts_internal_or_https_url(target_url: str):
    action = IntakePublicActionCreate(
        action_type="apply",
        label="Apply Now",
        target_url=target_url,
    )
    assert action.target_url == target_url


@pytest.mark.parametrize("target_url", ["//unsafe.example.test", "https://"])
def test_public_action_rejects_malformed_safe_scheme_targets(target_url: str):
    with pytest.raises(ValidationError):
        IntakePublicActionCreate(
            action_type="apply",
            label="Apply Now",
            target_url=target_url,
        )


def test_public_action_rejects_http_external_url():
    with pytest.raises(ValidationError):
        IntakePublicActionUpdate(target_url="http://unsafe.example.test")


def test_public_action_rejects_unknown_type():
    with pytest.raises(ValidationError):
        IntakePublicActionCreate(
            action_type="unknown",
            label="Unknown",
            target_url="/unknown",
        )


def test_public_action_rejects_reversed_window():
    with pytest.raises(ValidationError):
        IntakePublicActionCreate(
            action_type="apply",
            label="Apply Now",
            target_url="/apply",
            starts_at=datetime(2026, 9, 2, tzinfo=timezone.utc),
            ends_at=datetime(2026, 9, 1, tzinfo=timezone.utc),
        )


def test_milestone_rejects_reversed_window():
    with pytest.raises(ValidationError):
        IntakeMilestoneCreate(
            milestone_type="reporting",
            title="Reporting",
            starts_at=datetime(2026, 9, 2, tzinfo=timezone.utc),
            ends_at=datetime(2026, 9, 1, tzinfo=timezone.utc),
        )


def test_milestone_rejects_unsafe_instructions_url():
    with pytest.raises(ValidationError):
        IntakeMilestoneCreate(
            milestone_type="reporting",
            title="Reporting",
            starts_at=datetime(2026, 9, 1, tzinfo=timezone.utc),
            instructions_url="data:text/html,unsafe",
        )


def test_intake_rejects_unbounded_manual_override():
    with pytest.raises(ValidationError):
        IntakeUpdate(application_override="force_open", override_expires_at=None)


def test_intake_accepts_automatic_override_without_expiry():
    intake = IntakeUpdate(application_override="automatic", override_expires_at=None)
    assert intake.application_override == "automatic"


def test_intake_rejects_unknown_override():
    with pytest.raises(ValidationError):
        IntakeUpdate(application_override="sometimes")


def test_intake_rejects_reversed_timestamp_windows():
    with pytest.raises(ValidationError):
        IntakeUpdate(
            application_opens_at=datetime(2026, 9, 2, tzinfo=timezone.utc),
            application_closes_at=datetime(2026, 9, 1, tzinfo=timezone.utc),
        )


@pytest.mark.parametrize(
    "field_name",
    (
        "application_opens_at",
        "application_closes_at",
        "late_application_closes_at",
        "override_expires_at",
    ),
)
def test_intake_update_rejects_naive_operational_timestamps(field_name: str):
    with pytest.raises(ValidationError, match="timezone-aware"):
        IntakeUpdate(**{field_name: NAIVE})


@pytest.mark.parametrize("schema", (IntakePublicActionCreate, IntakePublicActionUpdate))
@pytest.mark.parametrize("field_name", ("starts_at", "ends_at", "scheduled_publish_at", "expires_at"))
def test_public_action_schemas_reject_naive_operational_timestamps(schema: type, field_name: str):
    values = {field_name: NAIVE}
    if schema is IntakePublicActionCreate:
        values.update(action_type="apply", label="Apply Now", target_url="/apply")
    with pytest.raises(ValidationError, match="timezone-aware"):
        schema(**values)


@pytest.mark.parametrize("schema", (IntakeMilestoneCreate, IntakeMilestoneUpdate))
@pytest.mark.parametrize("field_name", ("starts_at", "ends_at", "scheduled_publish_at", "expires_at"))
def test_milestone_schemas_reject_naive_operational_timestamps(schema: type, field_name: str):
    values = {"starts_at": AWARE, field_name: NAIVE}
    if schema is IntakeMilestoneCreate:
        values.update(milestone_type="reporting", title="Reporting")
    with pytest.raises(ValidationError, match="timezone-aware"):
        schema(**values)


@pytest.mark.parametrize(
    "schema, required",
    (
        (IntakePublicActionCreate, {"action_type": "apply", "label": "Apply Now", "target_url": "/apply"}),
        (IntakePublicActionUpdate, {}),
        (IntakeMilestoneCreate, {"milestone_type": "reporting", "title": "Reporting", "starts_at": AWARE}),
        (IntakeMilestoneUpdate, {}),
    ),
)
def test_action_and_milestone_schemas_expose_valid_publication_window(schema: type, required: dict):
    expires_at = datetime(2026, 9, 30, tzinfo=timezone.utc)
    record = schema(scheduled_publish_at=AWARE, expires_at=expires_at, **required)
    assert record.scheduled_publish_at == AWARE
    assert record.expires_at == expires_at


@pytest.mark.parametrize(
    "schema, required",
    (
        (IntakePublicActionCreate, {"action_type": "apply", "label": "Apply Now", "target_url": "/apply"}),
        (IntakePublicActionUpdate, {}),
        (IntakeMilestoneCreate, {"milestone_type": "reporting", "title": "Reporting", "starts_at": AWARE}),
        (IntakeMilestoneUpdate, {}),
    ),
)
def test_action_and_milestone_schemas_reject_reversed_publication_window(schema: type, required: dict):
    with pytest.raises(ValidationError):
        schema(
            scheduled_publish_at=datetime(2026, 10, 1, tzinfo=timezone.utc),
            expires_at=datetime(2026, 9, 30, tzinfo=timezone.utc),
            **required,
        )
