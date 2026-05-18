#!/usr/bin/env python3
"""Generate OpenAPI contracts and frontend-facing API summaries for KSU services."""

from __future__ import annotations

import importlib
import json
import os
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
COMMON_DIR = ROOT / "services" / "common"
OUTPUT_DIR = ROOT / "contracts"


SERVICE_SPECS = {
    "main": {
        "service_dir": ROOT / "services" / "main",
        "module": "app.main",
        "app_factory": "create_app",
        "env": {
            "APP_ENV": "development",
            "DATABASE_URL": "postgresql+asyncpg://docs:docs@localhost:5432/docs",
            "JWT_SECRET_KEY": "docs-secret",
            "REDIS_URL": "redis://localhost:6379/0",
            "CELERY_BROKER_URL": "redis://localhost:6379/0",
            "CELERY_RESULT_BACKEND": "redis://localhost:6379/0",
            "UPLOAD_DIR": str(ROOT / ".tmp" / "docs" / "main" / "uploads"),
            "INTERNAL_API_KEY": "docs-internal",
        },
    },
    "library": {
        "service_dir": ROOT / "services" / "library",
        "module": "app.main",
        "app_factory": "create_app",
        "env": {
            "APP_ENV": "development",
            "DATABASE_URL": "postgresql+asyncpg://docs:docs@localhost:5432/docs",
            "JWT_SECRET_KEY": "docs-secret",
            "REDIS_URL": "redis://localhost:6379/1",
            "CELERY_BROKER_URL": "redis://localhost:6379/1",
            "CELERY_RESULT_BACKEND": "redis://localhost:6379/1",
            "MAIN_SERVICE_URL": "http://main:8000",
            "INTERNAL_API_KEY": "docs-internal",
        },
    },
}


def ensure_env(env: dict[str, str]) -> None:
    for key, value in env.items():
        os.environ.setdefault(key, value)


def load_app(service_name: str):
    spec = SERVICE_SPECS[service_name]
    ensure_env(spec["env"])
    upload_dir = spec["env"].get("UPLOAD_DIR")
    if upload_dir:
        Path(upload_dir).mkdir(parents=True, exist_ok=True)

    service_dir = str(spec["service_dir"])
    for name in list(sys.modules):
        if name == "app" or name.startswith("app."):
            sys.modules.pop(name, None)
    if service_dir not in sys.path:
        sys.path.insert(0, service_dir)
    common_dir = str(COMMON_DIR)
    if common_dir not in sys.path:
        sys.path.insert(0, common_dir)

    module = importlib.import_module(spec["module"])
    app_factory = getattr(module, spec["app_factory"])
    return app_factory()


def ref_name(ref: str | None) -> str | None:
    if not ref:
        return None
    return ref.split("/")[-1]


def schema_label(schema: dict[str, Any] | None) -> str:
    if not schema:
        return "-"
    if "$ref" in schema:
        return ref_name(schema["$ref"]) or "-"
    schema_type = schema.get("type")
    if schema_type == "array":
        return f"array<{schema_label(schema.get('items'))}>"
    if "anyOf" in schema:
        return " | ".join(filter(None, [schema_label(item) for item in schema["anyOf"]]))
    if "oneOf" in schema:
        return " | ".join(filter(None, [schema_label(item) for item in schema["oneOf"]]))
    if "allOf" in schema:
        return " & ".join(filter(None, [schema_label(item) for item in schema["allOf"]]))
    if schema_type:
        return schema_type
    return "object"


def collect_request_body(operation: dict[str, Any]) -> str:
    body = operation.get("requestBody")
    if not body:
        return "-"
    content = body.get("content") or {}
    preferred = content.get("application/json") or next(iter(content.values()), None)
    if not preferred:
        return "-"
    return schema_label(preferred.get("schema"))


def collect_success_response(operation: dict[str, Any]) -> str:
    responses = operation.get("responses") or {}
    for code in ("200", "201", "202", "204"):
        if code not in responses:
            continue
        response = responses[code]
        if code == "204":
            return "204 No Content"
        content = response.get("content") or {}
        preferred = content.get("application/json") or next(iter(content.values()), None)
        if not preferred:
            return code
        return f"{code} {schema_label(preferred.get('schema'))}"
    return "-"


def collect_params(operation: dict[str, Any]) -> list[str]:
    params = []
    for param in operation.get("parameters") or []:
        params.append(
            f"`{param['name']}` ({param.get('in', 'query')}, {schema_label(param.get('schema'))})"
        )
    return params


def collect_security(operation: dict[str, Any]) -> str:
    security = operation.get("security")
    if not security:
        return "public"
    names: list[str] = []
    for item in security:
        names.extend(item.keys())
    return ", ".join(sorted(set(names))) or "public"


def render_markdown(service_name: str, schema: dict[str, Any]) -> str:
    lines: list[str] = []
    info = schema.get("info") or {}
    lines.append(f"# {info.get('title', service_name.title())}")
    lines.append("")
    lines.append(info.get("description", ""))
    lines.append("")
    lines.append(f"- Version: `{info.get('version', '-')}`")
    lines.append(f"- OpenAPI: `{schema.get('openapi', '-')}`")
    lines.append("")
    lines.append("## Frontend Contract")
    lines.append("")
    lines.append("This file is generated from the live FastAPI OpenAPI schema. Treat it as the frontend contract for request shapes, auth expectations, and response envelopes.")
    lines.append("")

    paths = schema.get("paths") or {}
    tag_groups: dict[str, list[tuple[str, str, dict[str, Any]]]] = {}
    for path, methods in sorted(paths.items()):
        for method, operation in methods.items():
            tag = (operation.get("tags") or ["Untagged"])[0]
            tag_groups.setdefault(tag, []).append((path, method.upper(), operation))

    for tag in sorted(tag_groups):
        lines.append(f"## {tag}")
        lines.append("")
        for path, method, operation in tag_groups[tag]:
            summary = operation.get("summary") or operation.get("operationId") or f"{method} {path}"
            lines.append(f"### `{method} {path}`")
            lines.append("")
            lines.append(summary)
            description = operation.get("description")
            if description:
                lines.append("")
                lines.append(description.strip())
            lines.append("")
            lines.append(f"- Auth: {collect_security(operation)}")
            lines.append(f"- Request body: {collect_request_body(operation)}")
            params = collect_params(operation)
            lines.append(f"- Parameters: {', '.join(params) if params else '-'}")
            lines.append(f"- Success response: {collect_success_response(operation)}")
            lines.append("")

    components = schema.get("components") or {}
    schemas = components.get("schemas") or {}
    lines.append("## Schemas")
    lines.append("")
    lines.append(f"Generated component schemas: `{len(schemas)}`")
    lines.append("")
    for name in sorted(schemas):
        item = schemas[name]
        required = item.get("required") or []
        properties = item.get("properties") or {}
        lines.append(f"### `{name}`")
        lines.append("")
        if not properties:
            lines.append("- No direct properties documented.")
            lines.append("")
            continue
        for prop_name, prop_schema in sorted(properties.items()):
            marker = "required" if prop_name in required else "optional"
            lines.append(f"- `{prop_name}`: `{schema_label(prop_schema)}` ({marker})")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def write_contracts(service_name: str, schema: dict[str, Any]) -> None:
    service_output = OUTPUT_DIR / service_name
    service_output.mkdir(parents=True, exist_ok=True)

    json_path = service_output / "openapi.json"
    md_path = service_output / "frontend-contract.md"

    json_path.write_text(json.dumps(schema, indent=2, sort_keys=True), encoding="utf-8")
    md_path.write_text(render_markdown(service_name, schema), encoding="utf-8")


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for service_name in SERVICE_SPECS:
        app = load_app(service_name)
        schema = app.openapi()
        write_contracts(service_name, schema)
        print(f"Generated contracts for {service_name}: {OUTPUT_DIR / service_name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
