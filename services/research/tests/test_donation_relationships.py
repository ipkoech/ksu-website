import unittest
import uuid
from unittest.mock import AsyncMock, patch

from fastapi.routing import APIRoute

from app.routes.v1.donations import router as donations_router
from app.services.donation import DonationRelationshipService


def _route(router, path: str, method: str) -> APIRoute:
    for route in router.routes:
        if isinstance(route, APIRoute) and route.path == path and method in route.methods:
            return route
    raise AssertionError(f"{method} {path} route not found")


class _RowsResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class _ScalarRows:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class _ScalarsResult:
    def __init__(self, rows):
        self._rows = rows

    def scalars(self):
        return _ScalarRows(self._rows)


class _DonationRelationDb:
    def __init__(self, source_rows, impact_rows):
        self.source_rows = source_rows
        self.impact_rows = impact_rows
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        if len(self.statements) == 1:
            return _RowsResult(self.source_rows)
        return _ScalarsResult(self.impact_rows)


class _Impact:
    def __init__(self, **values):
        self.id = values.get("id", uuid.uuid4())
        self.title = values.get("title", "Impact")
        self.slug = values.get("slug", "impact")
        self.status = values.get("status", "published")
        self.created_at = None
        self.updated_at = None
        self.impact_type = values.get("impact_type", "project")
        self.reporting_year = values.get("reporting_year", 2026)
        self.project_id = values.get("project_id")
        self.center_id = values.get("center_id")
        self.scholarship_id = values.get("scholarship_id")
        self.fund_id = values.get("fund_id")


class _Story:
    def __init__(self, **values):
        self.id = values.get("id", uuid.uuid4())
        self.title = values.get("title", "Story")
        self.name = None
        self.slug = values.get("slug", "story")
        self.status = values.get("status", "published")
        self.created_at = None
        self.updated_at = None
        self.donor_id = values.get("donor_id")
        self.donor_name = values.get("donor_name", "Donor")
        self.donor_organization = values.get("donor_organization")


class _ImpactStoriesDb:
    def __init__(self, donor_rows, story_rows):
        self.donor_rows = donor_rows
        self.story_rows = story_rows
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        if len(self.statements) == 1:
            return _RowsResult(self.donor_rows)
        return _ScalarsResult(self.story_rows)


class DonationRelationshipTests(unittest.IsolatedAsyncioTestCase):
    def test_donation_relationship_routes_exist(self):
        self.assertIsNotNone(_route(donations_router, "/donors/id/{donor_id}/impacts", "GET"))
        self.assertIsNotNone(_route(donations_router, "/donation-impacts/id/{impact_id}/donations", "GET"))
        self.assertIsNotNone(_route(donations_router, "/donation-impacts/id/{impact_id}/stories", "GET"))

    async def test_donor_impacts_are_resolved_from_donor_donation_source_bindings(self):
        donor_id = uuid.uuid4()
        project_id = uuid.uuid4()
        impact = _Impact(project_id=project_id)
        db = _DonationRelationDb(
            source_rows=[(project_id, None, None, None)],
            impact_rows=[impact],
        )

        with patch.object(DonationRelationshipService, "_ensure_donor", new=AsyncMock()):
            impacts = await DonationRelationshipService.list_donor_impacts(db, donor_id)

        self.assertEqual([impact.id], [item["id"] for item in impacts])
        self.assertEqual(2, len(db.statements))
        self.assertIn("donations.donor_id", str(db.statements[0]).lower())
        self.assertIn("donation_impacts.project_id", str(db.statements[1]).lower())

    async def test_impact_stories_are_resolved_from_matching_donation_donors(self):
        donor_id = uuid.uuid4()
        project_id = uuid.uuid4()
        impact = _Impact(project_id=project_id)
        story = _Story(donor_id=donor_id)
        db = _ImpactStoriesDb(donor_rows=[(donor_id,)], story_rows=[story])

        with patch.object(DonationRelationshipService, "_ensure_impact", new=AsyncMock(return_value=impact)):
            stories = await DonationRelationshipService.list_impact_stories(db, impact.id)

        self.assertEqual([story.id], [item["id"] for item in stories])
        self.assertEqual(2, len(db.statements))
        self.assertIn("donations.project_id", str(db.statements[0]).lower())
        self.assertIn("donation_stories.donor_id", str(db.statements[1]).lower())


if __name__ == "__main__":
    unittest.main()
