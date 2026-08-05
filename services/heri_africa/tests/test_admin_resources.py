from __future__ import annotations

from app.services.admin_resources import RESOURCE_MODELS
from app.models.partners import Partner


def test_every_heri_domain_has_an_admin_resource_binding() -> None:
    expected = {"pages", "page-sections", "news", "events", "opportunities", "themes", "projects", "publications", "team", "partners", "submissions", "media", "navigation", "footer", "site-settings", "analytics", "social-publications"}
    assert expected.issubset(RESOURCE_MODELS)


def test_heri_partner_projection_has_center_alignment_fields() -> None:
    columns = {column.name for column in Partner.__table__.columns}
    assert {
        "research_partner_id",
        "research_center_id",
        "partnership_level",
        "collaboration_areas",
        "relationship_status",
        "relationship_notes",
    }.issubset(columns)
