from __future__ import annotations

import uuid

import pytest
from ksu_common.auth import TokenPayload

from app.core.auth import authorize_permission
from app.services.workflow import TRANSITIONS, WorkflowService


def _token(role: str) -> TokenPayload:
    return TokenPayload(
        sub=str(uuid.uuid4()),
        jti=str(uuid.uuid4()),
        roles=[role],
        raw={},
    )


@pytest.mark.parametrize("permission", ["heri.content.review", "heri.content.publish"])
def test_heri_editor_cannot_authorize_review_or_publish(permission: str) -> None:
    decision = authorize_permission(_token("heri-editor"), permission)

    assert decision.allowed is False
    assert decision.reason == "missing_permission"


@pytest.mark.parametrize("permission", ["heri.content.review", "heri.content.publish"])
def test_heri_publisher_can_authorize_review_and_publish(permission: str) -> None:
    decision = authorize_permission(_token("heri-publisher"), permission)

    assert decision.allowed is True


@pytest.mark.parametrize(
    ("current", "target", "permission"),
    [
        ("draft", "in_review", "heri.content.submit"),
        ("in_review", "approved", "heri.content.review"),
        ("approved", "published", "heri.content.publish"),
    ],
)
def test_heri_administrator_authorizes_each_permitted_transition(
    current: str,
    target: str,
    permission: str,
) -> None:
    workflow = WorkflowService()

    assert workflow.transition_permission(current, target) == permission
    assert authorize_permission(_token("heri-admin"), permission).allowed is True


def test_heri_administrator_authorizes_all_valid_workflow_transitions() -> None:
    workflow = WorkflowService()
    administrator = _token("heri-admin")

    for current, targets in TRANSITIONS.items():
        for target in targets:
            permission = workflow.transition_permission(current, target)
            assert authorize_permission(administrator, permission).allowed is True


def test_workflow_state_transition_does_not_accept_a_role() -> None:
    assert WorkflowService().transition("draft", "in_review") == "in_review"
