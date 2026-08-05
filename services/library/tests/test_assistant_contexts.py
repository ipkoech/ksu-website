import uuid

import pytest
from pydantic import ValidationError

from app.schemas.assistant import (
    LibraryAssistantContextCreate,
    LibraryAssistantSourceCreate,
)
from app.services.assistant_contexts import _public_context_data
from app.models import LibraryAssistantContext, LibraryAssistantContextSource


def test_context_accepts_librarian_approved_source_records():
    source = LibraryAssistantSourceCreate(
        source_type="guide",
        source_id=uuid.uuid4(),
        title="Research support guide",
        public_url="/guides/research-support",
    )
    context = LibraryAssistantContextCreate(
        name="Research support",
        slug="research-support",
        instructions="Answer research questions only from approved Library sources.",
        allowed_source_types=["guide", "service"],
        sources=[source],
    )

    assert context.sources[0].source_type == "guide"
    assert context.allowed_source_types == ["guide", "service"]


def test_context_rejects_unknown_source_types():
    with pytest.raises(ValidationError, match="not supported"):
        LibraryAssistantSourceCreate(
            source_type="private_wiki",
            source_id=uuid.uuid4(),
            title="Internal notes",
        )


def test_context_rejects_malformed_slug_and_short_instructions():
    with pytest.raises(ValidationError):
        LibraryAssistantContextCreate(
            name="Research",
            slug="Research Support",
            instructions="Too short",
        )


def test_public_context_serializer_hides_instructions_and_unapproved_sources():
    context = LibraryAssistantContext(
        id=uuid.uuid4(),
        name="Research support",
        slug="research-support",
        instructions="Internal librarian routing instructions.",
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
            source_id=uuid.uuid4(),
            title="Public guide",
            is_approved=True,
            sort_order=0,
        ),
        LibraryAssistantContextSource(
            id=uuid.uuid4(),
            context_id=context.id,
            source_type="guide",
            source_id=uuid.uuid4(),
            title="Removed guide",
            is_approved=False,
            sort_order=1,
        ),
    ]

    public = _public_context_data(context)

    assert "instructions" not in public
    assert [source["title"] for source in public["sources"]] == ["Public guide"]
