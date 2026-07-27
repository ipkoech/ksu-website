from __future__ import annotations

from app.services.admin_resources import RESOURCE_MODELS


def test_every_heri_domain_has_an_admin_resource_binding() -> None:
    expected = {"pages", "page-sections", "news", "events", "opportunities", "themes", "projects", "publications", "team", "partners", "submissions", "media", "navigation", "footer", "site-settings", "analytics", "social-publications"}
    assert expected.issubset(RESOURCE_MODELS)
