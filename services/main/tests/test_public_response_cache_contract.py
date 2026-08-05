from __future__ import annotations

import inspect

from ksu_common.rate_limit import RateLimiter

from app.api.v1 import admissions, page_cms, persons, public_leadership, public_media, realtime
from app.core.config import get_settings


def _limiter(endpoint) -> RateLimiter:
    for cell in endpoint.__closure__ or ():
        if isinstance(cell.cell_contents, RateLimiter):
            return cell.cell_contents
    raise AssertionError(f"{endpoint.__name__} is missing a rate-limit wrapper")


def _route(module, endpoint_name: str):
    return next(route for route in module.router.routes if route.endpoint.__name__ == endpoint_name)


def test_homepage_is_cached_and_uses_the_anonymous_content_budget():
    source = inspect.getsource(page_cms)
    assert '@public_content_rate_limit\n@cached_public(timeout=300, vary_on=("scope_type", "scope_id"))\nasync def get_homepage' in source

    route = _route(page_cms, "get_homepage")
    limiter = _limiter(route.endpoint)
    settings = get_settings()
    assert limiter.requests == settings.PUBLIC_CONTENT_RATE_LIMIT_COUNT
    assert limiter.window == settings.PUBLIC_CONTENT_RATE_LIMIT_WINDOW_SECONDS
    assert "request" in inspect.signature(route.endpoint).parameters


def test_all_other_public_main_read_endpoints_are_cached_with_response_inputs():
    expectations = {
        admissions: {
            "get_admission_requirement": '("item_id", "fields", "include")',
            "get_programme_fee_structure": '("item_id", "fields", "include")',
            "get_admission_faq": '("item_id", "fields", "include")',
            "get_admission_page_section": '("item_id", "fields", "include")',
        },
        persons: {
            "list_persons": '("page", "per_page", "search", "department_id", "school_id", "academic_rank", "employment_type", "is_researcher", "status", "fields", "include")',
            "get_person": '("person_id", "fields", "include")',
        },
        public_leadership: {
            "get_vice_chancellor": '("fields", "include")',
            "get_chancellor": '("fields", "include")',
            "get_dean": '("school_id", "fields", "include")',
            "get_hod": '("department_id", "fields", "include")',
            "get_director": '("division_id", "fields", "include")',
            "get_leader": '("role", "entity_type", "entity_id", "fields", "include")',
            "list_leaders": '("entity_type", "entity_id", "fields", "include")',
        },
        public_media: {
            "list_public_media": '("page", "per_page", "media_type", "search")',
            "list_public_media_links": '("entity_type", "entity_id", "role", "per_page")',
            "get_public_media": '("media_id",)',
        },
        realtime: {
            "get_research_realtime_config": '()',
        },
    }

    for module, endpoints in expectations.items():
        source = inspect.getsource(module)
        for endpoint_name, vary_on in endpoints.items():
            assert f"@cached_public(timeout=300, vary_on={vary_on})\nasync def {endpoint_name}" in source
