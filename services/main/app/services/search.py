"""Aggregated search service for public discovery."""

from __future__ import annotations

from typing import Mapping, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Announcement, Blog, Department, Event, News, Person, School
from ._base import ilike_any


class SearchService:
    @staticmethod
    async def search(
        db: AsyncSession,
        *,
        q: str,
        limit_per_type: int = 5,
        scope_type: str | None = None,
        scope_id=None,
        load_options_by_type: Mapping[str, Sequence] | None = None,
    ) -> dict:
        term = q.strip()
        if not term:
            return {"query": q, "results": {}}

        load_options_by_type = load_options_by_type or {}
        results: dict[str, list] = {}
        results["news"] = await SearchService._search_content(db, News, term, limit_per_type, scope_type, scope_id, load_options_by_type.get("news", ()))
        results["blogs"] = await SearchService._search_content(db, Blog, term, limit_per_type, scope_type, scope_id, load_options_by_type.get("blogs", ()))
        results["announcements"] = await SearchService._search_content(db, Announcement, term, limit_per_type, scope_type, scope_id, load_options_by_type.get("announcements", ()))
        results["events"] = await SearchService._search_events(db, term, limit_per_type, scope_type, scope_id, load_options_by_type.get("events", ()))
        results["persons"] = await SearchService._search_people(db, term, limit_per_type, load_options_by_type.get("persons", ()))
        results["schools"] = await SearchService._search_schools(db, term, limit_per_type, load_options_by_type.get("schools", ()))
        results["departments"] = await SearchService._search_departments(db, term, limit_per_type, load_options_by_type.get("departments", ()))
        return {"query": q, "results": results}

    @staticmethod
    async def _search_content(db, model, term, limit_per_type, scope_type, scope_id, load_options=()):
        query = model.active_query().where(
            model.is_public.is_(True),
            model.archived_at.is_(None),
            ilike_any(term, model.title, model.summary, model.plain_text, model.rich_text),
        )
        if load_options:
            query = query.options(*load_options)
        if scope_type:
            query = query.where(model.scope_type == scope_type)
        if scope_id:
            query = query.where(model.scope_id == scope_id)
        result = await db.execute(query.limit(limit_per_type))
        return list(result.scalars().all())

    @staticmethod
    async def _search_events(db, term, limit_per_type, scope_type, scope_id, load_options=()):
        query = Event.active_query().where(
            Event.is_public.is_(True),
            Event.archived_at.is_(None),
            ilike_any(term, Event.title, Event.summary, Event.plain_text, Event.rich_text, Event.location),
        )
        if load_options:
            query = query.options(*load_options)
        if scope_type:
            query = query.where(Event.scope_type == scope_type)
        if scope_id:
            query = query.where(Event.scope_id == scope_id)
        result = await db.execute(query.limit(limit_per_type))
        return list(result.scalars().all())

    @staticmethod
    async def _search_people(db, term, limit_per_type, load_options=()):
        query = (
            select(Person)
            .where(
                Person.deleted_at.is_(None),
                Person.is_active.is_(True),
                Person.is_public.is_(True),
                ilike_any(term, Person.full_name, Person.email, Person.bio, Person.specialization),
            )
            .limit(limit_per_type)
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def _search_schools(db, term, limit_per_type, load_options=()):
        query = (
            select(School)
            .where(
                School.deleted_at.is_(None),
                School.is_active.is_(True),
                School.is_public.is_(True),
                ilike_any(term, School.name, School.code, School.about, School.head_message, School.mission),
            )
            .limit(limit_per_type)
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def _search_departments(db, term, limit_per_type, load_options=()):
        query = (
            select(Department)
            .where(
                Department.deleted_at.is_(None),
                Department.is_active.is_(True),
                ilike_any(term, Department.name, Department.code, Department.about, Department.head_message, Department.mission),
            )
            .limit(limit_per_type)
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return list(result.scalars().all())
