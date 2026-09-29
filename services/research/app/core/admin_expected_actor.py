"""Check client identity expectations against the server-verified JWT subject.

The header is never authentication or an authorization grant. Legacy clients
without it retain existing behavior. Research Admin sends it so switching cookie
accounts in another tab cannot execute an action under the journal's old actor.
"""
from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException

HEADER = "X-KSU-Expected-Actor"


def validate_expected_actor(request, actor) -> None:
    expected = request.headers.get(HEADER)
    if expected is None:
        return
    try:
        if not isinstance(expected, str) or len(expected) != 36:
            raise ValueError("Invalid actor identifier")
        matches = UUID(expected) == UUID(str(actor.sub))
    except (ValueError, TypeError, AttributeError) as exc:
        raise HTTPException(422, "Invalid expected workspace account identifier") from exc
    if not matches:
        # Native idempotency claims are acquired after auth dependencies finish.
        raise HTTPException(409, "The signed-in account changed. Reload the workspace before sending another command.")
