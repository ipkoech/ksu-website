"""Shared field-selection helpers for Research service routes."""

from __future__ import annotations

from typing import Type

from fastapi import Depends

from ksu_common.field_selection import FieldSelection, FieldSelector, FieldsQuery


def ResearchFieldsQuery(fields: str | None = None, include: str | None = None) -> FieldSelection:
    return FieldsQuery(always_include={"id"})(fields=fields, include=include)


def build_selector(model_class: Type, fields: FieldSelection) -> FieldSelector:
    return FieldSelector(model_class, fields, always_include={"id"})


FieldsDep = Depends(ResearchFieldsQuery)


__all__ = ["FieldsDep", "FieldSelection", "build_selector"]
