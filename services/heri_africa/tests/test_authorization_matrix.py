from __future__ import annotations

import uuid

from ksu_common.auth import TokenPayload

from app.core.auth import authorize_permission


def _token(*, roles: list[str] | None = None, permissions: list[str] | None = None) -> TokenPayload:
    return TokenPayload(
        sub=str(uuid.uuid4()),
        jti=str(uuid.uuid4()),
        roles=roles or [],
        raw={"permissions": permissions or []},
    )


def test_heri_content_matrix_denies_missing_token_permissions() -> None:
    decision = authorize_permission(_token(), "heri.content.submit")

    assert decision.allowed is False
    assert decision.reason == "missing_permission"


def test_heri_content_matrix_denies_valid_token_without_permission() -> None:
    decision = authorize_permission(_token(permissions=["heri.content.review"]), "heri.content.submit")

    assert decision.allowed is False
    assert decision.reason == "missing_permission"


def test_heri_content_matrix_allows_explicit_submit_permission() -> None:
    decision = authorize_permission(_token(permissions=["heri.content.submit"]), "heri.content.submit")

    assert decision.allowed is True
    assert decision.matched_permission == "heri.content.submit"


def test_heri_content_matrix_allows_administrator_override() -> None:
    decision = authorize_permission(_token(roles=["heri-admin"]), "heri.content.publish")

    assert decision.allowed is True
    assert decision.matched_permission == "heri:*"


def test_heri_explicit_content_workflow_permissions_are_not_role_name_inference() -> None:
    decision = authorize_permission(_token(roles=["heri-editor"]), "heri.content.review")

    assert decision.allowed is False
    assert decision.reason == "missing_permission"
