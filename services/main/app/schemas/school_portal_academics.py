"""School-owned department, programme, and import contracts."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any, Literal

from pydantic import ConfigDict, Field, model_validator

from .base import BaseSchema, CodeStr, PhoneStr, SlugStr


class SchoolDepartmentCreate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    code: CodeStr
    department_type: str = Field(default="academic", max_length=32)
    parent_department_id: uuid.UUID | None = None
    head_id: uuid.UUID | None = None
    postgraduate_coordinator_id: uuid.UUID | None = None
    establishment_date: date | None = None
    about: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    mandate: str | None = None
    core_values: str | None = None
    service_charter: str | None = None
    guidelines: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    cover_image_id: uuid.UUID | None = None
    is_public: bool = False
    allows_staff_management: bool = True
    display_order: int = Field(default=100, ge=0)


class SchoolDepartmentUpdate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    code: CodeStr | None = None
    department_type: str | None = Field(default=None, max_length=32)
    parent_department_id: uuid.UUID | None = None
    head_id: uuid.UUID | None = None
    postgraduate_coordinator_id: uuid.UUID | None = None
    establishment_date: date | None = None
    about: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    mandate: str | None = None
    core_values: str | None = None
    service_charter: str | None = None
    guidelines: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    cover_image_id: uuid.UUID | None = None
    is_active: bool | None = None
    is_public: bool | None = None
    allows_staff_management: bool | None = None
    display_order: int | None = Field(default=None, ge=0)


class SchoolProgrammeCreate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=255)
    code: CodeStr
    slug: SlugStr
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
    cluster_subjects: list[dict[str, Any]] | None = None
    fees_structure: dict[str, Any] | None = None
    intake_months: list[str] | None = None
    min_students: int | None = Field(default=None, ge=0)
    max_students: int | None = Field(default=None, ge=0)
    accreditation_status: str | None = Field(default=None, max_length=128)
    accrediting_body: str | None = Field(default=None, max_length=255)
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool = True
    display_order: int = Field(default=100, ge=0)
    tutor_ids: list[uuid.UUID] = Field(default_factory=list)
    intake_ids: list[uuid.UUID] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_capacity(self):
        if (
            self.min_students is not None
            and self.max_students is not None
            and self.min_students > self.max_students
        ):
            raise ValueError("min_students cannot exceed max_students")
        return self


class SchoolProgrammeUpdate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

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
    cluster_subjects: list[dict[str, Any]] | None = None
    fees_structure: dict[str, Any] | None = None
    intake_months: list[str] | None = None
    min_students: int | None = Field(default=None, ge=0)
    max_students: int | None = Field(default=None, ge=0)
    accreditation_status: str | None = Field(default=None, max_length=128)
    accrediting_body: str | None = Field(default=None, max_length=255)
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool | None = None
    display_order: int | None = Field(default=None, ge=0)
    tutor_ids: list[uuid.UUID] | None = None
    intake_ids: list[uuid.UUID] | None = None


class SchoolAcademicImportRequest(BaseSchema):
    resource: Literal["departments", "programmes"]
    rows: list[dict[str, Any]] = Field(min_length=1)
    mode: Literal["partial", "all_or_nothing"] = "partial"
    idempotency_key: str = Field(min_length=8, max_length=128)


__all__ = [
    "SchoolAcademicImportRequest",
    "SchoolDepartmentCreate",
    "SchoolDepartmentUpdate",
    "SchoolProgrammeCreate",
    "SchoolProgrammeUpdate",
]
