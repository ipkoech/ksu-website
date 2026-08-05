import unittest
from datetime import date

from sqlalchemy import select
from sqlalchemy.dialects import postgresql

from ksu_common.models import AuditLog

from app.services.audit import apply_audit_filters


def _sql(query) -> str:
    return str(
        query.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )


class AdminAuditFilterTests(unittest.TestCase):
    def test_no_filters_leaves_the_query_unrestricted(self):
        query = apply_audit_filters(select(AuditLog))

        self.assertNotIn("WHERE", _sql(query))

    def test_action_matches_exactly_or_as_a_dotted_prefix(self):
        query = apply_audit_filters(select(AuditLog), action="user")

        sql = _sql(query)
        self.assertIn("audit_logs.action = 'user'", sql)
        self.assertIn("audit_logs.action LIKE 'user.' || '%", sql)

    def test_date_range_bounds_happened_at_by_inclusive_calendar_days(self):
        query = apply_audit_filters(
            select(AuditLog),
            date_from=date(2026, 8, 1),
            date_to=date(2026, 8, 3),
        )

        sql = _sql(query)
        self.assertIn("audit_logs.happened_at >= '2026-08-01 00:00:00+00:00'", sql)
        self.assertIn("audit_logs.happened_at < '2026-08-04 00:00:00+00:00'", sql)

    def test_request_path_prefix_matches_the_path_and_its_subpaths(self):
        query = apply_audit_filters(select(AuditLog), request_path_prefix="/api/v1/news")

        sql = _sql(query)
        self.assertIn("audit_logs.request_path = '/api/v1/news'", sql)
        self.assertIn("audit_logs.request_path LIKE '/api/v1/news/' || '%", sql)

    def test_remaining_filters_apply_as_equality_clauses(self):
        query = apply_audit_filters(
            select(AuditLog),
            service_name="main",
            resource_type="news",
            status="success",
        )

        sql = _sql(query)
        self.assertIn("audit_logs.service_name = 'main'", sql)
        self.assertIn("audit_logs.resource_type = 'news'", sql)
        self.assertIn("audit_logs.status = 'success'", sql)


if __name__ == "__main__":
    unittest.main()
