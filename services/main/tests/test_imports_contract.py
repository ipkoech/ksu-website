import unittest
import inspect

from fastapi.routing import APIRoute

from app.api.v1.imports import router as imports_router
from app.tasks import imports as import_tasks
from app.tasks.celery_app import celery_app


def _route(router, path: str, method: str) -> APIRoute:
    for route in router.routes:
        if isinstance(route, APIRoute) and route.path == path and method in route.methods:
            return route
    raise AssertionError(f"{method} {path} route not found")


class ImportContractTests(unittest.TestCase):
    def test_import_commit_can_be_started_as_background_job(self):
        route = _route(imports_router, "/{resource_key}/commit-async", "POST")

        self.assertEqual(route.status_code, 202)

    def test_import_job_status_route_is_available(self):
        _route(imports_router, "/jobs/{job_id}", "GET")

    def test_import_task_is_registered_with_celery_worker(self):
        imports = set(celery_app.conf.imports)

        self.assertIn("app.tasks.imports", imports)

    def test_import_task_accepts_queueing_user_id_for_completion_notice(self):
        signature = inspect.signature(import_tasks.commit_import)

        self.assertIn("user_id", signature.parameters)
        self.assertIsNone(signature.parameters["user_id"].default)


if __name__ == "__main__":
    unittest.main()
