"""Native CRUD registration: one source of truth, no invented resource schemas.

The existing router builder registers the exact service, Pydantic classes and
write permission it uses. This module must not import routers or service barrels:
registration happens during application import and must remain cycle-free.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class NativeResource:
    key: str
    label: str
    service: Any
    create_schema: Any
    update_schema: Any
    write_permission: str
    public_read: bool
    public_create: bool


RESOURCES: dict[str, NativeResource] = {}


def register_resource(*, prefix: str, tag: str, service: Any, create_schema: Any,
                      update_schema: Any, write_scope: str, public_read: bool,
                      public_create: bool) -> None:
    key = prefix.strip("/")
    if not re.fullmatch(r"[a-z][a-z0-9]*(?:-[a-z0-9]+)*", key):
        raise ValueError(f"Unsupported workspace resource path: {prefix}")
    item = NativeResource(key, tag, service, create_schema, update_schema,
                          write_scope, public_read, public_create)
    previous = RESOURCES.get(key)
    if previous is not None and previous != item:
        raise ValueError(f"Conflicting native resource registration: {key}")
    RESOURCES[key] = item


GROUPS: dict[str, tuple[str, ...]] = {
    "Research portfolio": ("projects", "centers", "programs", "themes", "focus-areas", "expertise-tags"),
    "Funding and awards": ("grants", "grant-applications", "grant-reviews", "grant-reports", "grant-guidelines", "funders", "endowments"),
    "Publications and outputs": ("publications", "journals", "outputs"),
    "Innovation and enterprise": ("innovations", "startups", "incubation-records", "competition-entries", "technology-transfer-cases"),
    "Capacity and scholarships": ("training", "mentorship", "mentorship-applications", "mentorship-matches", "scholarships", "scholarship-applications"),
    "Partnerships and impact": ("partners", "consultancies", "farms", "sustainability", "stories", "impact-metrics"),
    "Giving and stewardship": ("donors", "donations", "donation-impacts", "donation-stories", "donation-settings"),
    "Resources and support": ("resources", "services", "guidelines"),
}

# Only resource keys actually implemented by routes/v1/workflow.py.
EDITORIAL_RESOURCES = frozenset({"projects", "publications", "farms", "partners",
                                "sustainability", "stories", "focus-areas", "impact-metrics"})
PATHWAY_RESOURCES = frozenset({"startups", "incubation-records", "competition-entries", "technology-transfer-cases"})

# These are field references, not inferred permission grants.
REFERENCES = {
    "center_id": "centers", "program_id": "programs", "project_id": "projects",
    "farm_id": "farms", "grant_id": "grants", "funder_id": "funders",
    "journal_id": "journals", "innovation_id": "innovations", "startup_id": "startups",
    "partner_id": "partners", "scholarship_id": "scholarships", "donor_id": "donors",
    "fund_id": "endowments", "focus_area_id": "focus-areas", "theme_id": "themes",
    "donation_id": "donations", "impact_id": "donation-impacts",
}


def group_for(key: str) -> str:
    return next((name for name, resources in GROUPS.items() if key in resources), "Other research records")


def reference_for(resource: str, key: str) -> str | None:
    if key == "application_id":
        return {"grant-reviews": "grant-applications", "grant-reports": "grant-applications",
                "mentorship-matches": "mentorship-applications"}.get(resource)
    if key == "program_id" and resource.startswith("mentorship-"):
        return "mentorship"
    return REFERENCES.get(key)


def singular_for(key: str, label: str) -> str:
    explicit = {"stories": "success story", "donation-stories": "donation story",
                "competition-entries": "competition entry", "consultancies": "consultancy",
                "mentorship-matches": "mentorship match", "sustainability": "sustainability initiative",
                "donation-settings": "donation settings record"}
    return explicit.get(key, label.removesuffix("s").lower())


# Main owns these existing editors. Preserve only reviewed destination keys
# that the canonical Research portal already authorized; never infer them from
# role names or union every legacy key into the workspace resource catalog.
INSTITUTIONAL_NAVIGATION = frozenset({
    "content-news", "content-blogs", "content-announcements",
    "content-events", "content-sliders", "settings-staff",
})


def workspace_navigation(resource_keys: list[str], authorized_keys: list[str]) -> list[str]:
    """Combine native module keys with explicitly authorized Main handoffs."""
    return list(dict.fromkeys([
        *resource_keys,
        *(key for key in authorized_keys if key in INSTITUTIONAL_NAVIGATION),
    ]))
