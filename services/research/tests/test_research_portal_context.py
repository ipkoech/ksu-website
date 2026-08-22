"""The server, not the browser, decides what the Research Portal shows.

These lock in the separation between the four portal roles: a farm manager and
a sustainability manager must see disjoint workspaces, and neither may review
or publish.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest

_SERVICES = Path(__file__).resolve().parents[1] / "app" / "services"


def _load(name: str, filename: str, rewrite: tuple[str, str] | None = None):
    """Load a service module without triggering ``app.services.__init__``.

    That package eagerly imports modules which construct Settings and therefore
    demand JWT environment variables; these modules are pure logic.
    """
    source = (_SERVICES / filename).read_text()
    if rewrite:
        source = source.replace(*rewrite)
    module = type(sys)(name)
    sys.modules[name] = module
    exec(compile(source, filename, "exec"), module.__dict__)
    return module


_load("research_domains", "research_domains.py")
rpc = _load(
    "research_portal_context",
    "research_portal_context.py",
    ("from .research_domains import", "from research_domains import"),
)

from ksu_common.auth import TokenPayload  # noqa: E402
from ksu_contracts.roles import ROLE_DEFINITIONS  # noqa: E402


def _user(role: str) -> TokenPayload:
    return TokenPayload(
        sub="00000000-0000-0000-0000-000000000001",
        jti="jti",
        roles=[role],
        raw={"permissions": list(ROLE_DEFINITIONS[role].scopes)},
    )


def _nav(role: str) -> list[str]:
    return rpc.build_research_portal_context(_user(role)).allowed_navigation


def test_farm_manager_sees_the_farm_workspace_and_no_sustainability():
    nav = _nav("research-farm")
    assert [key for key in nav if key.startswith("farm-")] == [
        "farm-overview",
        "farm-sites",
        "farm-projects",
        "farm-partners",
        "farm-activities",
        "farm-impact-stories",
        "farm-focus-areas",
    ]
    assert not [key for key in nav if key.startswith("sustainability-")]


def test_sustainability_manager_sees_the_inverse():
    nav = _nav("research-sustainability")
    assert [key for key in nav if key.startswith("sustainability-")] == [
        "sustainability-overview",
        "sustainability-projects",
        "sustainability-partners",
        "sustainability-activities",
    ]
    assert not [key for key in nav if key.startswith("farm-")]


def test_research_admin_sees_both_workspaces():
    nav = _nav("research-admin")
    assert len([key for key in nav if key.startswith("farm-")]) == 7
    assert len([key for key in nav if key.startswith("sustainability-")]) == 4


@pytest.mark.parametrize(
    "role", ["research-farm", "research-sustainability", "research-staff"]
)
def test_only_the_research_admin_may_review_or_publish(role):
    context = rpc.build_research_portal_context(_user(role))
    assert not context.can_review
    assert not context.can_publish


def test_the_research_admin_may_review_and_publish():
    context = rpc.build_research_portal_context(_user("research-admin"))
    assert context.can_review
    assert context.can_publish
    assert context.is_global


@pytest.mark.parametrize("role", ["research-farm", "research-sustainability"])
def test_domain_managers_are_not_global(role):
    assert not rpc.build_research_portal_context(_user(role)).is_global


def test_capabilities_never_exceed_the_declared_portal_surface():
    """An unrelated grant must not widen what the portal exposes."""
    for role in ROLE_DEFINITIONS:
        capabilities = rpc.research_portal_capabilities(_user(role))
        assert set(capabilities) == set(rpc.RESEARCH_PORTAL_CAPABILITIES)


def test_navigation_keys_are_unique():
    keys = [key for key, _ in rpc.RESEARCH_PORTAL_NAVIGATION]
    assert len(keys) == len(set(keys))


def test_every_navigation_scope_is_a_declared_capability():
    """A nav key gated on an unknown scope would silently never appear."""
    declared = set(rpc.RESEARCH_PORTAL_CAPABILITIES)
    for key, scopes in rpc.RESEARCH_PORTAL_NAVIGATION:
        assert set(scopes) <= declared, key
