import unittest
import json

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


def _permissive_schema_paths(components: dict, schema_name: str) -> list[str]:
    findings: list[str] = []
    visited: set[str] = set()

    def visit(node, path: str) -> None:
        if isinstance(node, dict):
            ref = node.get("$ref")
            if isinstance(ref, str) and ref.startswith("#/components/schemas/"):
                name = ref.rsplit("/", 1)[-1]
                if name in visited:
                    return
                visited.add(name)
                visit(components[name], f"{path}->$ref({name})")
                return

            if node.get("additionalProperties") is True:
                findings.append(path)

            for key, value in node.items():
                visit(value, f"{path}.{key}")
            return

        if isinstance(node, list):
            for index, value in enumerate(node):
                visit(value, f"{path}[{index}]")

    visit(components[schema_name], schema_name)
    return findings


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

    def test_context_supports_global_scope_modes_and_explicit_references(self):
        references = [
            {
                "label": "Projects",
                "type": "resource",
                "href": "/research/projects",
                "resource_key": "research-projects",
            },
            {
                "label": "Grants",
                "type": "resource",
                "href": "/research/grants",
                "resource_key": "research-grants",
            },
        ]

        response = ResearchAskAIService.respond(
            message="Compare /projects and /grants for funding gaps",
            path="/research/projects",
            section="projects",
            resource_key="research-projects",
            scope="mixed",
            intent_mode="compare",
            request_references=references,
            service_exposure={
                "mode": "read_only",
                "resources": [],
                "exports": [],
                "admin_stats": [],
                "record_samples": [],
            },
        )
        prompt = GeminiResearchAIProvider(api_key="test-key", model="gemini-2.5-flash").build_prompt(
            message="Compare /projects and /grants for funding gaps",
            context=response.context,
            service_exposure=response.service_exposure,
        )

        self.assertEqual(response.context.scope, "mixed")
        self.assertEqual(response.context.intent_mode, "compare")
        self.assertTrue(any(reference.resource_key == "research-projects" for reference in response.references))
        self.assertTrue(any(reference.resource_key == "research-grants" for reference in response.references))
        self.assertIn("page context and explicit references", response.answer.lower())
        self.assertIn("Scope: mixed", prompt)
        self.assertIn("Intent mode: compare", prompt)

    def test_single_slash_reference_sets_page_context(self):
        response = ResearchAskAIService.respond(
            message="Give me a report on /projects",
            path="/research/grants",
            section="grants",
            resource_key="research-grants",
            scope="page",
            intent_mode="report",
            service_exposure={
                "mode": "read_only",
                "resources": [],
                "exports": [],
                "admin_stats": [],
                "record_samples": [],
            },
        )

        self.assertEqual(response.context.section_key, "projects")
        self.assertEqual(response.context.resource_key, "research-projects")
        self.assertTrue(any(reference.href == "/research/projects" for reference in response.references))
        self.assertIn("Research Projects advisor", response.answer)

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

    def test_ask_ai_openapi_schemas_do_not_expose_permissive_objects(self):
        components = create_app().openapi()["components"]["schemas"]

        self.assertEqual(_permissive_schema_paths(components, "ResearchAskAIResponse"), [])
        self.assertEqual(_permissive_schema_paths(components, "ResearchAIConversationRead"), [])
        self.assertEqual(_permissive_schema_paths(components, "ResearchAIMessageRead"), [])

    def test_advisor_response_does_not_echo_user_question(self):
        response = ResearchAskAIService.respond(
            message="Whats the 1st project all about?",
            path="/research/projects",
            section="projects",
            resource_key="research-projects",
            service_exposure={
                "mode": "read_only",
                "resources": [],
                "exports": [],
                "admin_stats": [],
                "record_samples": [],
            },
        )

        self.assertNotIn("Your question", response.answer)
        self.assertNotIn("Whats the 1st project all about?", response.answer)

    def test_advisor_uses_project_record_samples_for_first_project_questions(self):
        response = ResearchAskAIService.respond(
            message="Whats the 1st project all about?",
            path="/research/projects",
            section="projects",
            resource_key="research-projects",
            service_exposure={
                "mode": "read_only",
                "resources": [],
                "exports": [],
                "admin_stats": [],
                "record_samples": [
                    {
                        "key": "research-projects",
                        "label": "Research Projects",
                        "href": "/research/projects",
                        "records": [
                            {
                                "title": "Carbon Literacy for Youth Employability",
                                "summary": "A project on carbon literacy, youth employability, and green jobs.",
                                "status": "ongoing",
                                "project_type": "collaborative",
                                "progress_percentage": 65,
                                "start_date": "2026-01-01",
                                "end_date": "2026-12-31",
                                "currency": "KES",
                                "budget": 1200000,
                            }
                        ],
                    }
                ],
            },
        )

        self.assertIn("Carbon Literacy for Youth Employability", response.answer)
        self.assertIn("carbon literacy", response.answer.lower())
        self.assertIn("ongoing", response.answer.lower())
        self.assertNotIn("Your question", response.answer)

    def test_advisor_removes_internal_project_metadata_from_answers_and_context(self):
        service_exposure = {
            "mode": "read_only",
            "resources": [],
            "exports": [],
            "admin_stats": [],
            "record_samples": [
                {
                    "key": "research-projects",
                    "label": "Research Projects",
                    "href": "/research/projects",
                    "records": [
                        {
                            "id": "79669500-24e4-4c4e-8c63-93d062fa24f1",
                            "title": "Carbon Literacy for Youth Employability",
                            "code": "CL4YE",
                            "summary": "A project on carbon literacy and youth employability.",
                            "center_id": "8168cb6e-0446-4703-aa29-2dc3957a21be",
                            "program_id": "3bf57aee-f60b-4cd9-a438-bf9be65a6427",
                            "status": "ongoing",
                            "project_type": "collaborative",
                            "progress_percentage": 35,
                            "start_date": "2026-01-01",
                            "budget": 1250000,
                            "currency": "KES",
                            "created_at": "2026-06-29T11:51:53.368357+00:00",
                            "updated_at": "2026-06-29T11:51:53.368357+00:00",
                        }
                    ],
                }
            ],
        }

        response = ResearchAskAIService.respond(
            message="Explain what the first project",
            path="/research/projects",
            section="projects",
            resource_key="research-projects",
            service_exposure=service_exposure,
        )
        prompt = GeminiResearchAIProvider(api_key="test-key", model="gemini-2.5-flash").build_prompt(
            message="Explain what the first project",
            context=response.context,
            service_exposure=response.service_exposure,
        )
        serialized_exposure = json.dumps(response.model_dump(mode="json")["service_exposure"])
        combined_output = "\n".join([response.answer, prompt, serialized_exposure])

        self.assertIn("Carbon Literacy for Youth Employability", response.answer)
        self.assertNotIn("79669500-24e4-4c4e-8c63-93d062fa24f1", combined_output)
        self.assertNotIn("8168cb6e-0446-4703-aa29-2dc3957a21be", combined_output)
        self.assertNotIn("3bf57aee-f60b-4cd9-a438-bf9be65a6427", combined_output)
        self.assertNotIn("created_at", combined_output)
        self.assertNotIn("updated_at", combined_output)
        self.assertNotIn("2026-06-29T11:51:53.368357+00:00", combined_output)

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
