import uuid
import unittest
from datetime import date, datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

from app.models import grant_themes
from app.schemas import (
    EndowmentFundUpdate,
    FundingUpdate,
    GrantApplicationUpdate,
    GrantGuidelineUpdate,
    GrantReportUpdate,
    GrantReviewUpdate,
    GrantUpdate,
)
from app.services.funding import GrantRelationshipService


class FundingUpdateSchemaTests(unittest.TestCase):
    def test_grant_update_accepts_full_edit_fields(self):
        cover_image_id = uuid.uuid4()
        attachment_id = uuid.uuid4()
        payload = GrantUpdate.model_validate(
            {
                "title": "Climate Seed Grant",
                "slug": "climate-seed-grant",
                "code": "CSG",
                "grant_type": "internal",
                "category": "research",
                "funder_name": "Research Office",
                "summary": "Short summary",
                "description": "Detailed description",
                "objectives": "Objectives",
                "eligibility": "Eligibility",
                "focus_areas": "Climate",
                "requirements": "Requirements",
                "total_budget": "1000000.00",
                "min_award": "10000.00",
                "max_award": "250000.00",
                "currency": "KES",
                "number_of_awards": 4,
                "announcement_date": date(2026, 1, 1),
                "open_date": date(2026, 1, 15),
                "deadline": datetime(2026, 2, 1, tzinfo=timezone.utc),
                "review_start_date": date(2026, 2, 5),
                "award_date": date(2026, 3, 1),
                "project_start_date": date(2026, 4, 1),
                "project_end_date": date(2027, 4, 1),
                "external_url": "https://example.com/grant",
                "application_url": "https://example.com/apply",
                "cover_image_id": cover_image_id,
                "attachment_media_ids": [attachment_id],
                "cover_image_url": "https://example.com/cover.jpg",
                "documents": [{"name": "Call document"}],
                "contact_name": "Research Admin",
                "contact_email": "research@example.com",
                "contact_phone": "+254700000000",
                "status": "open",
                "is_active": True,
                "is_featured": True,
            }
        )

        self.assertEqual("Climate Seed Grant", payload.title)
        self.assertEqual(Decimal("1000000.00"), payload.total_budget)
        self.assertEqual("open", payload.status)
        self.assertEqual(cover_image_id, payload.cover_image_id)
        self.assertEqual([attachment_id], payload.attachment_media_ids)
        self.assertEqual([{"name": "Call document"}], payload.documents)

    def test_other_funding_update_schemas_accept_full_edit_fields(self):
        grant_id = uuid.uuid4()
        application_id = uuid.uuid4()
        person_id = uuid.uuid4()
        project_id = uuid.uuid4()
        document_id = uuid.uuid4()
        logo_id = uuid.uuid4()
        attachment_id = uuid.uuid4()

        guideline = GrantGuidelineUpdate.model_validate(
            {
                "grant_id": grant_id,
                "title": "Submission Checklist",
                "slug": "submission-checklist",
                "guideline_type": "checklist",
                "content": "Checklist content",
                "document_id": document_id,
                "document_url": "https://example.com/checklist.pdf",
                "document_name": "Checklist.pdf",
                "is_required": True,
                "is_active": True,
            }
        )
        application = GrantApplicationUpdate.model_validate(
            {
                "grant_id": grant_id,
                "applicant_id": person_id,
                "project_title": "Youth Climate Skills",
                "summary": "Summary",
                "abstract": "Abstract",
                "objectives": "Objectives",
                "methodology": "Methodology",
                "expected_outcomes": "Outcomes",
                "work_plan": "Plan",
                "timeline": "Timeline",
                "requested_amount": "500000.00",
                "budget_breakdown": {"travel": 1000},
                "currency": "KES",
                "proposed_start_date": date(2026, 5, 1),
                "proposed_end_date": date(2026, 12, 1),
                "duration_months": 7,
                "co_investigators": [{"name": "Co PI"}],
                "attachment_media_ids": [attachment_id],
                "documents": [{"name": "Proposal"}],
                "status": "submitted",
            }
        )
        review = GrantReviewUpdate.model_validate(
            {
                "application_id": application_id,
                "reviewer_id": person_id,
                "overall_score": 87,
                "criteria_scores": {"impact": 90},
                "strengths": "Strong team",
                "weaknesses": "Budget needs detail",
                "comments": "Recommended",
                "recommendation": "approve",
                "status": "completed",
            }
        )
        report = GrantReportUpdate.model_validate(
            {
                "grant_id": grant_id,
                "application_id": application_id,
                "project_id": project_id,
                "submitter_id": person_id,
                "report_type": "progress",
                "title": "Quarter 1 Report",
                "reporting_period_start": date(2026, 5, 1),
                "reporting_period_end": date(2026, 8, 1),
                "summary": "Progress summary",
                "activities": "Activities",
                "achievements": "Achievements",
                "challenges": "Challenges",
                "lessons_learned": "Lessons",
                "next_steps": "Next",
                "expenditure_summary": {"spent": 100},
                "amount_spent": "100.00",
                "balance": "400.00",
                "documents": [{"name": "Report"}],
                "status": "submitted",
            }
        )
        funder = FundingUpdate.model_validate(
            {
                "name": "Green Climate Fund",
                "slug": "green-climate-fund",
                "acronym": "GCF",
                "funder_type": "international",
                "about": "About",
                "focus_areas": "Climate",
                "website": "https://example.com",
                "email": "funding@example.com",
                "phone": "+254700000001",
                "address": "Nairobi",
                "country": "Kenya",
                "logo_id": logo_id,
                "logo_url": "https://example.com/logo.png",
                "is_active": True,
            }
        )
        endowment = EndowmentFundUpdate.model_validate(
            {
                "name": "Research Endowment",
                "slug": "research-endowment",
                "code": "RE",
                "fund_type": "general",
                "purpose": "Purpose",
                "description": "Description",
                "eligibility": "Eligibility",
                "use_guidelines": "Guidelines",
                "principal_amount": "1000000.00",
                "current_value": "1200000.00",
                "annual_distribution": "50000.00",
                "currency": "KES",
                "established_date": date(2020, 1, 1),
                "donor_name": "Donor",
                "donor_message": "Message",
                "contact_name": "Contact",
                "contact_email": "contact@example.com",
                "cover_image_id": document_id,
                "document_media_ids": [attachment_id],
                "cover_image_url": "https://example.com/cover.jpg",
                "status": "active",
                "is_accepting_contributions": True,
                "is_active": True,
                "is_featured": True,
            }
        )

        self.assertEqual("Submission Checklist", guideline.title)
        self.assertEqual(document_id, guideline.document_id)
        self.assertEqual("Youth Climate Skills", application.project_title)
        self.assertEqual([attachment_id], application.attachment_media_ids)
        self.assertEqual("approve", review.recommendation)
        self.assertEqual("Quarter 1 Report", report.title)
        self.assertEqual("Green Climate Fund", funder.name)
        self.assertEqual(logo_id, funder.logo_id)
        self.assertEqual("Research Endowment", endowment.name)
        self.assertEqual([attachment_id], endowment.document_media_ids)


class FundingRelationshipServiceTests(unittest.IsolatedAsyncioTestCase):
    async def test_add_theme_inserts_grant_theme_ids(self):
        db = AsyncMock()
        db.scalar = AsyncMock(return_value=0)
        grant_id = uuid.uuid4()
        theme_id = uuid.uuid4()

        with (
            patch.object(GrantRelationshipService, "_ensure_grant", new=AsyncMock()),
            patch.object(GrantRelationshipService, "_ensure_theme", new=AsyncMock()),
            patch("app.services.funding.insert") as insert_mock,
        ):
            insert_mock.return_value.values = MagicMock(return_value="insert-statement")

            await GrantRelationshipService.add_theme(db, grant_id, theme_id)

        insert_mock.assert_called_once_with(grant_themes)
        insert_mock.return_value.values.assert_called_once_with(grant_id=grant_id, theme_id=theme_id)
        db.execute.assert_awaited_once_with("insert-statement")
        db.flush.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
