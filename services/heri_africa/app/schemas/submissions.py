from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class ConsentPayload(BaseModel):
    consent: bool = Field(description="Explicit consent to store and respond to this submission")


class ContactSubmission(ConsentPayload):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    organisation: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=120)
    subject: str | None = Field(default=None, max_length=255)
    message: str = Field(min_length=2, max_length=10_000)


class PartnershipSubmission(ConsentPayload):
    organisation: str = Field(min_length=2, max_length=255)
    contact_person: str = Field(min_length=2, max_length=255)
    email: EmailStr
    country: str = Field(min_length=2, max_length=120)
    partnership_interest: str = Field(min_length=2, max_length=255)
    proposed_collaboration: str = Field(min_length=2, max_length=10_000)
    website: str | None = Field(default=None, max_length=500)


class NetworkSubmission(ConsentPayload):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    organisation: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=120)
    role: str | None = Field(default=None, max_length=255)
    interests: list[str] = Field(default_factory=list, max_length=20)
    research_interests: str | None = Field(default=None, max_length=10_000)


class NewsletterSubmission(ConsentPayload):
    email: EmailStr
