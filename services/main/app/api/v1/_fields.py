"""Shared field-selection helpers for Main service routes."""

from __future__ import annotations

from typing import Any, Type

from fastapi import Depends

from ksu_common.field_selection import FieldSelection, FieldSelector, FieldsQuery
from ksu_common.schemas.responses import success


def MainFieldsQuery(fields: str | None = None, include: str | None = None) -> FieldSelection:
    return FieldsQuery(always_include={"id"})(fields=fields, include=include)


def build_selector(model_class: Type, fields: FieldSelection) -> FieldSelector:
    return FieldSelector(model_class, fields, always_include={"id"})


def success_with_fields(
    model_class: Type,
    fields: FieldSelection,
    data: Any,
    *,
    meta: dict[str, Any] | None = None,
    message: str | None = None,
):
    selector = build_selector(model_class, fields)
    return success(data=selector.apply(data), meta=meta, message=message)


FieldsDep = Depends(MainFieldsQuery)


__all__ = ["FieldsDep", "FieldSelection", "build_selector", "success_with_fields"]
