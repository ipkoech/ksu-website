"""Email verification contracts for Library assistant continuation."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, model_validator


class LibraryAssistantVerificationRequest(BaseModel):
    email: EmailStr


class LibraryAssistantVerificationConfirm(BaseModel):
    token: str | None = Field(default=None, min_length=20, max_length=256)
    code: str | None = Field(default=None, min_length=6, max_length=6, pattern=r"^\d{6}$")

    @model_validator(mode="after")
    def require_one_secret(self) -> "LibraryAssistantVerificationConfirm":
        if not self.token and not self.code:
            raise ValueError("Provide a verification token or code")
        if self.token and self.code:
            raise ValueError("Provide only one verification method")
        return self


class LibraryAssistantVerificationResponse(BaseModel):
    accepted: bool
    conversation_id: str | None = None
    continuation_token: str | None = None
    message: str
