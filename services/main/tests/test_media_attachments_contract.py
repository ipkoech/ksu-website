import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import media
from app.models.media import MEDIA_ATTACHMENT_ROLES
from app.schemas import MediaLinkCreate
from app.services.media import MediaService


class _Db:
    def __init__(self):
        self.added = []

    def add(self, record):
        self.added.append(record)

    async def flush(self):
        return None


class _ScalarResult:
    def __init__(self, value):
        self.value = value

    def one_or_none(self):
        return self.value


class _ScopeDb(_Db):
    def __init__(self, value):
        super().__init__()
        self.value = value

    async def execute(self, statement):
        return _ScalarResult(self.value)


class _Upload:
    content_type = "application/pdf"
    filename = "prospectus.pdf"


def _media(**overrides):
    values = {
        "id": uuid.uuid4(),
        "title": "Prospectus",
        "filename": "prospectus.pdf",
        "original_filename": "2026-prospectus.pdf",
        "mime_type": "application/pdf",
        "file_size": 2048,
        "media_type": "document",
        "thumbnail_url": None,
        "is_public": True,
        "url": "/media/prospectus.pdf",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class MediaAttachmentContractTests(unittest.IsolatedAsyncioTestCase):
    def test_standard_attachment_role_vocabulary_is_available(self):
        self.assertEqual(
            {"cover", "gallery", "logo", "video", "document", "poster", "cv", "brochure", "attachment"},
            set(MEDIA_ATTACHMENT_ROLES),
        )

    async def test_upload_with_entity_creates_media_link_immediately(self):
        db = _Db()
        entity_id = uuid.uuid4()
        uploaded = _media()

        with (
            patch("app.services.media.upload_file", new_callable=AsyncMock, return_value={
                "filename": uploaded.filename,
                "original_filename": uploaded.original_filename,
                "mime_type": uploaded.mime_type,
                "file_size": uploaded.file_size,
                "storage_path": "departments/prospectus.pdf",
            }),
            patch.object(MediaService, "link_media", new_callable=AsyncMock) as link_media,
        ):
            result = await MediaService.upload(
                db,
                file=_Upload(),
                uploaded_by_id=uuid.uuid4(),
                entity_type="department",
                entity_id=entity_id,
                role="brochure",
            )

        self.assertEqual("document", result.media_type)
        link_media.assert_awaited_once_with(
            db,
            media_id=result.id,
            entity_type="department",
            entity_id=entity_id,
            role="brochure",
            is_public=False,
        )

    def test_attachment_summary_includes_display_fields(self):
        item = _media()
        link = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=item.id,
            entity_type="department",
            entity_id=uuid.uuid4(),
            role="brochure",
            folder_id=None,
            display_order=4,
            is_public=False,
            media=item,
        )

        payload = MediaService.serialize_link(link)

        self.assertEqual("Prospectus", payload["media"]["title"])
        self.assertEqual("2026-prospectus.pdf", payload["media"]["original_filename"])
        self.assertEqual("/media/prospectus.pdf", payload["media"]["url"])
        self.assertEqual("brochure", payload["role"])
        self.assertEqual(4, payload["display_order"])
        self.assertFalse(payload["is_public"])

    async def test_list_attachments_returns_display_ready_media_summary(self):
        item = _media()
        link = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=item.id,
            entity_type="department",
            entity_id=uuid.uuid4(),
            role="brochure",
            folder_id=None,
            display_order=4,
            is_public=False,
            media=item,
        )

        with patch.object(media.MediaService, "list_links", return_value=[link]):
            response = await media.list_media_links(
                db=None,
                user=SimpleNamespace(id=uuid.uuid4()),
                entity_type="department",
                entity_id=link.entity_id,
            )

        attachment = response["data"][0]
        self.assertEqual("Prospectus", attachment["media"]["title"])
        self.assertEqual("2026-prospectus.pdf", attachment["media"]["original_filename"])
        self.assertEqual("/media/prospectus.pdf", attachment["media"]["url"])
        self.assertEqual("brochure", attachment["role"])
        self.assertEqual(4, attachment["display_order"])
        self.assertFalse(attachment["is_public"])

    async def test_link_reordering_persists_display_order(self):
        db = _Db()
        link = SimpleNamespace(display_order=100)

        result = await MediaService.update_link(db, link, display_order=2)

        self.assertIs(link, result)
        self.assertEqual(2, link.display_order)

    async def test_upload_rejects_entity_scope_without_attachment_permission(self):
        user = SimpleNamespace(id=uuid.uuid4())

        with patch.object(media, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await media.upload_media(
                    db=None,
                    user=user,
                    file=_Upload(),
                    folder_id=None,
                    is_public=False,
                    entity_type="department",
                    entity_id=uuid.uuid4(),
                    role="brochure",
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_create_link_rejects_entity_scope_without_attachment_permission(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = MediaLinkCreate(
            media_id=uuid.uuid4(),
            entity_type="department",
            entity_id=uuid.uuid4(),
            role="brochure",
        )

        with patch.object(media, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await media.create_media_link(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_workflow_managed_club_link_rejects_direct_visibility_update(self):
        link = SimpleNamespace(
            id=uuid.uuid4(),
            entity_type="blog",
            entity_id=uuid.uuid4(),
            owner_portal="student-clubs",
            owner_scope_type="club",
            owner_scope_id=uuid.uuid4(),
            is_public=False,
        )

        with (
            patch.object(media.MediaService, "get_link_by_id", new_callable=AsyncMock, return_value=link),
            patch.object(media, "_require_media_entity_scope", new_callable=AsyncMock),
        ):
            with self.assertRaises(HTTPException) as context:
                await media.update_media_link(
                    link_id=link.id,
                    data=media.MediaLinkUpdate(is_public=True),
                    db=None,
                    user=SimpleNamespace(id=uuid.uuid4()),
                )

        self.assertEqual(400, context.exception.status_code)

    async def test_club_assignment_can_upload_to_own_club_scope(self):
        club_id = uuid.uuid4()
        user = SimpleNamespace(
            id=uuid.uuid4(),
            role_assignments=[],
            person=SimpleNamespace(
                assignments=[
                    SimpleNamespace(entity_type="club", entity_id=club_id, role="official", status="active")
                ]
            ),
        )
        uploaded = _media(mime_type="image/jpeg", media_type="image", filename="club.jpg", original_filename="club.jpg")

        with (
            patch("app.services.media.upload_file", new_callable=AsyncMock, return_value={
                "filename": uploaded.filename,
                "original_filename": uploaded.original_filename,
                "mime_type": uploaded.mime_type,
                "file_size": uploaded.file_size,
                "storage_path": "clubs/club.jpg",
            }),
            patch.object(MediaService, "link_media", new_callable=AsyncMock) as link_media,
        ):
            response = await media.upload_media(
                db=_Db(),
                user=user,
                file=SimpleNamespace(content_type="image/jpeg", filename="club.jpg"),
                folder_id=None,
                is_public=True,
                entity_type="club",
                entity_id=club_id,
                role="gallery",
            )

        self.assertFalse(response["data"].is_public)
        call = link_media.await_args.kwargs
        self.assertFalse(call["is_public"])
        self.assertEqual("student-clubs", call["owner_portal"])
        self.assertEqual("club", call["owner_scope_type"])
        self.assertEqual(club_id, call["owner_scope_id"])
        self.assertEqual(user.id, call["author_user_id"])

    async def test_create_club_scoped_link_stamps_workflow_metadata(self):
        club_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        payload = MediaLinkCreate(
            media_id=uuid.uuid4(),
            entity_type="club",
            entity_id=club_id,
            role="gallery",
            is_public=True,
        )

        with (
            patch.object(media.MediaService, "get_attachment_scope", new_callable=AsyncMock, return_value=("club", club_id)),
            patch.object(media.MediaService, "get_authorized_by_id", new_callable=AsyncMock, return_value=_media(id=payload.media_id)),
            patch.object(media.MediaService, "link_media", new_callable=AsyncMock) as link_media,
            patch.object(media, "_require_media_folder_scope", new_callable=AsyncMock),
        ):
            link_media.return_value = SimpleNamespace(
                id=uuid.uuid4(),
                media_id=payload.media_id,
                entity_type="club",
                entity_id=club_id,
                role="gallery",
                folder_id=None,
                display_order=100,
                is_public=False,
                is_published=False,
                status="draft",
                workflow_status="draft",
                owner_portal="student-clubs",
                owner_scope_type="club",
                owner_scope_id=club_id,
                submitted_at=None,
                approved_at=None,
                published_at=None,
                media=_media(id=payload.media_id),
            )
            await media.create_media_link(payload, db=None, user=user)

        call = link_media.await_args.kwargs
        self.assertFalse(call["is_public"])
        self.assertEqual("student-clubs", call["owner_portal"])
        self.assertEqual("club", call["owner_scope_type"])
        self.assertEqual(club_id, call["owner_scope_id"])

    async def test_club_activity_attachment_scope_resolves_to_owning_club(self):
        club_id = uuid.uuid4()

        scope_type, scope_id = await MediaService.get_attachment_scope(
            _ScopeDb(("club", club_id, club_id)),
            entity_type="club_activity",
            entity_id=uuid.uuid4(),
        )

        self.assertEqual("club", scope_type)
        self.assertEqual(club_id, scope_id)


if __name__ == "__main__":
    unittest.main()
