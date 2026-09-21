import pytest
from fastapi import HTTPException

from ksu_common.assurance import require_recent_mfa
from ksu_common.auth import TokenPayload


@pytest.mark.parametrize("enabled,timestamp,allowed", [
    (True, 1000, True), (True, 100, True), (True, 99, False),
    (True, 1001, False), (False, 1000, False), (True, None, False),
    (True, True, False), (True, "1000", False), (True, float("nan"), False),
])
def test_assurance_requires_current_enrollment_and_recent_finite_time(enabled, timestamp, allowed):
    actor = TokenPayload("actor", "session", raw={"mfa_enabled": enabled, "mfa_verified_at": timestamp})
    if allowed:
        require_recent_mfa(actor, now=1000)
    else:
        with pytest.raises(HTTPException) as denied:
            require_recent_mfa(actor, now=1000)
        assert denied.value.status_code == 403
