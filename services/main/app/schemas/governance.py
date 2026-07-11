"""Governance schemas."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, SlugStr


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
