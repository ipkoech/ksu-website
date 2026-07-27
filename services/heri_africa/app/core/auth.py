from __future__ import annotations

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from ksu_common.auth import TokenPayload
from ksu_common.roles import ROLE_DEFINITIONS
from ksu_common.security import decode_token

from .config import get_settings

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    access_token: str | None = Cookie(default=None, alias="access_token"),
) -> TokenPayload:
    token = credentials.credentials if credentials else access_token
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = decode_token(token, secret=get_settings().JWT_SECRET_KEY, algorithm=get_settings().JWT_ALGORITHM)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token", headers={"WWW-Authenticate": "Bearer"}) from exc
    return TokenPayload(sub=payload["sub"], jti=payload["jti"], roles=payload.get("roles", []), raw=payload)


def require_permission(permission: str):
    async def dependency(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        scopes = set(user.raw.get("scopes", []) or []) | set(user.raw.get("permissions", []) or [])
        for role in user.roles:
            definition = ROLE_DEFINITIONS.get(role)
            if definition:
                scopes.update(definition.scopes)
        if permission in scopes or "admin:*" in scopes or "admin" in user.roles:
            return user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")

    return dependency
