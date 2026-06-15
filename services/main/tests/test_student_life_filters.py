import unittest
from unittest.mock import patch

from app.services import student_life
from app.services.student_life import AccommodationService, ClubService


async def _capture_query(_db, query, *, page=1, per_page=20):
    return query


class StudentLifeFilterTests(unittest.IsolatedAsyncioTestCase):
    async def test_club_list_can_filter_inactive_records(self):
        with patch.object(student_life, "paginate_query", _capture_query):
            query = await ClubService.list(object(), is_active=False)

        query_text = str(query).lower()

        self.assertIn("clubs.is_active is false", query_text)

    async def test_accommodation_list_can_filter_application_status(self):
        with patch.object(student_life, "paginate_query", _capture_query):
            query = await AccommodationService.list(
                object(),
                is_active=True,
                is_accepting_applications=False,
            )

        query_text = str(query).lower()

        self.assertIn("accommodations.is_active is true", query_text)
        self.assertIn("accommodations.is_accepting_applications is false", query_text)


if __name__ == "__main__":
    unittest.main()
