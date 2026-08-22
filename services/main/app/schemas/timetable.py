"""Schemas for structured academic timetables."""

from __future__ import annotations

import uuid
from datetime import date, time

from pydantic import Field, model_validator

from .base import BaseSchema


class TimetableVenueCreate(BaseSchema):
    campus_id: uuid.UUID | None = None
    name: str = Field(min_length=1, max_length=255)
    code: str = Field(min_length=1, max_length=64)
    building: str | None = Field(default=None, max_length=128)
    capacity: int | None = Field(default=None, ge=1)


class AcademicTimetableCreate(BaseSchema):
    calendar_id: uuid.UUID
    title: str = Field(min_length=1, max_length=255)
    timetable_type: str = Field(default="examination", max_length=32)
    version: int = Field(default=1, ge=1)
    notes: str | None = None
    fallback_document_id: uuid.UUID | None = None
    supersedes_id: uuid.UUID | None = None


class AcademicTimetableUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    notes: str | None = None
    fallback_document_id: uuid.UUID | None = None


class TimetableSittingCreate(BaseSchema):
    course_code: str = Field(min_length=1, max_length=64)
    course_title: str = Field(min_length=1, max_length=255)
    sitting_date: date
    start_time: time
    end_time: time
    venue_id: uuid.UUID | None = None
    programme_ids: list[uuid.UUID] = Field(min_length=1)
    cohort_label: str | None = Field(default=None, max_length=128)
    candidate_count: int | None = Field(default=None, ge=0)
    special_instructions: str | None = None

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        if len(set(self.programme_ids)) != len(self.programme_ids):
            raise ValueError("programme_ids must be unique")
        return self


class TimetableSittingUpdate(BaseSchema):
    course_code: str | None = Field(default=None, min_length=1, max_length=64)
    course_title: str | None = Field(default=None, min_length=1, max_length=255)
    sitting_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    venue_id: uuid.UUID | None = None
    programme_ids: list[uuid.UUID] | None = None
    cohort_label: str | None = Field(default=None, max_length=128)
    candidate_count: int | None = Field(default=None, ge=0)
    special_instructions: str | None = None
    status: str | None = Field(default=None, max_length=32)
