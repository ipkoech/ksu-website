"""Research service Base class with schema set."""

from __future__ import annotations

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

from ksu_common.models.base import SoftDeleteMixin, TimestampMixin

SCHEMA = "research"


class Base(TimestampMixin, SoftDeleteMixin, DeclarativeBase):
    """Research service Base — all tables go into the 'research' schema."""

    __abstract__ = True
    metadata = MetaData(schema=SCHEMA)
