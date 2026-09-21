from types import SimpleNamespace

import pytest
from ksu_common.auth import TokenPayload

from app.services.research_actions import can_domain_action, domain_action_filters


def actor(*grants):
    return TokenPayload("real-user", "session", raw={"scope_grants": list(grants)})


@pytest.mark.parametrize("action", ["submit", "review", "publish"])
def test_action_cannot_be_borrowed_from_another_domain(action):
    user = actor(
        {"scope_type": "research_domain", "scope_id": "farm", "permissions": [f"farm.{action}"]},
        {"scope_type": "research_domain", "scope_id": "sustainability", "permissions": ["sustainability.view"]},
    )
    assert can_domain_action(user, "partners", action, SimpleNamespace(partner_type="community"))
    assert not can_domain_action(user, "partners", action, SimpleNamespace(partner_type="sustainability"))


def test_review_and_management_do_not_publish():
    user = actor({"scope_type": "global", "permissions": ["farm.manage", "farm.review"]})
    assert not can_domain_action(user, "farms", "publish", {})


def test_foreign_center_and_unrelated_resources_are_denied():
    user = actor({"scope_type": "research", "scope_id": "one", "permissions": ["farm.publish"]})
    assert can_domain_action(user, "projects", "publish", {"center_id": "one", "project_type": "action"})
    assert not can_domain_action(user, "projects", "publish", {"center_id": "two", "project_type": "action"})
    assert not can_domain_action(user, "grants", "publish", {"center_id": "one"})


def test_oversight_still_requires_action_and_preserves_actor():
    user = actor({"scope_type": "global", "permissions": ["research.oversight", "research.review"]})
    assert can_domain_action(user, "projects", "review", {})
    assert not can_domain_action(user, "projects", "publish", {})
    assert user.sub == "real-user"


def test_review_query_uses_only_the_review_assignment_not_readable_domains():
    user = actor(
        {"scope_type": "research_domain", "scope_id": "farm", "permissions": ["farm.review"]},
        {"scope_type": "research_domain", "scope_id": "sustainability", "permissions": ["sustainability.view"]},
    )
    assert domain_action_filters(user, "partners", "review") == {
        "__domain_any__": [{"partner_type": "community"}],
    }


def test_explicit_platform_authority_can_execute_domain_commands():
    user = actor({"scope_type": "global", "permissions": ["platform.admin"]})
    assert can_domain_action(user, "projects", "publish", {})
