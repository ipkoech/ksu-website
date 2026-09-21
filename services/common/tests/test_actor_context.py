import pytest

from ksu_common.actor_context import sign_actor_context, verify_actor_context


def test_actor_context_round_trip_and_tamper_rejection():
    token = sign_actor_context("user-123", "shared-secret", ttl_seconds=60)
    assert verify_actor_context(token, "shared-secret")["actor_id"] == "user-123"
    with pytest.raises(ValueError):
        verify_actor_context(token + "x", "shared-secret")


def test_actor_context_expiry_is_enforced():
    token = sign_actor_context("user-123", "shared-secret", ttl_seconds=1)
    with pytest.raises(ValueError, match="invalid actor context"):
        verify_actor_context(token, "shared-secret", now=10**12)


def test_actor_context_rejects_materially_future_issuance():
    token = sign_actor_context("user-123", "shared-secret", ttl_seconds=60)
    with pytest.raises(ValueError, match="invalid actor context"):
        verify_actor_context(token, "shared-secret", now=0)
