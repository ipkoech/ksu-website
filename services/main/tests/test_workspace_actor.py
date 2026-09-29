"""Unit regressions for the optional workspace account precondition."""
import uuid

import pytest
from app.core.workspace_actor import require_workspace_actor
from fastapi import HTTPException

A = uuid.UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
B = uuid.UUID("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")


def test_same_account_and_legacy_omission_are_accepted():
    require_workspace_actor(A, str(A))
    require_workspace_actor(A, str(A).upper())
    require_workspace_actor(A, None)


@pytest.mark.parametrize("expected", [str(B), "", "invalid", " " + str(A)])
def test_different_or_invalid_expectation_is_rejected_without_echo(expected):
    with pytest.raises(HTTPException) as caught:
        require_workspace_actor(A, expected)
    assert caught.value.status_code == 409
    assert caught.value.headers == {"Cache-Control": "no-store"}
    assert str(A) not in caught.value.detail
    assert str(B) not in caught.value.detail
