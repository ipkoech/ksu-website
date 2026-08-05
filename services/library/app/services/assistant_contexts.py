"""Persistence and publication rules for Library assistant contexts."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import LibraryAssistantContext, LibraryAssistantContextSource
from ..schemas.assistant import (
    LibraryAssistantContextCreate,
    LibraryAssistantContextUpdate,
    LibraryAssistantSourceCreate,
)


def _source_out(source: LibraryAssistantContextSource) -> dict:
    return {
        "id": source.id,
        "context_id": source.context_id,
        "source_type": source.source_type,
        "source_id": source.source_id,
        "title": source.title,
        "public_url": source.public_url,
        "sort_order": source.sort_order,
        "is_approved": source.is_approved,
        "approved_by_person_id": source.approved_by_person_id,
        "approved_at": source.approved_at,
        "created_at": source.created_at,
        "updated_at": source.updated_at,
    }


def _context_data(context: LibraryAssistantContext) -> dict:
    return {
        "id": context.id,
        "library_id": context.library_id,
        "name": context.name,
        "slug": context.slug,
        "description": context.description,
        "audience": context.audience,
        "instructions": context.instructions,
        "allowed_source_types": context.allowed_source_types,
        "suggested_prompts": context.suggested_prompts,
        "escalation_guidance": context.escalation_guidance,
        "status": context.status,
        "is_public": context.is_public,
        "published_at": context.published_at,
        "sort_order": context.sort_order,
        "sources": [
            _source_out(source)
            for source in context.sources
            if source.deleted_at is None
        ],
        "created_at": context.created_at,
        "updated_at": context.updated_at,
    }


def _public_context_data(context: LibraryAssistantContext) -> dict:
    data = _context_data(context)
    data.pop("instructions", None)
    data.pop("status", None)
    data.pop("is_public", None)
    data.pop("published_at", None)
    data["sources"] = [source for source in data["sources"] if source["is_approved"]]
    return data


async def list_contexts(
    db: AsyncSession,
    *,
    public_only: bool,
    library_id: uuid.UUID | None = None,
    status_filter: str | None = None,
) -> list[dict]:
    query = (
        select(LibraryAssistantContext)
        .options(selectinload(LibraryAssistantContext.sources))
        .where(LibraryAssistantContext.deleted_at.is_(None))
    )
    if library_id is not None:
        query = query.where(LibraryAssistantContext.library_id == library_id)
    if public_only:
        query = query.where(
            LibraryAssistantContext.status == "active",
            LibraryAssistantContext.is_public.is_(True),
        )
    elif status_filter:
        query = query.where(LibraryAssistantContext.status == status_filter)
    query = query.order_by(LibraryAssistantContext.sort_order, LibraryAssistantContext.name)
    items = (await db.execute(query)).scalars().unique().all()
    serializer = _public_context_data if public_only else _context_data
    return [serializer(item) for item in items]


async def get_context(
    db: AsyncSession,
    context_id: uuid.UUID,
    *,
    public_only: bool,
) -> LibraryAssistantContext:
    query = (
        select(LibraryAssistantContext)
        .options(selectinload(LibraryAssistantContext.sources))
        .where(
            LibraryAssistantContext.id == context_id,
            LibraryAssistantContext.deleted_at.is_(None),
        )
    )
    if public_only:
        query = query.where(
            LibraryAssistantContext.status == "active",
            LibraryAssistantContext.is_public.is_(True),
        )
    context = (await db.execute(query)).scalars().unique().one_or_none()
    if context is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assistant context not found")
    return context


async def create_context(
    db: AsyncSession,
    data: LibraryAssistantContextCreate,
    *,
    approved_by_person_id: uuid.UUID,
) -> dict:
    context = LibraryAssistantContext(
        library_id=data.library_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        audience=data.audience,
        instructions=data.instructions,
        allowed_source_types=data.allowed_source_types,
        suggested_prompts=data.suggested_prompts,
        escalation_guidance=data.escalation_guidance,
        sort_order=data.sort_order,
        status="draft",
        is_public=False,
    )
    db.add(context)
    await db.flush()
    await replace_sources(db, context, data.sources, approved_by_person_id=approved_by_person_id)
    await db.refresh(context, attribute_names=["sources"])
    return _context_data(context)


async def update_context(
    db: AsyncSession,
    context: LibraryAssistantContext,
    data: LibraryAssistantContextUpdate,
    *,
    approved_by_person_id: uuid.UUID,
) -> dict:
    updates = data.model_dump(exclude_unset=True, exclude={"sources"})
    for key, value in updates.items():
        setattr(context, key, value)
    if data.sources is not None:
        await replace_sources(
            db, context, data.sources, approved_by_person_id=approved_by_person_id
        )
    if context.status == "active":
        context.status = "draft"
        context.is_public = False
        context.published_at = None
    await db.flush()
    await db.refresh(context, attribute_names=["sources"])
    return _context_data(context)


async def publish_context(
    db: AsyncSession,
    context: LibraryAssistantContext,
) -> dict:
    await db.refresh(context, attribute_names=["sources"])
    approved_sources = [source for source in context.sources if source.is_approved and source.deleted_at is None]
    if not approved_sources:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Assistant context needs at least one approved source before publishing",
        )
    context.status = "active"
    context.is_public = True
    context.published_at = datetime.now(timezone.utc)
    await db.flush()
    return _context_data(context)


async def archive_context(db: AsyncSession, context: LibraryAssistantContext) -> dict:
    context.status = "archived"
    context.is_public = False
    await db.flush()
    return _context_data(context)


async def replace_sources(
    db: AsyncSession,
    context: LibraryAssistantContext,
    sources: list[LibraryAssistantSourceCreate],
    *,
    approved_by_person_id: uuid.UUID,
) -> None:
    requested = {(source.source_type, source.source_id): source for source in sources}
    for existing in context.sources:
        key = (existing.source_type, existing.source_id)
        source = requested.get(key)
        if source is None:
            existing.is_approved = False
            continue
        existing.title = source.title
        existing.public_url = source.public_url
        existing.sort_order = source.sort_order
        existing.is_approved = True
        existing.approved_by_person_id = approved_by_person_id
        existing.approved_at = datetime.now(timezone.utc)
        requested.pop(key)
    for source in requested.values():
        context.sources.append(
            LibraryAssistantContextSource(
                source_type=source.source_type,
                source_id=source.source_id,
                title=source.title,
                public_url=source.public_url,
                sort_order=source.sort_order,
                is_approved=True,
                approved_by_person_id=approved_by_person_id,
                approved_at=datetime.now(timezone.utc),
            )
        )
