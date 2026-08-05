from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

from ksu_common.models.base import SoftDeleteMixin, TimestampMixin


class Base(TimestampMixin, SoftDeleteMixin, DeclarativeBase):
    """Declarative base for the HERI-owned PostgreSQL schema."""

    __abstract__ = True
    metadata = MetaData(schema="heri")
