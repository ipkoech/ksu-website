"""Funding services."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import delete, func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    EndowmentFund,
    Funding,
    Grant,
    GrantApplication,
    GrantGuideline,
    GrantReport,
    GrantReview,
    ResearchProject,
    ResearchTheme,
    grant_themes,
    project_funders,
)
from ._crud import CRUDService, build_simple_service


GrantService = build_simple_service(Grant, "title", "code", "funder_name", "summary", "description", "status")
GrantGuidelineService = build_simple_service(GrantGuideline, "title", "guideline_type", "content")
FundingService = build_simple_service(Funding, "name", "acronym", "about", "country")
EndowmentFundService = build_simple_service(EndowmentFund, "name", "code", "purpose", "description", "donor_name")


def _brief(item: Any, *extra_fields: str) -> dict[str, Any]:
    payload = {
        "id": item.id,
        "title": getattr(item, "title", None),
        "name": getattr(item, "name", None),
        "slug": getattr(item, "slug", None),
        "status": getattr(item, "status", None),
    }
    for field in extra_fields:
        payload[field] = getattr(item, field, None)
    return {key: value for key, value in payload.items() if value is not None}


async def _related_many(db: AsyncSession, stmt, *extra_fields: str) -> list[dict[str, Any]]:
    result = await db.execute(stmt)
    return [_brief(item, *extra_fields) for item in result.scalars().unique().all()]


async def _get_or_404(db: AsyncSession, model: Any, record_id: uuid.UUID, error_message: str) -> Any:
    result = await db.execute(model.active_query().where(model.id == record_id))
    record = result.scalar_one_or_none()
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_message)
    return record


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


class GrantRelationshipService:
    """Read and bind grant relationships supported by the current funding model."""

    @staticmethod
    async def _ensure_grant(db: AsyncSession, grant_id: uuid.UUID) -> Grant:
        return await _get_or_404(db, Grant, grant_id, "Grant not found")

    @staticmethod
    async def _ensure_theme(db: AsyncSession, theme_id: uuid.UUID) -> ResearchTheme:
        return await _get_or_404(db, ResearchTheme, theme_id, "Research theme not found")

    @staticmethod
    async def list_projects(db: AsyncSession, grant_id: uuid.UUID) -> list[dict[str, Any]]:
        await GrantRelationshipService._ensure_grant(db, grant_id)
        return await _related_many(
            db,
            ResearchProject.active_query()
            .where(ResearchProject.grant_id == grant_id)
            .order_by(ResearchProject.start_date.desc().nullslast(), ResearchProject.title.asc()),
            "code",
            "project_type",
            "status",
            "start_date",
        )

    @staticmethod
    async def list_themes(db: AsyncSession, grant_id: uuid.UUID) -> list[dict[str, Any]]:
        await GrantRelationshipService._ensure_grant(db, grant_id)
        return await _related_many(
            db,
            ResearchTheme.active_query()
            .join(grant_themes, ResearchTheme.id == grant_themes.c.theme_id)
            .where(grant_themes.c.grant_id == grant_id)
            .order_by(ResearchTheme.display_order.asc(), ResearchTheme.name.asc()),
            "code",
        )

    @staticmethod
    async def add_theme(db: AsyncSession, grant_id: uuid.UUID, theme_id: uuid.UUID) -> None:
        await GrantRelationshipService._ensure_grant(db, grant_id)
        await GrantRelationshipService._ensure_theme(db, theme_id)
        exists = await db.scalar(
            select(func.count())
            .select_from(grant_themes)
            .where(grant_themes.c.grant_id == grant_id, grant_themes.c.theme_id == theme_id)
        )
        if not exists:
            await db.execute(insert(grant_themes).values(grant_id=grant_id, theme_id=theme_id))
            await db.flush()

    @staticmethod
    async def remove_theme(db: AsyncSession, grant_id: uuid.UUID, theme_id: uuid.UUID) -> None:
        await GrantRelationshipService._ensure_grant(db, grant_id)
        await db.execute(delete(grant_themes).where(grant_themes.c.grant_id == grant_id, grant_themes.c.theme_id == theme_id))
        await db.flush()


class FundingRelationshipService:
    """Read funder relationships supported by project_funders."""

    @staticmethod
    async def _ensure_funder(db: AsyncSession, funder_id: uuid.UUID) -> Funding:
        return await _get_or_404(db, Funding, funder_id, "Funder not found")

    @staticmethod
    async def list_projects(db: AsyncSession, funder_id: uuid.UUID) -> list[dict[str, Any]]:
        await FundingRelationshipService._ensure_funder(db, funder_id)
        return await _related_many(
            db,
            ResearchProject.active_query()
            .join(project_funders, ResearchProject.id == project_funders.c.project_id)
            .where(project_funders.c.funding_id == funder_id)
            .order_by(ResearchProject.start_date.desc().nullslast(), ResearchProject.title.asc()),
            "code",
            "project_type",
            "status",
            "start_date",
        )


class ApplicationRelationshipService:
    """Read relationships for grant applications."""

    @staticmethod
    async def _ensure_application(db: AsyncSession, application_id: uuid.UUID) -> GrantApplication:
        return await _get_or_404(db, GrantApplication, application_id, "Grant application not found")

    @staticmethod
    async def list_reviews(db: AsyncSession, application_id: uuid.UUID) -> list[dict[str, Any]]:
        await ApplicationRelationshipService._ensure_application(db, application_id)
        return await _related_many(
            db,
            GrantReview.active_query()
            .where(GrantReview.application_id == application_id)
            .order_by(GrantReview.reviewed_at.desc().nullslast(), GrantReview.created_at.desc()),
            "overall_score",
            "recommendation",
            "status",
            "reviewed_at",
        )

    @staticmethod
    async def list_reports(db: AsyncSession, application_id: uuid.UUID) -> list[dict[str, Any]]:
        await ApplicationRelationshipService._ensure_application(db, application_id)
        return await _related_many(
            db,
            GrantReport.active_query()
            .where(GrantReport.application_id == application_id)
            .order_by(GrantReport.submitted_at.desc().nullslast(), GrantReport.created_at.desc()),
            "report_type",
            "status",
            "submitted_at",
        )
