"""Funding services."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import EndowmentFund, Funding, Grant, GrantApplication, GrantGuideline, GrantReport, GrantReview
from ._crud import CRUDService, build_simple_service


GrantService = build_simple_service(Grant, "title", "code", "funder_name", "summary", "description", "status")
GrantGuidelineService = build_simple_service(GrantGuideline, "title", "guideline_type", "content")
FundingService = build_simple_service(Funding, "name", "acronym", "about", "country")
EndowmentFundService = build_simple_service(EndowmentFund, "name", "code", "purpose", "description", "donor_name")


class ApplicationService(CRUDService):
    model = GrantApplication
    search_fields = ("application_number", "project_title", "summary", "status")
    default_order = ("created_at",)

    @classmethod
    async def create(cls, db: AsyncSession, data, *, actor_id=None):
        payload = data.model_dump(exclude_unset=True)
        if payload.get("status") == "submitted" and payload.get("submitted_at") is None:
            payload["submitted_at"] = datetime.now(timezone.utc)
        return await super().create(db, payload, actor_id=actor_id)

    @classmethod
    async def update(cls, db: AsyncSession, item, data, *, actor_id=None):
        payload = data.model_dump(exclude_unset=True)
        if payload.get("status") == "submitted" and item.submitted_at is None:
            payload["submitted_at"] = datetime.now(timezone.utc)
        return await super().update(db, item, payload, actor_id=actor_id)


class ReviewService(CRUDService):
    model = GrantReview
    search_fields = ("recommendation", "comments", "status")
    default_order = ("created_at",)

    @classmethod
    async def update(cls, db: AsyncSession, item, data, *, actor_id=None):
        payload = data.model_dump(exclude_unset=True)
        if payload.get("status") == "completed" and item.reviewed_at is None:
            payload["reviewed_at"] = datetime.now(timezone.utc)
        return await super().update(db, item, payload, actor_id=actor_id)


class ReportService(CRUDService):
    model = GrantReport
    search_fields = ("title", "summary", "report_type", "status")
    default_order = ("created_at",)

    @classmethod
    async def create(cls, db: AsyncSession, data, *, actor_id=None):
        payload = data.model_dump(exclude_unset=True)
        if payload.get("status") == "submitted" and payload.get("submitted_at") is None:
            payload["submitted_at"] = datetime.now(timezone.utc)
        return await super().create(db, payload, actor_id=actor_id)

