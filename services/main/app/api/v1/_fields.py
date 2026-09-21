"""Shared field-selection helpers for Main service routes."""

from __future__ import annotations

from typing import Any, Type

from fastapi import Depends
from sqlalchemy import inspect
from sqlalchemy.orm import defaultload, undefer

from ksu_common.field_selection import FieldSelection, FieldSelector, FieldsQuery
from ksu_common.schemas.responses import success


def MainFieldsQuery(fields: str | None = None, include: str | None = None) -> FieldSelection:
    return FieldsQuery(always_include={"id"})(fields=fields, include=include)


class MainFieldSelector(FieldSelector):
    @property
    def load_options(self) -> list:
        from ...models import Person

        def photo_dependencies(model, selection, path=None):
            options = []
            if model is Person:
                options.append(path.undefer(Person.external_avatar_url) if path is not None else undefer(Person.external_avatar_url))
            relationships = inspect(model).relationships
            for name, nested in selection.nested.items():
                if name in relationships:
                    attribute = getattr(model, name)
                    nested_path = path.defaultload(attribute) if path is not None else defaultload(attribute)
                    options.extend(photo_dependencies(relationships[name].mapper.class_, nested, nested_path))
            return options

        return [*super().load_options, *photo_dependencies(self.model_class, self.selection)]


def build_selector(model_class: Type, fields: FieldSelection) -> FieldSelector:
    return MainFieldSelector(model_class, fields, always_include={"id"})


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
