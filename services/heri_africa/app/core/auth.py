from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, status


async def get_current_user() -> Any:
    """Temporary shared-auth seam; protected routes will bind repository auth in Task 4."""
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")


def require_permission(permission: str):
    async def dependency(user: Any = Depends(get_current_user)) -> Any:
        del permission
        return user

    return dependency
