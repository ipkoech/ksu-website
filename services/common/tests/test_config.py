from __future__ import annotations

import pytest

from ksu_common.config import validate_read_replica_settings


def test_read_replica_is_disabled_by_default_without_a_url() -> None:
    assert validate_read_replica_settings(
        enabled=False, approved=False, url=None, app_env="production"
    ) is None


def test_read_replica_requires_explicit_measurement_approval() -> None:
    with pytest.raises(ValueError, match="READ_REPLICA_APPROVED"):
        validate_read_replica_settings(
            enabled=True,
            approved=False,
            url="postgresql+asyncpg://reader:secret@replica/ksu_services_db",
            app_env="production",
        )


def test_read_replica_requires_a_url_after_approval() -> None:
    with pytest.raises(ValueError, match="READ_DATABASE_URL"):
        validate_read_replica_settings(
            enabled=True, approved=True, url=None, app_env="production"
        )
