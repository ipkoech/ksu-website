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


def model_for_resource(resource: str) -> type[Any]:
    try:
        return RESOURCE_MODELS[resource]
    except KeyError as exc:
        raise ValueError(f"Unknown HERI resource: {resource}") from exc


def writable_fields(model: type[Any]) -> set[str]:
    return {column.name for column in model.__table__.columns if column.name not in {"id", "created_at", "updated_at", "deleted_at"}}
