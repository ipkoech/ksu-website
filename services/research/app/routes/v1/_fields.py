"""Shared field-selection helpers for Research service routes."""

from typing import Type

from fastapi import Depends

from ksu_common.field_selection import FieldSelection, FieldSelector, FieldsQuery


def ResearchFieldsQuery(fields: str | None = None, include: str | None = None) -> FieldSelection:
    return FieldsQuery(always_include={"id"})(fields=fields, include=include)


class ResearchFieldSelector(FieldSelector):
    def apply(self, data):
        def public_contract(value):
            if isinstance(value, dict):
                return {key: public_contract(item) for key, item in value.items() if key != "editorial_state"}
            if isinstance(value, list):
                return [public_contract(item) for item in value]
            return value
        return public_contract(super().apply(data))


def build_selector(model_class: Type, fields: FieldSelection) -> FieldSelector:
    return ResearchFieldSelector(model_class, fields, always_include={"id"})


def serialize_full_record(model_class: Type, data):
    """Serialize a model instance or list using the default full-field selection."""
    return build_selector(model_class, FieldSelection(fields=())).apply(data)


FieldsDep = Depends(ResearchFieldsQuery)


__all__ = ["FieldsDep", "FieldSelection", "build_selector", "serialize_full_record"]
