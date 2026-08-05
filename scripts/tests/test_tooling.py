from __future__ import annotations

import collections
import importlib.util
import json
from pathlib import Path
import sys

import pytest


ROOT = Path(__file__).parents[2]


def load_script(name: str):
    path = ROOT / "scripts" / name
    spec = importlib.util.spec_from_file_location(name.replace(".py", ""), path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


performance = load_script("performance_harness.py")
ruff_baseline = load_script("ruff_baseline.py")


def test_performance_scenarios_reject_non_get_and_absolute_urls(tmp_path):
    scenario_file = tmp_path / "scenarios.json"
    scenario_file.write_text(json.dumps([{"label": "health", "path": "/health", "method": "POST"}]))
    with pytest.raises(ValueError, match="only permits GET"):
        performance.load_scenarios([], str(scenario_file))
    with pytest.raises(ValueError, match="relative path"):
        performance.validate_path("https://example.invalid/health")


def test_performance_query_is_read_only_and_comment_free(tmp_path):
    assert performance.validate_explain_query("SELECT 1;") == "SELECT 1"
    with pytest.raises(ValueError, match="read-only"):
        performance.validate_explain_query("UPDATE users SET name = 'x'")
    with pytest.raises(ValueError, match="comment-free"):
        performance.validate_explain_query("SELECT 1; SELECT 2")


def test_percentiles_are_stable_and_empty_is_none():
    assert performance.percentile([10, 20, 30, 40], 50) == 30
    assert performance.percentile([], 95) is None


def test_ruff_baseline_uses_message_and_code_but_not_line_number():
    finding = {"filename": str(ROOT / "services/main/app/example.py"), "code": "F401", "message": "unused"}
    moved = finding | {"location": {"row": 999}}
    assert ruff_baseline.finding_key(finding) == ruff_baseline.finding_key(moved)


def test_ruff_baseline_counts_new_duplicate_findings():
    finding = {"filename": "services/main/app/example.py", "code": "F401", "message": "unused"}
    payload = ruff_baseline.make_baseline([finding])
    current = collections.Counter([ruff_baseline.finding_key(finding), ruff_baseline.finding_key(finding)])
    new_findings = current - ruff_baseline.baseline_counts(payload)
    assert sum(new_findings.values()) == 1


def test_ruff_baseline_check_allows_legacy_and_rejects_new_duplicates(tmp_path):
    finding = {
        "filename": "services/main/app/example.py",
        "code": "F401",
        "message": "unused",
        "location": {"row": 1, "column": 1},
    }
    baseline_path = tmp_path / ".ruff-baseline.json"
    ruff_baseline.write_baseline(baseline_path, [finding])
    assert ruff_baseline.check_baseline(baseline_path, [finding]) == 0
    assert ruff_baseline.check_baseline(baseline_path, [finding, finding]) == 1
