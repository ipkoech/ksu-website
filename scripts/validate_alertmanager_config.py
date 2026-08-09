#!/usr/bin/env python3
"""Reject an Alertmanager config that cannot notify an operator."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

NOTIFICATION_BLOCKS = (
    "webhook_configs:",
    "email_configs:",
    "pagerduty_configs:",
    "opsgenie_configs:",
    "slack_configs:",
    "sns_configs:",
    "telegram_configs:",
    "msteams_configs:",
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("config", type=Path)
    parser.add_argument("--allow-dashboard-only", action="store_true")
    args = parser.parse_args()

    if not args.config.is_file():
        raise SystemExit(f"Alertmanager configuration is missing: {args.config}")
    content = args.config.read_text(encoding="utf-8")
    if not re.search(r"(?m)^\s*route:\s*(?:#.*)?$", content):
        raise SystemExit("Alertmanager configuration has no route")
    if not re.search(r"(?m)^\s*receivers:\s*(?:#.*)?$", content):
        raise SystemExit("Alertmanager configuration has no receivers")
    has_external_receiver = any(
        re.search(rf"(?m)^\s*{re.escape(block)}\s*(?:#.*)?$", content)
        for block in NOTIFICATION_BLOCKS
    )
    if not args.allow_dashboard_only and not has_external_receiver:
        raise SystemExit("Alertmanager configuration has no external notification receiver")
    print("Alertmanager configuration validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
