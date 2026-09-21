from types import SimpleNamespace
import time
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.api.v1.content_workflow import authorize_club_media_workflow_action, authorize_content_workflow_action


@pytest.mark.parametrize("permissions", [set(), {"clubs.manage_own"}, {"stories.submit"},
                                        {"content.manage"}, {"content.review"}])
@pytest.mark.parametrize("action", ["approve", "publish", "schedule", "unpublish"])
def test_non_publishing_assignments_cannot_publish_through_alternate_routes(permissions, action):
    user = SimpleNamespace(id=uuid4())
    content = SimpleNamespace(author_user_id=user.id)
    with pytest.raises(HTTPException) as error:
        authorize_content_workflow_action(user, content, action, permissions)
    assert error.value.status_code == 403
    with pytest.raises(HTTPException):
        authorize_club_media_workflow_action(action, permissions)


def test_separate_publishing_assignment_allows_owner_to_publish():
    user = SimpleNamespace(id=uuid4(), _auth_assurance={"mfa_enabled": True, "mfa_verified_at": time.time()})
    content = SimpleNamespace(author_user_id=user.id)
    authorize_content_workflow_action(user, content, "publish", {"clubs.manage_own", "content.publish"})
    with pytest.raises(HTTPException):
        authorize_content_workflow_action(user, content, "approve", {"content.publish"})


@pytest.mark.parametrize("action", ["approve", "publish", "schedule", "unpublish"])
def test_password_only_editor_cannot_change_publication_through_custom_guards(action):
    user = SimpleNamespace(id=uuid4())
    content = SimpleNamespace(author_user_id=user.id)
    permissions = {f"content.{action}"}
    with pytest.raises(HTTPException) as denied:
        authorize_content_workflow_action(user, content, action, permissions)
    assert denied.value.headers["X-Authentication-Action"] == "enroll"
    with pytest.raises(HTTPException):
        authorize_club_media_workflow_action(action, permissions, actor=user)
