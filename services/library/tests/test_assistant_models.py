import sqlalchemy as sa

from app.models import (
    Base,
    LibraryAssistantContext,
    LibraryAssistantContextSource,
    LibraryConversation,
    LibraryConversationMessage,
    LibraryEmailVerification,
    LibraryConversationRecovery,
    LibraryGuestSession,
)


def test_assistant_models_are_registered_with_library_metadata():
    expected_tables = {
        "library_assistant_contexts",
        "library_assistant_context_sources",
        "library_conversations",
        "library_conversation_messages",
        "library_guest_sessions",
        "library_email_verifications",
        "library_conversation_recoveries",
    }

    assert expected_tables.issubset(
        {table.name for table in Base.metadata.tables.values() if table.schema == "library"}
    )


def test_context_has_publishable_configuration_and_source_audit_fields():
    context_columns = LibraryAssistantContext.__table__.c
    source_columns = LibraryAssistantContextSource.__table__.c

    assert {"slug", "instructions", "status", "is_public", "published_at"}.issubset(
        context_columns.keys()
    )
    assert {
        "source_type",
        "source_id",
        "title",
        "public_url",
        "is_approved",
        "approved_by_person_id",
    }.issubset(source_columns.keys())


def test_conversation_messages_and_guest_verification_have_required_boundaries():
    conversation_columns = LibraryConversation.__table__.c
    message_columns = LibraryConversationMessage.__table__.c
    guest_columns = LibraryGuestSession.__table__.c
    verification_columns = LibraryEmailVerification.__table__.c
    recovery_columns = LibraryConversationRecovery.__table__.c

    assert {"context_id", "status", "verified_email", "guest_session_id"}.issubset(
        conversation_columns.keys()
    )
    assert {"conversation_id", "sender_type", "content", "citations"}.issubset(
        message_columns.keys()
    )
    assert {"session_hash", "answer_consumed_at", "expires_at"}.issubset(
        guest_columns.keys()
    )
    assert {
        "email",
        "token_hash",
        "code_hash",
        "expires_at",
        "attempt_count",
        "verified_at",
    }.issubset(verification_columns.keys())
    assert {"conversation_id", "token_hash", "expires_at", "used_at"}.issubset(
        recovery_columns.keys()
    )


def test_model_defaults_are_safe_for_new_records():
    context = LibraryAssistantContext(slug="research", name="Research support")

    assert context.__table__.c.status.default.arg == "draft"
    assert context.__table__.c.is_public.default.arg is False
    assert LibraryConversation.__table__.c.status.default.arg == "active"
    assert LibraryGuestSession.__table__.c.answer_consumed_at.default is None
