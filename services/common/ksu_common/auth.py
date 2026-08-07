"""FastAPI authentication dependency."""

from __future__ import annotations

from collections.abc import Callable, Coroutine
from dataclasses import dataclass, field
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .security import decode_token, validate_secret

_bearer = HTTPBearer(auto_error=False)
_bearer_dependency = Depends(_bearer)


@dataclass
class TokenPayload:
    sub: str
    jti: str
    roles: list[str] = field(default_factory=list)
    raw: dict = field(default_factory=dict)


UserDependency = Callable[
    [HTTPAuthorizationCredentials | None], Coroutine[Any, Any, TokenPayload]
]
OptionalUserDependency = Callable[
    [HTTPAuthorizationCredentials | None], Coroutine[Any, Any, TokenPayload | None]
]


@dataclass(frozen=True)
class UserDependencies:
    current_user: UserDependency
    optional_user: OptionalUserDependency


def build_user_dependencies(
    *, secret: str, algorithm: str, app_env: str
) -> UserDependencies:
    """Bind JWT verification dependencies to explicit service configuration."""

    verified_secret = validate_secret(
        secret,
        field_name="JWT_SECRET_KEY",
        app_env=app_env,
    ) or secret

    async def get_current_user(
        credentials: HTTPAuthorizationCredentials | None = _bearer_dependency,
    ) -> TokenPayload:
        exc = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        if not credentials:
            raise exc
        try:
            payload = decode_token(
                credentials.credentials,
                secret=verified_secret,
                algorithm=algorithm,
                expected_type="access",
            )
        except jwt.PyJWTError as error:
            raise exc from error
        return TokenPayload(
            sub=payload["sub"],
            jti=payload["jti"],
            roles=payload.get("roles", []),
            raw=payload,
        )

    async def get_optional_user(
        credentials: HTTPAuthorizationCredentials | None = _bearer_dependency,
    ) -> TokenPayload | None:
        if not credentials:
            return None
        try:
            return await get_current_user(credentials)
        except HTTPException:
            return None

    return UserDependencies(get_current_user, get_optional_user)
