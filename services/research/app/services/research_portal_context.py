"""Research Portal bootstrap context.

The admin app previously decided the Research Portal's navigation and button
states entirely client-side, from whatever permissions happened to be in the
JWT. This module makes the server the authority, matching how the School and
Corporate portals already work:

* :data:`RESEARCH_PORTAL_CAPABILITIES` is the closed set of permissions the
  portal understands. Anything outside it cannot leak into the UI.
* :func:`research_portal_capabilities` answers "may I?" for each one.
* :func:`allowed_research_navigation` returns the nav keys the caller may see,
  so the sidebar is filtered by the server rather than by the browser.

The navigation keys below mirror ``navKey`` in the admin portal registry
(``frontend/apps/admin/src/lib/portals/registry.ts``); the two lists must stay
in step or a section will be authorised but unreachable.
"""

from __future__ import annotations

from dataclasses import dataclass

from ksu_common.auth import TokenPayload
from ksu_contracts.rbac import authorize_permission

from .research_domains import (
    DOMAIN_DEFINITIONS,
    caller_domains,
    has_global_research_authority,
)

#: Every permission the Research Portal understands. Kept explicit (rather than
#: derived) so an unrelated grant can never widen the portal's surface.
RESEARCH_PORTAL_CAPABILITIES: tuple[str, ...] = (
    # Core research
    "research.view",
    "research.view_projects",
    "research.manage_projects",
    "research.manage_centers",
    "research.manage_impact",
    "research.manage_reports",
    "research.manage_resources",
    "research.manage_services",
    "research.manage_guidelines",
    "research.submit",
    "research.review",
    "research.publish",
    # Classification
    "research_theme.view",
    "research_theme.manage",
    "research_program.view",
    "research_program.manage",
    # Farm domain
    "farm.view",
    "farm.manage",
    "farm.submit",
    "farm.review",
    "farm.publish",
    "farm.bulk",
    # Sustainability domain
    "sustainability.view",
    "sustainability.manage",
    "sustainability.submit",
    "sustainability.review",
    "sustainability.publish",
    "sustainability.bulk",
    # Funding
    "funding.manage",
    "funding.approve",
    "donations.view",
    "donations.manage",
    # Publications & innovation
    "publications.view",
    "publications.manage",
    "publications.submit",
    "publications.approve",
    "innovation.manage_startups",
    "innovation.manage_competitions",
    "innovation.manage_transfers",
    "innovation.review_disclosure",
    # Partnerships & content
    "partnerships.view",
    "partnerships.manage",
    "partnerships.manage_partners",
    "content.view",
    "content.view_drafts",
    "content.manage_news",
    "content.manage_blogs",
    "content.manage_events",
    "content.manage_announcements",
    "marketing.manage_sliders",
    # Supporting
    "media.upload",
    "analytics.view",
    "audit.view",
    "persons.view",
    "staff.manage",
)

#: ``(nav_key, required_scopes)`` — a key is shown when the caller holds ANY of
#: its scopes. Keys match ``navKey`` in the admin portal registry.
RESEARCH_PORTAL_NAVIGATION: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("dashboard", ("research.view",)),
    # Core
    ("projects", ("research.view_projects", "research.manage_projects")),
    ("centers", ("research.view", "research.manage_centers")),
    ("programs", ("research_program.view", "research_program.manage")),
    ("themes", ("research_theme.view", "research_theme.manage")),
    # Grants & funding
    ("grants", ("funding.manage",)),
    ("grant-applications", ("funding.manage",)),
    ("grant-reviews", ("funding.manage", "funding.approve")),
    ("grant-reports", ("research.manage_reports",)),
    ("grant-guidelines", ("funding.manage",)),
    ("funders", ("funding.manage",)),
    ("donations", ("donations.view", "donations.manage")),
    # Innovation & output
    ("innovations", ("innovation.review_disclosure",)),
    ("startups", ("innovation.manage_startups",)),
    ("incubation", ("innovation.manage_startups",)),
    ("competitions", ("innovation.manage_competitions",)),
    ("transfers", ("innovation.manage_transfers",)),
    ("publications", ("publications.view", "publications.manage")),
    ("outputs", ("research.manage_reports",)),
    ("reports", ("research.manage_reports",)),
    ("impact", ("research.manage_impact", "sustainability.view")),
    # Partnerships & services
    ("partnerships", ("partnerships.view", "partnerships.manage_partners")),
    ("resources", ("research.manage_resources",)),
    ("services", ("research.manage_services",)),
    ("guidelines", ("research.manage_guidelines",)),
    # Content
    ("content-news", ("content.manage_news",)),
    ("content-blogs", ("content.manage_blogs",)),
    ("content-announcements", ("content.manage_announcements",)),
    ("content-events", ("content.manage_events",)),
    ("content-sliders", ("marketing.manage_sliders",)),
    # Research farm
    ("farm-overview", ("farm.view",)),
    ("farm-sites", ("farm.view",)),
    ("farm-projects", ("farm.view",)),
    ("farm-partners", ("farm.view",)),
    ("farm-activities", ("farm.view",)),
    ("farm-impact-stories", ("farm.view",)),
    ("farm-focus-areas", ("farm.view",)),
    # Sustainability
    ("sustainability-overview", ("sustainability.view",)),
    ("sustainability-projects", ("sustainability.view",)),
    ("sustainability-partners", ("sustainability.view",)),
    ("sustainability-activities", ("sustainability.view",)),
    # Administration
    ("settings", ("research.view",)),
    ("settings-profile", ("research.view",)),
    ("settings-staff", ("staff.manage", "persons.view")),
    ("settings-services", ("research.manage_services",)),
    ("settings-resources", ("research.manage_resources",)),
    ("settings-guidelines", ("research.manage_guidelines",)),
    ("audit", ("audit.view",)),
)


@dataclass(frozen=True, slots=True)
class ResearchPortalContext:
    """Everything the portal shell needs to render for one caller."""

    capabilities: dict[str, bool]
    allowed_navigation: list[str]
    domains: list[str]
    is_global: bool
    can_review: bool
    can_publish: bool


def research_portal_capabilities(user: TokenPayload) -> dict[str, bool]:
    """Map every portal capability to whether this caller holds it."""
    return {
        capability: authorize_permission(user, capability).allowed
        for capability in RESEARCH_PORTAL_CAPABILITIES
    }


def allowed_research_navigation(capabilities: dict[str, bool]) -> list[str]:
    """Return the nav keys whose scope requirements are satisfied."""
    return [
        key
        for key, scopes in RESEARCH_PORTAL_NAVIGATION
        if any(capabilities.get(scope, False) for scope in scopes)
    ]


def _any(capabilities: dict[str, bool], *names: str) -> bool:
    return any(capabilities.get(name, False) for name in names)


def _publish_permissions() -> list[str]:
    return ["research.publish"] + [
        definition.publish_permission() for definition in DOMAIN_DEFINITIONS.values()
    ]


def caller_can_publish(user: TokenPayload | None) -> bool:
    """True when this caller may put a record straight onto the public site.

    Used by the CRUD router to decide whether a new record is published
    immediately or held for review.
    """
    if user is None:
        return False
    return any(
        authorize_permission(user, permission).allowed
        for permission in _publish_permissions()
    )


def build_research_portal_context(user: TokenPayload) -> ResearchPortalContext:
    """Resolve the caller's portal context from their signed grants."""
    capabilities = research_portal_capabilities(user)
    domains = caller_domains(user)
    is_global = has_global_research_authority(user)

    review_permissions = ["research.review"] + [
        f"{definition.namespace}.review" for definition in DOMAIN_DEFINITIONS.values()
    ]

    return ResearchPortalContext(
        capabilities=capabilities,
        allowed_navigation=allowed_research_navigation(capabilities),
        domains=domains,
        is_global=is_global,
        can_review=_any(capabilities, *review_permissions),
        can_publish=_any(capabilities, *_publish_permissions()),
    )


__all__ = [
    "RESEARCH_PORTAL_CAPABILITIES",
    "RESEARCH_PORTAL_NAVIGATION",
    "ResearchPortalContext",
    "allowed_research_navigation",
    "build_research_portal_context",
    "research_portal_capabilities",
]
