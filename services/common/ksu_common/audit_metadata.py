"""Bound and redact optional audit metadata without losing the core event."""

import json
import math
from typing import Any

from .field_selection import is_sensitive_field

MAX_METADATA_BYTES = 65536
MAX_METADATA_DEPTH = 16
MAX_METADATA_NODES = 4096


def prepare_audit_metadata(value: Any) -> Any:
    remaining = MAX_METADATA_BYTES
    nodes = 0
    ancestors: set[int] = set()

    def visit(item, depth):
        nonlocal remaining, nodes
        nodes += 1
        if nodes > MAX_METADATA_NODES:
            raise ValueError("node_limit")
        if depth > MAX_METADATA_DEPTH:
            raise ValueError("depth_limit")
        if isinstance(item, (dict, list, tuple)):
            if id(item) in ancestors:
                raise ValueError("cycle")
            ancestors.add(id(item))
            # Include separators and whitespace used by default JSON encoders.
            remaining -= 2 + 3 * len(item)
            if remaining < 0:
                raise ValueError("size_limit")
            try:
                if isinstance(item, dict):
                    result = {}
                    for key, nested in item.items():
                        if not isinstance(key, str):
                            raise ValueError("invalid_type")
                        if is_sensitive_field(key):
                            continue
                        visit(key, depth + 1)
                        remaining -= 1
                        result[key] = visit(nested, depth + 1)
                    return result
                return [visit(nested, depth + 1) for nested in item]
            finally:
                ancestors.remove(id(item))
        if not isinstance(item, (str, int, float, bool, type(None))):
            raise ValueError("invalid_type")
        if isinstance(item, float) and not math.isfinite(item):
            raise ValueError("invalid_number")
        if isinstance(item, str) and len(item) > remaining:
            raise ValueError("size_limit")
        if isinstance(item, str) and any(character == "\x00" or "\ud800" <= character <= "\udfff" for character in item):
            raise ValueError("invalid_text")
        try:
            remaining -= len(json.dumps(item, ensure_ascii=True, allow_nan=False).encode("ascii"))
        except (ValueError, OverflowError):
            raise ValueError("invalid_number") from None
        if remaining < 0:
            raise ValueError("size_limit")
        return item

    try:
        return visit(value, 0)
    except ValueError as exc:
        return {"audit_metadata_omitted": {"reason": str(exc)}}
