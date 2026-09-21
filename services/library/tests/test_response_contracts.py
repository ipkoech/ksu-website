from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from app.models.assistant import LibraryConversation, LibraryConversationMessage
from app.main import create_app
from app.models.resources import LibraryLoan, LibraryResource
from app.schemas import (
    LibraryAssistantAnswer,
    LibraryAssistantConversationOut,
    LibraryAssistantGuestSessionOut,
    LibraryLoanOut,
    LibraryResourceSnapshot,
)


def test_populated_loan_response_serializes_its_resource() -> None:
    now = datetime.now(timezone.utc)
    resource = LibraryResource(
        id=uuid.uuid4(),
        library_id=uuid.uuid4(),
        title="Distributed Systems",
        language="en",
        resource_type="book",
        status="available",
        total_copies=2,
        available_copies=2,
        is_loanable=True,
        is_reference_only=False,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    loan = LibraryLoan(
        id=uuid.uuid4(),
        resource_id=resource.id,
        resource=resource,
        borrower_person_id=uuid.uuid4(),
        borrowed_at=now,
        due_at=now,
        status="active",
        renewals_count=0,
        max_renewals=2,
        fine_amount=Decimal("0.00"),
        fine_paid=False,
        created_at=now,
        updated_at=now,
    )

    response = LibraryLoanOut.model_validate(loan)

    assert response.resource is not None
    assert response.resource.title == "Distributed Systems"


def test_field_selected_resource_snapshot_accepts_sparse_orm_values() -> None:
    resource = LibraryResource(
        id=uuid.uuid4(), library_id=uuid.uuid4(), title="Catalog item"
    )

    response = LibraryResourceSnapshot.model_validate(resource)

    assert response.title == "Catalog item"
    assert response.model_dump(exclude_unset=True)["title"] == "Catalog item"


def test_populated_assistant_conversation_response_serializes_messages() -> None:
    now = datetime.now(timezone.utc)
    conversation_id = uuid.uuid4()
    message = LibraryConversationMessage(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        sender_type="assistant",
        content="The library is open until 9 PM.",
        citations=[],
        message_metadata={"source": "catalog"},
        created_at=now,
        updated_at=now,
    )
    conversation = LibraryConversation(
        id=conversation_id,
        verified_email="student@example.edu",
        status="active",
        title="Opening hours",
        last_message_at=now,
        created_at=now,
        updated_at=now,
        messages=[message],
    )

    response = LibraryAssistantConversationOut.model_validate(conversation)

    assert response.verified_email == "student@example.edu"
    assert len(response.messages) == 1
    assert response.messages[0].content == "The library is open until 9 PM."
    assert response.messages[0].metadata == {"source": "catalog"}


def test_assistant_answer_contract_accepts_citations() -> None:
    response = LibraryAssistantAnswer.model_validate(
        {
            "answer": "Use the catalogue to find the item.",
            "citations": [
                {
                    "source_type": "catalog",
                    "source_id": str(uuid.uuid4()),
                    "title": "Library catalogue",
                    "url": "https://library.example.edu/catalog",
                }
            ],
            "provider": "deterministic",
        }
    )

    assert response.citations[0].source_type == "catalog"


def test_guest_session_contract_parses_uuid_and_expiry() -> None:
    expires_at = datetime.now(timezone.utc)
    response = LibraryAssistantGuestSessionOut.model_validate(
        {
            "guest_session_id": str(uuid.uuid4()),
            "expires_at": expires_at.isoformat(),
        }
    )

    assert response.expires_at == expires_at


def test_assistant_routers_are_registered() -> None:
    def collect_paths(routes) -> set[str]:
        paths: set[str] = set()
        for route in routes:
            route_path = getattr(route, "path", "")
            original_router = getattr(route, "original_router", None)
            if original_router is not None:
                paths.update(collect_paths(original_router.routes))
            elif route_path:
                methods = getattr(route, "methods", None) or {"GET"}
                paths.update(f"{method} {route_path}" for method in methods)
        return paths

    app = create_app()
    paths: set[str] = set()
    for route in app.routes:
        original_router = getattr(route, "original_router", None)
        if original_router is not None:
            paths.update(collect_paths(original_router.routes))

    expected = {
        "GET /library/assistant-contexts/public",
        "GET /library/assistant-contexts/",
        "POST /library/assistant-contexts/",
        "GET /library/assistant-contexts/{context_id}",
        "PATCH /library/assistant-contexts/{context_id}",
        "POST /library/assistant-contexts/{context_id}/archive",
        "POST /library/assistant-contexts/{context_id}/publish",
        "POST /library/assistant/answer",
        "GET /library/assistant/conversations",
        "GET /library/assistant/conversations/{conversation_id}",
        "POST /library/assistant/conversations/{conversation_id}/continue",
        "GET /library/assistant/conversations/{conversation_id}/messages",
        "POST /library/assistant/guest/session",
        "GET /library/assistant/recovery/confirm",
        "GET /library/assistant/staff/conversations",
        "GET /library/assistant/staff/conversations/{conversation_id}",
        "POST /library/assistant/staff/conversations/{conversation_id}/assign",
        "POST /library/assistant/staff/conversations/{conversation_id}/reply",
        "PATCH /library/assistant/staff/conversations/{conversation_id}/status",
        "GET /library/assistant/verification/confirm",
        "POST /library/assistant/verification/confirm",
        "POST /library/assistant/verification/request",
        "POST /library/assistant/verification/resend",
    }

    assert expected <= paths


def test_registered_route_keys_are_unique() -> None:
    app = create_app()
    seen: set[tuple[str, frozenset[str]]] = set()
    duplicates: set[tuple[str, frozenset[str]]] = set()
    for route in app.routes:
        methods = getattr(route, "methods", None)
        if not methods:
            continue
        key = (route.path, frozenset(methods))
        if key in seen:
            duplicates.add(key)
        seen.add(key)

    assert not duplicates
