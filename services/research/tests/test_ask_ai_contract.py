import unittest

from fastapi.routing import APIRoute

from app.main import create_app
from app.routes.v1.ask_ai import router as ask_ai_router
from app.services.ask_ai import ResearchAskAIService


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


class ResearchAskAIContractTests(unittest.TestCase):
    def test_ask_ai_route_is_registered_and_read_protected(self):
        route = _route(ask_ai_router, "/ask-ai", "POST")

        self.assertTrue(route.dependencies)

    def test_research_v1_router_includes_ask_ai_route(self):
        paths = _paths(create_app(), "POST")

        self.assertIn("/api/v1/ask-ai", paths)

    def test_section_context_resolves_guided_prompts_and_references(self):
        context = ResearchAskAIService.resolve_context("/research/projects", "projects", None)

        self.assertEqual(context.section_key, "projects")
        self.assertEqual(context.resource_key, "research-projects")
        self.assertGreaterEqual(len(context.guided_prompts), 4)
        self.assertTrue(any("missing PI" in prompt.text for prompt in context.guided_prompts))
        self.assertTrue(any(reference.href == "/research/projects" for reference in context.references))

    def test_unknown_section_falls_back_to_research_workspace_prompts(self):
        context = ResearchAskAIService.resolve_context("/research/unknown", None, None)

        self.assertEqual(context.section_key, "overview")
        self.assertTrue(any("research portfolio" in prompt.text.lower() for prompt in context.guided_prompts))

    def test_advisor_response_is_read_only_and_section_aware(self):
        response = ResearchAskAIService.respond(
            message="What should I check before exporting?",
            path="/research/reports",
            section="reports",
            resource_key=None,
        )

        self.assertEqual(response.mode, "read_only")
        self.assertEqual(response.context.section_key, "reports")
        self.assertIn("read-only", response.answer.lower())
        self.assertTrue(response.suggested_prompts)


if __name__ == "__main__":
    unittest.main()
