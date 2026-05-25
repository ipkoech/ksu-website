"""Person profile schemas."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from pydantic import EmailStr, Field, field_validator

from .base import BaseReadSchema, BaseSchema, PhoneStr, UrlStr


def _normalize_email(value: str) -> str:
    return value.strip().lower()


class QualificationItem(BaseSchema):
    degree: str = Field(min_length=1, max_length=255)
    institution: str = Field(min_length=1, max_length=255)
    year: str | int | None = None
    field: str | None = Field(default=None, max_length=255)


class PersonCreate(BaseSchema):
    user_id: uuid.UUID | None = None
    title: str | None = Field(default=None, max_length=32)
    first_name: str = Field(min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: PhoneStr | None = None
    alternative_email: EmailStr | None = None
    alternative_phone: PhoneStr | None = None
    photo_id: uuid.UUID | None = None
    bio: str | None = None
    full_bio: str | None = None
    qualifications: list[QualificationItem] | None = None
    employee_number: str | None = Field(default=None, max_length=32)
    employment_type: str = Field(default="full_time", max_length=32)
    employment_start_date: date | None = None
    employment_end_date: date | None = None
    job_group: str | None = Field(default=None, max_length=16)
    date_of_appointment: date | None = None
    contract_type: str | None = Field(default=None, max_length=32)
    department_id: uuid.UUID | None = None
    academic_rank: str | None = Field(default=None, max_length=64)
    tenure_status: str | None = Field(default=None, max_length=32)
    specialization: str | None = None
    research_interests: list[str] | None = None
    teaching_areas: list[str] | None = None
    publications_count: int = Field(default=0, ge=0)
    h_index: int | None = Field(default=None, ge=0)
    office_location: str | None = Field(default=None, max_length=255)
    office_hours: dict[str, Any] | None = None
    office_phone: PhoneStr | None = None
    courses_taught: list[str] | None = None
    institutional_role: str | None = Field(default=None, max_length=64)
    leadership_message: str | None = None
    website_url: UrlStr | None = None
    linkedin_url: UrlStr | None = None
    google_scholar_id: str | None = Field(default=None, max_length=128)
    google_scholar_url: UrlStr | None = None
    orcid: str | None = Field(default=None, max_length=32)
    researchgate_url: UrlStr | None = None
    scopus_id: str | None = Field(default=None, max_length=128)
    education_background: list[dict[str, Any]] | None = None
    professional_memberships: list[dict[str, Any]] | None = None
    awards_honors: list[dict[str, Any]] | None = None
    cv_file_id: uuid.UUID | None = None
    is_active: bool = True
    is_public: bool = True
    is_researcher: bool = False
    is_featured: bool = False
    show_on_directory: bool = True

    @field_validator("email", "alternative_email", mode="before")
    @classmethod
    def normalize_emails(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _normalize_email(value)


class PersonUpdate(BaseSchema):
    title: str | None = Field(default=None, max_length=32)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    phone: PhoneStr | None = None
    alternative_email: EmailStr | None = None
    alternative_phone: PhoneStr | None = None
    photo_id: uuid.UUID | None = None
    bio: str | None = None
    full_bio: str | None = None
    qualifications: list[QualificationItem] | None = None
    employee_number: str | None = Field(default=None, max_length=32)
    employment_type: str | None = Field(default=None, max_length=32)
    employment_start_date: date | None = None
    employment_end_date: date | None = None
    job_group: str | None = Field(default=None, max_length=16)
    date_of_appointment: date | None = None
    contract_type: str | None = Field(default=None, max_length=32)
    department_id: uuid.UUID | None = None
    academic_rank: str | None = Field(default=None, max_length=64)
    tenure_status: str | None = Field(default=None, max_length=32)
    specialization: str | None = None
    research_interests: list[str] | None = None
    teaching_areas: list[str] | None = None
    publications_count: int | None = Field(default=None, ge=0)
    h_index: int | None = Field(default=None, ge=0)
    office_location: str | None = Field(default=None, max_length=255)
    office_hours: dict[str, Any] | None = None
    office_phone: PhoneStr | None = None
    courses_taught: list[str] | None = None
    institutional_role: str | None = Field(default=None, max_length=64)
    leadership_message: str | None = None
    website_url: UrlStr | None = None
    linkedin_url: UrlStr | None = None
    google_scholar_id: str | None = Field(default=None, max_length=128)
    google_scholar_url: UrlStr | None = None
    orcid: str | None = Field(default=None, max_length=32)
    researchgate_url: UrlStr | None = None
    scopus_id: str | None = Field(default=None, max_length=128)
    education_background: list[dict[str, Any]] | None = None
    professional_memberships: list[dict[str, Any]] | None = None
    awards_honors: list[dict[str, Any]] | None = None
    cv_file_id: uuid.UUID | None = None
    is_active: bool | None = None
    is_public: bool | None = None
    is_researcher: bool | None = None
    is_featured: bool | None = None
    show_on_directory: bool | None = None

    @field_validator("email", "alternative_email", mode="before")
    @classmethod
    def normalize_emails(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _normalize_email(value)


class PersonRead(BaseReadSchema):
    user_id: uuid.UUID | None = None
    slug: str
    title: str | None = None
    first_name: str
    middle_name: str | None = None
    last_name: str
    full_name: str
    email: EmailStr
    phone: str | None = None
    alternative_email: str | None = None
    alternative_phone: str | None = None
    photo_id: uuid.UUID | None = None
    photo_url: str | None = None
    bio: str | None = None
    full_bio: str | None = None
    qualifications: list[dict[str, Any]] | None = None
    employee_number: str | None = None
    employment_type: str
    employment_start_date: date | None = None
    employment_end_date: date | None = None
    job_group: str | None = None
    date_of_appointment: date | None = None
    contract_type: str | None = None
    department_id: uuid.UUID | None = None
    academic_rank: str | None = None
    tenure_status: str | None = None
    specialization: str | None = None
    research_interests: list[str] | None = None
    teaching_areas: list[str] | None = None
    publications_count: int = 0
    h_index: int | None = None
    office_location: str | None = None
    office_hours: dict[str, Any] | None = None
    office_phone: str | None = None
    courses_taught: list[str] | None = None
    institutional_role: str | None = None
    leadership_message: str | None = None
    website_url: str | None = None
    linkedin_url: str | None = None
    google_scholar_id: str | None = None
    google_scholar_url: str | None = None
    orcid: str | None = None
    researchgate_url: str | None = None
    scopus_id: str | None = None
    education_background: list[dict[str, Any]] | None = None
    professional_memberships: list[dict[str, Any]] | None = None
    awards_honors: list[dict[str, Any]] | None = None
    cv_file_id: uuid.UUID | None = None
    is_active: bool
    is_public: bool
    is_researcher: bool
    is_featured: bool = False
    show_on_directory: bool = True
