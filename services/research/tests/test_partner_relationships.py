import unittest
import uuid
from unittest.mock import AsyncMock, patch

from app.services.core import MainScopedEventService
from app.services.impact import SustainabilityRelationshipService
from app.services.partnership import PartnerRelationshipService


class PartnerRelationshipAggregationTests(unittest.IsolatedAsyncioTestCase):
    async def test_partner_activities_include_direct_project_farm_and_sustainability_scopes(self):
        partner_id = uuid.uuid4()
        project_id = uuid.uuid4()
        farm_id = uuid.uuid4()
        sustainability_id = uuid.uuid4()

        async def event_list(scope_type, scope_id):
            return [{"id": f"{scope_type}:{scope_id}", "scope_type": scope_type, "scope_id": str(scope_id)}]

        with (
            patch.object(PartnerRelationshipService, "_ensure_partner", new=AsyncMock()),
            patch.object(PartnerRelationshipService, "list_projects", new=AsyncMock(return_value=[{"id": project_id}])),
            patch.object(PartnerRelationshipService, "list_farms", new=AsyncMock(return_value=[{"id": farm_id}])),
            patch.object(PartnerRelationshipService, "list_sustainability", new=AsyncMock(return_value=[{"id": sustainability_id}])),
            patch.object(MainScopedEventService, "list", new=AsyncMock(side_effect=event_list)) as event_list_mock,
        ):
            activities = await PartnerRelationshipService.list_activities(None, partner_id)

        self.assertEqual(
            {
                "research_partner",
                "research_project",
                "research_farm",
                "research_sustainability",
            },
            {activity["scope_type"] for activity in activities},
        )
        event_list_mock.assert_any_await("research_partner", partner_id)
        event_list_mock.assert_any_await("research_project", project_id)
        event_list_mock.assert_any_await("research_farm", farm_id)
        event_list_mock.assert_any_await("research_sustainability", sustainability_id)

    async def test_partner_impact_stories_include_sustainability_linked_stories(self):
        partner_id = uuid.uuid4()
        sustainability_id = uuid.uuid4()
        direct_story = {"id": "direct-story", "title": "Direct project story"}
        sustainability_story = {"id": "sustainability-story", "title": "Sustainability story"}

        with (
            patch.object(PartnerRelationshipService, "_ensure_partner", new=AsyncMock()),
            patch("app.services.partnership._related_many", new=AsyncMock(return_value=[direct_story])),
            patch.object(PartnerRelationshipService, "list_sustainability", new=AsyncMock(return_value=[{"id": sustainability_id}])),
            patch.object(SustainabilityRelationshipService, "list_stories", new=AsyncMock(return_value=[sustainability_story])) as stories_mock,
        ):
            stories = await PartnerRelationshipService.list_impact_stories(None, partner_id)

        self.assertEqual([direct_story, sustainability_story], stories)
        stories_mock.assert_awaited_once_with(None, sustainability_id)

    async def test_partner_innovation_pathway_methods_read_partner_records(self):
        partner_id = uuid.uuid4()
        expected = [{"id": "pathway-record", "title": "Partner pathway record"}]

        for method_name in (
            "list_startups",
            "list_incubation_records",
            "list_competition_entries",
            "list_technology_transfer_cases",
        ):
            with self.subTest(method_name=method_name):
                with (
                    patch.object(PartnerRelationshipService, "_ensure_partner", new=AsyncMock()),
                    patch("app.services.partnership._related_many", new=AsyncMock(return_value=expected)) as related_mock,
                ):
                    result = await getattr(PartnerRelationshipService, method_name)(None, partner_id)

                self.assertEqual(expected, result)
                related_mock.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
