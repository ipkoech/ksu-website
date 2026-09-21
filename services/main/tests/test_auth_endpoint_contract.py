from __future__ import annotations

from fastapi import Response

from app.api.v1.auth import (
    ACCESS_COOKIE_NAME,
    REFRESH_COOKIE_NAME,
    router,
    _clear_auth_cookies,
    _set_auth_cookies,
)


def test_auth_cookie_paths_and_expiry_match_token_transport() -> None:
    response = Response()
    _set_auth_cookies(response, "access-value", "refresh-value")

    cookies = response.headers.getlist("set-cookie")
    access = next(cookie for cookie in cookies if cookie.startswith(f"{ACCESS_COOKIE_NAME}="))
    refresh = next(cookie for cookie in cookies if cookie.startswith(f"{REFRESH_COOKIE_NAME}="))
    assert "HttpOnly" in access and "Path=/" in access and "SameSite=lax" in access
    assert "HttpOnly" in refresh and "Path=/api/v1/auth" in refresh
    assert "Max-Age=" in access and "Max-Age=" in refresh


def test_clear_auth_cookies_removes_legacy_and_scoped_refresh_paths() -> None:
    response = Response()
    _clear_auth_cookies(response)

    cookies = response.headers.getlist("set-cookie")
    refresh_clears = [cookie for cookie in cookies if cookie.startswith(f"{REFRESH_COOKIE_NAME}=")]
    assert len(refresh_clears) == 2
    assert any("Path=/api/v1/auth" in cookie for cookie in refresh_clears)
    assert any("Path=/" in cookie for cookie in refresh_clears)


def test_auth_mutations_declare_concrete_response_models() -> None:
    paths = {route.path: route.response_model for route in router.routes if route.path in {
        "/login", "/refresh", "/logout", "/logout-all", "/forgot-password",
        "/reset-password", "/verify-email", "/change-password",
    }}
    assert len(paths) == 8
    assert all(model is not None for model in paths.values())
