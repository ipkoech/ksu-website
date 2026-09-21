"""Library Pydantic schemas."""

from .library import (
    LibraryCreate,
    LibraryDetail,
    LibraryExternalLinkCreate,
    LibraryExternalLinkOut,
    LibraryExternalLinkToggle,
    LibraryExternalLinkUpdate,
    LibraryFileCreate,
    LibraryFileOut,
    LibraryFileUpdate,
    LibraryHoursCreate,
    LibraryHoursOut,
    LibraryHoursUpdate,
    LibraryOut,
    LibraryUpdate,
    LibraryTodayStatus,
)
from .resources import (
    LibraryChargeCreate,
    LibraryChargeOut,
    LibraryChargeUpdate,
    LibraryLoanCreate,
    LibraryLoanOut,
    LibraryLoanUpdate,
    LibraryReservationCreate,
    LibraryReservationOut,
    LibraryReservationUpdate,
    LibraryResourceCreate,
    LibraryResourceOut,
    LibraryResourceUpdate,
)
from .staff import (
    LibraryServiceCreate,
    LibraryServiceOut,
    LibraryServiceUpdate,
    LibraryStaffCreate,
    LibraryStaffOut,
    LibraryStaffUpdate,
    LibraryStatisticsCreate,
    LibraryStatisticsOut,
)
from .electronic import (
    CitationOut,
    CitationRequest,
    ElectronicResourceCreate,
    ElectronicResourceDetail,
    ElectronicResourceGuideCreate,
    ElectronicResourceGuideOut,
    ElectronicResourceGuideUpdate,
    ElectronicResourceOut,
    ElectronicResourceUpdate,
    PublicationResult,
    PublicationSearchQuery,
)
from .engagement import (
    LibraryInquiryCreate,
    LibraryInquiryOut,
    LibraryInquiryReply,
    LibraryInquiryUpdate,
    LibraryRegulationCreate,
    LibraryRegulationOut,
    LibraryRegulationUpdate,
    SavedPublicationCreate,
    SavedPublicationOut,
    SavedPublicationUpdate,
    SupportTicketCreate,
    SupportTicketOut,
    SupportTicketTargetSummary,
    SupportTicketUpdate,
)
from .guides import (
    LibraryGuideCreate,
    LibraryGuideOut,
    LibraryGuideSectionCreate,
    LibraryGuideSectionOut,
    LibraryGuideSectionUpdate,
    LibraryGuideUpdate,
    LibraryPolicyPageCreate,
    LibraryPolicyPageOut,
    LibraryPolicyPageUpdate,
    LibrarySpecialistCreate,
    LibrarySpecialistOut,
    LibrarySpecialistUpdate,
    LibraryWorkflowCreate,
    LibraryWorkflowOut,
    LibraryWorkflowStepCreate,
    LibraryWorkflowStepOut,
    LibraryWorkflowStepUpdate,
    LibraryWorkflowUpdate,
)
from .stats import PublicStatItem, PublicStatsResponse
from .search import LibrarySearchResponse, LibrarySearchResult
from .assistant_chat import (
    LibraryAssistantAnswer,
    LibraryAssistantAnswerDraft,
    LibraryAssistantAnswerRequest,
    LibraryAssistantCitation,
    LibraryAssistantConversationOut,
    LibraryAssistantGuestSessionOut,
    LibraryAssistantMessageOut,
    LibraryAssistantPageContext,
    LibraryAssistantRecoveryOut,
)
from .assistant import (
    LibraryAssistantContextCreate,
    LibraryAssistantContextOut,
    LibraryAssistantContextPublicOut,
    LibraryAssistantContextUpdate,
    LibraryAssistantSourceCreate,
    LibraryAssistantSourceOut,
    LibraryAssistantStaffAssignmentUpdate,
    LibraryAssistantStaffReplyCreate,
    LibraryAssistantStaffStatusUpdate,
)
from .assistant_identity import (
    LibraryAssistantVerificationConfirm,
    LibraryAssistantVerificationRequest,
    LibraryAssistantVerificationResponse,
)
from .base import optional_snapshot
from datetime import datetime
from typing import Any
import uuid
from pydantic import BaseModel


class AuditProxyItem(BaseModel):
    id: uuid.UUID
    service_name: str
    action: str
    resource_type: str | None = None
    resource_id: str | None = None
    request_method: str
    request_path: str
    route_name: str | None = None
    status_code: int
    status: str
    user_id: uuid.UUID | None = None
    session_jti: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    error_message: str | None = None
    details: dict[str, Any] | None = None
    changes: dict[str, Any] | None = None
    happened_at: datetime


class AuditProxyMeta(BaseModel):
    page: int
    per_page: int
    has_next: bool


class AuditProxyResponse(BaseModel):
    status: str
    message: str
    data: list[AuditProxyItem]
    meta: AuditProxyMeta

LibraryOutSnapshot = optional_snapshot("LibraryOutSnapshot", LibraryOut)
LibraryHoursSnapshot = optional_snapshot("LibraryHoursSnapshot", LibraryHoursOut)
LibraryExternalLinkSnapshot = optional_snapshot("LibraryExternalLinkSnapshot", LibraryExternalLinkOut)
LibraryFileSnapshot = optional_snapshot("LibraryFileSnapshot", LibraryFileOut)
LibraryResourceSnapshot = optional_snapshot("LibraryResourceSnapshot", LibraryResourceOut)
LibraryStaffSnapshot = optional_snapshot("LibraryStaffSnapshot", LibraryStaffOut)
LibraryServiceSnapshot = optional_snapshot("LibraryServiceSnapshot", LibraryServiceOut)
LibraryStatisticsSnapshot = optional_snapshot("LibraryStatisticsSnapshot", LibraryStatisticsOut)
ElectronicResourceSnapshot = optional_snapshot("ElectronicResourceSnapshot", ElectronicResourceOut)
ElectronicResourceGuideSnapshot = optional_snapshot("ElectronicResourceGuideSnapshot", ElectronicResourceGuideOut)
LibraryGuideSnapshot = optional_snapshot("LibraryGuideSnapshot", LibraryGuideOut)
LibraryGuideSectionSnapshot = optional_snapshot("LibraryGuideSectionSnapshot", LibraryGuideSectionOut)
LibrarySpecialistSnapshot = optional_snapshot("LibrarySpecialistSnapshot", LibrarySpecialistOut)
LibraryWorkflowSnapshot = optional_snapshot("LibraryWorkflowSnapshot", LibraryWorkflowOut)
LibraryWorkflowStepSnapshot = optional_snapshot("LibraryWorkflowStepSnapshot", LibraryWorkflowStepOut)
LibraryPolicyPageSnapshot = optional_snapshot("LibraryPolicyPageSnapshot", LibraryPolicyPageOut)
LibraryRegulationSnapshot = optional_snapshot("LibraryRegulationSnapshot", LibraryRegulationOut)

__all__ = [
    # library
    "LibraryCreate",
    "LibraryUpdate",
    "LibraryOut",
    "LibraryDetail",
    "LibraryHoursCreate",
    "LibraryHoursUpdate",
    "LibraryHoursOut",
    "LibraryExternalLinkCreate",
    "LibraryExternalLinkUpdate",
    "LibraryExternalLinkToggle",
    "LibraryExternalLinkOut",
    "LibraryFileCreate",
    "LibraryFileUpdate",
    "LibraryFileOut",
    "LibraryTodayStatus",
    # resources
    "LibraryResourceCreate",
    "LibraryResourceUpdate",
    "LibraryResourceOut",
    "LibraryLoanCreate",
    "LibraryLoanUpdate",
    "LibraryLoanOut",
    "LibraryReservationCreate",
    "LibraryReservationUpdate",
    "LibraryReservationOut",
    "LibraryChargeCreate",
    "LibraryChargeUpdate",
    "LibraryChargeOut",
    # staff & services
    "LibraryStaffCreate",
    "LibraryStaffUpdate",
    "LibraryStaffOut",
    "LibraryServiceCreate",
    "LibraryServiceUpdate",
    "LibraryServiceOut",
    "LibraryStatisticsCreate",
    "LibraryStatisticsOut",
    # electronic
    "ElectronicResourceCreate",
    "ElectronicResourceUpdate",
    "ElectronicResourceOut",
    "ElectronicResourceDetail",
    "ElectronicResourceGuideCreate",
    "ElectronicResourceGuideUpdate",
    "ElectronicResourceGuideOut",
    "PublicationSearchQuery",
    "PublicationResult",
    "CitationRequest",
    "CitationOut",
    # engagement
    "LibraryInquiryCreate",
    "LibraryInquiryUpdate",
    "LibraryInquiryReply",
    "LibraryInquiryOut",
    "SupportTicketCreate",
    "SupportTicketUpdate",
    "SupportTicketTargetSummary",
    "SupportTicketOut",
    "SavedPublicationCreate",
    "SavedPublicationUpdate",
    "SavedPublicationOut",
    "LibraryRegulationCreate",
    "LibraryRegulationUpdate",
    "LibraryRegulationOut",
    # guides
    "LibraryGuideCreate",
    "LibraryGuideUpdate",
    "LibraryGuideOut",
    "LibraryGuideSectionCreate",
    "LibraryGuideSectionUpdate",
    "LibraryGuideSectionOut",
    "LibrarySpecialistCreate",
    "LibrarySpecialistUpdate",
    "LibrarySpecialistOut",
    "LibraryWorkflowCreate",
    "LibraryWorkflowUpdate",
    "LibraryWorkflowOut",
    "LibraryWorkflowStepCreate",
    "LibraryWorkflowStepUpdate",
    "LibraryWorkflowStepOut",
    "LibraryPolicyPageCreate",
    "LibraryPolicyPageUpdate",
    "LibraryPolicyPageOut",
    # stats
    "PublicStatItem",
    "PublicStatsResponse",
    "LibrarySearchResult",
    "LibrarySearchResponse",
    "optional_snapshot",
    "AuditProxyResponse",
    "LibraryOutSnapshot",
    "LibraryHoursSnapshot",
    "LibraryExternalLinkSnapshot",
    "LibraryFileSnapshot",
    "LibraryResourceSnapshot",
    "LibraryStaffSnapshot",
    "LibraryServiceSnapshot",
    "LibraryStatisticsSnapshot",
    "ElectronicResourceSnapshot",
    "ElectronicResourceGuideSnapshot",
    "LibraryGuideSnapshot",
    "LibraryGuideSectionSnapshot",
    "LibrarySpecialistSnapshot",
    "LibraryWorkflowSnapshot",
    "LibraryWorkflowStepSnapshot",
    "LibraryPolicyPageSnapshot",
    "LibraryRegulationSnapshot",
    # assistant
    "LibraryAssistantAnswer",
    "LibraryAssistantAnswerDraft",
    "LibraryAssistantAnswerRequest",
    "LibraryAssistantCitation",
    "LibraryAssistantConversationOut",
    "LibraryAssistantGuestSessionOut",
    "LibraryAssistantMessageOut",
    "LibraryAssistantPageContext",
    "LibraryAssistantRecoveryOut",
    "LibraryAssistantContextCreate",
    "LibraryAssistantContextOut",
    "LibraryAssistantContextPublicOut",
    "LibraryAssistantContextUpdate",
    "LibraryAssistantSourceCreate",
    "LibraryAssistantSourceOut",
    "LibraryAssistantStaffAssignmentUpdate",
    "LibraryAssistantStaffReplyCreate",
    "LibraryAssistantStaffStatusUpdate",
    "LibraryAssistantVerificationConfirm",
    "LibraryAssistantVerificationRequest",
    "LibraryAssistantVerificationResponse",
]
