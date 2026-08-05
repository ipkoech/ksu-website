from __future__ import annotations

from typing import Any

from ..models.analytics import AnalyticsEvent
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
    "analytics": AnalyticsEvent,
    "social-publications": SocialPublication,
}

READ_ONLY_RESOURCES = {"analytics"}

#: Columns the generic CRUD must never accept from a client because another
#: pipeline owns them — the upload endpoint writes media file identity, and the
#: public submission endpoint writes what the visitor actually sent.
SERVER_MANAGED_FIELDS: dict[type[Any], frozenset[str]] = {
    MediaAsset: frozenset(
        {"storage_path", "file_hash", "file_size", "mime_type", "file_name", "public_url"}
    ),
}

#: Resources where only an explicit allowlist is writable. Submissions are a
#: record of what a visitor sent, so staff may triage them but not rewrite them.
WRITABLE_ALLOWLIST: dict[type[Any], frozenset[str]] = {
    Submission: frozenset({"status", "internal_notes"}),
}

_ALWAYS_PROTECTED = frozenset({"id", "created_at", "updated_at", "deleted_at"})


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
    protected = _ALWAYS_PROTECTED | SERVER_MANAGED_FIELDS.get(model, frozenset())
    return columns - protected
