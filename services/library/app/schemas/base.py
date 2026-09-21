"""Shared schema helpers for sparse, field-selected Library responses."""

from __future__ import annotations

from typing import Any, get_args

from pydantic import BaseModel, ConfigDict, create_model


def optional_snapshot(name: str, source: type[BaseModel]) -> type[BaseModel]:
    """Keep a bounded field set while allowing requested fields to be omitted."""
    fields: dict[str, tuple[Any, None]] = {}
    for field_name, field in source.model_fields.items():
        annotation = field.annotation
        if annotation is not Any and type(None) not in get_args(annotation):
            annotation = annotation | None
        fields[field_name] = (annotation, None)
    return create_model(name, __base__=BaseModel, __config__=ConfigDict(from_attributes=True), **fields)


__all__ = ["optional_snapshot"]
