"""Schemas for innovation pathway records: startups, incubation, competitions, transfers."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from pydantic import Field

from .base import (
    BaseReadSchema,
    BaseSchema,
    SEOFieldsMixin,
    SlugMixin,
    SlugStr,
    StatusMixin,
    UrlStr,
)


class PathwayActionNote(BaseSchema):
    note: str | None = Field(default=None, max_length=1000)


class StartupStageAction(PathwayActionNote):
    venture_stage: str = Field(max_length=32)
    registration_status: str | None = Field(default=None, max_length=32)
    status: str | None = Field(default=None, max_length=32)


class IncubationStageAction(PathwayActionNote):
    stage: str = Field(max_length=32)
    status: str | None = Field(default=None, max_length=32)


class MentorAssignmentAction(PathwayActionNote):
    mentor_ids: list[uuid.UUID] = Field(default_factory=list)


class CompetitionEntryStatusAction(PathwayActionNote):
    entry_status: str = Field(max_length=32)
    award: str | None = Field(default=None, max_length=255)
    position: str | None = Field(default=None, max_length=64)
    status: str | None = Field(default=None, max_length=32)


class TechnologyTransferStatusAction(PathwayActionNote):
    transfer_status: str = Field(max_length=32)
    case_type: str | None = Field(default=None, max_length=32)
    status: str | None = Field(default=None, max_length=32)


class StartupVentureBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    innovation_id: uuid.UUID
    partner_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    lead_founder_id: uuid.UUID | None = None
    venture_stage: str = Field(default="idea", max_length=32)
    registration_status: str = Field(default="not_registered", max_length=32)
    registration_number: str | None = Field(None, max_length=128)
    incorporation_date: date | None = None
    sector: str | None = Field(None, max_length=128)
    summary: str | None = None
    problem: str | None = None
    solution: str | None = None
    business_model: str | None = None
    market: str | None = None
    traction: str | None = None
    founders: list[dict] | None = None
    funding_raised: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    website: UrlStr | None = None
    pitch_deck_url: UrlStr | None = None
    cover_image_url: UrlStr | None = None
    documents: list[dict] | None = None
    status: str = Field(default="active", max_length=32)


class StartupVentureCreate(StartupVentureBase, StatusMixin):
    is_public: bool = True


class StartupVentureUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    code: str | None = Field(None, max_length=32)
    partner_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    lead_founder_id: uuid.UUID | None = None
    venture_stage: str | None = Field(None, max_length=32)
    registration_status: str | None = Field(None, max_length=32)
    registration_number: str | None = Field(None, max_length=128)
    incorporation_date: date | None = None
    sector: str | None = Field(None, max_length=128)
    summary: str | None = None
    problem: str | None = None
    solution: str | None = None
    business_model: str | None = None
    market: str | None = None
    traction: str | None = None
    founders: list[dict] | None = None
    funding_raised: Decimal | None = None
    website: UrlStr | None = None
    pitch_deck_url: UrlStr | None = None
    status: str | None = Field(None, max_length=32)
    is_active: bool | None = None
    is_public: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class StartupVentureRead(StartupVentureBase, BaseReadSchema, StatusMixin):
    is_public: bool


class StartupVentureList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    innovation_id: uuid.UUID
    partner_id: uuid.UUID | None
    venture_stage: str
    registration_status: str
    sector: str | None
    status: str
    is_active: bool
    is_featured: bool


class IncubationRecordBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    code: str | None = Field(None, max_length=32)
    innovation_id: uuid.UUID
    startup_id: uuid.UUID | None = None
    partner_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    program_name: str | None = Field(None, max_length=255)
    cohort: str | None = Field(None, max_length=128)
    incubation_type: str = Field(default="incubation", max_length=32)
    start_date: date | None = None
    end_date: date | None = None
    stage: str = Field(default="active", max_length=32)
    milestones: list[dict] | None = None
    support_received: str | None = None
    outcomes: str | None = None
    next_steps: str | None = None
    mentor_ids: list[str] | None = None
    documents: list[dict] | None = None
    status: str = Field(default="active", max_length=32)


class IncubationRecordCreate(IncubationRecordBase, StatusMixin):
    is_public: bool = True


class IncubationRecordUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    code: str | None = Field(None, max_length=32)
    startup_id: uuid.UUID | None = None
    partner_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    program_name: str | None = Field(None, max_length=255)
    cohort: str | None = Field(None, max_length=128)
    incubation_type: str | None = Field(None, max_length=32)
    start_date: date | None = None
    end_date: date | None = None
    stage: str | None = Field(None, max_length=32)
    milestones: list[dict] | None = None
    support_received: str | None = None
    outcomes: str | None = None
    next_steps: str | None = None
    mentor_ids: list[str] | None = None
    status: str | None = Field(None, max_length=32)
    is_active: bool | None = None
    is_public: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class IncubationRecordRead(IncubationRecordBase, BaseReadSchema, StatusMixin):
    is_public: bool


class IncubationRecordList(BaseReadSchema):
    title: str
    slug: str
    code: str | None
    innovation_id: uuid.UUID
    startup_id: uuid.UUID | None
    partner_id: uuid.UUID | None
    program_name: str | None
    cohort: str | None
    incubation_type: str
    stage: str
    status: str
    is_active: bool
    is_featured: bool


class CompetitionEntryBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    code: str | None = Field(None, max_length=32)
    innovation_id: uuid.UUID
    startup_id: uuid.UUID | None = None
    partner_id: uuid.UUID | None = None
    event_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    entry_type: str = Field(default="competition", max_length=32)
    competition_name: str | None = Field(None, max_length=255)
    organizer_name: str | None = Field(None, max_length=255)
    venue: str | None = Field(None, max_length=255)
    country: str | None = Field(None, max_length=128)
    event_date: date | None = None
    application_deadline: date | None = None
    entry_status: str = Field(default="submitted", max_length=32)
    award: str | None = Field(None, max_length=255)
    position: str | None = Field(None, max_length=64)
    prize_value: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    pitch_summary: str | None = None
    judges_feedback: str | None = None
    public_url: UrlStr | None = None
    pitch_deck_url: UrlStr | None = None
    documents: list[dict] | None = None
    status: str = Field(default="active", max_length=32)


class CompetitionEntryCreate(CompetitionEntryBase, StatusMixin):
    is_public: bool = True


class CompetitionEntryUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    code: str | None = Field(None, max_length=32)
    startup_id: uuid.UUID | None = None
    partner_id: uuid.UUID | None = None
    event_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    entry_type: str | None = Field(None, max_length=32)
    competition_name: str | None = Field(None, max_length=255)
    organizer_name: str | None = Field(None, max_length=255)
    venue: str | None = Field(None, max_length=255)
    country: str | None = Field(None, max_length=128)
    event_date: date | None = None
    application_deadline: date | None = None
    entry_status: str | None = Field(None, max_length=32)
    award: str | None = Field(None, max_length=255)
    position: str | None = Field(None, max_length=64)
    prize_value: Decimal | None = None
    pitch_summary: str | None = None
    judges_feedback: str | None = None
    public_url: UrlStr | None = None
    pitch_deck_url: UrlStr | None = None
    status: str | None = Field(None, max_length=32)
    is_active: bool | None = None
    is_public: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class CompetitionEntryRead(CompetitionEntryBase, BaseReadSchema, StatusMixin):
    is_public: bool


class CompetitionEntryList(BaseReadSchema):
    title: str
    slug: str
    code: str | None
    innovation_id: uuid.UUID
    startup_id: uuid.UUID | None
    partner_id: uuid.UUID | None
    entry_type: str
    competition_name: str | None
    event_date: date | None
    entry_status: str
    status: str
    is_active: bool
    is_featured: bool


class TechnologyTransferCaseBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    code: str | None = Field(None, max_length=32)
    innovation_id: uuid.UUID
    partner_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    lead_officer_id: uuid.UUID | None = None
    case_type: str = Field(default="disclosure", max_length=32)
    transfer_status: str = Field(default="disclosed", max_length=32)
    disclosure_date: date | None = None
    protection_date: date | None = None
    agreement_date: date | None = None
    expiry_date: date | None = None
    ip_reference: str | None = Field(None, max_length=128)
    agreement_reference: str | None = Field(None, max_length=128)
    license_type: str | None = Field(None, max_length=128)
    territory: str | None = Field(None, max_length=128)
    exclusivity: str | None = Field(None, max_length=32)
    commercial_terms: str | None = None
    revenue_terms: str | None = None
    upfront_value: Decimal | None = None
    annual_value: Decimal | None = None
    revenue_generated: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    summary: str | None = None
    public_benefit: str | None = None
    next_steps: str | None = None
    documents: list[dict] | None = None
    status: str = Field(default="active", max_length=32)


class TechnologyTransferCaseCreate(TechnologyTransferCaseBase, StatusMixin):
    is_public: bool = True


class TechnologyTransferCaseUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    code: str | None = Field(None, max_length=32)
    partner_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    lead_officer_id: uuid.UUID | None = None
    case_type: str | None = Field(None, max_length=32)
    transfer_status: str | None = Field(None, max_length=32)
    disclosure_date: date | None = None
    protection_date: date | None = None
    agreement_date: date | None = None
    expiry_date: date | None = None
    ip_reference: str | None = Field(None, max_length=128)
    agreement_reference: str | None = Field(None, max_length=128)
    license_type: str | None = Field(None, max_length=128)
    territory: str | None = Field(None, max_length=128)
    exclusivity: str | None = Field(None, max_length=32)
    commercial_terms: str | None = None
    revenue_terms: str | None = None
    upfront_value: Decimal | None = None
    annual_value: Decimal | None = None
    revenue_generated: Decimal | None = None
    summary: str | None = None
    public_benefit: str | None = None
    next_steps: str | None = None
    status: str | None = Field(None, max_length=32)
    is_active: bool | None = None
    is_public: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class TechnologyTransferCaseRead(TechnologyTransferCaseBase, BaseReadSchema, StatusMixin):
    is_public: bool


class TechnologyTransferCaseList(BaseReadSchema):
    title: str
    slug: str
    code: str | None
    innovation_id: uuid.UUID
    partner_id: uuid.UUID | None
    case_type: str
    transfer_status: str
    agreement_date: date | None
    status: str
    is_active: bool
    is_featured: bool
