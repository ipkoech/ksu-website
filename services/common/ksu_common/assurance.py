"""Current-session assurance checks for privileged business operations."""

import math
import time

from fastapi import HTTPException

MFA_MAX_AGE_SECONDS = 900


def require_recent_mfa(subject, *, now=None):
    raw = getattr(subject, "raw", getattr(subject, "_auth_assurance", {}))
    timestamp = raw.get("mfa_verified_at")
    current = time.time() if now is None else now
    valid = (
        raw.get("mfa_enabled") is True
        and isinstance(timestamp, (int, float)) and not isinstance(timestamp, bool)
        and math.isfinite(timestamp)
        and 0 <= current - timestamp <= MFA_MAX_AGE_SECONDS
    )
    if not valid:
        raise HTTPException(403, "Recent MFA verification required",
                            headers={"X-Authentication-Action": "step-up" if raw.get("mfa_enabled") is True else "enroll"})
