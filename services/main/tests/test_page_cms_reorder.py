from __future__ import annotations

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import page_cms
from app.models import PageSection, SectionItem
from app.schemas.page_cms import PageSectionReorderRequest, SectionItemReorderRequest
from app.services.page_cms import PageCmsReorderValidationError, PageSectionService


class _ScalarListResult:
    def __init__(self, records):
        self.records = records

    def scalars(self):
        return self

    def all(self):
        return list(self.records)

    def scalar_one_or_none(self):
        return self.records[0] if len(self.records) == 1 else None


class _ReorderDb:
    def __init__(self, *, sections=(), items=()):
        self.sections = list(sections)
        self.items = list(items)
        self.added = []
        self.statements = []
        self.flush_count = 0

    async def execute(self, statement):
        self.statements.append(statement)
        text = str(statement)
        if "section_items" in text:
            return _ScalarListResult(self.items)
        return _ScalarListResult(self.sections)

    def add(self, record):
        self.added.append(record)

    async def flush(self):
        self.flush_count += 1


class _StaleIdentityMapDb(_ReorderDb):
    def __init__(self, *, loaded_section, current_parent_state, items):
        super().__init__(sections=[loaded_section], items=items)
        self.loaded_section = loaded_section
        self.current_parent_state = current_parent_state

    async def execute(self, statement):
        self.statements.append(statement)
        if "section_items" in str(statement):
            return _ScalarListResult(self.items)
        if (
            statement._for_update_arg is not None
            and statement.get_execution_options().get("populate_existing") is True
        ):
            for field, value in self.current_parent_state.items():
                setattr(self.loaded_section, field, value)
        return _ScalarListResult([self.loaded_section])


def _user(*permissions: str):
    role = SimpleNamespace(
        is_active=True,
        role_permissions=[
            SimpleNamespace(permission=SimpleNamespace(name=permission, is_active=True))
            for permission in permissions
        ],
    )
    return SimpleNamespace(
        id=uuid.uuid4(),
        role_assignments=[SimpleNamespace(is_active=True, role=role)],
    )


def _section(*, order: int, revision: int = 1, status: str = "draft") -> PageSection:
    section = PageSection(
        page_key="homepage",
        scope_type="university",
        section_key=f"section-{order}",
        layout_variant="hero_admissions",
        display_order=order,
        revision=revision,
        status=status,
        workflow_status=status,
    )
    section.id = uuid.uuid4()
    return section


def _item(section: PageSection, *, order: int, revision: int = 1) -> SectionItem:
    item = SectionItem(
        page_section_id=section.id,
        item_type="text",
        title=f"Item {order}",
        display_order=order,
        revision=revision,
    )
    item.id = uuid.uuid4()
    return item


class PageCmsReorderTests(unittest.IsolatedAsyncioTestCase):
    async def test_section_reorder_normalizes_order_locks_rows_and_increments_revisions(self):
        first = _section(order=100)
        second = _section(order=200)
        db = _ReorderDb(sections=[first, second])
        user = _user("page_sections.update")
        request = PageSectionReorderRequest.model_validate({
            "scope_type": "university",
            "scope_id": None,
            "items": [
                {"id": str(second.id), "display_order": 1, "revision": 1},
                {"id": str(first.id), "display_order": 99, "revision": 1},
            ],
        })

        with patch.object(page_cms, "_require_page_section_access", AsyncMock()):
            response = await page_cms.reorder_page_sections(
                "homepage", request, db=db, user=user,
            )

        self.assertEqual([second.id, first.id], [section.id for section in response["data"]])
        self.assertEqual([10, 20], [section.display_order for section in response["data"]])
        self.assertEqual([2, 2], [section.revision for section in response["data"]])
        self.assertTrue(all(statement._for_update_arg is not None for statement in db.statements))
        self.assertTrue(all(
            statement.get_execution_options().get("populate_existing") is True
            for statement in db.statements
        ))
        self.assertEqual(1, db.flush_count)
        self.assertEqual(1, len(db.added))
        self.assertEqual("draft", db.added[0].from_status)
        self.assertEqual("draft", db.added[0].to_status)
        self.assertIn("section_reorder", db.added[0].changed_fields)

    async def test_draft_item_reorder_records_exactly_one_audit_event(self):
        section = _section(order=10)
        first = _item(section, order=100)
        second = _item(section, order=200)
        db = _ReorderDb(sections=[section], items=[first, second])
        request = SectionItemReorderRequest.model_validate({
            "items": [
                {"id": str(second.id), "display_order": 10, "revision": 1},
                {"id": str(first.id), "display_order": 20, "revision": 1},
            ],
        })

        with (
            patch.object(page_cms, "_get_page_section_or_404", AsyncMock(return_value=section)),
            patch.object(page_cms, "_require_page_section_access", AsyncMock()),
        ):
            await page_cms.reorder_section_items(
                section.id, request, db=db, user=_user("section_items.manage"),
            )

        self.assertEqual(1, len(db.added))
        self.assertEqual(section.id, db.added[0].content_id)
        self.assertEqual("draft", db.added[0].from_status)
        self.assertEqual("draft", db.added[0].to_status)
        self.assertIn("section_item_reorder", db.added[0].changed_fields)
        self.assertTrue(all(
            statement.get_execution_options().get("populate_existing") is True
            for statement in db.statements
        ))

    async def test_multiple_published_sections_reset_with_exactly_one_audit_event(self):
        first = _section(order=100, status="published")
        second = _section(order=200, status="published")
        db = _ReorderDb(sections=[first, second])
        request = PageSectionReorderRequest.model_validate({
            "scope_type": "university",
            "items": [
                {"id": str(second.id), "display_order": 10, "revision": 1},
                {"id": str(first.id), "display_order": 20, "revision": 1},
            ],
        })

        with patch.object(page_cms, "_require_page_section_access", AsyncMock()):
            await page_cms.reorder_page_sections(
                "homepage", request, db=db, user=_user("page_sections.update"),
            )

        self.assertEqual(["draft", "draft"], [first.status, second.status])
        self.assertEqual(["draft", "draft"], [first.workflow_status, second.workflow_status])
        self.assertEqual(1, len(db.added))
        self.assertEqual(first.id, db.added[0].content_id)
        self.assertEqual("published", db.added[0].from_status)
        self.assertIn("section_reorder", db.added[0].changed_fields)

    async def test_item_reorder_resets_published_parent_and_records_old_and_new_order_once(self):
        section = _section(order=10, status="published")
        first = _item(section, order=100)
        second = _item(section, order=200)
        db = _ReorderDb(sections=[section], items=[first, second])
        request = SectionItemReorderRequest.model_validate({
            "items": [
                {"id": str(second.id), "display_order": 10, "revision": 1},
                {"id": str(first.id), "display_order": 20, "revision": 1},
            ],
        })

        with (
            patch.object(page_cms, "_get_page_section_or_404", AsyncMock(return_value=section)),
            patch.object(page_cms, "_require_page_section_access", AsyncMock()),
        ):
            response = await page_cms.reorder_section_items(
                section.id, request, db=db, user=_user("section_items.manage"),
            )

        self.assertEqual([second.id, first.id], [item.id for item in response["data"]])
        self.assertEqual([10, 20], [item.display_order for item in response["data"]])
        self.assertEqual([2, 2], [item.revision for item in response["data"]])
        self.assertEqual("draft", section.status)
        self.assertEqual("draft", section.workflow_status)
        self.assertEqual(1, len(db.added))
        audit = db.added[0]
        self.assertEqual("edit_reset", audit.action)
        self.assertEqual({
            "section_item_reorder": {
                "old_order": [
                    {"id": str(first.id), "display_order": 100},
                    {"id": str(second.id), "display_order": 200},
                ],
                "new_order": [
                    {"id": str(second.id), "display_order": 10},
                    {"id": str(first.id), "display_order": 20},
                ],
            },
        }, audit.changed_fields)

    async def test_stale_section_revision_returns_reload_conflict(self):
        section = _section(order=100, revision=2)
        db = _ReorderDb(sections=[section])
        request = PageSectionReorderRequest.model_validate({
            "scope_type": "university",
            "items": [{"id": str(section.id), "display_order": 10, "revision": 1}],
        })

        with patch.object(page_cms, "_require_page_section_access", AsyncMock()):
            with self.assertRaises(HTTPException) as context:
                await page_cms.reorder_page_sections("homepage", request, db=db, user=_user())

        self.assertEqual(409, context.exception.status_code)
        self.assertEqual("Page composition changed; reload before saving order", context.exception.detail)
        self.assertEqual(100, section.display_order)
        self.assertEqual(2, section.revision)

    async def test_duplicate_missing_and_wrong_parent_ids_reject_without_partial_mutation(self):
        first = _section(order=100)
        second = _section(order=200)
        db = _ReorderDb(sections=[first, second])
        original = [(section.display_order, section.revision) for section in db.sections]

        cases = (
            [
                {"id": first.id, "display_order": 10, "revision": 1},
                {"id": first.id, "display_order": 20, "revision": 1},
            ],
            [{"id": first.id, "display_order": 10, "revision": 1}],
            [
                {"id": first.id, "display_order": 10, "revision": 1},
                {"id": uuid.uuid4(), "display_order": 20, "revision": 1},
            ],
        )

        for entries in cases:
            with self.subTest(entries=entries):
                with self.assertRaises(PageCmsReorderValidationError):
                    await PageSectionService.reorder_sections(
                        db,
                        page_key="homepage",
                        scope_type="university",
                        scope_id=None,
                        entries=entries,
                        actor_id=uuid.uuid4(),
                    )
                self.assertEqual(original, [(section.display_order, section.revision) for section in db.sections])
                self.assertEqual([], db.added)

    async def test_reorder_requires_authorized_scope_before_service_execution(self):
        section = _section(order=100)
        request = PageSectionReorderRequest.model_validate({
            "scope_type": "university",
            "items": [{"id": str(section.id), "display_order": 10, "revision": 1}],
        })
        denied = HTTPException(status_code=403, detail="Insufficient privileges for this page section scope")

        reorder_sections = AsyncMock()
        with (
            patch.object(page_cms, "_require_page_section_access", AsyncMock(side_effect=denied)),
            patch.object(page_cms.PageSectionService, "reorder_sections", reorder_sections),
        ):
            with self.assertRaises(HTTPException) as context:
                await page_cms.reorder_page_sections("homepage", request, db=_ReorderDb(), user=_user())

        self.assertEqual(403, context.exception.status_code)
        reorder_sections.assert_not_awaited()

    async def test_section_reorder_rejects_submitted_section_before_any_mutation(self):
        first = _section(order=100)
        second = _section(order=200, status="in_review")
        db = _ReorderDb(sections=[first, second])
        request = PageSectionReorderRequest.model_validate({
            "scope_type": "university",
            "items": [
                {"id": str(second.id), "display_order": 10, "revision": 1},
                {"id": str(first.id), "display_order": 20, "revision": 1},
            ],
        })

        with patch.object(page_cms, "_require_page_section_access", AsyncMock()):
            with self.assertRaises(HTTPException) as context:
                await page_cms.reorder_page_sections(
                    "homepage", request, db=db, user=_user("page_sections.update"),
                )

        self.assertEqual(403, context.exception.status_code)
        self.assertEqual([(100, 1, "draft"), (200, 1, "in_review")], [
            (section.display_order, section.revision, section.status)
            for section in (first, second)
        ])
        self.assertEqual([], db.added)
        self.assertEqual(0, db.flush_count)

    async def test_item_reorder_rejects_approved_parent_before_any_mutation(self):
        section = _section(order=10, status="approved")
        first = _item(section, order=100)
        second = _item(section, order=200)
        db = _ReorderDb(sections=[section], items=[first, second])
        request = SectionItemReorderRequest.model_validate({
            "items": [
                {"id": str(second.id), "display_order": 10, "revision": 1},
                {"id": str(first.id), "display_order": 20, "revision": 1},
            ],
        })

        with (
            patch.object(page_cms, "_get_page_section_or_404", AsyncMock(return_value=section)),
            patch.object(page_cms, "_require_page_section_access", AsyncMock()),
        ):
            with self.assertRaises(HTTPException) as context:
                await page_cms.reorder_section_items(
                    section.id, request, db=db, user=_user("section_items.manage"),
                )

        self.assertEqual(403, context.exception.status_code)
        self.assertEqual([(100, 1), (200, 1)], [
            (item.display_order, item.revision) for item in (first, second)
        ])
        self.assertEqual("approved", section.status)
        self.assertEqual([], db.added)
        self.assertEqual(0, db.flush_count)

    async def test_review_editor_can_reorder_submitted_sections(self):
        first = _section(order=100, status="in_review")
        second = _section(order=200, status="approved")
        db = _ReorderDb(sections=[first, second])
        request = PageSectionReorderRequest.model_validate({
            "scope_type": "university",
            "items": [
                {"id": str(second.id), "display_order": 10, "revision": 1},
                {"id": str(first.id), "display_order": 20, "revision": 1},
            ],
        })

        with patch.object(page_cms, "_require_page_section_access", AsyncMock()):
            response = await page_cms.reorder_page_sections(
                "homepage",
                request,
                db=db,
                user=_user("page_sections.update", "content.edit_submitted"),
            )

        self.assertEqual([second.id, first.id], [section.id for section in response["data"]])
        self.assertEqual(["draft", "draft"], [first.status, second.status])
        self.assertEqual(1, len(db.added))

    async def test_item_reorder_rechecks_locked_parent_current_scope_before_item_query(self):
        section = _section(order=10)
        first = _item(section, order=100)
        second = _item(section, order=200)
        current_scope_id = uuid.uuid4()
        db = _StaleIdentityMapDb(
            loaded_section=section,
            current_parent_state={
                "page_key": "school-homepage",
                "scope_type": "school",
                "scope_id": current_scope_id,
            },
            items=[first, second],
        )
        request = SectionItemReorderRequest.model_validate({
            "items": [
                {"id": str(second.id), "display_order": 10, "revision": 1},
                {"id": str(first.id), "display_order": 20, "revision": 1},
            ],
        })
        checked_scopes = []

        async def require_access(_db, _user, *, page_key, scope_type, scope_id, action):
            checked_scopes.append((page_key, scope_type, scope_id, action))
            if scope_type == "school":
                raise HTTPException(status_code=403, detail="Current scope denied")

        with patch.object(page_cms, "_require_page_section_access", side_effect=require_access):
            with self.assertRaises(HTTPException) as context:
                await page_cms.reorder_section_items(
                    section.id,
                    request,
                    db=db,
                    user=_user("section_items.manage"),
                )

        self.assertEqual(403, context.exception.status_code)
        self.assertEqual([
            ("homepage", "university", None, "item_manage"),
            ("school-homepage", "school", current_scope_id, "item_manage"),
        ], checked_scopes)
        self.assertFalse(any("section_items" in str(statement) for statement in db.statements))
        self.assertEqual([(100, 1), (200, 1)], [
            (item.display_order, item.revision) for item in (first, second)
        ])
        self.assertEqual([], db.added)
        self.assertEqual(0, db.flush_count)

    async def test_item_reorder_rechecks_locked_parent_current_workflow_before_item_query(self):
        section = _section(order=10)
        first = _item(section, order=100)
        second = _item(section, order=200)
        db = _StaleIdentityMapDb(
            loaded_section=section,
            current_parent_state={"status": "approved", "workflow_status": "approved"},
            items=[first, second],
        )
        request = SectionItemReorderRequest.model_validate({
            "items": [
                {"id": str(second.id), "display_order": 10, "revision": 1},
                {"id": str(first.id), "display_order": 20, "revision": 1},
            ],
        })

        with patch.object(page_cms, "_require_page_section_access", AsyncMock()):
            with self.assertRaises(HTTPException) as context:
                await page_cms.reorder_section_items(
                    section.id,
                    request,
                    db=db,
                    user=_user("section_items.manage"),
                )

        self.assertEqual(403, context.exception.status_code)
        self.assertEqual("Submitted content requires review edit privileges", context.exception.detail)
        self.assertFalse(any("section_items" in str(statement) for statement in db.statements))
        self.assertEqual([(100, 1), (200, 1)], [
            (item.display_order, item.revision) for item in (first, second)
        ])
        self.assertEqual([], db.added)
        self.assertEqual(0, db.flush_count)


if __name__ == "__main__":
    unittest.main()
