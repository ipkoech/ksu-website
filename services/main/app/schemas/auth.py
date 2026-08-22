"""Authentication schemas for users and JWT session tracking."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import EmailStr, Field, field_validator, model_validator

from .base import BaseReadSchema, BaseSchema, PhoneStr, UrlStr


def _normalize_email(value: str) -> str:
    return value.strip().lower()


def _validate_password(value: str) -> str:
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not any(char.isupper() for char in value):
        raise ValueError("Password must contain at least one uppercase letter")
    if not any(char.islower() for char in value):
        raise ValueError("Password must contain at least one lowercase letter")
    if not any(char.isdigit() for char in value):
        raise ValueError("Password must contain at least one digit")
    return value


def _reject_unsupported_mfa(value: object) -> object:
    if isinstance(value, dict) and "mfa_enabled" in value:
        raise ValueError("MFA enrollment is not supported; mfa_enabled cannot be set")
    return value


class UserLogin(BaseSchema):
    email: EmailStr
    password: str = Field(min_length=8, max_length=255)
    token_transport: Literal["cookie", "bearer"] = "cookie"

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)


class UserCreate(BaseSchema):
    email: EmailStr
    phone: PhoneStr | None = None
    password: str = Field(min_length=8, max_length=255)
    full_name: str = Field(min_length=1, max_length=255)
    avatar_url: UrlStr | None = None
    push_tokens: list[str] | None = None
    is_active: bool = True
    is_verified: bool = False
    service_memberships: list[Literal["main", "research", "library", "heri", "system"]] = Field(
        default_factory=list
    )
    must_change_password: bool = False

    @model_validator(mode="before")
    @classmethod
    def reject_unsupported_mfa(cls, value: object) -> object:
        return _reject_unsupported_mfa(value)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return _validate_password(value)


class UserUpdate(BaseSchema):
    email: EmailStr | None = None
    phone: PhoneStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=255)
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    avatar_url: UrlStr | None = None
    push_tokens: list[str] | None = None
    is_active: bool | None = None
    is_verified: bool | None = None
    service_memberships: list[Literal["main", "research", "library", "heri", "system"]] | None = None
    must_change_password: bool | None = None

    @model_validator(mode="before")
    @classmethod
    def reject_unsupported_mfa(cls, value: object) -> object:
        return _reject_unsupported_mfa(value)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _normalize_email(value)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _validate_password(value)


class UserRead(BaseReadSchema):
    email: EmailStr
    phone: str | None = None
    full_name: str
    avatar_url: str | None = None
    push_tokens: list[str] | None = None
    is_active: bool
    is_verified: bool
    service_memberships: list[str] = Field(default_factory=list)
    must_change_password: bool = False
    last_login_at: datetime | None = None
    failed_login_attempts: int
    locked_until: datetime | None = None
    email_verified_at: datetime | None = None
    roles: list[str] = Field(default_factory=list)
    notifications: list[dict[str, Any]] | None = None
    person: dict[str, Any] | None = None
    role_assignments: list[dict[str, Any]] | None = None
    sessions: list[dict[str, Any]] | None = None
    person_id: uuid.UUID | None = None


class SessionRead(BaseReadSchema):
    user_id: uuid.UUID
    jti: str
    token_type: str
    ip_address: str | None = None
    user_agent: str | None = None
    device_name: str | None = None
    device_type: str | None = None
    expires_at: datetime | None = None
    revoked_at: datetime | None = None
    revoked_reason: str | None = None
    last_used_at: datetime | None = None
    user: dict[str, Any] | None = None
    is_active: bool


class RefreshRequest(BaseSchema):
    refresh_token: str | None = Field(default=None, min_length=1)
    token_transport: Literal["cookie", "bearer"] = "cookie"


class ForgotPasswordRequest(BaseSchema):
    email: EmailStr
    frontend_service: Literal["web", "admin", "research", "library"] | None = None

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)


class ResetPasswordRequest(BaseSchema):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=255)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return _validate_password(value)


class VerifyEmailRequest(BaseSchema):
    token: str = Field(min_length=1)


class ChangePasswordRequest(BaseSchema):
    old_password: str = Field(min_length=1, max_length=255)
    new_password: str = Field(min_length=8, max_length=255)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return _validate_password(value)


class TokenResponse(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class CookieAuthResponse(BaseSchema):
    authenticated: bool = True
    token_type: Literal["cookie"] = "cookie"
