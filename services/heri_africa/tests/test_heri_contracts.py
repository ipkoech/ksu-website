"""Lightweight HERI contract checks.

These tests intentionally verify public contracts and registration points rather
than duplicating the full database integration suite used by shared services.
"""

from pathlib import Path

from app.models.chair import ChairProfile
from app.services.admin_resources import RESOURCE_MODELS


def test_public_heri_contract_routes_are_registered() -> None:
    source = Path(__file__).parents[1] / "app/routes/v1"
    routes = "\n".join(path.read_text() for path in source.glob("*.py"))
    required = {
        '"/site"', '"/chair"', '"/pages/{slug}"', '"/navigation"',
        '"/footer"', '"/hero-slides"', '"/research/themes"',
        '"/research/projects"', '"/research/publications"',
        '"/impact-metrics"', '"/team"', '"/partners"', '"/news"',
        '"/events"', '"/opportunities"',
    }
    assert all(route in routes for route in required)


def test_chair_profile_contains_language_chair_fields() -> None:
    fields = set(ChairProfile.__table__.columns.keys())
    assert {
        "name",
        "acronym",
        "host_institution",
        "about",
        "tagline",
        "vision",
        "mission",
        "mandate",
        "objectives",
        "values",
        "why_it_matters",
        "seo",
        "logo_url",
        "cover_image_url",
    } <= fields


def test_chair_profile_is_admin_managed() -> None:
    assert RESOURCE_MODELS["chair-profiles"] is ChairProfile
