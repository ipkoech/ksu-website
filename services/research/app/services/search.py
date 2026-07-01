"""Unified public search across research-owned records."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import date, datetime, timezone
from typing import Any

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    Consultancy,
    EndowmentFund,
    ExpertiseTag,
    FocusArea,
    Funding,
    Grant,
    GrantGuideline,
    ImpactMetric,
    Innovation,
    Journal,
    MentorshipProgram,
    Partner,
    Publication,
    ResearchCenter,
    ResearchFarm,
    ResearchGuideline,
    ResearchOutput,
    ResearchProgram,
    ResearchProject,
    ResearchResource,
    ResearchService,
    ResearchTheme,
    Scholarship,
    SuccessStory,
    Sustainability,
    TrainingProgram,
)


PUBLIC_STATUSES = {
    "published",
    "active",
    "available",
    "open",
    "ongoing",
    "upcoming",
    "approved",
    "completed",
    "closed",
    "awarded",
    "building",
}


@dataclass(frozen=True)
class ResearchSearchArea:
    key: str
    label: str
    model: type
    route: str
    title_fields: tuple[str, ...]
    description_fields: tuple[str, ...]
    search_fields: tuple[str, ...]
    date_fields: tuple[str, ...] = ("published_at", "created_at")
    metadata_fields: tuple[str, ...] = ()
    order_fields: tuple[str, ...] = ("display_order", "created_at")


RESEARCH_SEARCH_AREAS = (
    ResearchSearchArea(
        "projects",
        "Project",
        ResearchProject,
        "/projects",
        ("title", "name"),
        ("summary", "abstract", "description"),
        ("title", "code", "summary", "abstract", "status"),
        ("start_date", "published_at", "created_at"),
        ("project_type", "status", "center_id", "program_id", "grant_id", "farm_id"),
    ),
    ResearchSearchArea(
        "publications",
        "Publication",
        Publication,
        "/publications",
        ("title",),
        ("abstract", "journal_name", "publisher"),
        ("title", "journal_name", "publisher", "doi", "abstract", "conference_name", "book_title"),
        ("publication_date", "created_at"),
        ("publication_type", "year", "doi", "is_open_access", "access_type", "citation_count"),
    ),
    ResearchSearchArea(
        "grants",
        "Grant",
        Grant,
        "/funding",
        ("title", "name"),
        ("summary", "description", "eligibility"),
        ("title", "code", "summary", "description", "objectives", "eligibility", "focus_areas", "funder_name"),
        ("deadline", "open_date", "announcement_date", "created_at"),
        ("grant_type", "category", "status", "funder_id", "funder_name", "currency", "max_award"),
    ),
    ResearchSearchArea(
        "centers",
        "Center",
        ResearchCenter,
        "/centers",
        ("name", "title"),
        ("about", "mission", "research_areas", "mandate"),
        ("name", "code", "acronym", "about", "mission", "objectives", "mandate", "research_areas", "location"),
        ("established_date", "created_at"),
        ("center_type", "location", "school_id", "department_id"),
    ),
    ResearchSearchArea(
        "facilities",
        "Facility",
        ResearchFarm,
        "/facilities",
        ("name", "title"),
        ("about", "activities", "facilities", "products"),
        ("name", "code", "about", "activities", "products", "facilities", "location", "county"),
        ("created_at",),
        ("farm_type", "location", "county", "center_id"),
    ),
    ResearchSearchArea(
        "programs",
        "Program",
        ResearchProgram,
        "/programs",
        ("name", "title"),
        ("summary", "description", "objectives"),
        ("name", "code", "summary", "description", "objectives", "expected_outcomes", "methodology", "status"),
        ("start_date", "created_at"),
        ("status", "center_id", "currency", "budget"),
    ),
    ResearchSearchArea(
        "themes",
        "Theme",
        ResearchTheme,
        "/themes",
        ("name", "title"),
        ("description",),
        ("name", "code", "description"),
        ("created_at",),
        ("theme_type", "category", "status"),
    ),
    ResearchSearchArea(
        "focus_areas",
        "Focus Area",
        FocusArea,
        "/focus-areas",
        ("name", "title"),
        ("description",),
        ("name", "code", "description", "keywords"),
        ("created_at",),
        ("category", "status"),
    ),
    ResearchSearchArea(
        "expertise_tags",
        "Expertise Tag",
        ExpertiseTag,
        "/expertise",
        ("name", "title"),
        ("description",),
        ("name", "description", "category"),
        ("created_at",),
        ("category", "usage_count"),
    ),
    ResearchSearchArea(
        "journals",
        "Journal",
        Journal,
        "/publications",
        ("name", "title"),
        ("description", "scope", "publisher"),
        ("name", "abbreviation", "issn", "eissn", "publisher", "description", "scope"),
        ("created_at",),
        ("is_open_access", "is_university_journal", "quartile", "h_index"),
    ),
    ResearchSearchArea(
        "funders",
        "Funder",
        Funding,
        "/funding",
        ("name", "title"),
        ("description", "funding_areas"),
        ("name", "code", "description", "funding_areas", "funder_type", "country"),
        ("created_at",),
        ("funder_type", "country", "website"),
    ),
    ResearchSearchArea(
        "endowments",
        "Endowment",
        EndowmentFund,
        "/endowments",
        ("name", "title"),
        ("description", "purpose"),
        ("name", "code", "description", "purpose", "category"),
        ("created_at",),
        ("category", "status", "is_accepting_contributions"),
    ),
    ResearchSearchArea(
        "innovations",
        "Innovation",
        Innovation,
        "/innovations",
        ("title", "name"),
        ("summary", "description", "solution"),
        ("title", "code", "summary", "description", "solution", "category", "innovation_type"),
        ("created_at",),
        ("innovation_type", "category", "development_stage", "ip_status", "commercialization_status"),
    ),
    ResearchSearchArea(
        "outputs",
        "Output",
        ResearchOutput,
        "/outputs",
        ("title", "name"),
        ("summary", "description"),
        ("title", "summary", "description", "output_type", "doi"),
        ("created_at",),
        ("output_type", "doi", "project_id", "center_id"),
    ),
    ResearchSearchArea(
        "partners",
        "Partner",
        Partner,
        "/partners",
        ("name", "title"),
        ("about", "collaboration_areas"),
        ("name", "acronym", "about", "country", "partner_type", "collaboration_areas"),
        ("partnership_start_date", "created_at"),
        ("partner_type", "partnership_level", "country", "website"),
    ),
    ResearchSearchArea(
        "consultancies",
        "Consultancy",
        Consultancy,
        "/consultancies",
        ("title", "name"),
        ("summary", "description", "client_name"),
        ("title", "code", "client_name", "summary", "description", "consultancy_type"),
        ("start_date", "created_at"),
        ("consultancy_type", "client_type", "status", "center_id", "partner_id"),
    ),
    ResearchSearchArea(
        "training",
        "Training",
        TrainingProgram,
        "/training",
        ("title", "name"),
        ("summary", "description", "target_audience"),
        ("title", "code", "summary", "description", "target_audience", "training_type", "delivery_mode"),
        ("start_date", "created_at"),
        ("training_type", "delivery_mode", "status", "center_id"),
    ),
    ResearchSearchArea(
        "mentorship",
        "Mentorship",
        MentorshipProgram,
        "/mentorship",
        ("title", "name"),
        ("summary", "description", "target_audience"),
        ("title", "summary", "description", "target_audience", "mentorship_type"),
        ("start_date", "created_at"),
        ("mentorship_type", "status", "center_id"),
    ),
    ResearchSearchArea(
        "scholarships",
        "Scholarship",
        Scholarship,
        "/scholarships",
        ("title", "name"),
        ("summary", "description", "eligibility"),
        ("title", "code", "summary", "description", "eligibility", "scholarship_type"),
        ("deadline", "created_at"),
        ("scholarship_type", "status", "currency", "amount"),
    ),
    ResearchSearchArea(
        "resources",
        "Resource",
        ResearchResource,
        "/resources-tools",
        ("name", "title"),
        ("description",),
        ("name", "code", "description", "category", "resource_type"),
        ("created_at",),
        ("resource_type", "category", "access_type", "center_id"),
    ),
    ResearchSearchArea(
        "services",
        "Service",
        ResearchService,
        "/services",
        ("name", "title"),
        ("summary", "description"),
        ("name", "code", "summary", "description", "category", "service_type"),
        ("created_at",),
        ("service_type", "category", "center_id"),
    ),
    ResearchSearchArea(
        "guidelines",
        "Guideline",
        ResearchGuideline,
        "/guidelines",
        ("title", "name"),
        ("summary", "content"),
        ("title", "code", "summary", "content", "category", "guideline_type"),
        ("effective_date", "created_at"),
        ("guideline_type", "category", "status", "is_required"),
    ),
    ResearchSearchArea(
        "grant_guidelines",
        "Grant Guideline",
        GrantGuideline,
        "/guidelines",
        ("title", "name"),
        ("content", "guideline_type"),
        ("title", "content", "guideline_type", "document_name"),
        ("created_at",),
        ("guideline_type", "grant_id", "is_required"),
    ),
    ResearchSearchArea(
        "stories",
        "Story",
        SuccessStory,
        "/community-impact",
        ("title", "name"),
        ("summary", "story"),
        ("title", "summary", "story", "story_type", "beneficiary"),
        ("story_date", "created_at"),
        ("story_type", "beneficiary", "project_id", "center_id"),
    ),
    ResearchSearchArea(
        "impact_metrics",
        "Impact Metric",
        ImpactMetric,
        "/impact-metrics",
        ("name", "title"),
        ("description", "metric_type"),
        ("name", "description", "metric_type", "category", "unit"),
        ("measurement_date", "created_at"),
        ("metric_type", "category", "value", "unit"),
    ),
    ResearchSearchArea(
        "sustainability",
        "Sustainability Initiative",
        Sustainability,
        "/sustainability",
        ("title", "name"),
        ("summary", "description"),
        ("title", "summary", "description", "initiative_type", "sdg_goals"),
        ("start_date", "created_at"),
        ("initiative_type", "status", "center_id"),
    ),
)

SEARCH_AREA_BY_KEY = {area.key: area for area in RESEARCH_SEARCH_AREAS}


def _term(query: str) -> str:
    return f"%{query.strip()}%"


def _compact(value: object | None) -> str | None:
    if value is None:
        return None
    if isinstance(value, (dict, list, tuple, set)):
        text = " ".join(str(item) for item in value) if not isinstance(value, dict) else " ".join(str(item) for item in value.values())
    else:
        text = str(value)
    text = " ".join(text.split())
    return text or None


def _first_text(item: Any, fields: tuple[str, ...]) -> str | None:
    for field in fields:
        if hasattr(item, field) and (text := _compact(getattr(item, field))):
            return text[:500]
    return None


def _selected_areas(types: str | None) -> list[ResearchSearchArea]:
    if not types:
        return list(RESEARCH_SEARCH_AREAS)
    requested = {item.strip() for item in types.split(",") if item.strip()}
    return [area for area in RESEARCH_SEARCH_AREAS if area.key in requested]


def _search_predicate(area: ResearchSearchArea, term: str):
    predicates = []
    for field in area.search_fields:
        if not hasattr(area.model, field):
            continue
        column = getattr(area.model, field)
        predicates.append(sa.cast(column, sa.String).ilike(term))
    return sa.or_(*predicates) if predicates else None


def _apply_visibility(statement, model: type):
    now = datetime.now(timezone.utc)
    today = date.today()

    if hasattr(model, "deleted_at"):
        statement = statement.where(getattr(model, "deleted_at").is_(None))
    if hasattr(model, "is_public"):
        statement = statement.where(getattr(model, "is_public").is_(True))
    if hasattr(model, "is_active"):
        statement = statement.where(getattr(model, "is_active").is_(True))
    if hasattr(model, "status"):
        statement = statement.where(getattr(model, "status").in_(PUBLIC_STATUSES))
    if hasattr(model, "published_at"):
        published_at = getattr(model, "published_at")
        statement = statement.where(sa.or_(published_at.is_(None), published_at <= now))
    if hasattr(model, "starts_at"):
        starts_at = getattr(model, "starts_at")
        statement = statement.where(sa.or_(starts_at.is_(None), starts_at <= now))
    if hasattr(model, "ends_at"):
        ends_at = getattr(model, "ends_at")
        statement = statement.where(sa.or_(ends_at.is_(None), ends_at >= now))
    if hasattr(model, "publish_date"):
        publish_date = getattr(model, "publish_date")
        statement = statement.where(sa.or_(publish_date.is_(None), publish_date <= today))
    if hasattr(model, "expiry_date"):
        expiry_date = getattr(model, "expiry_date")
        statement = statement.where(sa.or_(expiry_date.is_(None), expiry_date >= today))
    return statement


def _apply_order(statement, area: ResearchSearchArea):
    order_columns = []
    if hasattr(area.model, "is_featured"):
        order_columns.append(getattr(area.model, "is_featured").desc())
    for field in area.order_fields:
        if not hasattr(area.model, field):
            continue
        column = getattr(area.model, field)
        order_columns.append(column.desc() if field.endswith("_at") else column.asc())
    return statement.order_by(*order_columns) if order_columns else statement


def _date_value(item: Any, fields: tuple[str, ...]) -> str | None:
    for field in fields:
        if not hasattr(item, field):
            continue
        value = getattr(item, field)
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        if value is not None:
            return str(value)
    return None


def _metadata(item: Any, fields: tuple[str, ...]) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    for field in fields:
        if not hasattr(item, field):
            continue
        value = getattr(item, field)
        if value is None:
            continue
        if isinstance(value, (datetime, date)):
            payload[field] = value.isoformat()
        else:
            payload[field] = str(value)
    return payload


def _href(area: ResearchSearchArea, item: Any) -> str:
    slug = getattr(item, "slug", None)
    if slug:
        return f"{area.route}/{slug}"
    return f"{area.route}?record={getattr(item, 'id')}"


def _result(area: ResearchSearchArea, item: Any) -> dict[str, Any]:
    return {
        "id": str(getattr(item, "id")),
        "type": area.key,
        "title": _first_text(item, area.title_fields) or area.label,
        "description": _first_text(item, area.description_fields),
        "url": _href(area, item),
        "date": _date_value(item, area.date_fields),
        "status": _compact(getattr(item, "status", None)),
        "is_featured": bool(getattr(item, "is_featured", False)),
        "metadata": {"label": area.label, **_metadata(item, area.metadata_fields)},
    }


async def unified_research_search(
    db: AsyncSession,
    *,
    query: str,
    types: str | None = None,
    limit: int = 60,
) -> dict[str, Any]:
    areas = _selected_areas(types)
    if not query.strip() or not areas:
        return {"query": query, "total": 0, "results": [], "by_type": {}}

    term = _term(query)
    per_type = max(3, min(12, limit // max(1, len(areas)) + 1))
    results: list[dict[str, Any]] = []

    for area in areas:
        predicate = _search_predicate(area, term)
        if predicate is None:
            continue
        statement = area.model.active_query().where(predicate)
        statement = _apply_visibility(statement, area.model)
        statement = _apply_order(statement, area).limit(per_type)
        rows = (await db.execute(statement)).scalars().all()
        results.extend(_result(area, row) for row in rows)

    results = results[:limit]
    by_type = dict(Counter(result["type"] for result in results))
    return {
        "query": query,
        "total": len(results),
        "results": results,
        "by_type": by_type,
    }
