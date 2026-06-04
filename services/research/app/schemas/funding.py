"""Schemas for funding models: grants, applications, funding sources, endowments."""

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
# Grant
# ============================================================================


class GrantBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    code: str | None = Field(None, max_length=32)
    grant_type: str = Field(default="internal", max_length=32)
    category: str = Field(default="research", max_length=64)
    funder_name: str | None = Field(None, max_length=255)
    funder_logo_url: UrlStr | None = None
    summary: str | None = None
    description: str | None = None
    objectives: str | None = None
    eligibility: str | None = None
    focus_areas: str | None = None
    requirements: str | None = None
    total_budget: Decimal | None = None
    min_award: Decimal | None = None
    max_award: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    number_of_awards: int | None = None
    announcement_date: date | None = None
    open_date: date | None = None
    deadline: datetime | None = None
    review_start_date: date | None = None
    award_date: date | None = None
    project_start_date: date | None = None
    project_end_date: date | None = None
    external_url: UrlStr | None = None
    application_url: UrlStr | None = None
    cover_image_url: UrlStr | None = None
    documents: list[dict] | None = None
    contact_name: str | None = Field(None, max_length=255)
    contact_email: EmailField | None = None
    contact_phone: PhoneStr | None = None
    status: str = Field(default="draft", max_length=32)


class GrantCreate(GrantBase, StatusMixin):
    pass


class GrantUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    status: str | None = None
    deadline: datetime | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class GrantRead(GrantBase, BaseReadSchema, StatusMixin):
    guidelines: list[dict[str, Any]] | None = None
    applications: list[dict[str, Any]] | None = None
    reports: list[dict[str, Any]] | None = None


class GrantList(BaseReadSchema):
    title: str
    slug: str
    code: str | None
    grant_type: str
    category: str
    funder_name: str | None
    deadline: datetime | None
    status: str
    is_active: bool
    is_featured: bool


# ============================================================================
# Grant Guideline
# ============================================================================


class GrantGuidelineBase(BaseSchema, SlugMixin):
    grant_id: uuid.UUID
    title: str = Field(max_length=255)
    guideline_type: str = Field(default="procedure", max_length=32)
    content: str | None = None
    document_url: UrlStr | None = None
    document_name: str | None = Field(None, max_length=255)
    is_required: bool = False


class GrantGuidelineCreate(GrantGuidelineBase, StatusMixin):
    pass


class GrantGuidelineUpdate(BaseSchema):
    title: str | None = Field(None, max_length=255)
    content: str | None = None
    is_active: bool | None = None


class GrantGuidelineRead(GrantGuidelineBase, BaseReadSchema, StatusMixin):
    grant: dict[str, Any] | None = None


# ============================================================================
# Grant Application
# ============================================================================


class GrantApplicationBase(BaseSchema):
    grant_id: uuid.UUID
    applicant_id: uuid.UUID
    project_title: str = Field(max_length=500)
    summary: str | None = None
    abstract: str | None = None
    objectives: str | None = None
    methodology: str | None = None
    expected_outcomes: str | None = None
    work_plan: str | None = None
    timeline: str | None = None
    requested_amount: Decimal | None = None
    budget_breakdown: dict | None = None
    currency: str = Field(default="KES", max_length=3)
    proposed_start_date: date | None = None
    proposed_end_date: date | None = None
    duration_months: int | None = None
    co_investigators: list[dict] | None = None
    documents: list[dict] | None = None


class GrantApplicationCreate(GrantApplicationBase):
    status: str = Field(default="draft", max_length=32)


class GrantApplicationUpdate(BaseSchema):
    project_title: str | None = Field(None, max_length=500)
    summary: str | None = None
    requested_amount: Decimal | None = None
    status: str | None = None


class GrantApplicationRead(GrantApplicationBase, BaseReadSchema):
    application_number: str | None
    status: str
    submitted_at: datetime | None
    approved_amount: Decimal | None
    decision_date: date | None
    grant: dict[str, Any] | None = None
    reviews: list[dict[str, Any]] | None = None


class GrantApplicationList(BaseReadSchema):
    grant_id: uuid.UUID
    application_number: str | None
    project_title: str
    requested_amount: Decimal | None
    status: str
    submitted_at: datetime | None


# ============================================================================
# Grant Review
# ============================================================================


class GrantReviewBase(BaseSchema):
    application_id: uuid.UUID
    reviewer_id: uuid.UUID
    overall_score: int | None = Field(None, ge=0, le=100)
    criteria_scores: dict | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    comments: str | None = None
    recommendation: str | None = Field(None, max_length=32)


class GrantReviewCreate(GrantReviewBase):
    status: str = Field(default="pending", max_length=32)


class GrantReviewUpdate(BaseSchema):
    overall_score: int | None = None
    recommendation: str | None = None
    status: str | None = None


class GrantReviewRead(GrantReviewBase, BaseReadSchema):
    status: str
    reviewed_at: datetime | None
    application: dict[str, Any] | None = None


# ============================================================================
# Grant Report
# ============================================================================


class GrantReportBase(BaseSchema):
    grant_id: uuid.UUID
    application_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    submitter_id: uuid.UUID
    report_type: str = Field(default="progress", max_length=32)
    title: str = Field(max_length=255)
    reporting_period_start: date | None = None
    reporting_period_end: date | None = None
    summary: str | None = None
    activities: str | None = None
    achievements: str | None = None
    challenges: str | None = None
    lessons_learned: str | None = None
    next_steps: str | None = None
    expenditure_summary: dict | None = None
    amount_spent: Decimal | None = None
    balance: Decimal | None = None
    documents: list[dict] | None = None


class GrantReportCreate(GrantReportBase):
    status: str = Field(default="draft", max_length=32)


class GrantReportUpdate(BaseSchema):
    title: str | None = None
    summary: str | None = None
    status: str | None = None


class GrantReportRead(GrantReportBase, BaseReadSchema):
    status: str
    submitted_at: datetime | None
    reviewed_at: datetime | None
    grant: dict[str, Any] | None = None


# ============================================================================
# Funding Source
# ============================================================================


class FundingBase(BaseSchema, SlugMixin):
    name: str = Field(max_length=255)
    acronym: str | None = Field(None, max_length=32)
    funder_type: str = Field(default="government", max_length=32)
    about: str | None = None
    focus_areas: str | None = None
    website: UrlStr | None = None
    email: EmailField | None = None
    phone: PhoneStr | None = None
    address: str | None = None
    country: str | None = Field(None, max_length=128)
    logo_url: UrlStr | None = None


class FundingCreate(FundingBase, StatusMixin):
    pass


class FundingUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    is_active: bool | None = None


class FundingRead(FundingBase, BaseReadSchema, StatusMixin):
    pass


class FundingList(BaseReadSchema):
    name: str
    slug: str
    acronym: str | None
    funder_type: str
    logo_url: str | None
    is_active: bool


# ============================================================================
# Endowment Fund
# ============================================================================


class EndowmentFundBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    fund_type: str = Field(default="general", max_length=32)
    purpose: str | None = None
    description: str | None = None
    eligibility: str | None = None
    use_guidelines: str | None = None
    principal_amount: Decimal | None = None
    current_value: Decimal | None = None
    annual_distribution: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    established_date: date | None = None
    donor_name: str | None = Field(None, max_length=255)
    donor_message: str | None = None
    contact_name: str | None = Field(None, max_length=255)
    contact_email: EmailField | None = None
    cover_image_url: UrlStr | None = None
    status: str = Field(default="active", max_length=32)
    is_accepting_contributions: bool = True


class EndowmentFundCreate(EndowmentFundBase, StatusMixin):
    pass


class EndowmentFundUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    current_value: Decimal | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class EndowmentFundRead(EndowmentFundBase, BaseReadSchema, StatusMixin):
    pass


class EndowmentFundList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    fund_type: str
    status: str
    is_active: bool
    is_featured: bool
