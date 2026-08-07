from __future__ import annotations

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from ksu_common.auth import TokenPayload
from ksu_contracts.rbac import AuthorizationDecision
from ksu_contracts.rbac import authorize_permission as evaluate_permission
from ksu_common.security import decode_key_material, decode_token

from .config import get_settings

_bearer = HTTPBearer(auto_error=False)
settings = get_settings()
public_key = decode_key_material(settings.JWT_PUBLIC_KEY_B64, field_name="JWT_PUBLIC_KEY_B64")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    access_token: str | None = Cookie(default=None, alias="access_token"),
) -> TokenPayload:
    token = credentials.credentials if credentials else access_token
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = decode_token(
            token,
            key=public_key,
            algorithm=settings.JWT_ALGORITHM,
            issuer=settings.JWT_ISSUER,
            audience=settings.JWT_AUDIENCE,
            key_id=settings.JWT_KEY_ID,
            expected_type="access",
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token", headers={"WWW-Authenticate": "Bearer"}) from exc
    return TokenPayload(sub=payload["sub"], jti=payload["jti"], roles=payload.get("roles", []), raw=payload)


def authorize_permission(user: TokenPayload, permission: str) -> AuthorizationDecision:
    """Evaluate one explicit HERI permission through the shared RBAC contract."""
    return evaluate_permission(user, permission)


def require_permission(permission: str):
    async def dependency(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if authorize_permission(user, permission).allowed:
            return user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")

    return dependency
