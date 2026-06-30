"""Partnership services."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    Consultancy,
    ImpactMetric,
    Partner,
    ResearchFarm,
    ResearchProject,
    SuccessStory,
    Sustainability,
    project_partners,
    sustainability_partners,
)
from ._crud import build_simple_service
from .core import MainScopedEventService

PartnerService = build_simple_service(Partner, "name", "acronym", "about", "country", "partner_type")
ConsultancyService = build_simple_service(
    Consultancy,
    "title",
    "code",
    "client_name",
    "summary",
    "consultancy_type",
    reference_fields={"lead_consultant_id": "persons"},
)


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


class PartnerRelationshipService:
    """Read reverse relationships backed by real partner links and foreign keys."""

    @staticmethod
    async def _ensure_partner(db: AsyncSession, partner_id: uuid.UUID) -> Partner:
        return await Partner.get_or_raise(db, partner_id, error_message="Partner not found")

    @staticmethod
    async def list_projects(db: AsyncSession, partner_id: uuid.UUID) -> list[dict[str, Any]]:
        await PartnerRelationshipService._ensure_partner(db, partner_id)
        return await _related_many(
            db,
            ResearchProject.active_query()
            .join(project_partners, ResearchProject.id == project_partners.c.project_id)
            .where(project_partners.c.partner_id == partner_id)
            .order_by(ResearchProject.start_date.desc().nullslast(), ResearchProject.title.asc()),
            "code",
            "project_type",
            "farm_id",
            "start_date",
            "end_date",
        )

    @staticmethod
    async def list_farms(db: AsyncSession, partner_id: uuid.UUID) -> list[dict[str, Any]]:
        await PartnerRelationshipService._ensure_partner(db, partner_id)
        return await _related_many(
            db,
            ResearchFarm.active_query()
            .join(ResearchProject, ResearchProject.farm_id == ResearchFarm.id)
            .join(project_partners, ResearchProject.id == project_partners.c.project_id)
            .where(project_partners.c.partner_id == partner_id)
            .order_by(ResearchFarm.display_order.asc(), ResearchFarm.name.asc()),
            "code",
            "farm_type",
            "county",
        )

    @staticmethod
    async def list_activities(db: AsyncSession, partner_id: uuid.UUID) -> list[dict[str, Any]]:
        await PartnerRelationshipService._ensure_partner(db, partner_id)
        return await MainScopedEventService.list("research_partner", partner_id)

    @staticmethod
    async def list_impact_stories(db: AsyncSession, partner_id: uuid.UUID) -> list[dict[str, Any]]:
        await PartnerRelationshipService._ensure_partner(db, partner_id)
        return await _related_many(
            db,
            SuccessStory.active_query()
            .join(project_partners, SuccessStory.project_id == project_partners.c.project_id)
            .where(project_partners.c.partner_id == partner_id)
            .order_by(SuccessStory.story_date.desc().nullslast(), SuccessStory.created_at.desc()),
            "story_type",
            "story_date",
            "project_id",
        )

    @staticmethod
    async def list_impact_metrics(db: AsyncSession, partner_id: uuid.UUID) -> list[dict[str, Any]]:
        await PartnerRelationshipService._ensure_partner(db, partner_id)
        return await _related_many(
            db,
            ImpactMetric.active_query()
            .join(project_partners, ImpactMetric.project_id == project_partners.c.project_id)
            .where(project_partners.c.partner_id == partner_id)
            .order_by(ImpactMetric.display_order.asc(), ImpactMetric.created_at.desc()),
            "metric_type",
            "category",
            "value",
            "unit",
            "project_id",
        )

    @staticmethod
    async def list_consultancies(db: AsyncSession, partner_id: uuid.UUID) -> list[dict[str, Any]]:
        await PartnerRelationshipService._ensure_partner(db, partner_id)
        return await _related_many(
            db,
            Consultancy.active_query()
            .where(Consultancy.partner_id == partner_id)
            .order_by(Consultancy.start_date.desc().nullslast(), Consultancy.title.asc()),
            "code",
            "consultancy_type",
            "client_name",
            "contract_value",
            "currency",
        )

    @staticmethod
    async def list_sustainability(db: AsyncSession, partner_id: uuid.UUID) -> list[dict[str, Any]]:
        await PartnerRelationshipService._ensure_partner(db, partner_id)
        return await _related_many(
            db,
            Sustainability.active_query()
            .join(sustainability_partners, Sustainability.id == sustainability_partners.c.sustainability_id)
            .where(sustainability_partners.c.partner_id == partner_id)
            .order_by(Sustainability.display_order.asc(), Sustainability.name.asc()),
            "code",
            "initiative_type",
        )
