import uuid

import pytest

from app.models import LibraryAssistantContext, LibraryAssistantContextSource
from app.services import assistant_retrieval


class FakeResult:
    def __init__(self, payload):
        self.payload = payload


@pytest.mark.asyncio
async def test_retrieval_keeps_only_explicitly_approved_results(monkeypatch):
    approved_id = uuid.uuid4()
    unapproved_id = uuid.uuid4()
    context = LibraryAssistantContext(
        id=uuid.uuid4(),
        name="Research",
        slug="research",
        instructions="Use approved sources.",
        allowed_source_types=["guide"],
        suggested_prompts=[],
        status="active",
        is_public=True,
        sort_order=0,
    )
    context.sources = [
        LibraryAssistantContextSource(
            id=uuid.uuid4(),
            context_id=context.id,
            source_type="guide",
            source_id=approved_id,
            title="Approved guide",
            public_url="/guides/research",
            is_approved=True,
            sort_order=0,
        )
    ]

    async def fake_search(*args, **kwargs):
        return {
            "results": [
                {"id": str(unapproved_id), "type": "guide", "title": "Unapproved"},
                {
                    "id": str(approved_id),
                    "type": "guide",
                    "title": "Approved guide",
                    "description": "Search methods.",
                    "url": "/guides/research",
                },
            ]
        }

    monkeypatch.setattr(assistant_retrieval, "unified_search", fake_search)
    sources = await assistant_retrieval.retrieve_approved_sources(
        object(), context, query="research methods"
    )

    assert [source["title"] for source in sources] == ["Approved guide"]
