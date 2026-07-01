import unittest
import uuid
from decimal import Decimal

from fastapi.routing import APIRoute

from app.routes.v1.donations import router as donations_router
from app.routes.v1.grants import router as grants_router
from app.routes.v1.scholarships import router as scholarships_router
from app.routes.v1.training import router as training_router
from app.schemas import PublicDonationSubmission
from app.services.core import ProjectService
from app.services.donation import DonationService


class _ScalarResult:
    def scalar_one_or_none(self):
        return None


class _StatementDb:
    def __init__(self):
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _ScalarResult()


class _DonationDb:
    def __init__(self):
        self.added = []
        self.flushes = 0
        self.refreshes = []

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        self.flushes += 1
        for item in self.added:
            if getattr(item, "id", None) is None:
                item.id = uuid.uuid4()

    async def refresh(self, item):
        self.refreshes.append(item)


def _iter_routes(router):
    for route in router.routes:
        if isinstance(route, APIRoute):
            yield route
        elif hasattr(route, "original_router"):
            yield from _iter_routes(route.original_router)


def _route(router, path: str, method: str) -> APIRoute:
    for route in _iter_routes(router):
        if route.path == path and method in route.methods:
            return route
    raise AssertionError(f"{method} {path} route not found")


def _is_protected(router, path: str, method: str = "GET") -> bool:
    return bool(_route(router, path, method).dependencies)


class PublicVisibilityTests(unittest.IsolatedAsyncioTestCase):
    async def test_public_project_slug_requires_public_active_status_and_not_deleted(self):
        db = _StatementDb()

        await ProjectService.get_public_by_slug(db, "soil-health")

        self.assertEqual(1, len(db.statements))
        query_text = str(db.statements[0]).lower()
        self.assertIn("research_projects.deleted_at is null", query_text)
        self.assertIn("research_projects.slug", query_text)
        self.assertIn("research_projects.is_public is true", query_text)
        self.assertIn("research_projects.is_active is true", query_text)
        self.assertIn("research_projects.status in", query_text)

    async def test_public_project_slug_filters_by_active_and_publish_window(self):
        db = _StatementDb()

        await ProjectService.get_public_by_slug(db, "research-project")

        self.assertEqual(1, len(db.statements))
        query_text = str(db.statements[0]).lower()
        self.assertIn("research_projects.slug", query_text)
        self.assertIn("research_projects.is_public is true", query_text)
        self.assertIn("research_projects.is_active is true", query_text)
        self.assertIn("research_projects.deleted_at is null", query_text)
        self.assertIn("research_projects.status in", query_text)


class RouteProtectionTests(unittest.TestCase):
    def test_donor_donation_and_settings_reads_are_protected(self):
        for path in ("/donors", "/donors/{slug}", "/donations", "/donations/{slug}", "/donation-settings", "/donation-settings/{slug}"):
            with self.subTest(path=path):
                self.assertTrue(_is_protected(donations_router, path))

    def test_public_donation_content_reads_remain_public(self):
        for path in ("/donation-impacts", "/donation-impacts/{slug}", "/donation-stories", "/donation-stories/{slug}"):
            with self.subTest(path=path):
                self.assertFalse(_is_protected(donations_router, path))

    def test_private_workflow_reads_are_protected(self):
        protected_routes = (
            (grants_router, "/grant-applications"),
            (grants_router, "/grant-applications/{slug}"),
            (grants_router, "/grant-reviews"),
            (grants_router, "/grant-reviews/{slug}"),
            (grants_router, "/grant-reports"),
            (grants_router, "/grant-reports/{slug}"),
            (grants_router, "/grant-applications/id/{application_id}/reviews"),
            (grants_router, "/grant-applications/id/{application_id}/reports"),
            (scholarships_router, "/scholarship-applications"),
            (scholarships_router, "/scholarship-applications/{slug}"),
            (training_router, "/mentorship-applications"),
            (training_router, "/mentorship-applications/{slug}"),
            (training_router, "/mentorship-matches"),
            (training_router, "/mentorship-matches/{slug}"),
        )

        for router, path in protected_routes:
            with self.subTest(path=path):
                self.assertTrue(_is_protected(router, path))

    def test_funding_relationship_writes_are_protected(self):
        protected_routes = (
            ("/grants/id/{grant_id}/themes/{theme_id}", "PUT"),
            ("/grants/id/{grant_id}/themes/{theme_id}", "DELETE"),
        )

        for path, method in protected_routes:
            with self.subTest(path=path, method=method):
                self.assertTrue(_is_protected(grants_router, path, method))


class PublicDonationSubmissionTests(unittest.IsolatedAsyncioTestCase):
    async def test_public_submission_creates_pending_intent_without_server_owned_fields(self):
        db = _DonationDb()
        original_side_effects = DonationService._queue_submission_side_effects
        DonationService._queue_submission_side_effects = classmethod(lambda cls, db, donation, donor: _noop())
        submission = PublicDonationSubmission.model_validate(
            {
                "first_name": "Ada",
                "last_name": "Lovelace",
                "email": "ada@example.com",
                "amount": "2500.00",
                "currency": "KES",
                "preferred_payment_method": "mpesa",
                "payment_reference": "client-controlled-reference",
                "receipt_number": "client-controlled-receipt",
                "status": "completed",
                "recognition_public": True,
            }
        )

        try:
            donation = await DonationService.create_public_submission(db, submission)
        finally:
            DonationService._queue_submission_side_effects = original_side_effects
        donor = db.added[0]

        self.assertEqual("Ada Lovelace", donor.display_name)
        self.assertEqual("pending", donation.status)
        self.assertEqual(Decimal("2500.00"), donation.amount)
        self.assertEqual("mpesa", donation.payment_method)
        self.assertTrue(donation.is_public)
        self.assertIsNone(donation.payment_reference)
        self.assertIsNone(donation.payment_provider)
        self.assertIsNone(donation.receipt_number)
        self.assertFalse(donation.receipt_sent)
        self.assertIsNone(donation.received_date)
        self.assertIsNone(donation.notes)

    def test_public_submission_schema_excludes_admin_payment_and_receipt_fields(self):
        forbidden_fields = {
            "status",
            "payment_reference",
            "payment_provider",
            "receipt_number",
            "receipt_sent",
            "receipt_sent_at",
            "received_date",
            "notes",
            "is_tax_deductible",
        }

        self.assertFalse(forbidden_fields & set(PublicDonationSubmission.model_fields))


async def _noop():
    return None


if __name__ == "__main__":
    unittest.main()
