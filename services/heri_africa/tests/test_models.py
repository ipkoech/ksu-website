from __future__ import annotations

from app.models import Base
from app.models.content import PublicationStatus


def test_heri_metadata_uses_heri_schema_and_publication_states() -> None:
    assert Base.metadata.schema == "heri"
    assert {state.value for state in PublicationStatus} == {
        "draft",
        "in_review",
        "approved",
        "scheduled",
        "published",
        "archived",
    }

    assert {"heri.site_settings", "heri.pages", "heri.page_sections", "heri.news_articles"}.issubset(Base.metadata.tables)
