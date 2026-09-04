"""Admissions schemas."""

from __future__ import annotations

import uuid
from typing import Any
from datetime import date, datetime, time
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import Field, field_validator, model_validator

from app.models.admissions import (
    ADMISSION_APPLICANT_TYPES,
    ADMISSION_DOCUMENT_TYPES,
    ADMISSION_PAGE_KEYS,
    INTAKE_APPLICATION_OVERRIDES,
    INTAKE_MILESTONE_TYPES,
    INTAKE_PUBLIC_ACTION_TYPES,
)

from .base import BaseReadSchema, BaseSchema, CodeStr, SlugStr


def _validate_choice(
    value: str | None, allowed: tuple[str, ...], field_name: str
) -> str | None:
    if value is not None and value not in allowed:
        raise ValueError(f"{field_name} must be one of: {', '.join(allowed)}")
    return value


def _validate_safe_target(value: str | None, field_name: str) -> str | None:
    if value is None:
        return None
    if value.startswith("/") and not value.startswith("//"):
        return value
    parsed = urlsplit(value)
    if parsed.scheme == "https" and parsed.netloc:
        return value
    raise ValueError(f"{field_name} must be an internal path or an https:// URL")


def _validate_timestamp_window(
    starts_at: datetime | None,
    ends_at: datetime | None,
    start_name: str,
    end_name: str,
) -> None:
    if starts_at is not None and ends_at is not None and ends_at < starts_at:
        raise ValueError(f"{end_name} cannot be before {start_name}")


def _validate_aware_timestamp(
    value: datetime | None, field_name: str
) -> datetime | None:
    if value is not None and (value.tzinfo is None or value.utcoffset() is None):
        raise ValueError(f"{field_name} must be timezone-aware")
    return value


def _validate_timezone(value: str) -> str:
    try:
        ZoneInfo(value)
    except ZoneInfoNotFoundError as exc:
        raise ValueError("timezone must be a valid IANA timezone") from exc
    return value


class ProgrammeTutorCreate(BaseSchema):
    person_id: uuid.UUID
    role: str = Field(min_length=1, max_length=64, default="lecturer")
    is_lead: bool = False


class ProgrammeTutorRead(BaseReadSchema):
    programme_id: uuid.UUID
    person_id: uuid.UUID
    role: str
    person: dict[str, Any] | None = None
    programme: dict[str, Any] | None = None
    is_lead: bool


class ProgrammeIntakeCreate(BaseSchema):
    intake_id: uuid.UUID
    slots_available: int | None = Field(default=None, ge=0)
    application_deadline: date | None = None
    is_active: bool = True


class ProgrammeIntakeRead(BaseReadSchema):
    programme_id: uuid.UUID
    intake_id: uuid.UUID
    slots_available: int | None = None
    application_deadline: date | None = None
    intake: dict[str, Any] | None = None
    programme: dict[str, Any] | None = None
    is_active: bool


class ProgrammeCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    code: CodeStr
    slug: SlugStr | None = None
    external_source: str | None = Field(default=None, max_length=64)
    external_source_id: str | None = Field(default=None, max_length=128)
    external_name: str | None = Field(default=None, max_length=255)
    level: str = Field(min_length=1, max_length=32)
    mode_of_study: str = Field(default="full_time", max_length=32)
    duration: str | None = Field(default=None, max_length=64)
    credits_required: int | None = Field(default=None, ge=0)
    department_id: uuid.UUID
    about: str | None = None
    objectives: str | None = None
    career_prospects: str | None = None
    curriculum_overview: str | None = None
    entry_requirements: str | None = None
    cluster_subjects: list[dict] | None = None
    fees_structure: dict | None = None
    intake_months: list[str] | None = None
    min_students: int | None = Field(default=None, ge=0)
    max_students: int | None = Field(default=None, ge=0)
    accreditation_status: str | None = Field(default=None, max_length=128)
    accrediting_body: str | None = Field(default=None, max_length=255)
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool = True
    display_order: int = 100

    @model_validator(mode="after")
    def validate_capacity(self) -> "ProgrammeCreate":
        if (
            self.min_students is not None
            and self.max_students is not None
            and self.min_students > self.max_students
        ):
            raise ValueError("min_students cannot exceed max_students")
        return self


class ProgrammeUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    code: CodeStr | None = None
    slug: SlugStr | None = None
    external_source: str | None = Field(default=None, max_length=64)
    external_source_id: str | None = Field(default=None, max_length=128)
    external_name: str | None = Field(default=None, max_length=255)
    level: str | None = Field(default=None, max_length=32)
    mode_of_study: str | None = Field(default=None, max_length=32)
    duration: str | None = Field(default=None, max_length=64)
    credits_required: int | None = Field(default=None, ge=0)
    department_id: uuid.UUID | None = None
    about: str | None = None
    objectives: str | None = None
    career_prospects: str | None = None
    curriculum_overview: str | None = None
    entry_requirements: str | None = None
    cluster_subjects: list[dict] | None = None
    fees_structure: dict | None = None
    intake_months: list[str] | None = None
    min_students: int | None = Field(default=None, ge=0)
    max_students: int | None = Field(default=None, ge=0)
    accreditation_status: str | None = Field(default=None, max_length=128)
    accrediting_body: str | None = Field(default=None, max_length=255)
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool | None = None
    display_order: int | None = None

    @model_validator(mode="after")
    def validate_capacity(self) -> "ProgrammeUpdate":
        if (
            self.min_students is not None
            and self.max_students is not None
            and self.min_students > self.max_students
        ):
            raise ValueError("min_students cannot exceed max_students")
        return self


class ProgrammeRead(BaseReadSchema):
    name: str
    code: str
    slug: str
    external_source: str | None = None
    external_source_id: str | None = None
    external_name: str | None = None
    level: str
    mode_of_study: str
    duration: str | None = None
    credits_required: int | None = None
    department_id: uuid.UUID
    about: str | None = None
    objectives: str | None = None
    career_prospects: str | None = None
    curriculum_overview: str | None = None
    entry_requirements: str | None = None
    cluster_subjects: list[dict] | None = None
    fees_structure: dict | None = None
    intake_months: list[str] | None = None
    min_students: int | None = None
    max_students: int | None = None
    accreditation_status: str | None = None
    accrediting_body: str | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool
    display_order: int
    tutors: list[ProgrammeTutorRead] = Field(default_factory=list)
    brochure: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    department: dict[str, Any] | None = None
    intakes: list[ProgrammeIntakeRead] = Field(default_factory=list)
    admission_requirements: list[dict[str, Any]] = Field(default_factory=list)
    fee_structures: list[dict[str, Any]] = Field(default_factory=list)
    admission_documents: list[dict[str, Any]] = Field(default_factory=list)


class IntakeCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    code: CodeStr
    slug: SlugStr | None = None
    academic_calendar_id: uuid.UUID
    application_start: date
    application_end: date
    late_application_end: date | None = None
    application_opens_at: datetime | None = None
    application_closes_at: datetime | None = None
    late_application_closes_at: datetime | None = None
    application_override: str = INTAKE_APPLICATION_OVERRIDES[0]
    override_expires_at: datetime | None = None
    late_applications_enabled: bool = False
    is_featured_on_homepage: bool = False
    homepage_priority: int = 100
    timezone: str = "Africa/Nairobi"
    max_students: int | None = Field(default=None, ge=0)
    cover_image_id: uuid.UUID | None = None
    is_active: bool = True
    is_open: bool = False

    @field_validator("application_override")
    @classmethod
    def validate_application_override(cls, value: str) -> str:
        return (
            _validate_choice(
                value, INTAKE_APPLICATION_OVERRIDES, "application_override"
            )
            or value
        )

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        return _validate_timezone(value)

    @field_validator(
        "application_opens_at",
        "application_closes_at",
        "late_application_closes_at",
        "override_expires_at",
    )
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_dates(self) -> "IntakeCreate":
        if self.application_end < self.application_start:
            raise ValueError("application_end cannot be before application_start")
        if (
            self.late_application_end
            and self.late_application_end < self.application_end
        ):
            raise ValueError("late_application_end cannot be before application_end")
        zone = ZoneInfo(self.timezone)
        if self.application_opens_at is None:
            self.application_opens_at = datetime.combine(
                self.application_start, time.min, zone
            )
        if self.application_closes_at is None:
            self.application_closes_at = datetime.combine(
                self.application_end, time(23, 59, 59), zone
            )
        if (
            self.late_application_end is not None
            and self.late_application_closes_at is None
        ):
            self.late_application_closes_at = datetime.combine(
                self.late_application_end, time(23, 59, 59), zone
            )
        _validate_timestamp_window(
            self.application_opens_at,
            self.application_closes_at,
            "application_opens_at",
            "application_closes_at",
        )
        _validate_timestamp_window(
            self.application_closes_at,
            self.late_application_closes_at,
            "application_closes_at",
            "late_application_closes_at",
        )
        if (
            self.application_override != "automatic"
            and self.override_expires_at is None
        ):
            raise ValueError(
                "override_expires_at is required for a manual application override"
            )
        if self.is_featured_on_homepage and not self.is_active:
            raise ValueError("a homepage-featured intake must be active")
        return self


class IntakeUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    code: CodeStr | None = None
    slug: SlugStr | None = None
    academic_calendar_id: uuid.UUID | None = None
    application_start: date | None = None
    application_end: date | None = None
    late_application_end: date | None = None
    application_opens_at: datetime | None = None
    application_closes_at: datetime | None = None
    late_application_closes_at: datetime | None = None
    application_override: str | None = None
    override_expires_at: datetime | None = None
    late_applications_enabled: bool | None = None
    is_featured_on_homepage: bool | None = None
    homepage_priority: int | None = None
    timezone: str | None = None
    max_students: int | None = Field(default=None, ge=0)
    cover_image_id: uuid.UUID | None = None
    is_active: bool | None = None
    is_open: bool | None = None

    @field_validator("application_override")
    @classmethod
    def validate_application_override(cls, value: str | None) -> str | None:
        return _validate_choice(
            value, INTAKE_APPLICATION_OVERRIDES, "application_override"
        )

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str | None) -> str | None:
        return _validate_timezone(value) if value is not None else None

    @field_validator(
        "application_opens_at",
        "application_closes_at",
        "late_application_closes_at",
        "override_expires_at",
    )
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_dates(self) -> "IntakeUpdate":
        if (
            self.application_start
            and self.application_end
            and self.application_end < self.application_start
        ):
            raise ValueError("application_end cannot be before application_start")
        if (
            self.application_end
            and self.late_application_end
            and self.late_application_end < self.application_end
        ):
            raise ValueError("late_application_end cannot be before application_end")
        _validate_timestamp_window(
            self.application_opens_at,
            self.application_closes_at,
            "application_opens_at",
            "application_closes_at",
        )
        _validate_timestamp_window(
            self.application_closes_at,
            self.late_application_closes_at,
            "application_closes_at",
            "late_application_closes_at",
        )
        if (
            self.application_override in {"force_open", "force_hidden"}
            and self.override_expires_at is None
        ):
            raise ValueError(
                "override_expires_at is required for a manual application override"
            )
        if self.is_featured_on_homepage is True and self.is_active is False:
            raise ValueError("a homepage-featured intake must be active")
        return self


class IntakeRead(BaseReadSchema):
    name: str
    code: str
    slug: str
    academic_calendar_id: uuid.UUID
    application_start: date
    application_end: date
    late_application_end: date | None = None
    application_opens_at: datetime
    application_closes_at: datetime
    late_application_closes_at: datetime | None = None
    application_override: str
    override_expires_at: datetime | None = None
    late_applications_enabled: bool
    is_featured_on_homepage: bool
    homepage_priority: int
    timezone: str
    max_students: int | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool
    is_open: bool
    academic_calendar: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    programmes: list[ProgrammeIntakeRead] = Field(default_factory=list)


class IntakePublicActionCreate(BaseSchema):
    action_type: str = Field(max_length=64)
    label: str = Field(min_length=1, max_length=255)
    description: str | None = None
    target_url: str = Field(min_length=1, max_length=1024)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_enabled: bool = True
    priority: int = 100
    open_in_new_tab: bool = False
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None

    @field_validator("action_type")
    @classmethod
    def validate_action_type(cls, value: str) -> str:
        return (
            _validate_choice(value, INTAKE_PUBLIC_ACTION_TYPES, "action_type") or value
        )

    @field_validator("target_url")
    @classmethod
    def validate_target_url(cls, value: str) -> str:
        return _validate_safe_target(value, "target_url") or value

    @field_validator("starts_at", "ends_at", "scheduled_publish_at", "expires_at")
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_window(self) -> "IntakePublicActionCreate":
        _validate_timestamp_window(self.starts_at, self.ends_at, "starts_at", "ends_at")
        _validate_timestamp_window(
            self.scheduled_publish_at,
            self.expires_at,
            "scheduled_publish_at",
            "expires_at",
        )
        return self


class IntakePublicActionUpdate(BaseSchema):
    action_type: str | None = Field(default=None, max_length=64)
    label: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    target_url: str | None = Field(default=None, min_length=1, max_length=1024)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_enabled: bool | None = None
    priority: int | None = None
    open_in_new_tab: bool | None = None
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None

    @field_validator("action_type")
    @classmethod
    def validate_action_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, INTAKE_PUBLIC_ACTION_TYPES, "action_type")

    @field_validator("target_url")
    @classmethod
    def validate_target_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "target_url")

    @field_validator("starts_at", "ends_at", "scheduled_publish_at", "expires_at")
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_window(self) -> "IntakePublicActionUpdate":
        _validate_timestamp_window(self.starts_at, self.ends_at, "starts_at", "ends_at")
        _validate_timestamp_window(
            self.scheduled_publish_at,
            self.expires_at,
            "scheduled_publish_at",
            "expires_at",
        )
        return self


class IntakePublicActionRead(BaseReadSchema):
    intake_id: uuid.UUID
    action_type: str
    label: str
    description: str | None = None
    target_url: str
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    is_enabled: bool
    priority: int
    open_in_new_tab: bool
    status: str
    workflow_status: str
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None
    submitted_by_id: uuid.UUID | None = None
    reviewed_by_id: uuid.UUID | None = None
    approved_by_id: uuid.UUID | None = None
    published_by_id: uuid.UUID | None = None
    created_by_id: uuid.UUID | None = None
    updated_by_id: uuid.UUID | None = None
    submitted_at: datetime | None = None
    reviewed_at: datetime | None = None
    approved_at: datetime | None = None
    published_at: datetime | None = None
    unpublished_at: datetime | None = None
    rejection_reason: str | None = None
    revision_notes: str | None = None


class IntakeMilestoneCreate(BaseSchema):
    milestone_type: str = Field(max_length=64)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    starts_at: datetime
    ends_at: datetime | None = None
    location: str | None = Field(default=None, max_length=255)
    instructions_url: str | None = Field(default=None, max_length=1024)
    is_public: bool = True
    display_order: int = 100
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None

    @field_validator("milestone_type")
    @classmethod
    def validate_milestone_type(cls, value: str) -> str:
        return (
            _validate_choice(value, INTAKE_MILESTONE_TYPES, "milestone_type") or value
        )

    @field_validator("instructions_url")
    @classmethod
    def validate_instructions_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "instructions_url")

    @field_validator("starts_at", "ends_at", "scheduled_publish_at", "expires_at")
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_window(self) -> "IntakeMilestoneCreate":
        _validate_timestamp_window(self.starts_at, self.ends_at, "starts_at", "ends_at")
        _validate_timestamp_window(
            self.scheduled_publish_at,
            self.expires_at,
            "scheduled_publish_at",
            "expires_at",
        )
        return self


class IntakeMilestoneUpdate(BaseSchema):
    milestone_type: str | None = Field(default=None, max_length=64)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    location: str | None = Field(default=None, max_length=255)
    instructions_url: str | None = Field(default=None, max_length=1024)
    is_public: bool | None = None
    display_order: int | None = None
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None

    @field_validator("milestone_type")
    @classmethod
    def validate_milestone_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, INTAKE_MILESTONE_TYPES, "milestone_type")

    @field_validator("instructions_url")
    @classmethod
    def validate_instructions_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "instructions_url")

    @field_validator("starts_at", "ends_at", "scheduled_publish_at", "expires_at")
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_window(self) -> "IntakeMilestoneUpdate":
        _validate_timestamp_window(self.starts_at, self.ends_at, "starts_at", "ends_at")
        _validate_timestamp_window(
            self.scheduled_publish_at,
            self.expires_at,
            "scheduled_publish_at",
            "expires_at",
        )
        return self


class IntakeMilestoneRead(BaseReadSchema):
    intake_id: uuid.UUID
    milestone_type: str
    title: str
    description: str | None = None
    starts_at: datetime
    ends_at: datetime | None = None
    location: str | None = None
    instructions_url: str | None = None
    is_public: bool
    display_order: int
    status: str
    workflow_status: str
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None
    submitted_by_id: uuid.UUID | None = None
    reviewed_by_id: uuid.UUID | None = None
    approved_by_id: uuid.UUID | None = None
    published_by_id: uuid.UUID | None = None
    created_by_id: uuid.UUID | None = None
    updated_by_id: uuid.UUID | None = None
    submitted_at: datetime | None = None
    reviewed_at: datetime | None = None
    approved_at: datetime | None = None
    published_at: datetime | None = None
    unpublished_at: datetime | None = None
    rejection_reason: str | None = None
    revision_notes: str | None = None


class HomepageActionConfig(BaseSchema):
    enabled: bool = False
    label: str | None = Field(default=None, min_length=1, max_length=255)
    url: str | None = Field(default=None, min_length=1, max_length=1024)
    starts_at: datetime | None = None
    ends_at: datetime | None = None

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "url")

    @field_validator("starts_at", "ends_at")
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_action(self) -> "HomepageActionConfig":
        _validate_timestamp_window(self.starts_at, self.ends_at, "starts_at", "ends_at")
        if self.enabled and (not self.label or not self.url):
            raise ValueError("label and url are required when an action is enabled")
        return self


class HomepageActionConfigUpdate(BaseSchema):
    enabled: bool | None = None
    label: str | None = Field(default=None, min_length=1, max_length=255)
    url: str | None = Field(default=None, min_length=1, max_length=1024)
    starts_at: datetime | None = None
    ends_at: datetime | None = None

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "url")

    @field_validator("starts_at", "ends_at")
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_supplied_window(self) -> "HomepageActionConfigUpdate":
        _validate_timestamp_window(self.starts_at, self.ends_at, "starts_at", "ends_at")
        return self


class HomepageReportingConfig(BaseSchema):
    enabled: bool = False
    title: str = Field(default="Reporting Day", min_length=1, max_length=255)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    location: str | None = Field(default=None, max_length=255)
    instructions_url: str | None = Field(default=None, max_length=1024)

    @field_validator("instructions_url")
    @classmethod
    def validate_instructions_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "instructions_url")

    @field_validator("starts_at", "ends_at")
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_reporting(self) -> "HomepageReportingConfig":
        _validate_timestamp_window(self.starts_at, self.ends_at, "starts_at", "ends_at")
        if self.enabled and self.starts_at is None:
            raise ValueError("starts_at is required when reporting is enabled")
        return self


class HomepageReportingConfigUpdate(BaseSchema):
    enabled: bool | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    location: str | None = Field(default=None, max_length=255)
    instructions_url: str | None = Field(default=None, max_length=1024)

    @field_validator("instructions_url")
    @classmethod
    def validate_instructions_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "instructions_url")

    @field_validator("starts_at", "ends_at")
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_supplied_window(self) -> "HomepageReportingConfigUpdate":
        _validate_timestamp_window(self.starts_at, self.ends_at, "starts_at", "ends_at")
        return self


class IntakeHomepageAdmissionUpdate(BaseSchema):
    is_featured_on_homepage: bool | None = None
    homepage_priority: int | None = None
    application_opens_at: datetime | None = None
    application_closes_at: datetime | None = None
    late_application_closes_at: datetime | None = None
    late_applications_enabled: bool | None = None
    application_override: str | None = None
    override_expires_at: datetime | None = None
    timezone: str | None = None
    apply: HomepageActionConfigUpdate | None = None
    check_requirements: HomepageActionConfigUpdate | None = None
    explore_programmes: HomepageActionConfigUpdate | None = None
    admission_letter: HomepageActionConfigUpdate | None = None
    reporting_instructions: HomepageActionConfigUpdate | None = None
    reporting: HomepageReportingConfigUpdate | None = None

    @field_validator("application_override")
    @classmethod
    def validate_application_override(cls, value: str | None) -> str | None:
        return _validate_choice(
            value, INTAKE_APPLICATION_OVERRIDES, "application_override"
        )

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str | None) -> str | None:
        return _validate_timezone(value) if value is not None else None

    @field_validator(
        "application_opens_at",
        "application_closes_at",
        "late_application_closes_at",
        "override_expires_at",
    )
    @classmethod
    def validate_operational_timestamp(
        cls, value: datetime | None, info
    ) -> datetime | None:
        return _validate_aware_timestamp(value, info.field_name)

    @model_validator(mode="after")
    def validate_application_window(self) -> "IntakeHomepageAdmissionUpdate":
        required_fields = (
            "is_featured_on_homepage",
            "homepage_priority",
            "application_opens_at",
            "application_closes_at",
            "late_applications_enabled",
            "application_override",
            "timezone",
        )
        for field_name in required_fields:
            if (
                field_name in self.model_fields_set
                and getattr(self, field_name) is None
            ):
                raise ValueError(f"{field_name} cannot be null")
        _validate_timestamp_window(
            self.application_opens_at,
            self.application_closes_at,
            "application_opens_at",
            "application_closes_at",
        )
        _validate_timestamp_window(
            self.application_closes_at,
            self.late_application_closes_at,
            "application_closes_at",
            "late_application_closes_at",
        )
        return self


class IntakeHomepageAdmissionRead(BaseSchema):
    intake_id: uuid.UUID
    intake_name: str
    intake_code: str
    is_featured_on_homepage: bool
    homepage_priority: int
    application_opens_at: datetime
    application_closes_at: datetime
    late_application_closes_at: datetime | None = None
    late_applications_enabled: bool
    application_override: str
    override_expires_at: datetime | None = None
    timezone: str
    apply: HomepageActionConfig = Field(default_factory=HomepageActionConfig)
    check_requirements: HomepageActionConfig = Field(
        default_factory=HomepageActionConfig
    )
    explore_programmes: HomepageActionConfig = Field(
        default_factory=HomepageActionConfig
    )
    admission_letter: HomepageActionConfig = Field(default_factory=HomepageActionConfig)
    reporting_instructions: HomepageActionConfig = Field(
        default_factory=HomepageActionConfig
    )
    reporting: HomepageReportingConfig = Field(default_factory=HomepageReportingConfig)


class AdmissionInfoCreate(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    content_type: str = Field(min_length=1, max_length=64)
    audience_levels: list[str] | None = None
    summary: str | None = None
    content: str | None = None
    external_url: str | None = None
    school_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    attachment_media_id: uuid.UUID | None = None
    is_published: bool = True
    display_order: int = 100


class AdmissionInfoUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    content_type: str | None = Field(default=None, max_length=64)
    audience_levels: list[str] | None = None
    summary: str | None = None
    content: str | None = None
    external_url: str | None = None
    school_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    attachment_media_id: uuid.UUID | None = None
    is_published: bool | None = None
    display_order: int | None = None


class AdmissionInfoRead(BaseReadSchema):
    title: str
    slug: str
    content_type: str
    audience_levels: list[str] | None = None
    summary: str | None = None
    content: str | None = None
    external_url: str | None = None
    school_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    attachment_media_id: uuid.UUID | None = None
    is_published: bool
    attachment_media: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    school: dict[str, Any] | None = None
    display_order: int


class AdmissionPathwayCreate(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    applicant_type: str = Field(max_length=64)
    summary: str | None = None
    eligibility_notes: str | None = None
    application_steps: list[dict[str, Any]] | None = None
    required_documents: list[dict[str, Any]] | None = None
    cta_label: str | None = Field(default=None, max_length=255)
    cta_url: str | None = Field(default=None, max_length=1024)
    cover_image_id: uuid.UUID | None = None
    is_published: bool = True
    display_order: int = 100

    @field_validator("applicant_type")
    @classmethod
    def validate_applicant_type(cls, value: str) -> str:
        return _validate_choice(value, ADMISSION_APPLICANT_TYPES, "applicant_type") or value

    @field_validator("cta_url")
    @classmethod
    def validate_cta_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "cta_url")


class AdmissionPathwayUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    applicant_type: str | None = Field(default=None, max_length=64)
    summary: str | None = None
    eligibility_notes: str | None = None
    application_steps: list[dict[str, Any]] | None = None
    required_documents: list[dict[str, Any]] | None = None
    cta_label: str | None = Field(default=None, max_length=255)
    cta_url: str | None = Field(default=None, max_length=1024)
    cover_image_id: uuid.UUID | None = None
    is_published: bool | None = None
    display_order: int | None = None

    @field_validator("applicant_type")
    @classmethod
    def validate_applicant_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, ADMISSION_APPLICANT_TYPES, "applicant_type")

    @field_validator("cta_url")
    @classmethod
    def validate_cta_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "cta_url")


class AdmissionPathwayRead(BaseReadSchema):
    title: str
    slug: str
    applicant_type: str
    summary: str | None = None
    eligibility_notes: str | None = None
    application_steps: list[dict[str, Any]] | None = None
    required_documents: list[dict[str, Any]] | None = None
    cta_label: str | None = None
    cta_url: str | None = None
    cover_image_id: uuid.UUID | None = None
    cover_image: dict[str, Any] | None = None
    is_published: bool
    display_order: int


class AdmissionRequirementCreate(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    applicant_type: str = Field(max_length=64)
    level: str | None = Field(default=None, max_length=64)
    minimum_grade: str | None = Field(default=None, max_length=128)
    subject_requirements: list[dict[str, Any]] | None = None
    alternative_qualifications: list[dict[str, Any]] | None = None
    documents_required: list[dict[str, Any]] | None = None
    notes: str | None = None
    effective_from: date | None = None
    effective_to: date | None = None
    programme_id: uuid.UUID | None = None
    school_id: uuid.UUID | None = None
    intake_id: uuid.UUID | None = None
    pathway_id: uuid.UUID | None = None
    is_active: bool = True
    display_order: int = 100

    @field_validator("applicant_type")
    @classmethod
    def validate_applicant_type(cls, value: str) -> str:
        return _validate_choice(value, ADMISSION_APPLICANT_TYPES, "applicant_type") or value

    @model_validator(mode="after")
    def validate_effective_window(self) -> "AdmissionRequirementCreate":
        if self.effective_from and self.effective_to and self.effective_to < self.effective_from:
            raise ValueError("effective_to cannot be before effective_from")
        return self


class AdmissionRequirementUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    applicant_type: str | None = Field(default=None, max_length=64)
    level: str | None = Field(default=None, max_length=64)
    minimum_grade: str | None = Field(default=None, max_length=128)
    subject_requirements: list[dict[str, Any]] | None = None
    alternative_qualifications: list[dict[str, Any]] | None = None
    documents_required: list[dict[str, Any]] | None = None
    notes: str | None = None
    effective_from: date | None = None
    effective_to: date | None = None
    programme_id: uuid.UUID | None = None
    school_id: uuid.UUID | None = None
    intake_id: uuid.UUID | None = None
    pathway_id: uuid.UUID | None = None
    is_active: bool | None = None
    display_order: int | None = None

    @field_validator("applicant_type")
    @classmethod
    def validate_applicant_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, ADMISSION_APPLICANT_TYPES, "applicant_type")

    @model_validator(mode="after")
    def validate_effective_window(self) -> "AdmissionRequirementUpdate":
        if self.effective_from and self.effective_to and self.effective_to < self.effective_from:
            raise ValueError("effective_to cannot be before effective_from")
        return self


class AdmissionRequirementRead(BaseReadSchema):
    title: str
    applicant_type: str
    level: str | None = None
    minimum_grade: str | None = None
    subject_requirements: list[dict[str, Any]] | None = None
    alternative_qualifications: list[dict[str, Any]] | None = None
    documents_required: list[dict[str, Any]] | None = None
    notes: str | None = None
    effective_from: date | None = None
    effective_to: date | None = None
    programme_id: uuid.UUID | None = None
    school_id: uuid.UUID | None = None
    intake_id: uuid.UUID | None = None
    pathway_id: uuid.UUID | None = None
    programme: dict[str, Any] | None = None
    school: dict[str, Any] | None = None
    intake: dict[str, Any] | None = None
    pathway: dict[str, Any] | None = None
    is_active: bool
    display_order: int


class ProgrammeFeeStructureCreate(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    applicant_type: str = Field(max_length=64)
    fee_category: str = Field(default="tuition", max_length=64)
    currency: str = Field(default="KES", min_length=3, max_length=8)
    tuition_amount: int | None = Field(default=None, ge=0)
    statutory_amount: int | None = Field(default=None, ge=0)
    other_amount: int | None = Field(default=None, ge=0)
    total_amount: int | None = Field(default=None, ge=0)
    payment_schedule: list[dict[str, Any]] | None = None
    notes: str | None = None
    effective_from: date | None = None
    effective_to: date | None = None
    programme_id: uuid.UUID
    intake_id: uuid.UUID | None = None
    attachment_media_id: uuid.UUID | None = None
    is_active: bool = True
    display_order: int = 100

    @field_validator("applicant_type")
    @classmethod
    def validate_applicant_type(cls, value: str) -> str:
        return _validate_choice(value, ADMISSION_APPLICANT_TYPES, "applicant_type") or value

    @model_validator(mode="after")
    def validate_effective_window(self) -> "ProgrammeFeeStructureCreate":
        if self.effective_from and self.effective_to and self.effective_to < self.effective_from:
            raise ValueError("effective_to cannot be before effective_from")
        return self


class ProgrammeFeeStructureUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    applicant_type: str | None = Field(default=None, max_length=64)
    fee_category: str | None = Field(default=None, max_length=64)
    currency: str | None = Field(default=None, min_length=3, max_length=8)
    tuition_amount: int | None = Field(default=None, ge=0)
    statutory_amount: int | None = Field(default=None, ge=0)
    other_amount: int | None = Field(default=None, ge=0)
    total_amount: int | None = Field(default=None, ge=0)
    payment_schedule: list[dict[str, Any]] | None = None
    notes: str | None = None
    effective_from: date | None = None
    effective_to: date | None = None
    programme_id: uuid.UUID | None = None
    intake_id: uuid.UUID | None = None
    attachment_media_id: uuid.UUID | None = None
    is_active: bool | None = None
    display_order: int | None = None

    @field_validator("applicant_type")
    @classmethod
    def validate_applicant_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, ADMISSION_APPLICANT_TYPES, "applicant_type")

    @model_validator(mode="after")
    def validate_effective_window(self) -> "ProgrammeFeeStructureUpdate":
        if self.effective_from and self.effective_to and self.effective_to < self.effective_from:
            raise ValueError("effective_to cannot be before effective_from")
        return self


class ProgrammeFeeStructureRead(BaseReadSchema):
    title: str
    applicant_type: str
    fee_category: str
    currency: str
    tuition_amount: int | None = None
    statutory_amount: int | None = None
    other_amount: int | None = None
    total_amount: int | None = None
    payment_schedule: list[dict[str, Any]] | None = None
    notes: str | None = None
    effective_from: date | None = None
    effective_to: date | None = None
    programme_id: uuid.UUID
    intake_id: uuid.UUID | None = None
    attachment_media_id: uuid.UUID | None = None
    programme: dict[str, Any] | None = None
    intake: dict[str, Any] | None = None
    attachment_media: dict[str, Any] | None = None
    is_active: bool
    display_order: int


class AdmissionDocumentCreate(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    document_type: str = Field(max_length=64)
    applicant_type: str | None = Field(default=None, max_length=64)
    summary: str | None = None
    external_url: str | None = Field(default=None, max_length=1024)
    media_id: uuid.UUID | None = None
    pathway_id: uuid.UUID | None = None
    programme_id: uuid.UUID | None = None
    intake_id: uuid.UUID | None = None
    is_published: bool = True
    published_at: datetime | None = None
    expires_at: datetime | None = None
    display_order: int = 100

    @field_validator("document_type")
    @classmethod
    def validate_document_type(cls, value: str) -> str:
        return _validate_choice(value, ADMISSION_DOCUMENT_TYPES, "document_type") or value

    @field_validator("applicant_type")
    @classmethod
    def validate_applicant_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, ADMISSION_APPLICANT_TYPES, "applicant_type")

    @field_validator("external_url")
    @classmethod
    def validate_external_url(cls, value: str | None) -> str | None:
        return _validate_safe_target(value, "external_url")


class AdmissionDocumentUpdate(AdmissionDocumentCreate):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    document_type: str | None = Field(default=None, max_length=64)
    is_published: bool | None = None
    display_order: int | None = None

    @field_validator("document_type")
    @classmethod
    def validate_document_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, ADMISSION_DOCUMENT_TYPES, "document_type")


class AdmissionDocumentRead(BaseReadSchema):
    title: str
    slug: str
    document_type: str
    applicant_type: str | None = None
    summary: str | None = None
    external_url: str | None = None
    media_id: uuid.UUID | None = None
    pathway_id: uuid.UUID | None = None
    programme_id: uuid.UUID | None = None
    intake_id: uuid.UUID | None = None
    media: dict[str, Any] | None = None
    pathway: dict[str, Any] | None = None
    programme: dict[str, Any] | None = None
    intake: dict[str, Any] | None = None
    is_published: bool
    published_at: datetime | None = None
    expires_at: datetime | None = None
    display_order: int


class AdmissionFaqCreate(BaseSchema):
    question: str = Field(min_length=1, max_length=500)
    answer: str = Field(min_length=1)
    category: str | None = Field(default=None, max_length=96)
    applicant_type: str | None = Field(default=None, max_length=64)
    pathway_id: uuid.UUID | None = None
    is_published: bool = True
    display_order: int = 100

    @field_validator("applicant_type")
    @classmethod
    def validate_applicant_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, ADMISSION_APPLICANT_TYPES, "applicant_type")


class AdmissionFaqUpdate(BaseSchema):
    question: str | None = Field(default=None, min_length=1, max_length=500)
    answer: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, max_length=96)
    applicant_type: str | None = Field(default=None, max_length=64)
    pathway_id: uuid.UUID | None = None
    is_published: bool | None = None
    display_order: int | None = None

    @field_validator("applicant_type")
    @classmethod
    def validate_applicant_type(cls, value: str | None) -> str | None:
        return _validate_choice(value, ADMISSION_APPLICANT_TYPES, "applicant_type")


class AdmissionFaqRead(BaseReadSchema):
    question: str
    answer: str
    category: str | None = None
    applicant_type: str | None = None
    pathway_id: uuid.UUID | None = None
    pathway: dict[str, Any] | None = None
    is_published: bool
    display_order: int


class AdmissionPageSectionCreate(BaseSchema):
    page_key: str = Field(max_length=64)
    section_key: str = Field(min_length=1, max_length=128)
    title: str = Field(min_length=1, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    body: str | None = None
    layout_variant: str = Field(default="editorial", max_length=64)
    settings: dict[str, Any] | None = None
    items: list[dict[str, Any]] | None = None
    media_id: uuid.UUID | None = None
    is_enabled: bool = True
    display_order: int = 100

    @field_validator("page_key")
    @classmethod
    def validate_page_key(cls, value: str) -> str:
        return _validate_choice(value, ADMISSION_PAGE_KEYS, "page_key") or value


class AdmissionPageSectionUpdate(BaseSchema):
    page_key: str | None = Field(default=None, max_length=64)
    section_key: str | None = Field(default=None, min_length=1, max_length=128)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    body: str | None = None
    layout_variant: str | None = Field(default=None, max_length=64)
    settings: dict[str, Any] | None = None
    items: list[dict[str, Any]] | None = None
    media_id: uuid.UUID | None = None
    is_enabled: bool | None = None
    display_order: int | None = None

    @field_validator("page_key")
    @classmethod
    def validate_page_key(cls, value: str | None) -> str | None:
        return _validate_choice(value, ADMISSION_PAGE_KEYS, "page_key")


class AdmissionPageSectionRead(BaseReadSchema):
    page_key: str
    section_key: str
    title: str
    subtitle: str | None = None
    body: str | None = None
    layout_variant: str
    settings: dict[str, Any] | None = None
    items: list[dict[str, Any]] | None = None
    media_id: uuid.UUID | None = None
    media: dict[str, Any] | None = None
    is_enabled: bool
    display_order: int


__all__ = [
    "ProgrammeCreate",
    "ProgrammeUpdate",
    "ProgrammeRead",
    "ProgrammeTutorCreate",
    "ProgrammeTutorRead",
    "IntakeCreate",
    "IntakeUpdate",
    "IntakeRead",
    "IntakePublicActionCreate",
    "IntakePublicActionUpdate",
    "IntakePublicActionRead",
    "IntakeMilestoneCreate",
    "IntakeMilestoneUpdate",
    "IntakeMilestoneRead",
    "HomepageActionConfig",
    "HomepageActionConfigUpdate",
    "HomepageReportingConfig",
    "HomepageReportingConfigUpdate",
    "IntakeHomepageAdmissionUpdate",
    "IntakeHomepageAdmissionRead",
    "ProgrammeIntakeCreate",
    "ProgrammeIntakeRead",
    "AdmissionInfoCreate",
    "AdmissionInfoUpdate",
    "AdmissionInfoRead",
    "AdmissionPathwayCreate",
    "AdmissionPathwayUpdate",
    "AdmissionPathwayRead",
    "AdmissionRequirementCreate",
    "AdmissionRequirementUpdate",
    "AdmissionRequirementRead",
    "ProgrammeFeeStructureCreate",
    "ProgrammeFeeStructureUpdate",
    "ProgrammeFeeStructureRead",
    "AdmissionDocumentCreate",
    "AdmissionDocumentUpdate",
    "AdmissionDocumentRead",
    "AdmissionFaqCreate",
    "AdmissionFaqUpdate",
    "AdmissionFaqRead",
    "AdmissionPageSectionCreate",
    "AdmissionPageSectionUpdate",
    "AdmissionPageSectionRead",
]
