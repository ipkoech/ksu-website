"""Core research services."""

from __future__ import annotations

import uuid
import logging
from typing import Any

import httpx
from fastapi import HTTPException, status
from ksu_common.models import AuditLog
from sqlalchemy import delete, func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..core.config import get_settings
from ..models import (
    CenterTeamMember,
    FocusArea,
    Funding,
    Grant,
    ImpactMetric,
    Partner,
    ProjectTeamMember,
    Publication,
    ResearchCenter,
    ResearchFarm,
    ResearchProgram,
    ResearchProject,
    SuccessStory,
    Sustainability,
    center_focus_areas,
    program_themes,
    project_focus_areas,
    project_funders,
    project_partners,
    sustainability_projects,
)
from ._crud import build_simple_service

CenterService = build_simple_service(
    ResearchCenter,
    "name",
    "code",
    "acronym",
    "about",
    "location",
    reference_fields={"school_id": "schools", "department_id": "departments", "director_id": "persons"},
)
FarmService = build_simple_service(ResearchFarm, "name", "code", "about", "location", "county")
ProgramService = build_simple_service(
    ResearchProgram,
    "name",
    "code",
    "summary",
    "description",
    "status",
    reference_fields={"lead_id": "persons"},
)
ProjectService = build_simple_service(
    ResearchProject,
    "title",
    "code",
    "summary",
    "abstract",
    "status",
    reference_fields={"pi_id": "persons"},
)
ProjectTeamMemberService = build_simple_service(ProjectTeamMember, "role", reference_fields={"person_id": "persons"})
CenterTeamMemberService = build_simple_service(CenterTeamMember, "role", reference_fields={"person_id": "persons"})

logger = logging.getLogger(__name__)


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


def _model_payload(item: Any) -> dict[str, Any]:
    return {
        column.name: getattr(item, column.name)
        for column in item.__table__.columns
        if hasattr(item, column.name)
    }


async def _related_many(db: AsyncSession, statement, *extra_fields: str) -> list[dict[str, Any]]:
    result = await db.execute(statement)
    return [_brief(item, *extra_fields) for item in result.scalars().all()]


class MainScopedEventService:
    """Read real main-service events scoped to research records."""

    @staticmethod
    async def list(scope_type: str, scope_id: uuid.UUID, *, per_page: int = 20) -> list[dict[str, Any]]:
        settings = get_settings()
        try:
            async with httpx.AsyncClient(
                base_url=settings.MAIN_SERVICE_URL.rstrip("/"),
                timeout=httpx.Timeout(settings.REFERENCE_VALIDATION_TIMEOUT_SECONDS),
            ) as client:
                response = await client.get(
                    "/api/v1/events",
                    params={
                        "scope_type": scope_type,
                        "scope_id": str(scope_id),
                        "page": 1,
                        "per_page": per_page,
                        "fields": "id,title,slug,summary,start_date,end_date,location,status,scope_type,scope_id,updated_at",
                    },
                )
                response.raise_for_status()
        except Exception as exc:
            logger.warning("Could not load main-service events for %s=%s: %s", scope_type, scope_id, exc)
            return []

        payload = response.json()
        data = payload.get("data", payload)
        return data if isinstance(data, list) else []


class ProjectDetailService:
    """Admin-oriented aggregate payloads for research project detail screens."""

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str) -> dict[str, Any] | None:
        project = await ProjectService.get_by_slug(
            db,
            slug,
            load_options=(selectinload(ResearchProject.center), selectinload(ResearchProject.program), selectinload(ResearchProject.farm)),
        )
        if project is None:
            return None

        grants = []
        if project.grant_id:
            result = await db.execute(Grant.active_query().where(Grant.id == project.grant_id))
            grant = result.scalar_one_or_none()
            if grant is not None:
                grants.append(_brief(grant, "deadline", "currency", "total_budget"))

        return {
            "record": {
                **_model_payload(project),
                "center": _brief(project.center) if project.center else None,
                "program": _brief(project.program) if project.program else None,
                "farm": _brief(project.farm) if project.farm else None,
            },
            "relationships": {
                "publications": await _related_many(
                    db,
                    Publication.active_query().where(Publication.project_id == project.id).order_by(Publication.year.desc().nullslast(), Publication.created_at.desc()),
                    "publication_type",
                    "year",
                    "doi",
                    "url",
                ),
                "grants": grants,
                "funders": await ProjectRelationshipService.list_funders(db, project.id),
                "partners": await ProjectRelationshipService.list_partners(db, project.id),
                "focus_areas": await ProjectRelationshipService.list_focus_areas(db, project.id),
                "impact": await _related_many(
                    db,
                    SuccessStory.active_query().where(SuccessStory.project_id == project.id).order_by(SuccessStory.story_date.desc().nullslast(), SuccessStory.created_at.desc()),
                    "story_type",
                    "story_date",
                ),
                "activities": await MainScopedEventService.list("research_project", project.id),
                "metrics": await _related_many(
                    db,
                    ImpactMetric.active_query().where(ImpactMetric.project_id == project.id).order_by(ImpactMetric.display_order.asc(), ImpactMetric.created_at.desc()),
                    "metric_type",
                    "category",
                    "value",
                    "unit",
                ),
                "sustainability": await _related_many(
                    db,
                    Sustainability.active_query()
                    .join(sustainability_projects, Sustainability.id == sustainability_projects.c.sustainability_id)
                    .where(sustainability_projects.c.project_id == project.id)
                    .order_by(Sustainability.display_order.asc(), Sustainability.created_at.desc()),
                    "initiative_type",
                ),
                "audit": await _related_many(
                    db,
                    AuditLog.active_query()
                    .where(AuditLog.resource_type.in_(("research_project", "projects", "project")))
                    .where(AuditLog.resource_id == str(project.id))
                    .order_by(AuditLog.happened_at.desc())
                    .limit(20),
                    "action",
                    "status",
                    "happened_at",
                ),
            },
        }


class ProjectRelationshipService:
    """Manage existing M:N project relationship tables."""

    @staticmethod
    async def _ensure_record(db: AsyncSession, model: Any, record_id: uuid.UUID, error_message: str) -> Any:
        result = await db.execute(model.active_query().where(model.id == record_id))
        record = result.scalar_one_or_none()
        if record is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_message)
        return record

    @staticmethod
    async def _ensure_project(db: AsyncSession, project_id: uuid.UUID) -> ResearchProject:
        project = await ProjectService.get_by_id(db, project_id)
        if project is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return project

    @staticmethod
    async def _ensure_partner(db: AsyncSession, partner_id: uuid.UUID) -> Partner:
        return await ProjectRelationshipService._ensure_record(db, Partner, partner_id, "Partner not found")

    @staticmethod
    async def _ensure_funder(db: AsyncSession, funder_id: uuid.UUID) -> Funding:
        return await ProjectRelationshipService._ensure_record(db, Funding, funder_id, "Funder not found")

    @staticmethod
    async def _ensure_focus_area(db: AsyncSession, focus_area_id: uuid.UUID) -> FocusArea:
        return await ProjectRelationshipService._ensure_record(db, FocusArea, focus_area_id, "Focus area not found")

    @staticmethod
    async def list_activities(db: AsyncSession, project_id: uuid.UUID) -> list[dict[str, Any]]:
        await ProjectRelationshipService._ensure_project(db, project_id)
        return await MainScopedEventService.list("research_project", project_id)

    @staticmethod
    async def list_impact_stories(db: AsyncSession, project_id: uuid.UUID) -> list[dict[str, Any]]:
        await ProjectRelationshipService._ensure_project(db, project_id)
        return await _related_many(
            db,
            SuccessStory.active_query()
            .where(SuccessStory.project_id == project_id)
            .order_by(SuccessStory.story_date.desc().nullslast(), SuccessStory.created_at.desc()),
            "story_type",
            "story_date",
        )

    @staticmethod
    async def list_impact_metrics(db: AsyncSession, project_id: uuid.UUID) -> list[dict[str, Any]]:
        await ProjectRelationshipService._ensure_project(db, project_id)
        return await _related_many(
            db,
            ImpactMetric.active_query()
            .where(ImpactMetric.project_id == project_id)
            .order_by(ImpactMetric.display_order.asc(), ImpactMetric.created_at.desc()),
            "metric_type",
            "category",
            "value",
            "unit",
        )

    @staticmethod
    async def list_partners(db: AsyncSession, project_id: uuid.UUID) -> list[dict[str, Any]]:
        await ProjectRelationshipService._ensure_project(db, project_id)
        return await _related_many(
            db,
            Partner.active_query()
            .join(project_partners, Partner.id == project_partners.c.partner_id)
            .where(project_partners.c.project_id == project_id)
            .order_by(Partner.display_order.asc(), Partner.name.asc()),
            "partner_type",
            "partnership_level",
        )

    @staticmethod
    async def add_partner(db: AsyncSession, project_id: uuid.UUID, partner_id: uuid.UUID) -> None:
        await ProjectRelationshipService._ensure_project(db, project_id)
        await ProjectRelationshipService._ensure_partner(db, partner_id)
        exists = await db.scalar(select(func.count()).select_from(project_partners).where(project_partners.c.project_id == project_id, project_partners.c.partner_id == partner_id))
        if not exists:
            await db.execute(insert(project_partners).values(project_id=project_id, partner_id=partner_id))
            await db.flush()

    @staticmethod
    async def remove_partner(db: AsyncSession, project_id: uuid.UUID, partner_id: uuid.UUID) -> None:
        await ProjectRelationshipService._ensure_project(db, project_id)
        await db.execute(delete(project_partners).where(project_partners.c.project_id == project_id, project_partners.c.partner_id == partner_id))
        await db.flush()

    @staticmethod
    async def list_funders(db: AsyncSession, project_id: uuid.UUID) -> list[dict[str, Any]]:
        await ProjectRelationshipService._ensure_project(db, project_id)
        return await _related_many(
            db,
            Funding.active_query()
            .join(project_funders, Funding.id == project_funders.c.funding_id)
            .where(project_funders.c.project_id == project_id)
            .order_by(Funding.display_order.asc(), Funding.name.asc()),
            "funder_type",
        )

    @staticmethod
    async def add_funder(db: AsyncSession, project_id: uuid.UUID, funder_id: uuid.UUID) -> None:
        await ProjectRelationshipService._ensure_project(db, project_id)
        await ProjectRelationshipService._ensure_funder(db, funder_id)
        exists = await db.scalar(select(func.count()).select_from(project_funders).where(project_funders.c.project_id == project_id, project_funders.c.funding_id == funder_id))
        if not exists:
            await db.execute(insert(project_funders).values(project_id=project_id, funding_id=funder_id))
            await db.flush()

    @staticmethod
    async def remove_funder(db: AsyncSession, project_id: uuid.UUID, funder_id: uuid.UUID) -> None:
        await ProjectRelationshipService._ensure_project(db, project_id)
        await db.execute(delete(project_funders).where(project_funders.c.project_id == project_id, project_funders.c.funding_id == funder_id))
        await db.flush()

    @staticmethod
    async def list_focus_areas(db: AsyncSession, project_id: uuid.UUID) -> list[dict[str, Any]]:
        await ProjectRelationshipService._ensure_project(db, project_id)
        return await _related_many(
            db,
            FocusArea.active_query()
            .join(project_focus_areas, FocusArea.id == project_focus_areas.c.focus_area_id)
            .where(project_focus_areas.c.project_id == project_id)
            .order_by(FocusArea.display_order.asc(), FocusArea.name.asc()),
            "code",
        )

    @staticmethod
    async def add_focus_area(db: AsyncSession, project_id: uuid.UUID, focus_area_id: uuid.UUID) -> None:
        await ProjectRelationshipService._ensure_project(db, project_id)
        await ProjectRelationshipService._ensure_focus_area(db, focus_area_id)
        exists = await db.scalar(select(func.count()).select_from(project_focus_areas).where(project_focus_areas.c.project_id == project_id, project_focus_areas.c.focus_area_id == focus_area_id))
        if not exists:
            await db.execute(insert(project_focus_areas).values(project_id=project_id, focus_area_id=focus_area_id))
            await db.flush()

    @staticmethod
    async def remove_focus_area(db: AsyncSession, project_id: uuid.UUID, focus_area_id: uuid.UUID) -> None:
        await ProjectRelationshipService._ensure_project(db, project_id)
        await db.execute(delete(project_focus_areas).where(project_focus_areas.c.project_id == project_id, project_focus_areas.c.focus_area_id == focus_area_id))
        await db.flush()


class CenterRelationshipService:
    """Manage research center relationships backed by FK and center_focus_areas links."""

    @staticmethod
    async def _ensure_center(db: AsyncSession, center_id: uuid.UUID) -> ResearchCenter:
        return await ResearchCenter.get_or_raise(db, center_id, error_message="Research center not found")

    @staticmethod
    async def _ensure_focus_area(db: AsyncSession, focus_area_id: uuid.UUID) -> FocusArea:
        return await FocusArea.get_or_raise(db, focus_area_id, error_message="Focus area not found")

    @staticmethod
    async def list_projects(db: AsyncSession, center_id: uuid.UUID) -> list[dict[str, Any]]:
        await CenterRelationshipService._ensure_center(db, center_id)
        return await _related_many(
            db,
            ResearchProject.active_query()
            .where(ResearchProject.center_id == center_id)
            .order_by(ResearchProject.start_date.desc().nullslast(), ResearchProject.title.asc()),
            "code",
            "project_type",
            "status",
            "start_date",
        )

    @staticmethod
    async def list_programs(db: AsyncSession, center_id: uuid.UUID) -> list[dict[str, Any]]:
        await CenterRelationshipService._ensure_center(db, center_id)
        return await _related_many(
            db,
            ResearchProgram.active_query()
            .where(ResearchProgram.center_id == center_id)
            .order_by(ResearchProgram.start_date.desc().nullslast(), ResearchProgram.name.asc()),
            "code",
            "status",
            "start_date",
        )

    @staticmethod
    async def list_farms(db: AsyncSession, center_id: uuid.UUID) -> list[dict[str, Any]]:
        await CenterRelationshipService._ensure_center(db, center_id)
        return await _related_many(
            db,
            ResearchFarm.active_query()
            .where(ResearchFarm.center_id == center_id)
            .order_by(ResearchFarm.display_order.asc(), ResearchFarm.name.asc()),
            "code",
            "farm_type",
            "location",
        )

    @staticmethod
    async def list_focus_areas(db: AsyncSession, center_id: uuid.UUID) -> list[dict[str, Any]]:
        await CenterRelationshipService._ensure_center(db, center_id)
        return await _related_many(
            db,
            FocusArea.active_query()
            .join(center_focus_areas, FocusArea.id == center_focus_areas.c.focus_area_id)
            .where(center_focus_areas.c.center_id == center_id)
            .order_by(FocusArea.display_order.asc(), FocusArea.name.asc()),
            "code",
            "theme_id",
        )

    @staticmethod
    async def add_focus_area(db: AsyncSession, center_id: uuid.UUID, focus_area_id: uuid.UUID) -> None:
        await CenterRelationshipService._ensure_center(db, center_id)
        await CenterRelationshipService._ensure_focus_area(db, focus_area_id)
        exists = await db.scalar(
            select(func.count())
            .select_from(center_focus_areas)
            .where(center_focus_areas.c.center_id == center_id, center_focus_areas.c.focus_area_id == focus_area_id)
        )
        if not exists:
            await db.execute(insert(center_focus_areas).values(center_id=center_id, focus_area_id=focus_area_id))
            await db.flush()

    @staticmethod
    async def remove_focus_area(db: AsyncSession, center_id: uuid.UUID, focus_area_id: uuid.UUID) -> None:
        await CenterRelationshipService._ensure_center(db, center_id)
        await db.execute(delete(center_focus_areas).where(center_focus_areas.c.center_id == center_id, center_focus_areas.c.focus_area_id == focus_area_id))
        await db.flush()


class ProgramRelationshipService:
    """Manage research program relationships backed by project FK and program_themes links."""

    @staticmethod
    async def _ensure_program(db: AsyncSession, program_id: uuid.UUID) -> ResearchProgram:
        return await ResearchProgram.get_or_raise(db, program_id, error_message="Research program not found")

    @staticmethod
    async def _ensure_theme(db: AsyncSession, theme_id: uuid.UUID):
        from ..models import ResearchTheme

        return await ResearchTheme.get_or_raise(db, theme_id, error_message="Research theme not found")

    @staticmethod
    async def list_projects(db: AsyncSession, program_id: uuid.UUID) -> list[dict[str, Any]]:
        await ProgramRelationshipService._ensure_program(db, program_id)
        return await _related_many(
            db,
            ResearchProject.active_query()
            .where(ResearchProject.program_id == program_id)
            .order_by(ResearchProject.start_date.desc().nullslast(), ResearchProject.title.asc()),
            "code",
            "project_type",
            "status",
            "start_date",
        )

    @staticmethod
    async def list_themes(db: AsyncSession, program_id: uuid.UUID) -> list[dict[str, Any]]:
        from ..models import ResearchTheme

        await ProgramRelationshipService._ensure_program(db, program_id)
        return await _related_many(
            db,
            ResearchTheme.active_query()
            .join(program_themes, ResearchTheme.id == program_themes.c.theme_id)
            .where(program_themes.c.program_id == program_id)
            .order_by(ResearchTheme.display_order.asc(), ResearchTheme.name.asc()),
            "code",
            "color",
        )

    @staticmethod
    async def add_theme(db: AsyncSession, program_id: uuid.UUID, theme_id: uuid.UUID) -> None:
        await ProgramRelationshipService._ensure_program(db, program_id)
        await ProgramRelationshipService._ensure_theme(db, theme_id)
        exists = await db.scalar(
            select(func.count())
            .select_from(program_themes)
            .where(program_themes.c.program_id == program_id, program_themes.c.theme_id == theme_id)
        )
        if not exists:
            await db.execute(insert(program_themes).values(program_id=program_id, theme_id=theme_id))
            await db.flush()

    @staticmethod
    async def remove_theme(db: AsyncSession, program_id: uuid.UUID, theme_id: uuid.UUID) -> None:
        await ProgramRelationshipService._ensure_program(db, program_id)
        await db.execute(delete(program_themes).where(program_themes.c.program_id == program_id, program_themes.c.theme_id == theme_id))
        await db.flush()


class FarmDetailService:
    """Admin-oriented aggregate payloads for research farm detail screens."""

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str) -> dict[str, Any] | None:
        farm = await FarmService.get_by_slug(
            db,
            slug,
            load_options=(selectinload(ResearchFarm.center), selectinload(ResearchFarm.projects)),
        )
        if farm is None:
            return None

        return {
            "record": {
                **_model_payload(farm),
                "center": _brief(farm.center) if farm.center else None,
            },
            "relationships": {
                "projects": await FarmRelationshipService.list_projects(db, farm.id),
                "partners": await FarmRelationshipService.list_partners(db, farm.id),
                "activities": await FarmRelationshipService.list_activities(db, farm.id),
                "impact": await FarmRelationshipService.list_impact_stories(db, farm.id),
                "metrics": await FarmRelationshipService.list_impact_metrics(db, farm.id),
                "audit": await _related_many(
                    db,
                    AuditLog.active_query()
                    .where(AuditLog.resource_type.in_(("research_farm", "farms", "farm")))
                    .where(AuditLog.resource_id == str(farm.id))
                    .order_by(AuditLog.happened_at.desc())
                    .limit(20),
                    "action",
                    "status",
                    "happened_at",
                ),
            },
        }


class FarmRelationshipService:
    """Manage farm relationships backed by existing project farm_id fields."""

    @staticmethod
    async def _ensure_farm(db: AsyncSession, farm_id: uuid.UUID) -> ResearchFarm:
        return await ResearchFarm.get_or_raise(db, farm_id, error_message="Farm not found")

    @staticmethod
    async def list_projects(db: AsyncSession, farm_id: uuid.UUID) -> list[dict[str, Any]]:
        await FarmRelationshipService._ensure_farm(db, farm_id)
        return await _related_many(
            db,
            ResearchProject.active_query()
            .where(ResearchProject.farm_id == farm_id)
            .order_by(ResearchProject.start_date.desc().nullslast(), ResearchProject.title.asc()),
            "code",
            "project_type",
            "start_date",
            "end_date",
        )

    @staticmethod
    async def add_project(db: AsyncSession, farm_id: uuid.UUID, project_id: uuid.UUID) -> None:
        await FarmRelationshipService._ensure_farm(db, farm_id)
        project = await ResearchProject.get_or_raise(db, project_id, error_message="Project not found")
        project.farm_id = farm_id
        await db.flush()

    @staticmethod
    async def remove_project(db: AsyncSession, farm_id: uuid.UUID, project_id: uuid.UUID) -> None:
        await FarmRelationshipService._ensure_farm(db, farm_id)
        project = await ResearchProject.get_or_raise(db, project_id, error_message="Project not found")
        if project.farm_id == farm_id:
            project.farm_id = None
            await db.flush()

    @staticmethod
    async def list_partners(db: AsyncSession, farm_id: uuid.UUID) -> list[dict[str, Any]]:
        await FarmRelationshipService._ensure_farm(db, farm_id)
        return await _related_many(
            db,
            Partner.active_query()
            .join(project_partners, Partner.id == project_partners.c.partner_id)
            .join(ResearchProject, ResearchProject.id == project_partners.c.project_id)
            .where(ResearchProject.farm_id == farm_id)
            .order_by(Partner.display_order.asc(), Partner.name.asc()),
            "partner_type",
            "partnership_level",
        )

    @staticmethod
    async def list_activities(db: AsyncSession, farm_id: uuid.UUID) -> list[dict[str, Any]]:
        await FarmRelationshipService._ensure_farm(db, farm_id)
        return await MainScopedEventService.list("research_farm", farm_id)

    @staticmethod
    async def list_impact_stories(db: AsyncSession, farm_id: uuid.UUID) -> list[dict[str, Any]]:
        await FarmRelationshipService._ensure_farm(db, farm_id)
        return await _related_many(
            db,
            SuccessStory.active_query()
            .join(ResearchProject, ResearchProject.id == SuccessStory.project_id)
            .where(ResearchProject.farm_id == farm_id)
            .order_by(SuccessStory.story_date.desc().nullslast(), SuccessStory.created_at.desc()),
            "story_type",
            "story_date",
        )

    @staticmethod
    async def list_impact_metrics(db: AsyncSession, farm_id: uuid.UUID) -> list[dict[str, Any]]:
        await FarmRelationshipService._ensure_farm(db, farm_id)
        return await _related_many(
            db,
            ImpactMetric.active_query()
            .join(ResearchProject, ResearchProject.id == ImpactMetric.project_id)
            .where(ResearchProject.farm_id == farm_id)
            .order_by(ImpactMetric.display_order.asc(), ImpactMetric.created_at.desc()),
            "metric_type",
            "category",
            "value",
            "unit",
        )
