"""Typed contracts for School Admin evidence, tasks, and report jobs."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import Field
from .base import BaseSchema


class EvidenceDecision(BaseSchema):
    decision: Literal["approved", "rejected", "replacement_requested"]
    reviewer_notes: str | None = None
    expires_at: datetime | None = None


class EvidenceReplacement(BaseSchema):
    file_id: uuid.UUID
    reviewer_notes: str | None = None


class WorkTaskCreate(BaseSchema):
    title: str
    description: str | None = None
    priority: Literal["low", "normal", "high", "urgent"] = "normal"
    owner_id: uuid.UUID | None = None
    due_at: datetime | None = None
    resource_type: str | None = None
    resource_id: uuid.UUID | None = None
    evidence_ids: list[uuid.UUID] = Field(default_factory=list)


class WorkTaskUpdate(BaseSchema):
    title: str | None = None
    description: str | None = None
    priority: Literal["low", "normal", "high", "urgent"] | None = None
    owner_id: uuid.UUID | None = None
    due_at: datetime | None = None


class WorkTaskNote(BaseSchema):
    body: str


class WorkTaskReminder(BaseSchema):
    remind_at: datetime


class ReportDefinition(BaseSchema):
    report_type: str
    range: Literal["7d", "30d", "90d", "12m"]
    comparison_range: Literal["7d", "30d", "90d", "12m"] | None = None
    department_id: uuid.UUID | None = None
    sections: list[str]
    format: Literal["pdf", "csv"]


__all__ = ["EvidenceDecision", "EvidenceReplacement", "ReportDefinition", "WorkTaskCreate", "WorkTaskNote", "WorkTaskReminder", "WorkTaskUpdate"]
