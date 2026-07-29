from __future__ import annotations

import pytest

from app.services.workflow import WorkflowError, WorkflowService


def test_editor_can_submit_draft_but_cannot_publish() -> None:
    service = WorkflowService()
    assert service.transition("draft", "in_review", "editor") == "in_review"
    with pytest.raises(WorkflowError):
        service.transition("in_review", "published", "editor")


def test_publisher_can_approve_and_publish_reviewed_content() -> None:
    service = WorkflowService()
    assert service.transition("in_review", "approved", "publisher") == "approved"
    assert service.transition("approved", "published", "publisher") == "published"


def test_invalid_transition_is_rejected() -> None:
    with pytest.raises(WorkflowError):
        WorkflowService().transition("draft", "published", "publisher")
