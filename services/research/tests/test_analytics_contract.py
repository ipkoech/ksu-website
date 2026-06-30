import unittest
import os

from fastapi.routing import APIRoute

os.environ.setdefault("LOG_DIR", "/tmp/ksu-research-test-logs")

from app.main import create_app
from app.routes.v1.analytics import router as analytics_router
from app.schemas.analytics import (
    ResearchAnalyticsChart,
    ResearchAnalyticsPoint,
    ResearchDashboardAnalytics,
)
from ksu_common.models import AuditLog


def _route(router, path: str, method: str) -> APIRoute:
    for route in router.routes:
        if isinstance(route, APIRoute) and route.path == path and method in route.methods:
            return route
    raise AssertionError(f"{method} {path} route not found")


def _paths(router, method: str, prefix: str = "") -> set[str]:
    paths: set[str] = set()
    for route in router.routes:
        if isinstance(route, APIRoute) and method in route.methods:
            paths.add(f"{prefix}{route.path}")
            continue
        original_router = getattr(route, "original_router", None)
        include_context = getattr(route, "include_context", None)
        if original_router is not None and include_context is not None:
            paths.update(_paths(original_router, method, f"{prefix}{include_context.prefix}"))
    return paths


class ResearchAnalyticsContractTests(unittest.TestCase):
    def test_dashboard_analytics_route_is_registered_and_read_protected(self):
        route = _route(analytics_router, "/analytics/dashboard", "GET")

        self.assertTrue(route.dependencies)
        self.assertTrue(any(param.name == "db" for param in route.dependant.dependencies))
        self.assertTrue(any(param.name == "user" for param in route.dependant.dependencies))

    def test_research_v1_router_includes_dashboard_analytics_route(self):
        paths = _paths(create_app(), "GET")

        self.assertIn("/api/v1/analytics/dashboard", paths)

    def test_shared_audit_log_queries_target_public_schema(self):
        self.assertEqual("main", AuditLog.__table__.schema)

    def test_dashboard_schema_exposes_operational_zones(self):
        point = ResearchAnalyticsPoint(label="Open", value=3, key="open")
        chart = ResearchAnalyticsChart(
            key="grant_status",
            title="Grant status",
            chart_type="bar",
            data=[point],
        )
        dashboard = ResearchDashboardAnalytics(
            kpis=[],
            attention=[],
            portfolio_health=[chart],
            funding_pipeline=[chart],
            outputs_publications=[chart],
            partnerships_sustainability=[chart],
            applications_reviews=[chart],
            admin_activity=[chart],
        )

        payload = dashboard.model_dump()

        self.assertIn("portfolio_health", payload)
        self.assertIn("funding_pipeline", payload)
        self.assertIn("outputs_publications", payload)
        self.assertIn("partnerships_sustainability", payload)
        self.assertIn("applications_reviews", payload)
        self.assertIn("admin_activity", payload)
        self.assertEqual(payload["funding_pipeline"][0]["data"][0]["value"], 3)


if __name__ == "__main__":
    unittest.main()
