"""Authentication endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Request, Response

from ksu_common.schemas.responses import success
from ksu_common.security import decode_key_material, public_jwk

from ...core.config import get_settings
from ...deps import CurrentToken, CurrentUser, DbSession
from ...models import User
from ...schemas import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    RefreshRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserLogin,
    VerifyEmailRequest,
)
from ...services import AuthService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()
settings = get_settings()
ACCESS_COOKIE_NAME = "ksu_access"
REFRESH_COOKIE_NAME = "ksu_refresh"


@router.get("/jwks", response_model=dict[str, list[dict[str, str | list[str]]]])
async def jwks():
    """Publish verifier-only key material for external and internal consumers."""
    public_key = decode_key_material(
        settings.JWT_PUBLIC_KEY_B64,
        field_name="JWT_PUBLIC_KEY_B64",
    )
    return {
        "keys": [
            public_jwk(
                public_key,
                key_id=settings.JWT_KEY_ID,
                algorithm=settings.JWT_ALGORITHM,
            )
        ]
    }


def _cookie_secure() -> bool:
    return settings.APP_ENV.lower() in {"production", "prod"}


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        ACCESS_COOKIE_NAME,
        access_token,
        max_age=settings.JWT_ACCESS_TTL_MINUTES * 60,
        httponly=True,
        secure=_cookie_secure(),
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        refresh_token,
        max_age=settings.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=_cookie_secure(),
        samesite="lax",
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE_NAME, path="/")
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")


def _serialize_auth_user(user: User) -> dict:
    """Return an auth-friendly user payload with computed role names."""
    permissions = sorted(
        {
            permission
            for assignment in user.role_assignments
            if assignment.is_active and assignment.role and assignment.role.is_active
            for permission in assignment.role.permissions
        }
    )
    return {
        "id": str(user.id),
        "email": user.email,
        "phone": user.phone,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "push_tokens": user.push_tokens,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "mfa_enabled": user.mfa_enabled,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "failed_login_attempts": user.failed_login_attempts,
        "locked_until": user.locked_until.isoformat() if user.locked_until else None,
        "email_verified_at": user.email_verified_at.isoformat() if user.email_verified_at else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "person_id": str(user.person.id) if user.person else None,
        "roles": user.roles,
        "permissions": permissions,
    }


@router.post("/login")
async def login(data: UserLogin, db: DbSession, response: Response, request: Request):
    user, access_token, refresh_token = await AuthService.login(
        db,
        data.email,
        data.password,
        ip_address=request.client.host if request.client else None,
    )
    _set_auth_cookies(response, access_token, refresh_token)
    return success(
        data=TokenResponse(access_token=access_token, refresh_token=refresh_token).model_dump()
    )


@router.post("/refresh")
async def refresh(data: RefreshRequest, db: DbSession, response: Response):
    access_token, refresh_token = await AuthService.refresh_token(db, data.refresh_token)
    _set_auth_cookies(response, access_token, refresh_token)
    return success(
        data=TokenResponse(access_token=access_token, refresh_token=refresh_token).model_dump()
    )


@router.post("/logout")
async def logout(db: DbSession, user: CurrentUser, token: CurrentToken, response: Response):
    await AuthService.logout(db, user.id, token.jti)
    _clear_auth_cookies(response)
    return success(message="Logged out")


@router.post("/logout-all")
async def logout_all(db: DbSession, user: CurrentUser):
    count = await AuthService.logout_all(db, user.id)
    return success(data={"revoked_sessions": count}, message="All sessions revoked")


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: DbSession, request: Request):
    await AuthService.request_password_reset(
        db,
        data.email,
        frontend_service=data.frontend_service,
        ip_address=request.client.host if request.client else None,
    )
    return success(message="If the email exists, a password reset message has been queued")


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: DbSession):
    await AuthService.reset_password(db, data.token, data.new_password)
    return success(message="Password reset successfully")


@router.post("/verify-email")
async def verify_email(data: VerifyEmailRequest, db: DbSession):
    user = await AuthService.verify_email(db, data.token)
    return success(data={"user_id": str(user.id), "verified": True}, message="Email verified")


@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, db: DbSession, user: CurrentUser):
    await AuthService.change_password(db, user, data.old_password, data.new_password)
    return success(message="Password changed successfully")


@router.get("/me")
async def get_me(user: CurrentUser, fields: FieldSelection = FieldsDep):
    payload = _serialize_auth_user(user)
    if fields and not fields.is_empty:
        selector = build_selector(User, fields)
        data = selector.apply(payload)
        for computed_key in ("roles", "permissions", "person_id"):
            if fields.has_field(computed_key) and computed_key not in data:
                data[computed_key] = payload[computed_key]
        return success(data=data)
    return success(data=payload)
