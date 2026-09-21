from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.services import assistant_retrieval as svc


@pytest.mark.asyncio
async def test_citations_use_current_canonical_metadata_and_configured_types(monkeypatch):
    guide_id, staff_id, foreign_id = uuid4(), uuid4(), uuid4()
    sources = [SimpleNamespace(source_type=kind, source_id=identifier, is_approved=True,
                               deleted_at=None, title="Old approval label", public_url="https://unrelated.example")
               for kind, identifier in (("guide", guide_id), ("staff", staff_id))]
    context = SimpleNamespace(library_id=uuid4(), allowed_source_types=["guide"], sources=sources)
    canonical = {"type": "guide", "id": str(guide_id), "title": "Current guide", "url": "/guides/current", "description": "Evidence"}
    search = AsyncMock(return_value={"results": [canonical, canonical,
        {"type": "staff", "id": str(staff_id)}, {"type": "guide", "id": str(foreign_id)}]})
    monkeypatch.setattr(svc, "unified_search", search)
    result = await svc.retrieve_approved_sources(object(), context, query="help")
    assert len(result) == 1
    assert result[0]["title"] == "Current guide" and result[0]["url"] == "/guides/current"
    assert result[0]["snippet"] == "Evidence"
    assert search.call_args.kwargs["types"] == "guide"
    assert search.call_args.kwargs["library_id"] == context.library_id


@pytest.mark.asyncio
async def test_disallowed_or_unapproved_sources_do_not_trigger_unrestricted_search(monkeypatch):
    context = SimpleNamespace(library_id=uuid4(), allowed_source_types=["guide"], sources=[
        SimpleNamespace(source_type="staff", source_id=uuid4(), is_approved=True, deleted_at=None),
        SimpleNamespace(source_type="guide", source_id=uuid4(), is_approved=False, deleted_at=None),
    ])
    search = AsyncMock()
    monkeypatch.setattr(svc, "unified_search", search)
    assert await svc.retrieve_approved_sources(object(), context, query="help") == []
    search.assert_not_awaited()
