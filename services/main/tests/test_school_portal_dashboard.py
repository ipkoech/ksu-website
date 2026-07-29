import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi import FastAPI

from app.api.v1 import register_routes
from app.schemas.school_portal_dashboard import SchoolPortalDashboardResponse
from app.services.school_portal_dashboard import (
    dashboard_window,
    permission_quick_links,
    profile_completeness,
)


class SchoolPortalDashboardContractTests(unittest.TestCase):
    def test_dashboard_route_and_supported_ranges_are_in_openapi(self):
        app = FastAPI()
        register_routes(app)
        operation = app.openapi()["paths"]["/api/v1/school-portal/dashboard"]["get"]

        self.assertTrue(operation["operationId"].startswith("get_school_dashboard"))
        range_parameter = next(
            item for item in operation["parameters"] if item["name"] == "range"
        )
        self.assertEqual(
            {"7d", "30d", "90d", "12m"},
            set(range_parameter["schema"]["enum"]),
        )

    def test_range_uses_timezone_aware_current_and_preceding_periods(self):
        now = datetime(2026, 7, 17, 12, tzinfo=timezone.utc)

        window = dashboard_window("30d", now=now)

        self.assertEqual(30, (window.end - window.start).days)
        self.assertEqual(30, (window.start - window.previous_start).days)
        self.assertIsNotNone(window.start.tzinfo)

    def test_profile_completeness_counts_real_public_profile_fields(self):
        school = SimpleNamespace(
            about="About",
            head_message="Dean message",
            mission="Mission",
            vision="Vision",
            mandate=None,
            core_values=None,
            email="school@example.test",
            phone="+254700000000",
            office_location="Block A",
            website=None,
            dean_id=uuid.uuid4(),
            logo_image_id=uuid.uuid4(),
            cover_image_id=None,
            brochure_id=None,
        )

        result = profile_completeness(school)

        self.assertEqual(64, result.percent)
        self.assertIn("mandate", result.missing_fields)
        self.assertIn("cover_image", result.missing_fields)

    def test_quick_links_are_permission_filtered(self):
        links = permission_quick_links(
            {"school.departments.view", "school.inquiries.view"},
            {"departments": 3, "inquiries": 4, "content": 9},
        )

        self.assertEqual(["departments", "inquiries"], [item.key for item in links])
        self.assertEqual([3, 4], [item.count for item in links])

    def test_response_contract_contains_all_operational_sections(self):
        response = SchoolPortalDashboardResponse(
            school_id=uuid.uuid4(),
            range="7d",
            generated_at=datetime.now(timezone.utc),
            summary_cards=[],
            activity_summary={
                "page_views": 0,
                "previous_page_views": 0,
                "visitors": 0,
                "previous_visitors": 0,
            },
            trends=[],
            distributions={},
            attention_items=[],
            recent_activity=[],
            quick_links=[],
            quick_actions=[],
            profile_completeness={
                "percent": 0,
                "completed_fields": 0,
                "total_fields": 14,
                "missing_fields": ["about"],
            },
            collection_notes={
                "traffic": "Collected from first-party analytics after deployment."
            },
        )

        payload = response.model_dump(mode="json")
        self.assertIn("summary_cards", payload)
        self.assertIn("trends", payload)
        self.assertIn("distributions", payload)
        self.assertIn("attention_items", payload)
        self.assertIn("recent_activity", payload)
        self.assertIn("quick_links", payload)


if __name__ == "__main__":
    unittest.main()
