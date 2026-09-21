from migrate_access_assignments import plan, rollback_snapshot

def test_equivalent_mapping_is_idempotent_and_preserves_source():
    row = {"user_id": "u", "role": "school-admin", "scope_type": "school", "scope_id": "s", "is_active": True}
    first = plan([row])
    second = plan([row])
    assert first == second and first["assignments"][0]["migratable"]
    assert rollback_snapshot(first) == [row]

def test_expanded_ambiguous_and_inactive_are_never_migratable():
    rows = [
        {"role": "admin", "is_active": True},
        {"role": "unknown", "is_active": True},
        {"role": "library-admin", "is_active": False},
    ]
    result = plan(rows)
    assert [item["classification"] for item in result["assignments"]] == ["expanded", "ambiguous", "expired_or_inactive"]
    assert not any(item["migratable"] for item in result["assignments"])
