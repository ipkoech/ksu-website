from __future__ import annotations

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from ksu_common.auth import StrictHTTPBearer, TokenPayload
from ksu_common.identity_freshness import build_identity_validator
from ksu_contracts.rbac import AuthorizationDecision, AuthorizationScope
from ksu_contracts.assurance import require_operation_assurance
from ksu_contracts.rbac import authorize_permission as evaluate_permission
from ksu_common.security import decode_key_material, decode_token

from .config import get_settings

_bearer = StrictHTTPBearer(auto_error=False)
settings = get_settings()
public_key = decode_key_material(settings.JWT_PUBLIC_KEY_B64, field_name="JWT_PUBLIC_KEY_B64")
_validate_identity = build_identity_validator(
    base_url=settings.MAIN_SERVICE_URL, service_key=settings.MAIN_SERVICE_API_KEY,
)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    access_token: str | None = Cookie(default=None, alias="ksu_access"),
    legacy_access_token: str | None = Cookie(default=None, alias="access_token"),
) -> TokenPayload:
    token = credentials.credentials if credentials else access_token or legacy_access_token
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
    return await _validate_identity(token, TokenPayload(
        sub=payload["sub"], jti=payload["jti"], roles=payload.get("roles", []), raw=payload,
    ))


def authorize_permission(user: TokenPayload, permission: str) -> AuthorizationDecision:
    """Evaluate one explicit HERI permission through the shared RBAC contract."""
    decision = evaluate_permission(user, permission, AuthorizationScope("heri", "heri"))
    if decision.allowed:
        require_operation_assurance(user, permission)
    return decision


def require_permission(permission: str):
    async def dependency(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if authorize_permission(user, permission).allowed:
            require_operation_assurance(user, permission)
            return user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")

    return dependency


def require_resource_permission(action: str):
    async def dependency(resource: str, user: TokenPayload = Depends(get_current_user)):
        namespace = {"submissions": "submissions", "media": "media", "analytics": "analytics",
                     "social-publications": "social"}.get(resource, "content")
        permission = f"heri.{namespace}.{action}"
        if not authorize_permission(user, permission).allowed:
            raise HTTPException(403, "Insufficient privileges for this HERI resource")
        require_operation_assurance(user, permission)
        return user
    return dependency
