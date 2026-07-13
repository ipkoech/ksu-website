from __future__ import annotations

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import media, page_cms
from app.models import PageSection, SectionItem
from app.schemas import MediaLinkCreate, PageSectionUpdate, SectionItemCreate


def _permission(name: str):
    return SimpleNamespace(name=name, is_active=True)


def _user(*permissions: str):
    return SimpleNamespace(
        id=uuid.uuid4(),
        is_active=True,
        deleted_at=None,
        role_assignments=[SimpleNamespace(
            is_active=True,
            scope_type=None,
            scope_id=None,
            role=SimpleNamespace(
                name="page-editor",
                is_active=True,
                role_permissions=[SimpleNamespace(permission=_permission(permission)) for permission in permissions],
            ),
        )],
        person=None,
    )


class _Db:
    def __init__(self):
        self.added = []
        self.deleted = []
        self.execute_count = 0

    def add(self, value):
        self.added.append(value)

    async def flush(self):
        return None

    async def refresh(self, _value):
        return None

    async def rollback(self):
        return None

    async def execute(self, _statement):
        self.execute_count += 1
        result = SimpleNamespace(scalar_one_or_none=lambda: self.locked_section)
        result.unique = lambda: result
        return result

    async def delete(self, value):
        self.deleted.append(value)


class _PageSectionParentDb(_Db):
    def __init__(self, section: PageSection):
        super().__init__()
        self.section = section

    async def execute(self, _statement):
        return SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: [self.section]))


def _item(section: PageSection, *, title: str, revision: int = 1) -> SectionItem:
    item = SectionItem(page_section_id=section.id, item_type="card", title=title, display_order=10, is_enabled=True)
    item.id = uuid.uuid4()
    item.revision = revision
    return item


def _section(*items: SectionItem) -> PageSection:
    section = PageSection(
        page_key="homepage",
        scope_type="university",
        section_key="pillars",
        layout_variant="pillar_grid",
        status="published",
        workflow_status="published",
    )
    section.id = uuid.uuid4()
    section.revision = 4
    section.items = list(items)
    for item in section.items:
        item.page_section_id = section.id
    return section


class PageCmsNestedPatchTests(unittest.IsolatedAsyncioTestCase):
    async def _update(self, section: PageSection, payload: dict, db: _Db | None = None):
        user = _user("page_sections.update")
        db = db or _Db()
        db.locked_section = section
        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            response = await page_cms.update_page_section(
                section.id,
                PageSectionUpdate.model_validate(payload),
                db=db,
                user=user,
            )
        return response, db

    async def test_nested_patch_creates_updates_and_removes_items_in_one_response(self):
        section = _section()
        existing = _item(section, title="Before")
        removed = _item(section, title="Remove")
        section.items = [existing, removed]

        response, db = await self._update(section, {
            "items": [
                {"id": str(existing.id), "revision": 1, "item_type": "card", "title": "After", "display_order": 10, "is_enabled": True},
                {"item_type": "card", "title": "Created", "display_order": 20, "is_enabled": True},
            ],
        })

        self.assertEqual("After", existing.title)
        self.assertEqual(2, existing.revision)
        self.assertEqual(["After", "Created"], [item.title for item in response["data"].items])
        self.assertEqual(1, len([entry for entry in db.added if entry.__class__.__name__ == "ContentWorkflowLog"]))

    async def test_nested_patch_rejects_foreign_item_identity(self):
        section = _section()
        section.items = [_item(section, title="Current")]

        with self.assertRaises(HTTPException) as context:
            await self._update(section, {
                "items": [{"id": str(uuid.uuid4()), "revision": 1, "item_type": "card", "title": "Foreign"}],
            })

        self.assertEqual(422, context.exception.status_code)
        self.assertEqual(["Current"], [item.title for item in section.items])

    async def test_nested_patch_rejects_duplicate_item_identity(self):
        section = _section()
        existing = _item(section, title="Current")
        section.items = [existing]

        with self.assertRaises(HTTPException) as context:
            await self._update(section, {
                "items": [
                    {"id": str(existing.id), "revision": 1, "item_type": "card", "title": "First"},
                    {"id": str(existing.id), "revision": 1, "item_type": "card", "title": "Second"},
                ],
            })

        self.assertEqual(422, context.exception.status_code)
        self.assertEqual("Current", existing.title)

    async def test_nested_patch_stale_revision_conflict_leaves_all_items_unchanged(self):
        section = _section()
        first = _item(section, title="First", revision=1)
        stale = _item(section, title="Stale", revision=3)
        section.items = [first, stale]

        with self.assertRaises(HTTPException) as context:
            await self._update(section, {
                "items": [
                    {"id": str(first.id), "revision": 1, "item_type": "card", "title": "Mutated"},
                    {"id": str(stale.id), "revision": 2, "item_type": "card", "title": "Also mutated"},
                ],
            })

        self.assertEqual(409, context.exception.status_code)
        self.assertEqual(("First", 1), (first.title, first.revision))
        self.assertEqual(("Stale", 3), (stale.title, stale.revision))

    async def test_patch_without_items_remains_a_section_only_update(self):
        section = _section()
        existing = _item(section, title="Preserved")
        section.items = [existing]

        response, _db = await self._update(section, {"title": "New title"})

        self.assertEqual("New title", response["data"].title)
        self.assertEqual([existing.id], [item.id for item in response["data"].items])

    async def test_stale_section_revision_cannot_delete_a_concurrently_added_item(self):
        section = _section()
        existing = _item(section, title="Original")
        concurrent = _item(section, title="Concurrent", revision=2)
        section.items = [existing, concurrent]
        section.revision = 5

        with self.assertRaises(HTTPException) as context:
            await self._update(section, {
                "revision": 4,
                "title": "Stale overwrite",
                "media_links": [],
                "items": [{
                    "id": str(existing.id),
                    "revision": 1,
                    "item_type": "card",
                    "title": "Changed",
                    "display_order": 10,
                    "is_enabled": True,
                }],
            })

        self.assertEqual(409, context.exception.status_code)
        self.assertEqual(5, section.revision)
        self.assertEqual("Original", existing.title)
        self.assertEqual([existing.id, concurrent.id], [item.id for item in section.items])

    async def test_standalone_item_create_advances_parent_revision_before_stale_nested_patch(self):
        section = _section()
        section.status = "published"
        section.workflow_status = "published"
        section.revision = 4
        db = _Db()
        db.locked_section = section
        user = _user("section_items.manage")

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            response = await page_cms.create_section_item(
                section.id,
                SectionItemCreate(item_type="card", title="Concurrent item"),
                db=db,
                user=user,
            )

        child = response["data"]
        section.items = [child]

        self.assertEqual(5, section.revision)
        self.assertEqual(user.id, section.updated_by_id)
        self.assertEqual("draft", section.workflow_status)
        self.assertEqual(1, len([entry for entry in db.added if entry.__class__.__name__ == "ContentWorkflowLog"]))

        with self.assertRaises(HTTPException) as context:
            await self._update(section, {"revision": 4, "items": []})

        self.assertEqual(409, context.exception.status_code)
        self.assertEqual([child.id], [item.id for item in section.items])

    async def test_standalone_media_link_create_advances_parent_revision_before_stale_nested_patch(self):
        section = _section()
        payload = MediaLinkCreate(
            media_id=uuid.uuid4(),
            entity_type="page_section",
            entity_id=section.id,
            role="attachment",
        )
        media_record = SimpleNamespace(
            id=payload.media_id,
            title="Attachment",
            filename="attachment.pdf",
            original_filename="attachment.pdf",
            mime_type="application/pdf",
            media_type="document",
            file_size=100,
            thumbnail_url=None,
            is_public=True,
            url="/media/attachment.pdf",
        )
        link = SimpleNamespace(
            id=uuid.uuid4(),
            media_id=payload.media_id,
            entity_type="page_section",
            entity_id=section.id,
            role="attachment",
            folder_id=None,
            display_order=100,
            is_public=True,
            media=None,
        )
        user = _user("section_items.manage", "media.manage")

        with (
            patch.object(media, "_authorized_media_entity_scope", AsyncMock(return_value=("university", None))),
            patch.object(media.MediaService, "get_authorized_by_id", AsyncMock(return_value=media_record)),
            patch.object(media.MediaService, "link_media", AsyncMock(return_value=link)),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            await media.create_media_link(payload, db=_PageSectionParentDb(section), user=user)

        self.assertEqual(5, section.revision)
        stale_db = _MediaDb(section, [link], [])
        with self.assertRaises(HTTPException) as context:
            await self._update(section, {"revision": 4, "media_links": []}, db=stale_db)

        self.assertEqual(409, context.exception.status_code)
        self.assertEqual([], stale_db.deleted)


class _MediaDb(_Db):
    def __init__(self, section: PageSection, links, media):
        super().__init__()
        self.locked_section = section
        self.links = links
        self.media = media

    async def execute(self, _statement):
        self.execute_count += 1
        if self.execute_count == 1:
            result = SimpleNamespace(scalar_one_or_none=lambda: self.locked_section)
            result.unique = lambda: result
            return result
        rows = self.links if self.execute_count == 2 else self.media
        return SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: rows))


class PageCmsMediaReconciliationTests(unittest.TestCase):
    def test_reconciliation_rejects_invalid_role_without_mutating_existing_links(self):
        section_id = uuid.uuid4()
        existing = SimpleNamespace(
            id=uuid.uuid4(), media_id=uuid.uuid4(), entity_type="page_section", entity_id=section_id,
            role="hero_image", display_order=10, is_public=True,
        )
        definition = SimpleNamespace(media_roles={
            "hero_image": SimpleNamespace(media_type="image", multiple=False),
        })
        media = SimpleNamespace(id=existing.media_id, media_type="image", is_public=True)

        with self.assertRaises(HTTPException) as context:
            page_cms.reconcile_section_media_links(
                [existing],
                [{"id": existing.id, "media_id": existing.media_id, "role": "unknown", "display_order": 10, "is_public": True}],
                definition,
                {media.id: media},
            )

        self.assertEqual(422, context.exception.status_code)
        self.assertEqual("hero_image", existing.role)

    def test_reconciliation_rejects_duplicate_singleton_role(self):
        definition = SimpleNamespace(media_roles={
            "hero_image": SimpleNamespace(media_type="image", multiple=False),
        })
        first_media = SimpleNamespace(id=uuid.uuid4(), media_type="image", is_public=True)
        second_media = SimpleNamespace(id=uuid.uuid4(), media_type="image", is_public=True)

        with self.assertRaises(HTTPException) as context:
            page_cms.reconcile_section_media_links(
                [],
                [
                    {"media_id": first_media.id, "role": "hero_image", "display_order": 10, "is_public": True},
                    {"media_id": second_media.id, "role": "hero_image", "display_order": 20, "is_public": True},
                ],
                definition,
                {first_media.id: first_media, second_media.id: second_media},
            )

        self.assertEqual(422, context.exception.status_code)


class PageCmsMediaPatchTests(PageCmsNestedPatchTests):
    async def test_published_media_edit_resets_workflow_once_and_increments_section_revision_once(self):
        section = _section()
        section.layout_variant = "hero_admissions"
        old_media_id = uuid.uuid4()
        new_media_id = uuid.uuid4()
        link = SimpleNamespace(
            id=uuid.uuid4(), media_id=old_media_id, entity_type="page_section", entity_id=section.id,
            role="hero_image", display_order=10, is_public=True,
        )
        media = SimpleNamespace(id=new_media_id, media_type="image", is_public=True)
        db = _MediaDb(section, [link], [media])

        response, _ = await self._update(section, {
            "revision": 4,
            "media_links": [{
                "id": str(link.id),
                "media_id": str(new_media_id),
                "role": "hero_image",
                "display_order": 20,
                "is_public": True,
            }],
        }, db=db)

        self.assertEqual("draft", response["data"].status)
        self.assertEqual("draft", response["data"].workflow_status)
        self.assertEqual(5, response["data"].revision)
        self.assertEqual(new_media_id, link.media_id)
        self.assertEqual(20, link.display_order)
        self.assertEqual(1, len([entry for entry in db.added if entry.__class__.__name__ == "ContentWorkflowLog"]))


if __name__ == "__main__":
    unittest.main()
