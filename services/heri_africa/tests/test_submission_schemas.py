from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.submissions import ContactSubmission, PartnershipSubmission


def test_contact_submission_requires_valid_email_and_consent() -> None:
    with pytest.raises(ValidationError):
        ContactSubmission(name="A", email="not-an-email", message="Hello", consent=True)
    with pytest.raises(ValidationError):
        ContactSubmission(name="A", email="a@example.com", message="Hello", consent=False)


def test_partnership_submission_accepts_required_collaboration_fields() -> None:
    request = PartnershipSubmission(
        organisation="Kisii University",
        contact_person="Amina",
        email="amina@example.com",
        country="Kenya",
        partnership_interest="Research collaboration",
        proposed_collaboration="A literacy study",
        consent=True,
    )
    assert request.organisation == "Kisii University"
