from __future__ import annotations

from typing import Any
from functools import lru_cache

from fastapi import HTTPException
from pydantic import TypeAdapter, ValidationError
from sqlalchemy import DateTime, JSON, String

from ..models.analytics import AnalyticsEvent
from ..models.chair import ChairProfile
from ..models.content import Event, FooterLink, HeroSlide, ImpactMetric, NavigationItem, NewsArticle, Opportunity, Page, PageSection, ResearchPublication, ResearchProject, ResearchTheme, SiteSettings
from ..models.media import MediaAsset
from ..models.people import TeamMember
from ..models.partners import Partner
from ..models.social import SocialPublication
from ..models.submissions import Submission

RESOURCE_MODELS: dict[str, type[Any]] = {
    "pages": Page,
    "page-sections": PageSection,
    "news": NewsArticle,
    "events": Event,
    "opportunities": Opportunity,
    "themes": ResearchTheme,
    "projects": ResearchProject,
    "publications": ResearchPublication,
    "impact-metrics": ImpactMetric,
    "team": TeamMember,
    "partners": Partner,
    "submissions": Submission,
    "media": MediaAsset,
    "navigation": NavigationItem,
    "hero-slides": HeroSlide,
    "footer": FooterLink,
    "site-settings": SiteSettings,
    "chair-profiles": ChairProfile,
    "analytics": AnalyticsEvent,
    "social-publications": SocialPublication,
}

READ_ONLY_RESOURCES = {"analytics"}

#: Columns the generic CRUD must never accept from a client because another
#: pipeline owns them — the upload endpoint writes media file identity, and the
#: public submission endpoint writes what the visitor actually sent.
SERVER_MANAGED_FIELDS: dict[type[Any], frozenset[str]] = {
    Partner: frozenset({"research_partner_id", "research_center_id", "research_center_slug"}),
    MediaAsset: frozenset(
        {"storage_path", "file_hash", "file_size", "mime_type", "file_name", "public_url"}
    ),
}

PARTNER_RESEARCH_FIELDS = frozenset({
    "slug", "name", "description", "about", "logo_url", "website_url", "country",
    "partner_type", "partnership_level", "relationship_status", "is_active", "is_featured",
})


def require_local_fields(record, values):
    if isinstance(record, Partner) and record.research_partner_id is not None:
        changed = [key for key in values if key in PARTNER_RESEARCH_FIELDS
                   and values[key] != getattr(record, key)]
        if changed:
            raise HTTPException(422, "Research maintains these partner fields: " + ", ".join(sorted(changed)))

#: Resources where only an explicit allowlist is writable. Submissions are a
#: record of what a visitor sent, so staff may triage them but not rewrite them.
WRITABLE_ALLOWLIST: dict[type[Any], frozenset[str]] = {
    Submission: frozenset({"status", "internal_notes"}),
}

_ALWAYS_PROTECTED = frozenset({"id", "created_at", "updated_at", "deleted_at"})
# Publication state is owned by WorkflowService. Generic CRUD must never
# mutate it under the broad content.write capability.
_WORKFLOW_MANAGED_FIELDS = frozenset({"status"})


def model_for_resource(resource: str) -> type[Any]:
    try:
        return RESOURCE_MODELS[resource]
    except KeyError as exc:
        raise ValueError(f"Unknown HERI resource: {resource}") from exc


def writable_fields(model: type[Any]) -> set[str]:
    allowlist = WRITABLE_ALLOWLIST.get(model)
    columns = {column.name for column in model.__table__.columns}
    if allowlist is not None:
        return columns & allowlist
    protected = (
        _ALWAYS_PROTECTED
        | _WORKFLOW_MANAGED_FIELDS
        | SERVER_MANAGED_FIELDS.get(model, frozenset())
    )
    return columns - protected


@lru_cache(maxsize=64)
def _field_adapter(python_type):
    return TypeAdapter(python_type)


def validated_values(model, payload):
    """Parse scalar wire values using the owning model's persistence types."""
    values = {key: value for key, value in payload.items() if key in writable_fields(model)}
    for key, value in values.items():
        column = model.__table__.columns[key]
        if value is None:
            if not column.nullable:
                raise HTTPException(422, f"{key} cannot be null")
            continue
        if isinstance(column.type, JSON):
            # Structured content retains its existing JSON shape; domain-specific
            # validation belongs to each content schema, not scalar coercion.
            continue
        try:
            python_type = column.type.python_type
            parsed = _field_adapter(python_type).validate_python(
                value, strict=python_type in {str, bool, int, float},
            )
            if isinstance(column.type, String) and column.type.length and len(parsed) > column.type.length:
                raise ValueError("too long")
            if isinstance(column.type, DateTime) and column.type.timezone and parsed.utcoffset() is None:
                raise ValueError("timezone required")
        except (ValueError, TypeError, ValidationError) as exc:
            raise HTTPException(422, f"Invalid value for {key}") from exc
        values[key] = parsed
    return values


def reject_protected_fields(model, payload: dict[str, object], *, allow: set[str] | None = None) -> None:
    """Reject client attempts to mutate fields owned by another pipeline."""
    protected = (_ALWAYS_PROTECTED | _WORKFLOW_MANAGED_FIELDS | SERVER_MANAGED_FIELDS.get(model, frozenset())) - (allow or set())
    attempted = sorted(set(payload) & protected)
    if attempted:
        raise HTTPException(422, "Protected fields cannot be changed: " + ", ".join(attempted))
