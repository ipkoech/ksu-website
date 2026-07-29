from __future__ import annotations

from app.core.auth import HERI_ROLE_SCOPES


def test_heri_roles_have_explicit_scopes() -> None:
    assert "heri.content.write" in HERI_ROLE_SCOPES["heri-editor"]
    assert "heri.workflow.publish" in HERI_ROLE_SCOPES["heri-publisher"]
    assert "heri.analytics.read" in HERI_ROLE_SCOPES["heri-viewer"]
