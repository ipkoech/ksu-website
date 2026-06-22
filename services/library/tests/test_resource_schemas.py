import unittest
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from app.schemas.engagement import LibraryInquiryOut
from app.schemas.resources import LibraryLoanOut, LibraryReservationOut


RESOURCE_ID = uuid.UUID("00000000-0000-4000-8000-000000000001")
LIBRARY_ID = uuid.UUID("00000000-0000-4000-8000-000000000002")
PERSON_ID = uuid.UUID("00000000-0000-4000-8000-000000000003")
NOW = datetime(2026, 6, 22, 10, 30, tzinfo=timezone.utc)


def resource_payload():
    return {
        "id": RESOURCE_ID,
        "library_id": LIBRARY_ID,
        "title": "Research Methods Handbook",
        "language": "en",
        "resource_type": "book",
        "status": "available",
        "total_copies": 3,
        "available_copies": 2,
        "is_loanable": True,
        "is_reference_only": False,
        "is_active": True,
        "created_at": NOW,
        "updated_at": NOW,
    }


def library_payload():
    return {
        "id": LIBRARY_ID,
        "name": "Main Library",
        "short_name": "ML",
        "slug": "main-library",
        "library_type": "main",
        "is_active": True,
        "is_public": True,
        "sort_order": 0,
        "created_at": NOW,
        "updated_at": NOW,
    }


class ResourceRelationshipSchemaTests(unittest.TestCase):
    def test_inquiry_response_includes_library_summary(self):
        inquiry = LibraryInquiryOut.model_validate(
            {
                "id": uuid.UUID("00000000-0000-4000-8000-000000000006"),
                "library_id": LIBRARY_ID,
                "library": library_payload(),
                "sender_name": "Amina Otieno",
                "sender_email": "amina@example.com",
                "subject": "Borrowing hours",
                "message": "When does the branch close?",
                "status": "open",
                "created_at": NOW,
                "updated_at": NOW,
            }
        )

        self.assertEqual(inquiry.library.name, "Main Library")

    def test_loan_response_includes_resource_summary(self):
        loan = LibraryLoanOut.model_validate(
            {
                "id": uuid.UUID("00000000-0000-4000-8000-000000000004"),
                "resource_id": RESOURCE_ID,
                "resource": resource_payload(),
                "borrower_person_id": PERSON_ID,
                "borrowed_at": NOW,
                "due_at": NOW,
                "status": "active",
                "renewals_count": 0,
                "max_renewals": 2,
                "fine_amount": Decimal("0.00"),
                "fine_paid": False,
                "created_at": NOW,
                "updated_at": NOW,
            }
        )

        self.assertEqual(loan.resource.title, "Research Methods Handbook")

    def test_reservation_response_includes_resource_summary(self):
        reservation = LibraryReservationOut.model_validate(
            {
                "id": uuid.UUID("00000000-0000-4000-8000-000000000005"),
                "resource_id": RESOURCE_ID,
                "resource": resource_payload(),
                "requester_person_id": PERSON_ID,
                "reserved_at": NOW,
                "status": "pending",
                "queue_position": 1,
                "created_at": NOW,
                "updated_at": NOW,
            }
        )

        self.assertEqual(reservation.resource.title, "Research Methods Handbook")


if __name__ == "__main__":
    unittest.main()
