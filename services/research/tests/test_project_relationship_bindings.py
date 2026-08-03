import uuid
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException

from app.models import center_partners, project_focus_areas, project_funders, project_partners
from app.services.core import CenterRelationshipService, ProjectRelationshipService, ProjectService


class ProjectRelationshipBindingTests(unittest.IsolatedAsyncioTestCase):
    async def test_ensure_project_uses_project_service_lookup(self):
        db = AsyncMock()
        project_id = uuid.uuid4()
        project = object()

        with patch.object(ProjectService, "get_by_id", new=AsyncMock(return_value=project)) as get_by_id:
            result = await ProjectRelationshipService._ensure_project(db, project_id)

        self.assertIs(project, result)
        get_by_id.assert_awaited_once_with(db, project_id)

    async def test_ensure_project_raises_404_when_project_missing(self):
        db = AsyncMock()
        project_id = uuid.uuid4()

        with patch.object(ProjectService, "get_by_id", new=AsyncMock(return_value=None)):
            with self.assertRaises(HTTPException) as error:
                await ProjectRelationshipService._ensure_project(db, project_id)

        self.assertEqual(404, error.exception.status_code)

    async def test_add_partner_inserts_project_partner_ids(self):
        db = AsyncMock()
        db.scalar = AsyncMock(return_value=0)
        project_id = uuid.uuid4()
        partner_id = uuid.uuid4()

        with (
            patch.object(ProjectRelationshipService, "_ensure_project", new=AsyncMock()),
            patch.object(ProjectRelationshipService, "_ensure_partner", new=AsyncMock()),
            patch("app.services.core.insert") as insert_mock,
        ):
            insert_mock.return_value.values = MagicMock(return_value="insert-statement")

            await ProjectRelationshipService.add_partner(db, project_id, partner_id)

        insert_mock.assert_called_once_with(project_partners)
        insert_mock.return_value.values.assert_called_once_with(project_id=project_id, partner_id=partner_id)
        db.execute.assert_awaited_once_with("insert-statement")
        db.flush.assert_awaited_once()


class CenterPartnerRelationshipTests(unittest.IsolatedAsyncioTestCase):
    async def test_add_partner_inserts_metadata(self):
        db = AsyncMock()
        db.scalar = AsyncMock(return_value=0)
        center_id = uuid.uuid4()
        partner_id = uuid.uuid4()
        metadata = {"partnership_type": "strategic", "status": "active", "notes": "MOU"}

        with (
            patch.object(CenterRelationshipService, "_ensure_center", new=AsyncMock()),
            patch.object(CenterRelationshipService, "_ensure_partner", new=AsyncMock()),
            patch("app.services.core.insert") as insert_mock,
        ):
            insert_mock.return_value.values = MagicMock(return_value="insert-statement")
            await CenterRelationshipService.add_partner(db, center_id, partner_id, metadata)

        insert_mock.assert_called_once_with(center_partners)
        insert_mock.return_value.values.assert_called_once_with(center_id=center_id, partner_id=partner_id, **metadata)
        db.execute.assert_awaited_once_with("insert-statement")
        db.flush.assert_awaited_once()

    async def test_remove_partner_deletes_link(self):
        db = AsyncMock()
        center_id = uuid.uuid4()
        partner_id = uuid.uuid4()
        with patch("app.services.core.delete") as delete_mock:
            delete_mock.return_value.where.return_value = "delete-statement"
            await CenterRelationshipService.remove_partner(db, center_id, partner_id)
        db.execute.assert_awaited_once_with("delete-statement")
        db.flush.assert_awaited_once()

    async def test_add_funder_inserts_project_funder_ids(self):
        db = AsyncMock()
        db.scalar = AsyncMock(return_value=0)
        project_id = uuid.uuid4()
        funder_id = uuid.uuid4()

        with (
            patch.object(ProjectRelationshipService, "_ensure_project", new=AsyncMock()),
            patch.object(ProjectRelationshipService, "_ensure_funder", new=AsyncMock()),
            patch("app.services.core.insert") as insert_mock,
        ):
            insert_mock.return_value.values = MagicMock(return_value="insert-statement")

            await ProjectRelationshipService.add_funder(db, project_id, funder_id)

        insert_mock.assert_called_once_with(project_funders)
        insert_mock.return_value.values.assert_called_once_with(project_id=project_id, funding_id=funder_id)
        db.execute.assert_awaited_once_with("insert-statement")
        db.flush.assert_awaited_once()

    async def test_add_focus_area_inserts_project_focus_area_ids(self):
        db = AsyncMock()
        db.scalar = AsyncMock(return_value=0)
        project_id = uuid.uuid4()
        focus_area_id = uuid.uuid4()

        with (
            patch.object(ProjectRelationshipService, "_ensure_project", new=AsyncMock()),
            patch.object(ProjectRelationshipService, "_ensure_focus_area", new=AsyncMock()),
            patch("app.services.core.insert") as insert_mock,
        ):
            insert_mock.return_value.values = MagicMock(return_value="insert-statement")

            await ProjectRelationshipService.add_focus_area(db, project_id, focus_area_id)

        insert_mock.assert_called_once_with(project_focus_areas)
        insert_mock.return_value.values.assert_called_once_with(project_id=project_id, focus_area_id=focus_area_id)
        db.execute.assert_awaited_once_with("insert-statement")
        db.flush.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
