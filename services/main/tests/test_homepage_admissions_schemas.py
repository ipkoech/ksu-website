from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.admissions import (
    IntakeMilestoneCreate,
    IntakePublicActionCreate,
    IntakePublicActionUpdate,
    IntakeUpdate,
)


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
