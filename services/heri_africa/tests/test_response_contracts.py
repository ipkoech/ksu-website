from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models.content import Event, PublicationStatus
from app.schemas.admin_content import EventAdminResponse
from app.schemas.operations import DynamicResourceResponse


def test_populated_event_response_serializes_generated_editorial_fields() -> None:
    event = Event(
        id=uuid.uuid4(),
        slug="research-day",
        title="Research Day",
        summary="Annual research showcase",
        description="Projects and publications from across the centre.",
        status=PublicationStatus.PUBLISHED,
        is_virtual=True,
        virtual_url="https://example.edu/events/research-day",
        is_featured=True,
        position=2,
    )

    response = EventAdminResponse.model_validate(event)

    assert response.status == PublicationStatus.PUBLISHED
    assert response.is_virtual is True
    assert response.position == 2


def test_dynamic_resource_response_serializes_only_table_columns() -> None:
    event = Event(
        id=uuid.uuid4(),
        slug="research-day",
        title="Research Day",
        summary="Annual research showcase",
        description="Projects and publications from across the centre.",
        status=PublicationStatus.DRAFT,
    )
    event.internal_secret = "must not cross the response boundary"

    response = DynamicResourceResponse.model_validate(event)

    assert response.slug == "research-day"
    assert "internal_secret" not in response.model_dump()
