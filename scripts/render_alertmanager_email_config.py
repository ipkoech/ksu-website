#!/usr/bin/env python3
"""Render a restricted Alertmanager email configuration from an env file."""

from __future__ import annotations

import argparse
import json
import os
import tempfile
from pathlib import Path


def read_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
            value = value[1:-1]
        values[key.strip()] = value
    return values


def quoted(value: str) -> str:
    return json.dumps(value)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--env-file", default="services/main/.env")
    parser.add_argument("--recipient", required=True)
    parser.add_argument("--output", default=".deploy/alertmanager.generated.yml")
    args = parser.parse_args()

    values = read_env(Path(args.env_file))
    required = ("SMTP_HOST", "SMTP_PORT", "SMTP_FROM_EMAIL")
    missing = [key for key in required if not values.get(key)]
    if missing:
        raise SystemExit(f"missing required SMTP settings: {', '.join(missing)}")

    use_tls = values.get("SMTP_USE_TLS", "true").strip().lower() in {"1", "true", "yes", "on"}
    username = values.get("SMTP_USERNAME", "")
    password = values.get("SMTP_PASSWORD", "")
    if bool(username) != bool(password):
        raise SystemExit("SMTP_USERNAME and SMTP_PASSWORD must either both be set or both be empty")

    global_lines = [
        "global:",
        "  resolve_timeout: 5m",
        f"  smtp_smarthost: {quoted(values['SMTP_HOST'] + ':' + values['SMTP_PORT'])}",
        f"  smtp_from: {quoted(values['SMTP_FROM_EMAIL'])}",
        f"  smtp_require_tls: {'true' if use_tls else 'false'}",
    ]
    if username:
        global_lines.extend(
            (
                f"  smtp_auth_username: {quoted(username)}",
                f"  smtp_auth_password: {quoted(password)}",
            )
        )

    config = "\n".join(
        (*global_lines,
         "",
         "route:",
         "  receiver: university-operations-email",
         "  group_by: [alertname, service, component]",
         "  group_wait: 10s",
         "  group_interval: 5m",
         "  repeat_interval: 4h",
         "",
         "receivers:",
         "  - name: university-operations-email",
         "    email_configs:",
         f"      - to: {quoted(args.recipient)}",
         "        send_resolved: true",
         "")
    )

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(prefix=".alertmanager.", dir=output.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            handle.write(config)
        # Alertmanager remains UID 65534 but joins the deployment operator's
        # configured group, allowing group-read without making SMTP secrets
        # world-readable.
        os.chmod(temporary_name, 0o640)
        os.replace(temporary_name, output)
    finally:
        if os.path.exists(temporary_name):
            os.unlink(temporary_name)
    print(f"rendered Alertmanager configuration: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
