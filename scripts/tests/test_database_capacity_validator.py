from __future__ import annotations

import pytest

from scripts.validate_database_capacity import validate


def test_default_connection_budget_is_safe():
    possible, budget, pool_capacity = validate({})

    assert (possible, budget, pool_capacity) == (60, 80, 5)


def test_scaled_deployment_is_rejected_when_it_exceeds_postgres_budget():
    with pytest.raises(ValueError, match="budget exceeded"):
        validate({"API_WORKERS": "8", "CELERY_CONCURRENCY": "4"})


def test_replica_counts_are_included_in_connection_budget():
    with pytest.raises(ValueError, match="budget exceeded"):
        validate({"API_REPLICAS": "2", "CELERY_REPLICAS": "2"})
