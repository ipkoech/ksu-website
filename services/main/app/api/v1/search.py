"""Aggregated public search endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Query, Request

from ksu_common import cached_public, rate_limit
from ksu_common.field_selection import parse_field_selection
from ksu_common.schemas.responses import success

from ...deps import DbSession
from ...models import Announcement, Blog, Department, Event, News, Person, School
from ...services import SearchService
from ._fields import build_selector

router = APIRouter()


@router.get("")
@rate_limit(requests=30, window=60, prefix="main:search:ip")
@cached_public(
    timeout=120,
    vary_on=(
        "q",
        "scope_type",
        "scope_id",
        "limit_per_type",
        "news_fields",
        "news_include",
        "blogs_fields",
        "blogs_include",
        "announcements_fields",
        "announcements_include",
        "events_fields",
        "events_include",
        "persons_fields",
        "persons_include",
        "schools_fields",
        "schools_include",
        "departments_fields",
        "departments_include",
    ),
)
async def search(
    request: Request,
    db: DbSession,
    q: str = Query(..., min_length=2),
    limit_per_type: int = Query(5, ge=1, le=20),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    news_fields: str | None = Query(default=None),
    news_include: str | None = Query(default=None),
    blogs_fields: str | None = Query(default=None),
    blogs_include: str | None = Query(default=None),
    announcements_fields: str | None = Query(default=None),
    announcements_include: str | None = Query(default=None),
    events_fields: str | None = Query(default=None),
    events_include: str | None = Query(default=None),
    persons_fields: str | None = Query(default=None),
    persons_include: str | None = Query(default=None),
    schools_fields: str | None = Query(default=None),
    schools_include: str | None = Query(default=None),
    departments_fields: str | None = Query(default=None),
    departments_include: str | None = Query(default=None),
):
    selectors = {
        "news": build_selector(News, parse_field_selection(fields=news_fields, include=news_include)),
        "blogs": build_selector(Blog, parse_field_selection(fields=blogs_fields, include=blogs_include)),
        "announcements": build_selector(Announcement, parse_field_selection(fields=announcements_fields, include=announcements_include)),
        "events": build_selector(Event, parse_field_selection(fields=events_fields, include=events_include)),
        "persons": build_selector(Person, parse_field_selection(fields=persons_fields, include=persons_include)),
        "schools": build_selector(School, parse_field_selection(fields=schools_fields, include=schools_include)),
        "departments": build_selector(Department, parse_field_selection(fields=departments_fields, include=departments_include)),
    }
    result = await SearchService.search(
        db,
        q=q,
        limit_per_type=limit_per_type,
        scope_type=scope_type,
        scope_id=scope_id,
        load_options_by_type={key: selector.load_options for key, selector in selectors.items()},
    )
    result["results"] = {key: selectors[key].apply(items) for key, items in result["results"].items()}
    return success(data=result)
