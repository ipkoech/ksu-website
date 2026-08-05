"""Tests for the media where-used lookup and scope-name alignment."""

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app import schemas
from app.api.v1 import media
from app.deps import _has_permission


def _media_item():
    return SimpleNamespace(
        id=uuid.uuid4(),
        title="Prospectus",
        filename="prospectus.pdf",
        original_filename="2026-prospectus.pdf",
        mime_type="application/pdf",
        media_type="document",
        file_size=1024,
        thumbnail_url=None,
        is_public=True,
        url="/media/prospectus.pdf",
    )


def _link(media_item, entity_type="department"):
    return SimpleNamespace(
        id=uuid.uuid4(),
        media_id=media_item.id,
        entity_type=entity_type,
        entity_id=uuid.uuid4(),
        role="brochure",
        folder_id=None,
        display_order=1,
        is_public=True,
        media=media_item,
    )


class MediaWhereUsedTests(unittest.IsolatedAsyncioTestCase):
    async def test_links_lookup_by_media_id_only(self):
        item = _media_item()
        links = [_link(item, "department"), _link(item, "news")]

        with patch.object(media.MediaService, "list_links", return_value=links) as mock_list:
            response = await media.list_media_links(
                db=None,
                user=SimpleNamespace(id=uuid.uuid4()),
                media_id=item.id,
            )

        kwargs = mock_list.call_args.kwargs
        self.assertEqual(item.id, kwargs["media_id"])
        self.assertIsNone(kwargs["entity_type"])
        self.assertIsNone(kwargs["entity_id"])
        self.assertEqual(2, len(response["data"]))
        self.assertEqual(
            {"department", "news"},
            {row["entity_type"] for row in response["data"]},
        )

    async def test_links_lookup_still_supports_entity_pair(self):
        item = _media_item()
        link = _link(item)

        with patch.object(media.MediaService, "list_links", return_value=[link]):
            response = await media.list_media_links(
                db=None,
                user=SimpleNamespace(id=uuid.uuid4()),
                entity_type="department",
                entity_id=link.entity_id,
            )

        self.assertEqual(1, len(response["data"]))

    async def test_links_lookup_rejects_missing_filters(self):
        with self.assertRaises(HTTPException) as context:
            await media.list_media_links(
                db=None,
                user=SimpleNamespace(id=uuid.uuid4()),
            )
        self.assertEqual(400, context.exception.status_code)

    async def test_links_lookup_rejects_partial_entity_pair(self):
        with self.assertRaises(HTTPException) as context:
            await media.list_media_links(
                db=None,
                user=SimpleNamespace(id=uuid.uuid4()),
                entity_type="department",
            )
        self.assertEqual(400, context.exception.status_code)


class MediaScopeAlignmentTests(unittest.TestCase):
    """The registry grants dot-form scopes; both forms must satisfy media routes."""

    def test_dot_form_grant_satisfies_manage_scope(self):
        self.assertTrue(_has_permission({"media.manage"}, "media.manage"))

    def test_colon_form_grant_satisfies_manage_scope(self):
        self.assertTrue(_has_permission({"media:manage"}, "media.manage"))

    def test_delete_scope_accepts_both_forms(self):
        self.assertTrue(_has_permission({"media.delete"}, "media.delete"))
        self.assertTrue(_has_permission({"media:delete"}, "media.delete"))

    def test_manage_grant_does_not_grant_delete(self):
        self.assertFalse(_has_permission({"media.manage"}, "media.delete"))

    def test_media_routes_declare_dot_form_scopes(self):
        import inspect

        source = inspect.getsource(media)
        self.assertNotIn('require_scope("media:', source)
        self.assertIn('require_scope("media.manage")', source)
        self.assertIn('require_scope("media.delete")', source)


class MediaFolderSchemaTests(unittest.TestCase):
    def test_folder_create_slug_is_optional(self):
        payload = schemas.MediaFolderCreate(name="Registrar Media")
        self.assertIsNone(payload.slug)

    def test_folder_create_still_accepts_slug(self):
        payload = schemas.MediaFolderCreate(name="Registrar Media", slug="registrar-media")
        self.assertEqual("registrar-media", payload.slug)


if __name__ == "__main__":
    unittest.main()
