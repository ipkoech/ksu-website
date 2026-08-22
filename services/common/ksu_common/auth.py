"""FastAPI authentication dependency."""

from __future__ import annotations

from collections.abc import Callable, Coroutine
from dataclasses import dataclass, field
from typing import Any

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .security import decode_key_material, decode_token

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
    *,
    public_key_b64: str,
    issuer: str,
    audience: str,
    key_id: str,
    algorithm: str = "RS256",
) -> UserDependencies:
    """Bind JWT verification dependencies to explicit service configuration."""

    public_key = decode_key_material(public_key_b64, field_name="JWT_PUBLIC_KEY_B64")

    async def get_current_user(
        credentials: HTTPAuthorizationCredentials | None = _bearer_dependency,
        access_cookie: str | None = Cookie(default=None, alias="ksu_access"),
    ) -> TokenPayload:
        exc = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        token = credentials.credentials if credentials else access_cookie if isinstance(access_cookie, str) else None
        if not token:
            raise exc
        try:
            payload = decode_token(
                token,
                key=public_key,
                algorithm=algorithm,
                issuer=issuer,
                audience=audience,
                key_id=key_id,
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
        access_cookie: str | None = Cookie(default=None, alias="ksu_access"),
    ) -> TokenPayload | None:
        if not credentials and not isinstance(access_cookie, str):
            return None
        try:
            return await get_current_user(credentials, access_cookie)
        except HTTPException:
            return None

    return UserDependencies(get_current_user, get_optional_user)
