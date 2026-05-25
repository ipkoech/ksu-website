"""Academic structure schemas."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, CodeStr, PhoneStr, SlugStr, UrlStr


class CampusCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    code: CodeStr
    campus_type: str = Field(default="main", max_length=32)
    address: str | None = None
    city: str | None = Field(default=None, max_length=128)
    county: str | None = Field(default=None, max_length=128)
    postal_code: str | None = Field(default=None, max_length=20)
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    description: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool = True
    display_order: int = 100


class CampusRead(BaseReadSchema):
    name: str
    slug: str
    code: str
    campus_type: str
    address: str | None = None
    city: str | None = None
    county: str | None = None
    postal_code: str | None = None
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    description: str | None = None
    email: str | None = None
    phone: str | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool
    display_order: int


class CampusUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    code: CodeStr | None = None
    campus_type: str | None = Field(default=None, max_length=32)
    address: str | None = None
    city: str | None = Field(default=None, max_length=128)
    county: str | None = Field(default=None, max_length=128)
    postal_code: str | None = Field(default=None, max_length=20)
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    description: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool | None = None
    display_order: int | None = None


class SchoolCreate(BaseSchema):
    campus_id: uuid.UUID | None = None
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    code: CodeStr
    school_type: str = Field(default="school", max_length=32)
    dean_id: uuid.UUID | None = None
    establishment_date: date | None = None
    about: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    mandate: str | None = None
    core_values: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    website: UrlStr | None = None
    logo_image_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool = True
    is_public: bool = True
    display_order: int = 100


class SchoolRead(BaseReadSchema):
    campus_id: uuid.UUID | None = None
    name: str
    slug: str
    code: str
    school_type: str
    dean_id: uuid.UUID | None = None
    establishment_date: date | None = None
    about: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    mandate: str | None = None
    core_values: str | None = None
    email: str | None = None
    phone: str | None = None
    office_location: str | None = None
    website: str | None = None
    logo_image_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool
    is_public: bool
    display_order: int


class SchoolUpdate(BaseSchema):
    campus_id: uuid.UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    code: CodeStr | None = None
    school_type: str | None = Field(default=None, max_length=32)
    dean_id: uuid.UUID | None = None
    establishment_date: date | None = None
    about: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    mandate: str | None = None
    core_values: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    website: UrlStr | None = None
    logo_image_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool | None = None
    is_public: bool | None = None
    display_order: int | None = None


class DepartmentCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    code: CodeStr
    department_type: str = Field(default="academic", max_length=32)
    school_id: uuid.UUID | None = None
    wing_id: uuid.UUID | None = None
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
    student_count: int = 0
    postgraduate_student_count: int = 0
    is_active: bool = True
    is_public: bool = True
    allows_staff_management: bool = True
    display_order: int = 100


class DepartmentServiceRead(BaseReadSchema):
    department_id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    requirements: str | None = None
    process: str | None = None
    turnaround_time: str | None = None
    fee: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    is_active: bool
    display_order: int


class DepartmentRead(BaseReadSchema):
    name: str
    slug: str
    code: str
    department_type: str
    school_id: uuid.UUID | None = None
    wing_id: uuid.UUID | None = None
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
    email: str | None = None
    phone: str | None = None
    office_location: str | None = None
    cover_image_id: uuid.UUID | None = None
    student_count: int
    postgraduate_student_count: int
    is_active: bool
    is_public: bool
    allows_staff_management: bool
    display_order: int
    services: list[DepartmentServiceRead] = Field(default_factory=list)


class DepartmentUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    code: CodeStr | None = None
    department_type: str | None = Field(default=None, max_length=32)
    school_id: uuid.UUID | None = None
    wing_id: uuid.UUID | None = None
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
    student_count: int | None = None
    postgraduate_student_count: int | None = None
    is_active: bool | None = None
    is_public: bool | None = None
    allows_staff_management: bool | None = None
    display_order: int | None = None


class AcademicCalendarCreate(BaseSchema):
    academic_year: str = Field(min_length=4, max_length=32)
    semester: int = Field(ge=1, le=3)
    start_date: date
    end_date: date
    registration_start: date | None = None
    registration_end: date | None = None
    late_registration_end: date | None = None
    teaching_start: date | None = None
    teaching_end: date | None = None
    exam_start: date | None = None
    exam_end: date | None = None
    results_release: date | None = None
    holidays: list[dict[str, Any]] | None = None
    events: list[dict[str, Any]] | None = None
    status: str = Field(default="draft", max_length=32)


class AcademicCalendarRead(BaseReadSchema):
    academic_year: str
    semester: int
    start_date: date
    end_date: date
    registration_start: date | None = None
    registration_end: date | None = None
    late_registration_end: date | None = None
    teaching_start: date | None = None
    teaching_end: date | None = None
    exam_start: date | None = None
    exam_end: date | None = None
    results_release: date | None = None
    holidays: list[dict[str, Any]] | None = None
    events: list[dict[str, Any]] | None = None
    status: str


class AcademicCalendarUpdate(BaseSchema):
    academic_year: str | None = Field(default=None, min_length=4, max_length=32)
    semester: int | None = Field(default=None, ge=1, le=3)
    start_date: date | None = None
    end_date: date | None = None
    registration_start: date | None = None
    registration_end: date | None = None
    late_registration_end: date | None = None
    teaching_start: date | None = None
    teaching_end: date | None = None
    exam_start: date | None = None
    exam_end: date | None = None
    results_release: date | None = None
    holidays: list[dict[str, Any]] | None = None
    events: list[dict[str, Any]] | None = None
    status: str | None = Field(default=None, max_length=32)
