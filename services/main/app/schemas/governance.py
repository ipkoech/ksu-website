"""Governance schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any, Literal

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, SlugStr


GovernanceDisplayGroup = Literal["chairperson", "member", "secretary"]


class GovernanceRoleCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    category: str = Field(min_length=1, max_length=64)
    display_group: GovernanceDisplayGroup
    public_label: str = Field(min_length=1, max_length=255)
    default_hierarchy_level: int = Field(default=2, ge=1)
    default_display_order: int = 100
    badge_style: str | None = Field(default=None, max_length=64)
    description: str | None = None
    is_active: bool = True


class GovernanceRoleUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    category: str | None = Field(default=None, min_length=1, max_length=64)
    display_group: GovernanceDisplayGroup | None = None
    public_label: str | None = Field(default=None, min_length=1, max_length=255)
    default_hierarchy_level: int | None = Field(default=None, ge=1)
    default_display_order: int | None = None
    badge_style: str | None = Field(default=None, max_length=64)
    description: str | None = None
    is_active: bool | None = None


class GovernanceRoleRead(BaseReadSchema):
    name: str
    slug: str
    category: str
    display_group: GovernanceDisplayGroup
    public_label: str
    default_hierarchy_level: int
    default_display_order: int
    badge_style: str | None = None
    description: str | None = None
    is_active: bool


class GovernancePageContentUpdate(BaseSchema):
    title: str | None = Field(default=None, max_length=255)
    intro: str | None = None
    breadcrumb_label: str | None = Field(default=None, max_length=255)
    hero_image_id: uuid.UUID | None = None
    hero_focal_point: str | None = Field(default=None, max_length=64)
    overlay_intensity: int | None = Field(default=None, ge=0, le=100)
    mandate_label: str | None = Field(default=None, max_length=255)
    mandate_heading: str | None = Field(default=None, max_length=255)
    mandate_body: str | None = None
    mandate_icon: str | None = Field(default=None, max_length=64)
    document_cta_label: str | None = Field(default=None, max_length=255)
    document_cta_url: str | None = Field(default=None, max_length=1024)


class GovernancePageContentRead(BaseReadSchema):
    board_id: uuid.UUID
    page_key: str
    title: str | None = None
    intro: str | None = None
    breadcrumb_label: str | None = None
    hero_image_id: uuid.UUID | None = None
    hero_image: dict[str, Any] | None = None
    hero_focal_point: str | None = None
    overlay_intensity: int | None = None
    mandate_label: str | None = None
    mandate_heading: str | None = None
    mandate_body: str | None = None
    mandate_icon: str | None = None
    document_cta_label: str | None = None
    document_cta_url: str | None = None
    status: str
    workflow_status: str
    submitted_at: datetime | None = None
    approved_at: datetime | None = None
    published_at: datetime | None = None
    unpublished_at: datetime | None = None


class CouncilMemberCreate(BaseSchema):
    person_id: uuid.UUID
    governance_role_id: uuid.UUID
    appointment_category: str | None = Field(default=None, max_length=64)
    official_designation: str | None = Field(default=None, max_length=255)
    public_role_label: str = Field(min_length=1, max_length=255)
    represented_institution: str | None = Field(default=None, max_length=255)
    current_office: str | None = Field(default=None, max_length=255)
    appointing_authority: str | None = Field(default=None, max_length=255)
    appointment_reference: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    term_years: int | None = Field(default=None, ge=1, le=10)
    term_number: int | None = Field(default=None, ge=1)
    is_ex_officio: bool = False
    is_voting_member: bool = True
    is_acting: bool = False
    show_contact_publicly: bool = False
    portrait_media_id: uuid.UUID | None = None
    profile_slug: SlugStr | None = None
    profile_summary: str | None = None
    appointment_status: str = Field(default="draft", max_length=32)
    workflow_status: str = Field(default="draft", max_length=32)
    hierarchy_level: int | None = Field(default=None, ge=1)
    reports_to_id: uuid.UUID | None = None
    display_order: int = 100
    publish_without_portrait_override: bool = False
    publication_notes: str | None = None


class CouncilMemberUpdate(BaseSchema):
    governance_role_id: uuid.UUID | None = None
    appointment_category: str | None = Field(default=None, max_length=64)
    official_designation: str | None = Field(default=None, max_length=255)
    public_role_label: str | None = Field(default=None, min_length=1, max_length=255)
    represented_institution: str | None = Field(default=None, max_length=255)
    current_office: str | None = Field(default=None, max_length=255)
    appointing_authority: str | None = Field(default=None, max_length=255)
    appointment_reference: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    term_years: int | None = Field(default=None, ge=1, le=10)
    term_number: int | None = Field(default=None, ge=1)
    is_ex_officio: bool | None = None
    is_voting_member: bool | None = None
    is_acting: bool | None = None
    show_contact_publicly: bool | None = None
    portrait_media_id: uuid.UUID | None = None
    profile_slug: SlugStr | None = None
    profile_summary: str | None = None
    appointment_status: str | None = Field(default=None, max_length=32)
    workflow_status: str | None = Field(default=None, max_length=32)
    hierarchy_level: int | None = Field(default=None, ge=1)
    reports_to_id: uuid.UUID | None = None
    display_order: int | None = None
    publish_without_portrait_override: bool | None = None
    publication_notes: str | None = None


class CouncilMemberReportsToRead(BaseSchema):
    id: uuid.UUID
    display_label: str
    role_label: str


class CouncilMemberRead(BaseReadSchema):
    person_id: uuid.UUID
    person: dict[str, Any] | None = None
    governance_role_id: uuid.UUID | None = None
    governance_role: GovernanceRoleRead | None = None
    appointment_category: str | None = None
    official_designation: str | None = None
    public_role_label: str | None = None
    represented_institution: str | None = None
    current_office: str | None = None
    appointing_authority: str | None = None
    appointment_reference: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    term_years: int | None = None
    term_number: int | None = None
    is_ex_officio: bool
    is_voting_member: bool
    is_acting: bool
    show_contact_publicly: bool
    portrait_media_id: uuid.UUID | None = None
    portrait_media: dict[str, Any] | None = None
    profile_slug: str | None = None
    profile_summary: str | None = None
    appointment_status: str
    workflow_status: str
    hierarchy_level: int
    reports_to_id: uuid.UUID | None = None
    reports_to: CouncilMemberReportsToRead | None = None
    display_order: int
    published_at: datetime | None = None
    unpublished_at: datetime | None = None
    archived_at: datetime | None = None
    publish_without_portrait_override: bool
    publication_notes: str | None = None


class CouncilOrderNode(BaseSchema):
    assignment_id: uuid.UUID
    display_group: GovernanceDisplayGroup
    display_order: int
    hierarchy_level: int = Field(ge=1)
    reports_to_id: uuid.UUID | None = None


class CouncilOrderUpdate(BaseSchema):
    nodes: list[CouncilOrderNode] = Field(min_length=1)


class CouncilDashboardRead(BaseSchema):
    total_active_members: int
    chairperson: CouncilMemberRead | None = None
    member_count: int
    government_representative_count: int
    other_representative_count: int
    secretary: CouncilMemberRead | None = None
    draft_profile_count: int
    published_profile_count: int
    inactive_profile_count: int
    vacant_position_count: int
    last_updated_at: datetime | None = None


class BoardCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    board_type: str = Field(default="board", max_length=64)
    parent_entity_type: str | None = Field(default=None, max_length=32)
    parent_entity_id: uuid.UUID | None = None
    chairperson_id: uuid.UUID | None = None
    vice_chairperson_id: uuid.UUID | None = None
    secretary_id: uuid.UUID | None = None
    mandate: str | None = None
    establishment_date: date | None = None
    meeting_schedule: str | None = Field(default=None, max_length=255)
    member_count: int | None = Field(default=None, ge=1)
    quorum: int | None = Field(default=None, ge=1)
    standard_term_years: int | None = Field(default=None, ge=1, le=10)
    max_terms: int | None = Field(default=None, ge=1)
    show_member_terms: bool = False
    description: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    cover_image_id: uuid.UUID | None = None
    division_id: uuid.UUID | None = None
    is_public: bool = True
    is_active: bool = True
    status: str = Field(default="active", max_length=32)
    display_order: int = 100


class BoardUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    board_type: str | None = Field(default=None, max_length=64)
    parent_entity_type: str | None = Field(default=None, max_length=32)
    parent_entity_id: uuid.UUID | None = None
    chairperson_id: uuid.UUID | None = None
    vice_chairperson_id: uuid.UUID | None = None
    secretary_id: uuid.UUID | None = None
    mandate: str | None = None
    establishment_date: date | None = None
    meeting_schedule: str | None = Field(default=None, max_length=255)
    member_count: int | None = Field(default=None, ge=1)
    quorum: int | None = Field(default=None, ge=1)
    standard_term_years: int | None = Field(default=None, ge=1, le=10)
    max_terms: int | None = Field(default=None, ge=1)
    show_member_terms: bool | None = None
    description: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    cover_image_id: uuid.UUID | None = None
    division_id: uuid.UUID | None = None
    is_public: bool | None = None
    is_active: bool | None = None
    status: str | None = Field(default=None, max_length=32)
    display_order: int | None = None


class BoardMemberCreate(BaseSchema):
    person_id: uuid.UUID
    role: str = Field(default="member", min_length=1, max_length=64)
    title: str | None = Field(default=None, max_length=255)
    hierarchy_level: int | None = Field(default=None, ge=1, le=11)
    reports_to_id: uuid.UUID | None = None
    is_primary: bool = False
    is_acting: bool = False
    is_public: bool = True
    start_date: date | None = None
    end_date: date | None = None
    term_years: int | None = Field(default=None, ge=1, le=10)
    term_renewable: bool = True
    show_term_dates: bool = False
    status: str = Field(default="active", max_length=32)
    display_order: int = 100
    notes: str | None = None


class BoardMemberSummary(BaseSchema):
    id: uuid.UUID
    display_label: str
    role_label: str


class BoardMemberRead(BaseSchema):
    id: uuid.UUID
    display_label: str
    role: str
    role_label: str
    title: str | None = None
    hierarchy_level: int
    reports_to: BoardMemberSummary | None = None
    display_order: int
    is_acting: bool


class BoardRead(BaseReadSchema):
    display_label: str
    name: str
    slug: str
    board_type: str
    parent_entity_type: str | None = None
    parent_entity_id: uuid.UUID | None = None
    chairperson_id: uuid.UUID | None = None
    chairperson: dict[str, Any] | None = None
    vice_chairperson_id: uuid.UUID | None = None
    vice_chairperson: dict[str, Any] | None = None
    secretary_id: uuid.UUID | None = None
    secretary: dict[str, Any] | None = None
    mandate: str | None = None
    establishment_date: date | None = None
    meeting_schedule: str | None = None
    member_count: int | None = None
    quorum: int | None = None
    standard_term_years: int | None = None
    max_terms: int | None = None
    show_member_terms: bool
    description: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    cover_image_id: uuid.UUID | None = None
    cover_image: dict[str, Any] | None = None
    division_id: uuid.UUID | None = None
    division: dict[str, Any] | None = None
    is_public: bool
    is_active: bool
    status: str
    display_order: int
    members: list[BoardMemberRead] = Field(default_factory=list)
