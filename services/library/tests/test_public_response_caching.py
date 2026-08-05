from __future__ import annotations

import ast
from pathlib import Path


LIBRARY_APP = Path(__file__).parents[1] / "app"


def _route_decorators(path: Path) -> dict[str, set[str]]:
    tree = ast.parse(path.read_text())
    routes: dict[str, set[str]] = {}
    for node in ast.walk(tree):
        if not isinstance(node, (ast.AsyncFunctionDef, ast.FunctionDef)):
            continue
        names: set[str] = set()
        for decorator in node.decorator_list:
            target = decorator.func if isinstance(decorator, ast.Call) else decorator
            if isinstance(target, ast.Name):
                names.add(target.id)
            elif isinstance(target, ast.Attribute):
                names.add(target.attr)
        routes[node.name] = names
    return routes


def test_anonymous_public_get_handlers_use_shared_redis_cache():
    expected = {
        "assistant_contexts.py": {"list_public_contexts"},
        "electronic.py": {
            "list_resources_az",
            "list_guides_route",
            "search_publications_route",
        },
        "library.py": {
            "get_library_hours",
            "get_library_today_hours",
            "list_today_hours",
        },
        "search.py": {"search_library"},
        "stats.py": {"get_public_stats"},
    }

    for filename, handlers in expected.items():
        routes = _route_decorators(LIBRARY_APP / "routes" / "v1" / filename)
        for handler in handlers:
            assert "cached_public" in routes[handler], f"{filename}:{handler}"


def test_public_cache_does_not_cover_mixed_authenticated_handlers():
    mixed_handlers = {
        "library.py": {"list_libraries", "get_library", "list_external_links", "list_library_files"},
        "resources.py": {"list_resources", "get_resource"},
        "staff.py": {"list_staff", "list_library_leadership", "list_services"},
        "engagement.py": {
            "list_regulations",
            "get_regulation",
            "list_specialists",
            "list_guides",
            "get_guide_by_slug",
            "list_workflows",
            "get_workflow_by_slug",
            "list_policies",
            "get_policy_by_slug",
        },
        "electronic.py": {
            "get_resource_by_slug_route",
            "get_resource_detail",
            "list_resources_route",
        },
    }

    for filename, handlers in mixed_handlers.items():
        routes = _route_decorators(LIBRARY_APP / "routes" / "v1" / filename)
        for handler in handlers:
            assert "cached_public" not in routes[handler], f"{filename}:{handler}"
