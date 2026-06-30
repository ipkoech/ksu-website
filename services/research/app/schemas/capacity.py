"""Schemas for capacity building models: training, mentorship, scholarships."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from pydantic import Field

from .base import (
    BaseSchema,
    BaseReadSchema,
    SEOFieldsMixin,
    SlugMixin,
    StatusMixin,
    SlugStr,
    UrlStr,
    EmailField,
    PhoneStr,
)


# ============================================================================
# Training Program
# ============================================================================


class TrainingProgramBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    code: str | None = Field(None, max_length=32)
    program_type: str = Field(default="workshop", max_length=32)
    category: str | None = Field(None, max_length=64)
    center_id: uuid.UUID | None = None
    organizer_id: uuid.UUID | None = None
    summary: str | None = None
    description: str | None = None
    objectives: str | None = None
    target_audience: str | None = None
    prerequisites: str | None = None
    curriculum: str | None = None
    outcomes: str | None = None
    facilitators: list[dict] | None = None
    start_date: date | None = None
    end_date: date | None = None
    schedule: str | None = None
    duration_hours: int | None = None
    delivery_mode: str = Field(default="in_person", max_length=32)
    venue: str | None = Field(None, max_length=255)
    platform: str | None = Field(None, max_length=128)
    meeting_link: UrlStr | None = None
    registration_deadline: datetime | None = None
    max_participants: int | None = None
    is_free: bool = True
    fee: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    early_bird_fee: Decimal | None = None
    early_bird_deadline: datetime | None = None
    offers_certificate: bool = False
    cpd_points: int | None = None
    contact_name: str | None = Field(None, max_length=255)
    contact_email: EmailField | None = None
    contact_phone: PhoneStr | None = None
    cover_image_url: UrlStr | None = None
    brochure_url: UrlStr | None = None
    materials: list[dict] | None = None
    status: str = Field(default="draft", max_length=32)


class TrainingProgramCreate(TrainingProgramBase, StatusMixin):
    pass


class TrainingProgramUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class TrainingProgramRead(TrainingProgramBase, BaseReadSchema, StatusMixin):
    current_registrations: int


class TrainingProgramList(BaseReadSchema):
    title: str
    slug: str
    code: str | None
    program_type: str
    category: str | None
    start_date: date | None
    end_date: date | None
    delivery_mode: str
    is_free: bool
    status: str
    is_active: bool
    is_featured: bool


# ============================================================================
# Mentorship Program
# ============================================================================


class MentorshipProgramBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    program_type: str = Field(default="research", max_length=32)
    center_id: uuid.UUID | None = None
    coordinator_id: uuid.UUID | None = None
    summary: str | None = None
    description: str | None = None
    objectives: str | None = None
    benefits: str | None = None
    mentor_requirements: str | None = None
    mentee_requirements: str | None = None
    expectations: str | None = None
    guidelines: str | None = None
    duration_months: int | None = None
    commitment_hours_weekly: int | None = None
    application_open: date | None = None
    application_deadline: datetime | None = None
    cohort_start_date: date | None = None
    cohort_end_date: date | None = None
    max_mentees: int | None = None
    max_mentors: int | None = None
    contact_email: EmailField | None = None
    contact_phone: PhoneStr | None = None
    cover_image_url: UrlStr | None = None
    brochure_url: UrlStr | None = None
    status: str = Field(default="active", max_length=32)


class MentorshipProgramCreate(MentorshipProgramBase, StatusMixin):
    pass


class MentorshipProgramUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class MentorshipProgramRead(MentorshipProgramBase, BaseReadSchema, StatusMixin):
    applications: list[dict[str, Any]] | None = None
    matches: list[dict[str, Any]] | None = None


class MentorshipProgramList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    program_type: str
    status: str
    application_deadline: datetime | None
    is_active: bool
    is_featured: bool


# ============================================================================
# Mentorship Application
# ============================================================================


class MentorshipApplicationBase(BaseSchema):
    program_id: uuid.UUID
    applicant_id: uuid.UUID
    application_type: str = Field(max_length=16)
    motivation: str | None = None
    experience: str | None = None
    expertise_areas: list[str] | None = None
    goals: str | None = None
    availability: str | None = None
    preferred_communication: str | None = Field(None, max_length=64)
    looking_for: str | None = None
    cv_url: UrlStr | None = None
    supporting_documents: list[dict] | None = None


class MentorshipApplicationCreate(MentorshipApplicationBase):
    status: str = Field(default="draft", max_length=32)


class MentorshipApplicationUpdate(BaseSchema):
    motivation: str | None = None
    status: str | None = None
    review_notes: str | None = None
    reviewed_at: datetime | None = None
    reviewed_by_id: uuid.UUID | None = None


class MentorshipApplicationRead(MentorshipApplicationBase, BaseReadSchema):
    status: str
    submitted_at: datetime | None
    reviewed_at: datetime | None
    program: dict[str, Any] | None = None


# ============================================================================
# Mentorship Match
# ============================================================================


class MentorshipMatchBase(BaseSchema):
    program_id: uuid.UUID
    mentor_id: uuid.UUID
    mentee_id: uuid.UUID
    match_date: date
    start_date: date | None = None
    end_date: date | None = None
    goals: str | None = None
    milestones: list[dict] | None = None
    meeting_schedule: str | None = None


class MentorshipMatchCreate(MentorshipMatchBase):
    status: str = Field(default="active", max_length=32)


class MentorshipMatchUpdate(BaseSchema):
    goals: str | None = None
    status: str | None = None


class MentorshipMatchRead(MentorshipMatchBase, BaseReadSchema):
    status: str
    meeting_log: list[dict] | None
    mentor_feedback: str | None
    mentee_feedback: str | None
    rating: int | None
    program: dict[str, Any] | None = None


# ============================================================================
# Scholarship
# ============================================================================


class ScholarshipBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    scholarship_type: str = Field(default="research", max_length=32)
    funder_name: str | None = Field(None, max_length=255)
    funder_logo_url: UrlStr | None = None
    endowment_fund_id: uuid.UUID | None = None
    summary: str | None = None
    description: str | None = None
    eligibility: str | None = None
    requirements: str | None = None
    benefits: str | None = None
    obligations: str | None = None
    selection_criteria: str | None = None
    value: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    covers_tuition: bool = False
    covers_stipend: bool = False
    covers_travel: bool = False
    covers_research: bool = False
    duration_months: int | None = None
    renewable: bool = False
    application_open: date | None = None
    application_deadline: datetime | None = None
    award_date: date | None = None
    start_date: date | None = None
    number_available: int | None = None
    external_url: UrlStr | None = None
    application_url: UrlStr | None = None
    contact_name: str | None = Field(None, max_length=255)
    contact_email: EmailField | None = None
    contact_phone: PhoneStr | None = None
    cover_image_url: UrlStr | None = None
    documents: list[dict] | None = None
    status: str = Field(default="open", max_length=32)


class ScholarshipCreate(ScholarshipBase, StatusMixin):
    pass


class ScholarshipUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class ScholarshipRead(ScholarshipBase, BaseReadSchema, StatusMixin):
    applications: list[dict[str, Any]] | None = None


class ScholarshipList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    scholarship_type: str
    funder_name: str | None
    value: Decimal | None
    application_deadline: datetime | None
    status: str
    is_active: bool
    is_featured: bool


# ============================================================================
# Scholarship Application
# ============================================================================


class ScholarshipApplicationBase(BaseSchema):
    scholarship_id: uuid.UUID
    applicant_id: uuid.UUID
    research_proposal: str | None = None
    personal_statement: str | None = None
    research_experience: str | None = None
    career_goals: str | None = None
    budget_justification: str | None = None
    references: list[dict] | None = None
    cv_url: UrlStr | None = None
    transcripts_url: UrlStr | None = None
    supporting_documents: list[dict] | None = None


class ScholarshipApplicationCreate(ScholarshipApplicationBase):
    status: str = Field(default="draft", max_length=32)


class ScholarshipApplicationUpdate(BaseSchema):
    research_proposal: str | None = None
    status: str | None = None
    review_score: int | None = None
    decision_date: date | None = None
    awarded_amount: Decimal | None = None


class ScholarshipApplicationRead(ScholarshipApplicationBase, BaseReadSchema):
    application_number: str | None
    status: str
    submitted_at: datetime | None
    review_score: int | None
    decision_date: date | None
    awarded_amount: Decimal | None
    scholarship: dict[str, Any] | None = None
