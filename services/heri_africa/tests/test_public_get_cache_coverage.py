from __future__ import annotations

import ast
from pathlib import Path


ROUTES_DIR = Path(__file__).resolve().parents[1] / "app" / "routes" / "v1"


def _public_get_decorators(path: Path) -> dict[str, ast.Call]:
    tree = ast.parse(path.read_text())
    routes: dict[str, ast.Call] = {}
    for node in ast.walk(tree):
        if not isinstance(node, (ast.AsyncFunctionDef, ast.FunctionDef)):
            continue
        for decorator in node.decorator_list:
            if not isinstance(decorator, ast.Call) or not isinstance(decorator.func, ast.Attribute):
                continue
            if decorator.func.attr == "get":
                routes[node.name] = decorator
                break
    return routes


def test_all_anonymous_public_get_routes_use_shared_response_cache():
    routes = {}
    for filename in ("public.py", "collections.py"):
        routes.update(_public_get_decorators(ROUTES_DIR / filename))

    assert len(routes) == 22
    for path in (ROUTES_DIR / "public.py", ROUTES_DIR / "collections.py"):
        source = path.read_text()
        assert source.count("@cached_public(") == len(_public_get_decorators(path))


def test_public_cache_keys_vary_on_every_output_affecting_parameter():
    expected = {
        "news": {"limit", "offset"},
        "news_detail": {"slug"},
        "team": {"limit"},
        "team_detail": {"slug"},
        "partners": {"limit", "center_id", "center_slug"},
        "center_partners": {"center_id", "limit"},
        "projects": {"limit"},
        "projects_paginated": {"page", "per_page"},
        "project_detail": {"slug"},
        "publications": {"limit"},
        "publications_paginated": {"page", "per_page"},
        "publication_detail": {"slug"},
        "themes": {"limit"},
        "theme_detail": {"slug"},
        "public_page": {"slug"},
        "events": {"limit"},
        "opportunities": {"limit"},
    }
    for function_name, parameters in expected.items():
        source = (ROUTES_DIR / ("public.py" if function_name in {"news", "news_detail"} else "collections.py")).read_text()
        function = next(node for node in ast.walk(ast.parse(source)) if isinstance(node, ast.AsyncFunctionDef) and node.name == function_name)
        cache_decorator = next(
            decorator
            for decorator in function.decorator_list
            if isinstance(decorator, ast.Call)
            and isinstance(decorator.func, ast.Name)
            and decorator.func.id == "cached_public"
        )
        vary_on = next(keyword.value for keyword in cache_decorator.keywords if keyword.arg == "vary_on")
        assert {element.value for element in vary_on.elts} == parameters
