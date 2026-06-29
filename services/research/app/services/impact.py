"""Impact services."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import delete, func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    ImpactMetric,
    Partner,
    ResearchProject,
    SuccessStory,
    Sustainability,
    TrainingProgram,
    sustainability_partners,
    sustainability_projects,
    sustainability_stories,
    sustainability_training,
)
from ._crud import build_simple_service

StoryService = build_simple_service(SuccessStory, "title", "summary", "impact", "story_type", "location")
MetricService = build_simple_service(ImpactMetric, "name", "code", "description", "category", "metric_type")
SustainabilityService = build_simple_service(Sustainability, "name", "code", "summary", "description", "initiative_type")


def _brief(item: Any, *extra_fields: str) -> dict[str, Any]:
    payload = {
        "id": item.id,
        "title": getattr(item, "title", None),
        "name": getattr(item, "name", None),
        "slug": getattr(item, "slug", None),
        "status": getattr(item, "status", None),
        "created_at": getattr(item, "created_at", None),
        "updated_at": getattr(item, "updated_at", None),
    }
    for field in extra_fields:
        payload[field] = getattr(item, field, None)
    return {key: value for key, value in payload.items() if value is not None}


async def _related_many(db: AsyncSession, statement, *extra_fields: str) -> list[dict[str, Any]]:
    result = await db.execute(statement)
    return [_brief(item, *extra_fields) for item in result.scalars().all()]


class SustainabilityRelationshipService:
    """Manage existing M:N sustainability relationship tables."""

    @staticmethod
    async def _ensure_sustainability(db: AsyncSession, sustainability_id: uuid.UUID) -> Sustainability:
        return await Sustainability.get_or_raise(db, sustainability_id, error_message="Sustainability record not found")

    @staticmethod
    async def list_projects(db: AsyncSession, sustainability_id: uuid.UUID) -> list[dict[str, Any]]:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        return await _related_many(
            db,
            ResearchProject.active_query()
            .join(sustainability_projects, ResearchProject.id == sustainability_projects.c.project_id)
            .where(sustainability_projects.c.sustainability_id == sustainability_id)
            .order_by(ResearchProject.start_date.desc().nullslast(), ResearchProject.title.asc()),
            "code",
            "project_type",
        )

    @staticmethod
    async def add_project(db: AsyncSession, sustainability_id: uuid.UUID, project_id: uuid.UUID) -> None:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        await ResearchProject.get_or_raise(db, project_id, error_message="Project not found")
        exists = await db.scalar(
            select(func.count())
            .select_from(sustainability_projects)
            .where(sustainability_projects.c.sustainability_id == sustainability_id, sustainability_projects.c.project_id == project_id)
        )
        if not exists:
            await db.execute(insert(sustainability_projects).values(sustainability_id=sustainability_id, project_id=project_id))
            await db.flush()

    @staticmethod
    async def remove_project(db: AsyncSession, sustainability_id: uuid.UUID, project_id: uuid.UUID) -> None:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        await db.execute(delete(sustainability_projects).where(sustainability_projects.c.sustainability_id == sustainability_id, sustainability_projects.c.project_id == project_id))
        await db.flush()

    @staticmethod
    async def list_partners(db: AsyncSession, sustainability_id: uuid.UUID) -> list[dict[str, Any]]:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        return await _related_many(
            db,
            Partner.active_query()
            .join(sustainability_partners, Partner.id == sustainability_partners.c.partner_id)
            .where(sustainability_partners.c.sustainability_id == sustainability_id)
            .order_by(Partner.display_order.asc(), Partner.name.asc()),
            "partner_type",
            "partnership_level",
            "country",
        )

    @staticmethod
    async def add_partner(db: AsyncSession, sustainability_id: uuid.UUID, partner_id: uuid.UUID) -> None:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        await Partner.get_or_raise(db, partner_id, error_message="Partner not found")
        exists = await db.scalar(
            select(func.count())
            .select_from(sustainability_partners)
            .where(sustainability_partners.c.sustainability_id == sustainability_id, sustainability_partners.c.partner_id == partner_id)
        )
        if not exists:
            await db.execute(insert(sustainability_partners).values(sustainability_id=sustainability_id, partner_id=partner_id))
            await db.flush()

    @staticmethod
    async def remove_partner(db: AsyncSession, sustainability_id: uuid.UUID, partner_id: uuid.UUID) -> None:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        await db.execute(delete(sustainability_partners).where(sustainability_partners.c.sustainability_id == sustainability_id, sustainability_partners.c.partner_id == partner_id))
        await db.flush()

    @staticmethod
    async def list_training(db: AsyncSession, sustainability_id: uuid.UUID) -> list[dict[str, Any]]:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        return await _related_many(
            db,
            TrainingProgram.active_query()
            .join(sustainability_training, TrainingProgram.id == sustainability_training.c.training_id)
            .where(sustainability_training.c.sustainability_id == sustainability_id)
            .order_by(TrainingProgram.start_date.desc().nullslast(), TrainingProgram.title.asc()),
            "code",
            "program_type",
            "delivery_mode",
        )

    @staticmethod
    async def add_training(db: AsyncSession, sustainability_id: uuid.UUID, training_id: uuid.UUID) -> None:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        await TrainingProgram.get_or_raise(db, training_id, error_message="Training program not found")
        exists = await db.scalar(
            select(func.count())
            .select_from(sustainability_training)
            .where(sustainability_training.c.sustainability_id == sustainability_id, sustainability_training.c.training_id == training_id)
        )
        if not exists:
            await db.execute(insert(sustainability_training).values(sustainability_id=sustainability_id, training_id=training_id))
            await db.flush()

    @staticmethod
    async def remove_training(db: AsyncSession, sustainability_id: uuid.UUID, training_id: uuid.UUID) -> None:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        await db.execute(delete(sustainability_training).where(sustainability_training.c.sustainability_id == sustainability_id, sustainability_training.c.training_id == training_id))
        await db.flush()

    @staticmethod
    async def list_stories(db: AsyncSession, sustainability_id: uuid.UUID) -> list[dict[str, Any]]:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        return await _related_many(
            db,
            SuccessStory.active_query()
            .join(sustainability_stories, SuccessStory.id == sustainability_stories.c.story_id)
            .where(sustainability_stories.c.sustainability_id == sustainability_id)
            .order_by(SuccessStory.story_date.desc().nullslast(), SuccessStory.created_at.desc()),
            "story_type",
            "story_date",
        )

    @staticmethod
    async def add_story(db: AsyncSession, sustainability_id: uuid.UUID, story_id: uuid.UUID) -> None:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        await SuccessStory.get_or_raise(db, story_id, error_message="Impact story not found")
        exists = await db.scalar(
            select(func.count())
            .select_from(sustainability_stories)
            .where(sustainability_stories.c.sustainability_id == sustainability_id, sustainability_stories.c.story_id == story_id)
        )
        if not exists:
            await db.execute(insert(sustainability_stories).values(sustainability_id=sustainability_id, story_id=story_id))
            await db.flush()

    @staticmethod
    async def remove_story(db: AsyncSession, sustainability_id: uuid.UUID, story_id: uuid.UUID) -> None:
        await SustainabilityRelationshipService._ensure_sustainability(db, sustainability_id)
        await db.execute(delete(sustainability_stories).where(sustainability_stories.c.sustainability_id == sustainability_id, sustainability_stories.c.story_id == story_id))
        await db.flush()
