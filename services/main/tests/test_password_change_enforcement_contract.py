"""Regression checks for forced password-change account state."""

from __future__ import annotations

from pathlib import Path


def test_user_schema_accepts_service_trace_and_password_change_control():
    source = (Path(__file__).parents[1] / "app" / "schemas" / "auth.py").read_text()
    assert "service_memberships:" in source
    assert "must_change_password:" in source


def test_auth_payload_exposes_enforcement_and_service_trace():
    source = (Path(__file__).parents[1] / "app" / "api" / "v1" / "auth.py").read_text()
    assert '"service_memberships": user.service_memberships' in source
    assert '"must_change_password": user.must_change_password' in source
