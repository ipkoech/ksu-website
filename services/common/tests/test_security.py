from datetime import UTC, datetime, timedelta

import jwt
import pytest

from ksu_common.security import decode_token, hash_password, verify_password

SECRET = "unit-test-secret-value-at-least-32-bytes"


def _mint(token_type: str | None, *, secret: str = SECRET) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": "user-1",
        "jti": "jti-1",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=5),
    }
    if token_type is not None:
        payload["type"] = token_type
    return jwt.encode(payload, secret, algorithm="HS256")


def test_access_token_is_accepted_when_access_is_expected():
    payload = decode_token(_mint("access"), secret=SECRET, expected_type="access")

    assert payload["sub"] == "user-1"


@pytest.mark.parametrize("token_type", ["refresh", "socket", None])
def test_non_access_tokens_are_rejected_when_access_is_expected(token_type):
    with pytest.raises(jwt.PyJWTError):
        decode_token(_mint(token_type), secret=SECRET, expected_type="access")


def test_token_type_is_not_checked_when_no_type_is_expected():
    payload = decode_token(_mint("refresh"), secret=SECRET)

    assert payload["type"] == "refresh"


def test_token_signed_with_another_secret_is_rejected():
    with pytest.raises(jwt.PyJWTError):
        decode_token(_mint("access", secret="a-different-secret"), secret=SECRET)


def test_expired_token_is_rejected():
    now = datetime.now(UTC)
    expired = jwt.encode(
        {
            "sub": "user-1",
            "jti": "jti-1",
            "iat": now - timedelta(hours=2),
            "nbf": now - timedelta(hours=2),
            "exp": now - timedelta(hours=1),
            "type": "access",
        },
        SECRET,
        algorithm="HS256",
    )

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_token(expired, secret=SECRET, expected_type="access")


def test_token_missing_required_claims_is_rejected():
    now = datetime.now(UTC)
    incomplete = jwt.encode(
        {"sub": "user-1", "exp": now + timedelta(minutes=5), "type": "access"},
        SECRET,
        algorithm="HS256",
    )

    with pytest.raises(jwt.MissingRequiredClaimError):
        decode_token(incomplete, secret=SECRET, expected_type="access")


def test_password_round_trip():
    stored = hash_password("correct horse battery staple")

    assert stored != "correct horse battery staple"
    assert verify_password(stored, "correct horse battery staple")
    assert not verify_password(stored, "wrong password")
