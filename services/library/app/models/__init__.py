"""Library ORM models."""

from ksu_common.models.base import Base  # noqa: F401

from .library import Library, LibraryExternalLink, LibraryFile, LibraryHours
from .resources import (
    LibraryCharge,
    LibraryLoan,
    LibraryResource,
    LibraryResourceReservation,
)
from .staff import LibraryStaff
from .electronic import ElectronicResource, ElectronicResourceGuide
from .services import LibraryService, LibraryStatistics
from .assistant import (
    LibraryAssistantContext,
    LibraryAssistantContextSource,
    LibraryConversation,
    LibraryConversationMessage,
    LibraryConversationRecovery,
    LibraryEmailVerification,
    LibraryGuestSession,
)
from .engagement import (
    LibraryGuide,
    LibraryGuideSection,
    LibraryGuideSpecialist,
    LibraryInquiry,
    LibraryPolicyPage,
    LibraryRegulation,
    LibrarySpecialist,
    LibraryWorkflow,
    LibraryWorkflowStep,
    SavedPublication,
    SupportTicket,
)

__all__ = [
    "Base",
    # library
    "Library",
    "LibraryHours",
    "LibraryExternalLink",
    "LibraryFile",
    # resources
    "LibraryResource",
    "LibraryLoan",
    "LibraryResourceReservation",
    "LibraryCharge",
    # staff
    "LibraryStaff",
    # electronic
    "ElectronicResource",
    "ElectronicResourceGuide",
    # services
    "LibraryService",
    "LibraryStatistics",
    # engagement
    "LibraryInquiry",
    "SupportTicket",
    "SavedPublication",
    "LibraryRegulation",
    # guides — merged into engagement.py, which owns the canonical shape
    "LibraryGuide",
    "LibraryGuideSection",
    "LibraryGuideSpecialist",
    "LibrarySpecialist",
    "LibraryWorkflow",
    "LibraryWorkflowStep",
    "LibraryPolicyPage",
    # assistant — these 7 tables were never registered on Base.metadata, so
    # create_all and autogenerate both silently skipped them.
    "LibraryAssistantContext",
    "LibraryAssistantContextSource",
    "LibraryConversation",
    "LibraryConversationMessage",
    "LibraryGuestSession",
    "LibraryEmailVerification",
    "LibraryConversationRecovery",
]
