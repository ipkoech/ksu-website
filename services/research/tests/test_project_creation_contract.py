"""Project creation must accept everything required by the public detail page."""

from __future__ import annotations

import uuid

import pytest
from pydantic import ValidationError

from app.schemas.core import ResearchProjectCreate


def test_project_create_accepts_people_and_media_references():
    identifiers = [uuid.uuid4() for _ in range(5)]
    project = ResearchProjectCreate(
        title="Climate-smart field trial",
        pi_id=identifiers[0],
        cover_image_id=identifiers[1],
        gallery_media_ids=[identifiers[2]],
        document_media_ids=[identifiers[3]],
        attachment_media_ids=[identifiers[4]],
        start_date="2026-01-01",
        end_date="2026-12-31",
    )

    assert project.pi_id == identifiers[0]
    assert project.cover_image_id == identifiers[1]
    assert project.gallery_media_ids == [identifiers[2]]
    assert project.document_media_ids == [identifiers[3]]
    assert project.attachment_media_ids == [identifiers[4]]


def test_project_create_rejects_an_end_date_before_the_start_date():
    with pytest.raises(ValidationError, match="End date must be on or after the start date"):
        ResearchProjectCreate(
            title="Invalid project timeline",
            start_date="2026-12-31",
            end_date="2026-01-01",
        )

