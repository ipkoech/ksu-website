import time

import pytest
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.core.auth import authorize_permission
from app.services.workflow import WorkflowService


@pytest.mark.parametrize("current,target,required", [
    ("in_review", "approved", "approve"),
    ("approved", "scheduled", "schedule"),
    ("scheduled", "approved", "schedule"),
    ("published", "archived", "unpublish"),
])
def test_editorial_actions_do_not_inherit_review_or_publish_authority(current, target, required):
    actor = TokenPayload("publisher", "session", raw={
        "scope_grants": [{"scope_type": "heri", "scope_id": "heri",
                          "permissions": ["heri.content.review", "heri.content.publish"]}],
        "mfa_enabled": True, "mfa_verified_at": time.time(),
    })
    permission = WorkflowService().transition_permission(current, target)
    assert permission == f"heri.content.{required}"
    assert not authorize_permission(actor, permission).allowed
    actor.raw["scope_grants"][0]["permissions"].append(permission)
    assert authorize_permission(actor, permission).allowed


@pytest.mark.parametrize("current,target", [("approved", "published"), ("published", "archived"), ("approved", "scheduled")])
def test_heri_workflow_permission_rechecks_session_assurance(current, target):
    actor = TokenPayload("publisher", "session", raw={"scope_grants": [
        {"scope_type": "heri", "scope_id": "heri", "permissions": [WorkflowService().transition_permission(current, target)]},
    ]})
    required = WorkflowService().transition_permission(current, target)
    with pytest.raises(HTTPException) as denied:
        authorize_permission(actor, required)
    assert denied.value.status_code == 403
    actor.raw.update(mfa_enabled=True, mfa_verified_at=time.time())
    assert authorize_permission(actor, required).allowed
