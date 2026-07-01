"""Classification services."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import delete, func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    ExpertiseTag,
    FocusArea,
    Grant,
    Publication,
    ResearchProgram,
    ResearchProject,
    ResearchTheme,
    grant_themes,
    program_themes,
    project_themes,
    publication_themes,
)
from ._crud import build_simple_service

ThemeService = build_simple_service(ResearchTheme, "name", "code", "description", "objectives")
FocusAreaService = build_simple_service(FocusArea, "name", "code", "description", "key_questions")
TagService = build_simple_service(ExpertiseTag, "name", "category", "description")


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


class ThemeRelationshipService:
    """Manage research theme relationships backed by FK and theme association tables."""

    @staticmethod
    async def _ensure_theme(db: AsyncSession, theme_id: uuid.UUID) -> ResearchTheme:
        return await ResearchTheme.get_or_raise(db, theme_id, error_message="Research theme not found")

    @staticmethod
    async def _ensure_project(db: AsyncSession, project_id: uuid.UUID) -> ResearchProject:
        return await ResearchProject.get_or_raise(db, project_id, error_message="Research project not found")

    @staticmethod
    async def _ensure_program(db: AsyncSession, program_id: uuid.UUID) -> ResearchProgram:
        return await ResearchProgram.get_or_raise(db, program_id, error_message="Research program not found")

    @staticmethod
    async def _ensure_publication(db: AsyncSession, publication_id: uuid.UUID) -> Publication:
        return await Publication.get_or_raise(db, publication_id, error_message="Publication not found")

    @staticmethod
    async def _ensure_grant(db: AsyncSession, grant_id: uuid.UUID) -> Grant:
        return await Grant.get_or_raise(db, grant_id, error_message="Grant not found")

    @staticmethod
    async def list_focus_areas(db: AsyncSession, theme_id: uuid.UUID) -> list[dict[str, Any]]:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        return await _related_many(
            db,
            FocusArea.active_query()
            .where(FocusArea.theme_id == theme_id)
            .order_by(FocusArea.display_order.asc(), FocusArea.name.asc()),
            "code",
            "icon",
            "color",
        )

    @staticmethod
    async def list_projects(db: AsyncSession, theme_id: uuid.UUID) -> list[dict[str, Any]]:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        return await _related_many(
            db,
            ResearchProject.active_query()
            .join(project_themes, ResearchProject.id == project_themes.c.project_id)
            .where(project_themes.c.theme_id == theme_id)
            .order_by(ResearchProject.start_date.desc().nullslast(), ResearchProject.title.asc()),
            "code",
            "project_type",
            "status",
        )

    @staticmethod
    async def add_project(db: AsyncSession, theme_id: uuid.UUID, project_id: uuid.UUID) -> None:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        await ThemeRelationshipService._ensure_project(db, project_id)
        exists = await db.scalar(
            select(func.count())
            .select_from(project_themes)
            .where(project_themes.c.theme_id == theme_id, project_themes.c.project_id == project_id)
        )
        if not exists:
            await db.execute(insert(project_themes).values(theme_id=theme_id, project_id=project_id))
            await db.flush()

    @staticmethod
    async def remove_project(db: AsyncSession, theme_id: uuid.UUID, project_id: uuid.UUID) -> None:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        await db.execute(delete(project_themes).where(project_themes.c.theme_id == theme_id, project_themes.c.project_id == project_id))
        await db.flush()

    @staticmethod
    async def list_programs(db: AsyncSession, theme_id: uuid.UUID) -> list[dict[str, Any]]:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        return await _related_many(
            db,
            ResearchProgram.active_query()
            .join(program_themes, ResearchProgram.id == program_themes.c.program_id)
            .where(program_themes.c.theme_id == theme_id)
            .order_by(ResearchProgram.start_date.desc().nullslast(), ResearchProgram.name.asc()),
            "code",
            "status",
        )

    @staticmethod
    async def add_program(db: AsyncSession, theme_id: uuid.UUID, program_id: uuid.UUID) -> None:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        await ThemeRelationshipService._ensure_program(db, program_id)
        exists = await db.scalar(
            select(func.count())
            .select_from(program_themes)
            .where(program_themes.c.theme_id == theme_id, program_themes.c.program_id == program_id)
        )
        if not exists:
            await db.execute(insert(program_themes).values(theme_id=theme_id, program_id=program_id))
            await db.flush()

    @staticmethod
    async def remove_program(db: AsyncSession, theme_id: uuid.UUID, program_id: uuid.UUID) -> None:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        await db.execute(delete(program_themes).where(program_themes.c.theme_id == theme_id, program_themes.c.program_id == program_id))
        await db.flush()

    @staticmethod
    async def list_publications(db: AsyncSession, theme_id: uuid.UUID) -> list[dict[str, Any]]:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        return await _related_many(
            db,
            Publication.active_query()
            .join(publication_themes, Publication.id == publication_themes.c.publication_id)
            .where(publication_themes.c.theme_id == theme_id)
            .order_by(Publication.publication_date.desc().nullslast(), Publication.title.asc()),
            "publication_type",
            "year",
            "status",
        )

    @staticmethod
    async def add_publication(db: AsyncSession, theme_id: uuid.UUID, publication_id: uuid.UUID) -> None:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        await ThemeRelationshipService._ensure_publication(db, publication_id)
        exists = await db.scalar(
            select(func.count())
            .select_from(publication_themes)
            .where(publication_themes.c.theme_id == theme_id, publication_themes.c.publication_id == publication_id)
        )
        if not exists:
            await db.execute(insert(publication_themes).values(theme_id=theme_id, publication_id=publication_id))
            await db.flush()

    @staticmethod
    async def remove_publication(db: AsyncSession, theme_id: uuid.UUID, publication_id: uuid.UUID) -> None:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        await db.execute(delete(publication_themes).where(publication_themes.c.theme_id == theme_id, publication_themes.c.publication_id == publication_id))
        await db.flush()

    @staticmethod
    async def list_grants(db: AsyncSession, theme_id: uuid.UUID) -> list[dict[str, Any]]:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        return await _related_many(
            db,
            Grant.active_query()
            .join(grant_themes, Grant.id == grant_themes.c.grant_id)
            .where(grant_themes.c.theme_id == theme_id)
            .order_by(Grant.deadline.desc().nullslast(), Grant.title.asc()),
            "code",
            "grant_type",
            "status",
            "deadline",
        )

    @staticmethod
    async def add_grant(db: AsyncSession, theme_id: uuid.UUID, grant_id: uuid.UUID) -> None:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        await ThemeRelationshipService._ensure_grant(db, grant_id)
        exists = await db.scalar(
            select(func.count())
            .select_from(grant_themes)
            .where(grant_themes.c.theme_id == theme_id, grant_themes.c.grant_id == grant_id)
        )
        if not exists:
            await db.execute(insert(grant_themes).values(theme_id=theme_id, grant_id=grant_id))
            await db.flush()

    @staticmethod
    async def remove_grant(db: AsyncSession, theme_id: uuid.UUID, grant_id: uuid.UUID) -> None:
        await ThemeRelationshipService._ensure_theme(db, theme_id)
        await db.execute(delete(grant_themes).where(grant_themes.c.theme_id == theme_id, grant_themes.c.grant_id == grant_id))
        await db.flush()
