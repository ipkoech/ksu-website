"""Canonical metadata for Page CMS section templates."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True)
class MediaRoleDefinition:
    label: str
    media_type: str
    required: bool = False
    multiple: bool = False


@dataclass(frozen=True)
class SectionDefinition:
    key: str
    label: str
    description: str
    allowed_scopes: tuple[str, ...]
    min_items: int
    max_items: int
    allowed_item_types: tuple[str, ...]
    allowed_source_types: tuple[str, ...]
    media_roles: dict[str, MediaRoleDefinition]
    settings_schema: dict[str, Any]
    required_fields: tuple[str, ...]


ALL_SCOPES = ("university", "school", "research", "library")
UNIVERSITY_AND_SCHOOL_SCOPES = ("university", "school")
UNIVERSITY_AND_RESEARCH_SCOPES = ("university", "research")


SECTION_DEFINITIONS: dict[str, SectionDefinition] = {
    "hero_admissions": SectionDefinition(
        key="hero_admissions",
        label="Admissions hero",
        description="Primary admissions-led introduction for a public page.",
        allowed_scopes=UNIVERSITY_AND_SCHOOL_SCOPES,
        min_items=1,
        max_items=3,
        allowed_item_types=("cta",),
        allowed_source_types=("intake",),
        media_roles={
            "hero_image": MediaRoleDefinition("Desktop image", "image", required=True),
            "mobile_image": MediaRoleDefinition("Mobile image", "image", required=True),
            "video": MediaRoleDefinition("Background video", "video"),
            "poster": MediaRoleDefinition("Video poster", "image"),
        },
        settings_schema={
            "eyebrow": {"type": "string"},
            "admissions_state": {"type": "string"},
            "primary_cta": {"type": "cta"},
            "secondary_cta": {"type": "cta"},
            "tertiary_cta": {"type": "cta"},
        },
        required_fields=("title",),
    ),
    "pulse_strip": SectionDefinition(
        key="pulse_strip",
        label="Pulse strip",
        description="Compact, time-sensitive university updates.",
        allowed_scopes=ALL_SCOPES,
        min_items=1,
        max_items=4,
        allowed_item_types=("card",),
        allowed_source_types=("news", "event", "research_project", "club_activity"),
        media_roles={},
        settings_schema={
            "priority": {"type": "integer"},
            "expires_at": {"type": "datetime"},
            "icon_key": {"type": "string"},
        },
        required_fields=(),
    ),
    "featured_partnership": SectionDefinition(
        key="featured_partnership",
        label="Featured partnership",
        description="Prominent research partnership spotlight.",
        allowed_scopes=UNIVERSITY_AND_RESEARCH_SCOPES,
        min_items=1,
        max_items=1,
        allowed_item_types=("card", "cta"),
        allowed_source_types=("research_partner",),
        media_roles={"signing_photo": MediaRoleDefinition("Signing photo", "image")},
        settings_schema={
            "pillars": {"type": "repeatable"},
            "opportunities": {"type": "repeatable"},
        },
        required_fields=("title",),
    ),
    "programme_finder": SectionDefinition(
        key="programme_finder",
        label="Programme finder",
        description="Programme discovery and study-pathway guidance.",
        allowed_scopes=UNIVERSITY_AND_SCHOOL_SCOPES,
        min_items=1,
        max_items=6,
        allowed_item_types=("card", "cta"),
        allowed_source_types=("programme",),
        media_roles={},
        settings_schema={
            "filters": {"type": "string_list"},
            "pathway_steps": {"type": "repeatable", "max_items": 5},
        },
        required_fields=("title",),
    ),
    "date_timeline": SectionDefinition(
        key="date_timeline",
        label="Date timeline",
        description="Academic dates and admissions deadlines.",
        allowed_scopes=UNIVERSITY_AND_SCHOOL_SCOPES,
        min_items=1,
        max_items=6,
        allowed_item_types=("card",),
        allowed_source_types=("intake", "academic_calendar"),
        media_roles={},
        settings_schema={"timezone": {"type": "string"}},
        required_fields=("title",),
    ),
    "pillar_grid": SectionDefinition(
        key="pillar_grid",
        label="Pillar grid",
        description="A concise grid of institutional pillars or priorities.",
        allowed_scopes=ALL_SCOPES,
        min_items=2,
        max_items=6,
        allowed_item_types=("card",),
        allowed_source_types=(),
        media_roles={},
        settings_schema={"recommended_items": {"type": "integer", "default": 4}},
        required_fields=("title",),
    ),
    "media_mosaic": SectionDefinition(
        key="media_mosaic",
        label="Media mosaic",
        description="Curated campus imagery and video.",
        allowed_scopes=ALL_SCOPES,
        min_items=0,
        max_items=0,
        allowed_item_types=(),
        allowed_source_types=(),
        media_roles={"gallery": MediaRoleDefinition("Gallery", "image", required=True, multiple=True)},
        settings_schema={},
        required_fields=("title",),
    ),
    "leadership_activity": SectionDefinition(
        key="leadership_activity",
        label="Leadership activity",
        description="Leadership profile and current institutional activity.",
        allowed_scopes=ALL_SCOPES,
        min_items=1,
        max_items=4,
        allowed_item_types=("card",),
        allowed_source_types=("person", "staff_assignment", "club_activity"),
        media_roles={"hero_image": MediaRoleDefinition("Leadership image", "image")},
        settings_schema={},
        required_fields=("title",),
    ),
    "research_cards": SectionDefinition(
        key="research_cards",
        label="Research cards",
        description="Research projects and publications.",
        allowed_scopes=UNIVERSITY_AND_RESEARCH_SCOPES,
        min_items=1,
        max_items=6,
        allowed_item_types=("card",),
        allowed_source_types=("research_project", "publication"),
        media_roles={},
        settings_schema={},
        required_fields=("title",),
    ),
    "news_grid": SectionDefinition(
        key="news_grid",
        label="News grid",
        description="Recent published news stories.",
        allowed_scopes=ALL_SCOPES,
        min_items=1,
        max_items=6,
        allowed_item_types=("card",),
        allowed_source_types=("news",),
        media_roles={},
        settings_schema={},
        required_fields=("title",),
    ),
    "events_list": SectionDefinition(
        key="events_list",
        label="Events list",
        description="Upcoming published events.",
        allowed_scopes=ALL_SCOPES,
        min_items=1,
        max_items=6,
        allowed_item_types=("card",),
        allowed_source_types=("event",),
        media_roles={},
        settings_schema={},
        required_fields=("title",),
    ),
    "logo_carousel": SectionDefinition(
        key="logo_carousel",
        label="Logo carousel",
        description="Partner and collaborator logos.",
        allowed_scopes=UNIVERSITY_AND_RESEARCH_SCOPES,
        min_items=0,
        max_items=6,
        allowed_item_types=("media",),
        allowed_source_types=("research_partner",),
        media_roles={"logo": MediaRoleDefinition("Partner logo", "image", required=True, multiple=True)},
        settings_schema={},
        required_fields=(),
    ),
    "alumni_story": SectionDefinition(
        key="alumni_story",
        label="Alumni story",
        description="A featured alumni or testimonial story.",
        allowed_scopes=("university",),
        min_items=1,
        max_items=1,
        allowed_item_types=("card",),
        allowed_source_types=("alumni", "testimonial"),
        media_roles={"hero_image": MediaRoleDefinition("Story image", "image")},
        settings_schema={},
        required_fields=("title",),
    ),
    "facts_strip": SectionDefinition(
        key="facts_strip",
        label="Facts strip",
        description="Verified institutional statistics.",
        allowed_scopes=ALL_SCOPES,
        min_items=1,
        max_items=4,
        allowed_item_types=("stat",),
        allowed_source_types=("public_stat",),
        media_roles={},
        settings_schema={},
        required_fields=("title",),
    ),
}


def serialize_section_definitions() -> list[dict[str, Any]]:
    """Return definitions in a deterministic order suitable for API responses."""
    return [
        asdict(definition)
        for definition in sorted(SECTION_DEFINITIONS.values(), key=lambda definition: (definition.label, definition.key))
    ]


__all__ = [
    "MediaRoleDefinition",
    "SectionDefinition",
    "SECTION_DEFINITIONS",
    "serialize_section_definitions",
]
