import re

from app.services.assistant_identity import (
    CONTINUATION_COOKIE,
    GUEST_SESSION_COOKIE,
    create_guest_token,
    create_verification_code,
    hash_secret,
)


def test_secret_hash_is_one_way_stable_and_does_not_equal_plaintext():
    value = create_guest_token()

    assert hash_secret(value) == hash_secret(value)
    assert hash_secret(value) != value
    assert len(hash_secret(value)) == 64


def test_verification_code_is_exactly_six_digits():
    assert re.fullmatch(r"\d{6}", create_verification_code())


def test_identity_cookies_are_separate_security_boundaries():
    assert GUEST_SESSION_COOKIE != CONTINUATION_COOKIE
    assert GUEST_SESSION_COOKIE.startswith("ksu_library_")
    assert CONTINUATION_COOKIE.startswith("ksu_library_")
