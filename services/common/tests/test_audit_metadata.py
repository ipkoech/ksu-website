import json

import pytest

from ksu_common.audit_metadata import MAX_METADATA_BYTES, prepare_audit_metadata
from ksu_common.audit import _audit_log_from_payload


@pytest.mark.parametrize("value,reason", [
    ("x" * 65537, "size_limit"), ([0] * 4097, "node_limit"),
    (float("nan"), "invalid_number"), (object(), "invalid_type"),
    ({"text": "a\x00b"}, "invalid_text"), ({"text": "\ud800"}, "invalid_text"),
    ({"bad\x00key": "value"}, "invalid_text"),
], ids=["bytes", "nodes", "nonfinite", "unsupported", "null", "surrogate", "null-key"])
def test_unbounded_metadata_has_explicit_safe_marker(value, reason):
    assert prepare_audit_metadata(value) == {"audit_metadata_omitted": {"reason": reason}}


def test_cycles_depth_and_shared_values():
    cyclic = {}
    cyclic["self"] = cyclic
    assert prepare_audit_metadata(cyclic)["audit_metadata_omitted"]["reason"] == "cycle"
    deep = 1
    for _ in range(18):
        deep = [deep]
    assert prepare_audit_metadata(deep)["audit_metadata_omitted"]["reason"] == "depth_limit"
    shared = {"label": "safe", "password": "secret"}
    assert prepare_audit_metadata((shared, shared)) == [{"label": "safe"}] * 2
    assert shared["password"] == "secret"


def test_encoded_bound_and_core_event_survive_omission():
    value = "é" * 12000
    result = prepare_audit_metadata(value)
    assert len(json.dumps(result).encode()) <= MAX_METADATA_BYTES
    entry = _audit_log_from_payload(
        {"action": "account.change", "status_code": 200, "details": value},
        lambda **fields: fields,
    )
    assert entry["action"] == "account.change"
    assert entry["status_code"] == 200
    assert entry["details"]["audit_metadata_omitted"]["reason"] == "size_limit"
