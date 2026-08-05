from __future__ import annotations

import uuid

from ksu_common.auth import TokenPayload

from app.core.auth import authorize_scoped_record


def _token(*, permissions: list[str] | None = None, grants: list[dict] | None = None) -> TokenPayload:
    raw: dict[str, object] = {"permissions": permissions or []}
    if grants is not None:
        raw["scope_grants"] = grants
    return TokenPayload(sub=str(uuid.uuid4()), jti=str(uuid.uuid4()), roles=[], raw=raw)


def _decision(user: TokenPayload, target_id: uuid.UUID):
    return authorize_scoped_record(user, "research.manage_projects", "research", target_id)


def test_research_scope_matrix_denies_missing_token_permissions() -> None:
    decision = _decision(_token(), uuid.uuid4())

    assert decision.allowed is False
    assert decision.reason == "missing_permission"


def test_research_scope_matrix_denies_valid_token_without_permission() -> None:
    decision = _decision(_token(permissions=["research.view"]), uuid.uuid4())

    assert decision.allowed is False
    assert decision.reason == "missing_permission"


def test_research_scope_matrix_denies_wrong_scope() -> None:
    decision = _decision(
        _token(
            permissions=["research.manage_projects"],
            grants=[
                {
                    "permissions": ["research.manage_projects"],
                    "scope_type": "research",
                    "scope_id": str(uuid.uuid4()),
                }
            ],
        ),
        uuid.uuid4(),
    )

    assert decision.allowed is False
    assert decision.reason == "scope_mismatch"


def test_research_scope_matrix_allows_correct_scope() -> None:
    research_id = uuid.uuid4()
    decision = _decision(
        _token(
            permissions=["research.manage_projects"],
            grants=[
                {
                    "permissions": ["research.manage_projects"],
                    "scope_type": "research",
                    "scope_id": str(research_id),
                }
            ],
        ),
        research_id,
    )

    assert decision.allowed is True
    assert decision.matched_permission == "research.manage_projects"


def test_research_scope_matrix_allows_global_administrator_override() -> None:
    decision = _decision(
        _token(
            permissions=["admin:*"],
            grants=[{"permissions": ["admin:*"], "scope_type": "global", "scope_id": None}],
        ),
        uuid.uuid4(),
    )

    assert decision.allowed is True
    assert decision.matched_permission == "admin:*"
