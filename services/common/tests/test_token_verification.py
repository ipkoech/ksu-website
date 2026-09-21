import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa

from ksu_common.security import decode_token, encode_token


@pytest.fixture(scope="module")
def keys():
    private = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    return private, private.public_key()


def claims():
    now = int(time.time())
    return {"sub": "user-1", "jti": "session-1", "iat": now, "nbf": now,
            "exp": now + 300, "type": "access"}


def verify(token, public):
    return decode_token(token, key=public, key_id="active", issuer="authority",
                        audience="platform", expected_type="access")


def sign(payload, private, **overrides):
    options = {"key_id": "active", "issuer": "authority", "audience": "platform", **overrides}
    return encode_token(payload, private_key=private, **options)


def test_valid_signed_access_token(keys):
    payload = claims()
    assert verify(sign(payload, keys[0]), keys[1])["sub"] == "user-1"


@pytest.mark.parametrize("missing", ["sub", "jti", "iat", "nbf", "exp"])
def test_required_claims_cannot_be_omitted(keys, missing):
    payload = claims()
    del payload[missing]
    with pytest.raises(jwt.PyJWTError):
        verify(sign(payload, keys[0]), keys[1])


@pytest.mark.parametrize("change", [
    {"sub": ""}, {"sub": "   "}, {"jti": ""}, {"jti": "   "},
    {"exp": 1}, {"iat": 9999999999}, {"nbf": 9999999999}, {"type": "refresh"},
])
def test_invalid_claims_are_rejected(keys, change):
    with pytest.raises(jwt.PyJWTError):
        verify(sign({**claims(), **change}, keys[0]), keys[1])


@pytest.mark.parametrize("overrides", [{"key_id": "retired"}, {"issuer": "other"}, {"audience": "other"}])
def test_wrong_trust_boundary_is_rejected(keys, overrides):
    with pytest.raises(jwt.PyJWTError):
        verify(sign(claims(), keys[0], **overrides), keys[1])


def test_other_signer_and_algorithm_are_rejected(keys):
    other = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    with pytest.raises(jwt.PyJWTError):
        verify(sign(claims(), other), keys[1])
    token = jwt.encode({**claims(), "iss": "authority", "aud": "platform"},
                       b"test-only-hmac-key-with-at-least-32-bytes", algorithm="HS256", headers={"kid": "active"})
    with pytest.raises(jwt.PyJWTError):
        verify(token, keys[1])
