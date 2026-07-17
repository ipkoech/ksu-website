"""Contracts for school-scoped staff lifecycle operations."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Literal

from pydantic import ConfigDict, EmailStr, Field, model_validator

from .base import BaseSchema, PhoneStr

SchoolTeamRole = Literal[
    "dean",
    "deputy_dean",
    "cod",
    "hod",
    "coordinator",
    "school_administrator",
    "administrative_staff",
    "lecturer",
    "technician",
    "support_staff",
]
SchoolPortalRole = Literal["school_admin", "school_editor"]


class SchoolTeamMemberCreate(BaseSchema):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    person_id: uuid.UUID | None = None
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    middle_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    phone: PhoneStr | None = None
    employee_number: str | None = Field(default=None, max_length=32)
    department_id: uuid.UUID | None = None
    role: SchoolTeamRole
    title: str | None = Field(default=None, max_length=255)
    start_date: date | None = None
    is_primary: bool = False
    is_public: bool = True
    display_order: int = Field(default=100, ge=0)
    invite_user: bool = False
    portal_role: SchoolPortalRole | None = None
    temporary_password: str | None = Field(default=None, min_length=8, max_length=255)

    @model_validator(mode="after")
    def require_person_identity(self):
        if self.person_id is None and not (
            self.first_name and self.last_name and self.email
        ):
            raise ValueError(
                "person_id or first_name, last_name, and email are required"
            )
        if self.portal_role and not self.invite_user:
            raise ValueError("portal_role requires invite_user")
        return self


class SchoolTeamMemberUpdate(BaseSchema):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str | None = Field(default=None, max_length=255)
    role: SchoolTeamRole | None = None
    department_id: uuid.UUID | None = None
    is_primary: bool | None = None
    is_public: bool | None = None
    display_order: int | None = Field(default=None, ge=0)
    phone: PhoneStr | None = None


class SchoolTeamLifecycleRequest(BaseSchema):
    replacement_person_id: uuid.UUID | None = None
    acknowledge_vacancy: bool = False
    notes: str | None = Field(default=None, max_length=1000)
    effective_date: date | None = None


class SchoolTeamTransferRequest(BaseSchema):
    department_id: uuid.UUID | None = None
    role: SchoolTeamRole | None = None
    title: str | None = Field(default=None, max_length=255)


class SchoolTeamImportRequest(BaseSchema):
    rows: list[dict] = Field(min_length=1)
    mode: Literal["partial", "all_or_nothing"] = "partial"
    idempotency_key: str = Field(min_length=8, max_length=128)


__all__ = [
    "SchoolPortalRole",
    "SchoolTeamImportRequest",
    "SchoolTeamLifecycleRequest",
    "SchoolTeamMemberCreate",
    "SchoolTeamMemberUpdate",
    "SchoolTeamRole",
    "SchoolTeamTransferRequest",
]
