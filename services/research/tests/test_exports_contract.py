import unittest

from fastapi.routing import APIRoute

from app.main import create_app
from app.routes.v1.exports import router as exports_router
from app.services.exports import (
    EXPORT_RESOURCE_CONFIGS,
    ResearchExportService,
)
from app.tasks.celery_app import celery_app


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


def _permissive_schema_paths(schema: dict) -> list[str]:
    findings: list[str] = []
    defs = schema.get("$defs", {})
    visited: set[str] = set()

    def visit(node, path: str) -> None:
        if isinstance(node, dict):
            ref = node.get("$ref")
            if isinstance(ref, str) and ref.startswith("#/$defs/"):
                name = ref.rsplit("/", 1)[-1]
                if name in visited:
                    return
                visited.add(name)
                visit(defs[name], f"{path}->$ref({name})")
                return

            if node.get("additionalProperties") is True:
                findings.append(path)

            for key, value in node.items():
                visit(value, f"{path}.{key}")
            return

        if isinstance(node, list):
            for index, value in enumerate(node):
                visit(value, f"{path}[{index}]")

    visit(schema, "ResearchExportJSONResponse")
    return findings


class ResearchExportContractTests(unittest.TestCase):
    def test_export_route_is_registered_and_protected(self):
        route = _route(exports_router, "/exports/{resource_key}", "GET")
        query_param_names = {param.name for param in route.dependant.query_params}

        self.assertTrue(route.dependencies)
        self.assertIn("format", query_param_names)
        self.assertIn("search", query_param_names)
        self.assertIn("status", query_param_names)
        self.assertIn("year", query_param_names)

    def test_export_job_routes_are_registered_and_protected(self):
        start_route = _route(exports_router, "/exports/{resource_key}/jobs", "POST")
        status_route = _route(exports_router, "/exports/jobs/{job_id}", "GET")
        download_route = _route(exports_router, "/exports/jobs/{job_id}/download", "GET")

        self.assertEqual(start_route.status_code, 202)
        self.assertTrue(start_route.dependencies)
        self.assertTrue(status_route.dependencies)
        self.assertTrue(download_route.dependencies)

    def test_research_v1_router_includes_export_route(self):
        paths = _paths(create_app(), "GET")

        self.assertIn("/api/v1/exports/{resource_key}", paths)
        self.assertIn("/api/v1/exports/jobs/{job_id}", paths)
        self.assertIn("/api/v1/exports/jobs/{job_id}/download", paths)

    def test_export_route_openapi_documents_json_and_csv_variants(self):
        operation = create_app().openapi()["paths"]["/api/v1/exports/{resource_key}"]["get"]
        content = operation["responses"]["200"]["content"]
        json_schema = content["application/json"]["schema"]
        meta_schema_ref = json_schema["properties"]["meta"]["anyOf"][0]["$ref"]
        meta_schema_name = meta_schema_ref.rsplit("/", 1)[-1]
        meta_schema = json_schema["$defs"][meta_schema_name]

        self.assertIn("application/json", content)
        self.assertIn("text/csv", content)
        self.assertTrue(content["application/json"].get("schema") or content["application/json"].get("examples"))
        self.assertTrue(content["text/csv"].get("schema") or content["text/csv"].get("examples"))
        self.assertEqual(_permissive_schema_paths(json_schema), [])
        self.assertFalse(meta_schema.get("additionalProperties", False))
        self.assertEqual(set(meta_schema["properties"]), {"resource", "total"})

    def test_research_export_task_is_registered_with_celery_worker(self):
        imports = set(celery_app.conf.imports)

        self.assertIn("app.tasks.exports", imports)

    def test_supported_export_resources_cover_bulk_import_resources(self):
        keys = set(EXPORT_RESOURCE_CONFIGS)

        self.assertGreaterEqual(len(keys), 20)
        self.assertIn("research-projects", keys)
        self.assertIn("research-publications", keys)
        self.assertIn("research-grants", keys)
        self.assertIn("research-donations", keys)
        self.assertIn("research-stories", keys)

    def test_csv_export_uses_stable_configured_columns(self):
        config = EXPORT_RESOURCE_CONFIGS["research-projects"]

        csv_text = ResearchExportService.to_csv(
            config,
            [
                {
                    "title": "Climate Resilience",
                    "status": "ongoing",
                    "budget": 1000,
                    "internal_note": "not exported",
                }
            ],
        )

        self.assertTrue(csv_text.startswith("id,title,slug,code,project_type,status"))
        self.assertIn("Climate Resilience", csv_text)
        self.assertNotIn("internal_note", csv_text)


if __name__ == "__main__":
    unittest.main()
