from __future__ import annotations

from typing import Any

from sqlalchemy import Enum, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .content import SubmissionStatus, UUIDMixin


class Submission(UUIDMixin, Base):
    __tablename__ = "submissions"
    kind: Mapped[str] = mapped_column(String(60), index=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(320), index=True)
    organisation: Mapped[str | None] = mapped_column(String(255))
    country: Mapped[str | None] = mapped_column(String(120))
    message: Mapped[str] = mapped_column(Text, default="")
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    status: Mapped[SubmissionStatus] = mapped_column(Enum(SubmissionStatus), default=SubmissionStatus.NEW, index=True)
    internal_notes: Mapped[str | None] = mapped_column(Text)
