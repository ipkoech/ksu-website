"""Server-side capability resolution for the Corporate Communication portal.

Mirrors ``school_portal_context`` but for the global (non entity-scoped)
Corporate Communication admin portal: capabilities and allowed navigation are
derived from the authenticated user's active role permissions using the same
wildcard-aware resolution (`_has_permission`) the rest of the API relies on.
"""

from __future__ import annotations

from ..deps import _has_permission, permissions_for_user
from ..models import User

#: Every real action the Corporate Communication portal exposes, derived from
#: the portal's nav + resource scopes in the admin registry
#: (frontend/apps/admin/src/lib/portals/registry.ts, "corporate-communication").
CORPORATE_PORTAL_CAPABILITIES = (
    "about.manage",
    "audit.view",
    "clubs.manage_own",
    "clubs.view",
    "content.manage",
    "content.manage_announcements",
    "content.manage_blogs",
    "content.manage_events",
    "content.manage_news",
    "content.manage_pages",
    "content.manage_stories",
    "content.publish",
    "content.review",
    "content.submit",
    "content.view",
    "homepage.manage",
    "homepage.view",
    "life_around_studies.manage",
    "life_around_studies.publish",
    "life_around_studies.review",
    "life_around_studies.view",
    "marketing.manage_newsletters",
    "marketing.manage_sliders",
    "media.manage",
    "media.view",
    "office.manage_content",
    "page_sections.manage",
    "page_sections.view",
    "partnership_spotlights.manage",
    "policy.manage",
    "policy.view",
    "section_items.manage",
    "support.manage_contacts",
    "vc_hub.manage",
    "vc_hub.publish",
    "vc_hub.review",
    "vc_hub.view",
)

#: Stable navigation keys matching the portal registry's top-level nav items.
#: A key is allowed when the user holds any of its scopes (union of the nav
#: group's own scopes and its children's scopes).
CORPORATE_PORTAL_NAVIGATION = (
    ("dashboard", ("content.view",)),
    ("review-queue", ("content.review", "content.publish")),
    (
        "records",
        (
            "policy.view",
            "policy.manage",
            "content.manage_pages",
            "office.manage_content",
        ),
    ),
    (
        "website-content",
        (
            "page_sections.view",
            "page_sections.manage",
            "homepage.view",
            "homepage.manage",
            "partnership_spotlights.manage",
            "about.manage",
            "marketing.manage_sliders",
            "vc_hub.view",
            "vc_hub.manage",
            "vc_hub.review",
            "vc_hub.publish",
        ),
    ),
    (
        "newsroom",
        (
            "content.manage_news",
            "content.manage_blogs",
            "content.manage_stories",
            "content.manage_announcements",
            "content.manage_events",
        ),
    ),
    ("media", ("media.view", "media.manage", "marketing.manage_sliders")),
    (
        "engagement",
        (
            "content.manage",
            "marketing.manage_newsletters",
            "support.manage_contacts",
        ),
    ),
    (
        "student-life",
        (
            "content.review",
            "clubs.view",
            "clubs.manage_own",
            "life_around_studies.view",
            "life_around_studies.manage",
            "life_around_studies.review",
            "life_around_studies.publish",
            "homepage.manage",
            "section_items.manage",
        ),
    ),
    ("oversight", ("audit.view", "content.view")),
)


def corporate_portal_capabilities(user: User) -> dict[str, bool]:
    """Map every portal capability to whether the user's grants allow it."""
    granted = permissions_for_user(user)
    return {
        capability: _has_permission(granted, capability)
        for capability in CORPORATE_PORTAL_CAPABILITIES
    }


def allowed_corporate_navigation(capabilities: dict[str, bool]) -> list[str]:
    """Return the nav keys whose scope requirements are satisfied."""
    return [
        key
        for key, scopes in CORPORATE_PORTAL_NAVIGATION
        if any(capabilities.get(scope, False) for scope in scopes)
    ]


__all__ = [
    "CORPORATE_PORTAL_CAPABILITIES",
    "CORPORATE_PORTAL_NAVIGATION",
    "allowed_corporate_navigation",
    "corporate_portal_capabilities",
]
