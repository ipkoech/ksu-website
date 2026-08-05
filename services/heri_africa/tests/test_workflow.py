from __future__ import annotations

import pytest

from app.services.workflow import WorkflowError, WorkflowService


def test_workflow_validates_a_submit_transition_without_a_role() -> None:
    service = WorkflowService()
    assert service.transition("draft", "in_review") == "in_review"


def test_workflow_reports_the_explicit_permission_for_each_transition() -> None:
    service = WorkflowService()
    assert service.transition_permission("in_review", "approved") == "heri.content.review"
    assert service.transition_permission("approved", "published") == "heri.content.publish"


def test_invalid_transition_is_rejected() -> None:
    with pytest.raises(WorkflowError):
        WorkflowService().transition("draft", "published")
