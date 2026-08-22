"""The portal registry and the server's navigation table must agree.

The admin app renders the Research Portal sidebar from ``registry.ts`` but the
server decides which entries are allowed, matching them by ``navKey``. If a nav
item carries a key the server has no rule for, the provider hides it and the
section becomes unreachable — a silent failure that is easy to introduce and
hard to spot. This test fails loudly instead.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import pytest

_REPO = Path(__file__).resolve().parents[3]
_REGISTRY = (
    _REPO / "frontend" / "apps" / "admin" / "src" / "lib" / "portals" / "registry.ts"
)
_CONTEXT = (
    Path(__file__).resolve().parents[1]
    / "app"
    / "services"
    / "research_portal_context.py"
)


def _registry_nav_keys() -> set[str]:
    source = _REGISTRY.read_text()
    start = source.index("  research: {")
    end = source.index("\n    dashboard:", start)
    return set(re.findall(r'navKey: "([^"]+)"', source[start:end]))


def _server_nav_keys() -> set[str]:
    module = type(sys)("research_portal_context_navonly")
    source = _CONTEXT.read_text()
    table = source[
        source.index("RESEARCH_PORTAL_NAVIGATION") : source.index("@dataclass")
    ]
    return set(re.findall(r'\(\s*"([a-z0-9-]+)",\s*\(', table))


@pytest.mark.skipif(not _REGISTRY.exists(), reason="admin app not present")
def test_every_registry_nav_key_is_authorised_by_the_server():
    missing = sorted(_registry_nav_keys() - _server_nav_keys())
    assert not missing, (
        "These portal nav items would be hidden because the server has no rule "
        f"for their navKey: {missing}"
    )


@pytest.mark.skipif(not _REGISTRY.exists(), reason="admin app not present")
def test_the_farm_and_sustainability_workspaces_are_fully_navigable():
    registry = _registry_nav_keys()
    server = _server_nav_keys()
    for key in (
        "farm-overview",
        "farm-sites",
        "farm-projects",
        "farm-partners",
        "farm-activities",
        "farm-impact-stories",
        "farm-focus-areas",
        "sustainability-overview",
        "sustainability-projects",
        "sustainability-partners",
        "sustainability-activities",
    ):
        assert key in registry, f"{key} missing from the portal registry"
        assert key in server, f"{key} missing from the server navigation table"
