"""Staff assignment schemas."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any, Literal

from pydantic import Field

from .base import BaseReadSchema, BaseSchema


ConflictResolution = Literal["cancel", "assign_acting", "replace_current", "edit_selection"]


class StaffAssignmentCreate(BaseSchema):
    person_id: uuid.UUID
    user_id: uuid.UUID | None = None
    entity_type: str = Field(min_length=1, max_length=32)
    entity_id: uuid.UUID | None = None
    role: str = Field(min_length=1, max_length=64)
    title: str | None = Field(default=None, max_length=255)
    hierarchy_level: int = Field(ge=1, le=11)
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
    conflict_resolution: ConflictResolution | None = None
    conflict_end_date: date | None = None
    conflict_notes: str | None = None


class StaffAssignmentUpdate(BaseSchema):
    user_id: uuid.UUID | None = None
    entity_type: str | None = Field(default=None, min_length=1, max_length=32)
    entity_id: uuid.UUID | None = None
    role: str | None = Field(default=None, min_length=1, max_length=64)
    title: str | None = Field(default=None, max_length=255)
    hierarchy_level: int | None = Field(default=None, ge=1, le=11)
    reports_to_id: uuid.UUID | None = None
    is_primary: bool | None = None
    is_acting: bool | None = None
    is_public: bool | None = None
    start_date: date | None = None
    end_date: date | None = None
    term_years: int | None = Field(default=None, ge=1, le=10)
    term_renewable: bool | None = None
    show_term_dates: bool | None = None
    status: str | None = Field(default=None, max_length=32)
    display_order: int | None = None
    notes: str | None = None
    conflict_resolution: ConflictResolution | None = None
    conflict_end_date: date | None = None
    conflict_notes: str | None = None


class StaffAssignmentEnd(BaseSchema):
    end_date: date | None = None
    notes: str | None = None


class StaffAssignmentActivate(BaseSchema):
    start_date: date | None = None
    notes: str | None = None
    conflict_resolution: ConflictResolution | None = None
    conflict_end_date: date | None = None
    conflict_notes: str | None = None


class StaffAssignmentReassign(BaseSchema):
    person_id: uuid.UUID
    title: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    end_previous_date: date | None = None
    notes: str | None = None
    conflict_resolution: ConflictResolution | None = None
    conflict_end_date: date | None = None
    conflict_notes: str | None = None


class StaffAssignmentConflictCheck(BaseSchema):
    entity_type: str = Field(min_length=1, max_length=32)
    entity_id: uuid.UUID | None = None
    role: str = Field(min_length=1, max_length=64)
    exclude_assignment_id: uuid.UUID | None = None


class StaffEntityOption(BaseSchema):
    id: uuid.UUID | None = None
    entity_type: str
    label: str
    subtitle: str | None = None
    is_active: bool = True


class StaffAssignmentEntitySummary(BaseSchema):
    id: uuid.UUID | None = None
    name: str
    type: str
    subtitle: str | None = None
    is_active: bool = True


class StaffAssignmentRead(BaseReadSchema):
    person_id: uuid.UUID
    user_id: uuid.UUID | None = None
    entity_type: str
    entity_id: uuid.UUID | None = None
    role: str
    title: str | None = None
    hierarchy_level: int
    reports_to_id: uuid.UUID | None = None
    is_primary: bool
    is_acting: bool
    is_public: bool
    start_date: date | None = None
    end_date: date | None = None
    term_years: int | None = None
    term_renewable: bool
    show_term_dates: bool
    status: str
    display_order: int
    notes: str | None = None
    role_display: str | None = None
    term_display: str | None = None
    entity: StaffAssignmentEntitySummary | None = None
    person: dict[str, Any] | None = None
    reports_to: dict[str, Any] | None = None
    subordinates: list[dict[str, Any]] | None = None
    user: dict[str, Any] | None = None
    is_current: bool | None = None
