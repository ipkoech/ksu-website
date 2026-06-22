import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app import schemas
from app.api.v1 import media


def _folder(scope_type, scope_id):
    return SimpleNamespace(
        id=uuid.uuid4(),
        scope_type=scope_type,
        scope_id=scope_id,
    )


class MediaScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_create_folder_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = schemas.MediaFolderCreate(
            name="Registrar Media",
            slug="registrar-media",
            scope_type="wing",
            scope_id=uuid.uuid4(),
        )

        with patch.object(media, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await media.create_folder(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_folder_checks_existing_and_next_scope(self):
        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        folder = _folder("wing", own_wing_id)
        payload = schemas.MediaFolderUpdate(scope_type="wing", scope_id=other_wing_id)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_wing_id

        with (
            patch.object(media.MediaService, "get_folder_by_id", return_value=folder),
            patch.object(media, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await media.update_folder(folder.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_media_rejects_unowned_target_folder(self):
        user = SimpleNamespace(id=uuid.uuid4())
        target_folder = _folder("wing", uuid.uuid4())
        media_item = SimpleNamespace(id=uuid.uuid4(), folder_id=None)
        payload = schemas.MediaUpdate(folder_id=target_folder.id)

        with (
            patch.object(media.MediaService, "get_authorized_by_id", return_value=media_item),
            patch.object(media.MediaService, "get_folder_by_id", return_value=target_folder),
            patch.object(media, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await media.update_media(media_item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_upload_media_rejects_unowned_target_folder(self):
        user = SimpleNamespace(id=uuid.uuid4())
        target_folder = _folder("wing", uuid.uuid4())
        upload = SimpleNamespace(content_type="image/png")

        with (
            patch.object(media.MediaService, "get_folder_by_id", return_value=target_folder),
            patch.object(media, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await media.upload_media(
                    db=None,
                    user=user,
                    file=upload,
                    folder_id=target_folder.id,
                    is_public=False,
                    entity_type=None,
                    entity_id=None,
                    role=None,
                )

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
