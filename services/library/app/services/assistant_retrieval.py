"""Approved-source retrieval for the Library assistant."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import LibraryAssistantContext
from ..services.search import unified_search


async def retrieve_approved_sources(
    db: AsyncSession,
    context: LibraryAssistantContext,
    *,
    query: str,
    page_context: dict[str, Any] | None = None,
    limit: int = 12,
) -> list[dict[str, Any]]:
    """Search public Library records and keep only context-approved sources."""

    limit = min(max(limit, 1), 40)
    allowed_types = set(context.allowed_source_types or [])
    approved = {
        (source.source_type, source.source_id): source
        for source in context.sources
        if source.deleted_at is None and source.is_approved
        and (not allowed_types or source.source_type in allowed_types)
    }
    if not approved:
        return []

    source_types = {source_type for source_type, _ in approved}
    search_query = query.strip()
    if page_context and page_context.get("title"):
        search_query = f"{search_query} {page_context['title']}"
    result = await unified_search(
        db,
        query=search_query,
        types=",".join(sorted(source_types)),
        library_id=context.library_id,
        limit=limit,
    )

    sources: list[dict[str, Any]] = []
    seen = set()
    for item in result.get("results", []):
        try:
            key = (str(item["type"]), uuid.UUID(str(item["id"])))
        except (KeyError, TypeError, ValueError):
            continue
        approved_source = approved.get(key)
        if approved_source is None or key in seen:
            continue
        seen.add(key)
        sources.append(
            {
                "source_type": approved_source.source_type,
                "source_id": approved_source.source_id,
                "title": item.get("title") or "Library source",
                "url": item.get("url"),
                "snippet": item.get("description"),
                "metadata": item.get("metadata", {}),
            }
        )
        if len(sources) >= limit:
            break
    return sources
