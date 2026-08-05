from __future__ import annotations

from datetime import datetime, timezone

from app.models.content import NewsArticle, PublicationStatus, ResearchTheme
from app.services.public import PublicService, is_public_record


def test_only_published_records_or_due_scheduled_records_are_public() -> None:
    now = datetime.now(timezone.utc)
    published = NewsArticle(slug="published", title="Published", status=PublicationStatus.PUBLISHED)
    draft = NewsArticle(slug="draft", title="Draft", status=PublicationStatus.DRAFT)
    future = NewsArticle(slug="future", title="Future", status=PublicationStatus.SCHEDULED, scheduled_at=now.replace(year=now.year + 1))
    due = NewsArticle(slug="due", title="Due", status=PublicationStatus.SCHEDULED, scheduled_at=now)

    assert is_public_record(published, now)
    assert not is_public_record(draft, now)
    assert not is_public_record(future, now)
    assert is_public_record(due, now)


def test_public_query_supports_models_without_scheduled_at() -> None:
    query = PublicService.public_query(ResearchTheme)

    # Building the query must not assume every status-bearing model is schedulable.
    assert "research_themes" in str(query)
