"""MFA must not appear configurable until challenge and recovery are implemented."""

import pytest
from pydantic import ValidationError

from app.schemas.auth import UserCreate, UserUpdate
from app.services.system import UNSUPPORTED_SETTING_KEYS


def test_user_contracts_do_not_advertise_mfa() -> None:
    assert "mfa_enabled" not in UserCreate.model_json_schema()["properties"]
    assert "mfa_enabled" not in UserUpdate.model_json_schema()["properties"]


@pytest.mark.parametrize(
    "schema,payload",
    [
        (
            UserCreate,
            {
                "email": "admin@example.invalid",
                "password": "ValidPass1",
                "full_name": "Admin",
                "mfa_enabled": True,
            },
        ),
        (UserUpdate, {"mfa_enabled": False}),
    ],
)
def test_user_contracts_reject_unsupported_mfa_state(schema, payload) -> None:
    with pytest.raises(ValidationError, match="MFA enrollment is not supported"):
        schema.model_validate(payload)


def test_no_op_two_factor_setting_is_reserved() -> None:
    assert "require_2fa" in UNSUPPORTED_SETTING_KEYS
