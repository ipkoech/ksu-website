from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, Mock

import pytest

from app.models import VcSpeech
from app.models import Media, VcGalleryAlbum
from app.schemas.vice_chancellor import VcGalleryMediaCreate
from app.services.vice_chancellor import (
    ViceChancellorAdminService,
    ViceChancellorWorkflowService,
    serialize_public_media,
)


@pytest.mark.asyncio
async def test_workflow_follows_review_before_publish():
    db = Mock()
    db.flush = AsyncMock()
    actor_id = uuid.uuid4()
    speech = VcSpeech(title="Graduation", slug="graduation")
    speech.id = uuid.uuid4()
    speech.status = "draft"
    speech.workflow_status = "draft"
    speech.is_published = False

    await ViceChancellorWorkflowService.transition(db, speech, "submit", actor_id)
    assert speech.workflow_status == "in_review"
    await ViceChancellorWorkflowService.transition(db, speech, "approve", actor_id)
    assert speech.workflow_status == "approved"
    await ViceChancellorWorkflowService.transition(db, speech, "publish", actor_id)
    assert speech.workflow_status == "published"
    assert speech.is_published is True
    assert speech.published_by_id == actor_id
    assert db.add.call_count == 3


@pytest.mark.asyncio
async def test_workflow_rejects_illegal_transition():
    speech = VcSpeech(title="Graduation", slug="graduation")
    speech.status = "draft"
    speech.workflow_status = "draft"
    with pytest.raises(ValueError, match="Cannot publish"):
        await ViceChancellorWorkflowService.transition(
            Mock(flush=AsyncMock()), speech, "publish", uuid.uuid4()
        )


def test_public_media_serializer_omits_private_media():
    private = Mock(is_public=False)
    assert serialize_public_media(private) is None

    public = Mock(
        id=uuid.uuid4(), is_public=True, filename="vc.jpg", original_filename="VC.jpg",
        mime_type="image/jpeg", media_type="image", public_url="/media/vc.jpg",
        cdn_url=None, thumbnail_url=None, alt_text="Vice Chancellor", title=None,
        caption=None, width=1200, height=800, duration=None,
    )
    assert serialize_public_media(public)["url"] == "/media/vc.jpg"


@pytest.mark.asyncio
async def test_gallery_attachment_applies_editorial_caption_and_alt_text():
    media = Media(
        filename="event.jpg", original_filename="event.jpg", mime_type="image/jpeg",
        file_size=10, storage_path="event.jpg", media_type="image",
    )
    media.id = uuid.uuid4()
    media.deleted_at = None
    db = Mock()
    db.get = AsyncMock(return_value=media)
    db.flush = AsyncMock()
    album = VcGalleryAlbum(title="Event", slug="event")
    album.id = uuid.uuid4()

    await ViceChancellorAdminService.attach_gallery_media(
        db,
        album,
        VcGalleryMediaCreate(
            media_id=media.id,
            caption="The VC addresses students",
            alt_text="Vice Chancellor speaking at a lectern",
        ),
    )

    assert media.caption == "The VC addresses students"
    assert media.alt_text == "Vice Chancellor speaking at a lectern"
