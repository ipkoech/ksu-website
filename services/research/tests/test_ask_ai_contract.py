import unittest

from fastapi.routing import APIRoute

from app.main import create_app
from app.models.ask_ai import ResearchAIConversation, ResearchAIMessage
from app.routes.v1.ask_ai import router as ask_ai_router
from app.services.ask_ai import GeminiResearchAIProvider, ResearchAskAIService


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
        self.assertTrue(any(param.name == "db" for param in route.dependant.dependencies))
        self.assertTrue(any(param.name == "user" for param in route.dependant.dependencies))

    def test_conversation_read_routes_are_registered_and_read_protected(self):
        conversations = _route(ask_ai_router, "/ask-ai/conversations", "GET")
        messages = _route(ask_ai_router, "/ask-ai/conversations/{conversation_id}/messages", "GET")

        self.assertTrue(conversations.dependencies)
        self.assertTrue(messages.dependencies)

    def test_ask_ai_stream_route_is_registered_and_read_protected(self):
        route = _route(ask_ai_router, "/ask-ai/stream", "POST")

        self.assertTrue(route.dependencies)
        self.assertTrue(any(param.name == "db" for param in route.dependant.dependencies))
        self.assertTrue(any(param.name == "user" for param in route.dependant.dependencies))

    def test_research_v1_router_includes_ask_ai_route(self):
        paths = _paths(create_app(), "POST")

        self.assertIn("/api/v1/ask-ai", paths)
        self.assertIn("/api/v1/ask-ai/stream", paths)

    def test_research_v1_router_includes_ask_ai_read_routes(self):
        paths = _paths(create_app(), "GET")

        self.assertIn("/api/v1/ask-ai/conversations", paths)
        self.assertIn("/api/v1/ask-ai/conversations/{conversation_id}/messages", paths)

    def test_ask_ai_persistence_models_use_research_schema(self):
        self.assertEqual(ResearchAIConversation.__tablename__, "ai_conversations")
        self.assertEqual(ResearchAIMessage.__tablename__, "ai_messages")
        self.assertEqual(ResearchAIConversation.__table__.schema, "research")
        self.assertEqual(ResearchAIMessage.__table__.schema, "research")

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
        self.assertEqual(response.content_format, "markdown")
        self.assertEqual(response.context.section_key, "reports")
        self.assertIn("##", response.answer)
        self.assertIn("read-only", response.answer.lower())
        self.assertTrue(response.suggested_prompts)

    def test_markdown_chunking_preserves_complete_answer(self):
        answer = "## Heading\n\n- First point\n- Second point"

        chunks = list(ResearchAskAIService.markdown_chunks(answer, chunk_size=9))

        self.assertEqual("".join(chunks), answer)
        self.assertTrue(all(len(chunk) <= 9 for chunk in chunks))

    def test_service_exposure_covers_research_backend_surfaces(self):
        exposure = ResearchAskAIService.service_exposure_catalog()

        keys = {item["key"] for item in exposure["resources"]}
        self.assertIn("projects", keys)
        self.assertIn("publications", keys)
        self.assertIn("grants", keys)
        self.assertIn("sustainability", keys)
        self.assertGreaterEqual(len(keys), 20)
        self.assertIn("exports", exposure)

    def test_gemini_provider_is_configured_for_markdown_read_only_answers(self):
        provider = GeminiResearchAIProvider(api_key="test-key", model="gemini-2.5-flash")

        prompt = provider.build_prompt(
            message="Summarize project risks",
            context=ResearchAskAIService.resolve_context("/research/projects", "projects", None),
            service_exposure=ResearchAskAIService.service_exposure_catalog(),
        )

        self.assertIn("read-only", prompt.lower())
        self.assertIn("markdown", prompt.lower())
        self.assertIn("Research service exposure", prompt)
        self.assertEqual(provider.model, "gemini-2.5-flash")

    def test_gemini_provider_reports_disabled_without_key(self):
        provider = GeminiResearchAIProvider(api_key="", model="gemini-2.5-flash")

        self.assertFalse(provider.is_configured)


if __name__ == "__main__":
    unittest.main()
