"""Optional displayed-account precondition for shared Main-service operations.

This is not an authentication or permission source. Call only after the normal
active-user/session checks. A missing header preserves existing clients; a
present header must match the authenticated account, including for reads.
"""
from __future__ import annotations

import re
import uuid

from fastapi import HTTPException

EXPECTED_ACTOR_HEADER = "X-KSU-Expected-Actor"
_UUID = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")


def require_workspace_actor(authenticated_id: uuid.UUID | str, expected_actor: str | None) -> None:
    if expected_actor is None:
        return
    try:
        if not isinstance(expected_actor, str) or not _UUID.fullmatch(expected_actor):
            raise ValueError("invalid account precondition")
        expected = uuid.UUID(expected_actor)
        actual = uuid.UUID(str(authenticated_id))
        if expected != actual:
            raise ValueError("different account")
    except (TypeError, ValueError, AttributeError) as exc:
        # Do not echo either account ID, credentials, or rejected header text.
        raise HTTPException(
            status_code=409,
            detail="The signed-in account changed. Reload this workspace before continuing.",
            headers={"Cache-Control": "no-store"},
        ) from exc
