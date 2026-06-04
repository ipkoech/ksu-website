"""Admissions schemas."""

from __future__ import annotations

import uuid
from typing import Any
from datetime import date

from pydantic import Field, model_validator

from .base import BaseReadSchema, BaseSchema, CodeStr, SlugStr


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
    level: str = Field(min_length=1, max_length=32)
    mode_of_study: str = Field(default="full_time", max_length=32)
    duration: str = Field(min_length=1, max_length=64)
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
        if self.min_students is not None and self.max_students is not None and self.min_students > self.max_students:
            raise ValueError("min_students cannot exceed max_students")
        return self


class ProgrammeUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    code: CodeStr | None = None
    slug: SlugStr | None = None
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
        if self.min_students is not None and self.max_students is not None and self.min_students > self.max_students:
            raise ValueError("min_students cannot exceed max_students")
        return self


class ProgrammeRead(BaseReadSchema):
    name: str
    code: str
    slug: str
    level: str
    mode_of_study: str
    duration: str
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


class IntakeCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    code: CodeStr
    slug: SlugStr | None = None
    academic_calendar_id: uuid.UUID
    application_start: date
    application_end: date
    late_application_end: date | None = None
    max_students: int | None = Field(default=None, ge=0)
    cover_image_id: uuid.UUID | None = None
    is_active: bool = True
    is_open: bool = False

    @model_validator(mode="after")
    def validate_dates(self) -> "IntakeCreate":
        if self.application_end < self.application_start:
            raise ValueError("application_end cannot be before application_start")
        if self.late_application_end and self.late_application_end < self.application_end:
            raise ValueError("late_application_end cannot be before application_end")
        return self


class IntakeUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    code: CodeStr | None = None
    slug: SlugStr | None = None
    academic_calendar_id: uuid.UUID | None = None
    application_start: date | None = None
    application_end: date | None = None
    late_application_end: date | None = None
    max_students: int | None = Field(default=None, ge=0)
    cover_image_id: uuid.UUID | None = None
    is_active: bool | None = None
    is_open: bool | None = None

    @model_validator(mode="after")
    def validate_dates(self) -> "IntakeUpdate":
        if self.application_start and self.application_end and self.application_end < self.application_start:
            raise ValueError("application_end cannot be before application_start")
        if self.application_end and self.late_application_end and self.late_application_end < self.application_end:
            raise ValueError("late_application_end cannot be before application_end")
        return self


class IntakeRead(BaseReadSchema):
    name: str
    code: str
    slug: str
    academic_calendar_id: uuid.UUID
    application_start: date
    application_end: date
    late_application_end: date | None = None
    max_students: int | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool
    is_open: bool
    academic_calendar: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    programmes: list[ProgrammeIntakeRead] = Field(default_factory=list)


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


__all__ = [
    "ProgrammeCreate",
    "ProgrammeUpdate",
    "ProgrammeRead",
    "ProgrammeTutorCreate",
    "ProgrammeTutorRead",
    "IntakeCreate",
    "IntakeUpdate",
    "IntakeRead",
    "ProgrammeIntakeCreate",
    "ProgrammeIntakeRead",
    "AdmissionInfoCreate",
    "AdmissionInfoUpdate",
    "AdmissionInfoRead",
]
