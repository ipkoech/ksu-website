from datetime import datetime, timezone
from uuid import uuid4

from ksu_common.research_sources import research_source_catalog
from app.schemas.core import ResearchProjectPublicDetail
from app.schemas.innovation import InnovationCreate


def test_register_rows_are_preserved_once_after_duplicate_consolidation():
    projects = research_source_catalog()["projects"]
    rows = [
        ref["row"] for p in projects for ref in p["source_references"] if "row" in ref
    ]
    assert sorted(rows) == list(range(1, 40))
    assert len({p["slug"] for p in projects}) == len(projects) == 38
    assert all(p.get("start_date") is None for p in projects)
    assert all(p.get("end_date") is None for p in projects)


def test_copyright_registrations_are_not_seeded_as_patents():
    specs = research_source_catalog()["innovations"]
    assert len({p["copyright_number"] for p in specs}) == 19
    for spec in specs:
        parsed = InnovationCreate.model_validate(spec)
        assert parsed.copyright_number.startswith("RZ")
        assert parsed.patent_number is None


def test_public_project_detail_preserves_attribution_and_media_without_private_fields():
    now = datetime.now(timezone.utc)
    media = {
        "id": str(uuid4()),
        "url": "/images/research/verified/innovation-week-05.jpeg",
    }
    parsed = ResearchProjectPublicDetail.model_validate(
        {
            "id": uuid4(),
            "title": "Research project",
            "slug": "research-project",
            "created_at": now,
            "updated_at": now,
            "project_type": "applied",
            "currency": "KES",
            "status": "ongoing",
            "progress_percentage": 0,
            "is_active": True,
            "principal_investigator_name": "Dr. Pamela Wadende",
            "school_name": "School of Education",
            "funder_name": "Templeton World Charity Foundation",
            "cover_image": media,
            "gallery_media": [media],
            "deleted_at": now,
            "internal_notes": "private",
        }
    ).model_dump()
    assert parsed["cover_image"] == media
    assert parsed["gallery_media"] == [media]
    assert parsed["principal_investigator_name"] == "Dr. Pamela Wadende"
    assert "deleted_at" not in parsed and "internal_notes" not in parsed


def test_live_snapshot_is_complete_and_retains_actual_unavailable_page():
    pages = research_source_catalog()["live_pages"]
    errors = [p for p in pages if "error" in p]
    assert len(pages) == 124
    assert len(errors) == 1
    assert "404" in errors[0]["error"]
    assert len(research_source_catalog()["awards"]) == 10
