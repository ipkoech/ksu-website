from __future__ import annotations

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import page_cms
from app.models import PageSection, SectionItem
from app.schemas import PageSectionUpdate


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

    def add(self, value):
        self.added.append(value)

    async def flush(self):
        return None

    async def refresh(self, _value):
        return None


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
    async def _update(self, section: PageSection, payload: dict):
        user = _user("page_sections.update")
        db = _Db()
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


if __name__ == "__main__":
    unittest.main()
