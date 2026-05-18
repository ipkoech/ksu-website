"""Capacity building services."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    MentorshipApplication,
    MentorshipMatch,
    MentorshipProgram,
    Scholarship,
    ScholarshipApplication,
    TrainingProgram,
)
from ._crud import CRUDService, build_simple_service

TrainingService = build_simple_service(TrainingProgram, "title", "code", "summary", "description", "category")
MentorshipService = build_simple_service(MentorshipProgram, "name", "code", "summary", "description", "program_type")
ScholarshipService = build_simple_service(Scholarship, "name", "code", "summary", "description", "funder_name")


class MentorshipApplicationService(CRUDService):
    model = MentorshipApplication
    search_fields = ("application_type", "status", "motivation", "experience")
    default_order = ("created_at",)

    @classmethod
    async def create(cls, db: AsyncSession, data, *, actor_id=None):
        payload = data.model_dump(exclude_unset=True)
        if payload.get("status") == "submitted":
            payload["submitted_at"] = datetime.now(timezone.utc)
        return await super().create(db, payload, actor_id=actor_id)


MentorshipMatchService = build_simple_service(MentorshipMatch, "status", "goals", "meeting_schedule", default_order=("created_at",))


class ScholarshipApplicationService(CRUDService):
    model = ScholarshipApplication
    search_fields = ("application_number", "status", "personal_statement", "career_goals")
    default_order = ("created_at",)

    @classmethod
    async def create(cls, db: AsyncSession, data, *, actor_id=None):
        payload = data.model_dump(exclude_unset=True)
        if payload.get("status") == "submitted":
            payload["submitted_at"] = datetime.now(timezone.utc)
        return await super().create(db, payload, actor_id=actor_id)

