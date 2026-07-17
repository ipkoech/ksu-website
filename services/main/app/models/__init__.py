"""Main service ORM models."""

from ksu_common.models import AuditLog
from ksu_common.models.base import Base  # noqa: F401

# Auth
from .auth import Session, User

# RBAC
from .rbac import Permission, Role, RolePermission, UserRole

# Person & Staff
from .person import Person
from .staff import ACADEMIC_RANK_ORDER, ENTITY_ROLES, ROLE_HIERARCHY, StaffAssignment

# Governance
from .governance import Board, GovernancePageContent, GovernanceRole

# Organization
from .organization import Division, Wing

# Academic
from .academic import (
    AcademicCalendar,
    Campus,
    Department,
    DepartmentService,
    School,
)

# Admissions
from .admissions import (
    INTAKE_APPLICATION_OVERRIDES,
    INTAKE_MILESTONE_TYPES,
    INTAKE_PUBLIC_ACTION_TYPES,
    INTAKE_WORKFLOW_STATUSES,
    AdmissionInfo,
    Intake,
    IntakeMilestone,
    IntakePublicAction,
    Programme,
    ProgrammeIntake,
    ProgrammeTutor,
)

# Student life
from .student_life import Accommodation, ArtsCulture, Club, ClubActivity, SportsFacility, StudentGovernance

# Marketing
from .marketing import (
    Newsletter,
    NewsletterSubscriber,
    SocialMediaDelivery,
    SocialMediaPost,
    SocialPlatformAccount,
    Testimonial,
)

# Documents
from .document import Document, Policy

# Alumni
from .alumni import Alumni, AlumniAssociation, AlumniAssociationMember

# Exchange
from .exchange import ExchangeProgramme

# University profile
from .university import UniversityInfo
from .about_content import (
    ABOUT_WORKFLOW_STATUSES,
    FACT_KINDS,
    AboutPageContent,
    FactEdition,
    FactGroup,
    FactItem,
    HistoryMilestone,
    InstitutionalPage,
    InstitutionalPageItem,
    InstitutionalPageSection,
    InstitutionalSectionDocument,
)

# System
from .system import ApiKey, Setting, UserPreference, Webhook
from .analytics import AnalyticsEvent
from .outbox_event import OutboxEvent
from .upload_batch import UploadBatch, UploadBatchFile

# Media
from .media import Media, MediaFolder, MediaLink

# Content
from .content import Announcement, Blog, Event, News, Slider, SliderGroup
from .content_workflow import CONTENT_WORKFLOW_ACTIONS, CONTENT_WORKFLOW_STATUSES, ContentWorkflowLog
from .page_cms import (
    PAGE_SCOPE_TYPES,
    PAGE_SECTION_LAYOUT_VARIANTS,
    PAGE_SECTION_STATUSES,
    PARTNERSHIP_CTA_SOURCES,
    SECTION_ITEM_TYPES,
    PageSection,
    PartnershipSpotlight,
    SectionItem,
)
from .public_page import PublicSitePage

# Support and notifications
from .support import ContactDirectory, FAQ, SupportTicket
from .contact_inquiry import ContactInquiry, ContactInquiryMessage
from .notification import Notification, NotificationDelivery, NotificationTemplate

__all__ = [
    # Base
    "Base",
    "AuditLog",
    # Auth
    "User",
    "Session",
    # RBAC
    "Permission",
    "Role",
    "RolePermission",
    "UserRole",
    # Person & Staff
    "Person",
    "StaffAssignment",
    "ROLE_HIERARCHY",
    "ENTITY_ROLES",
    "ACADEMIC_RANK_ORDER",
    # Governance
    "Board",
    "GovernanceRole",
    "GovernancePageContent",
    # Organization
    "Division",
    "Wing",
    # Academic
    "Campus",
    "School",
    "Department",
    "DepartmentService",
    "AcademicCalendar",
    # Admissions
    "Programme",
    "ProgrammeTutor",
    "Intake",
    "ProgrammeIntake",
    "AdmissionInfo",
    "IntakePublicAction",
    "IntakeMilestone",
    "INTAKE_APPLICATION_OVERRIDES",
    "INTAKE_PUBLIC_ACTION_TYPES",
    "INTAKE_MILESTONE_TYPES",
    "INTAKE_WORKFLOW_STATUSES",
    # Student life
    "Club",
    "ClubActivity",
    "Accommodation",
    "SportsFacility",
    "ArtsCulture",
    "StudentGovernance",
    # Marketing
    "Newsletter",
    "NewsletterSubscriber",
    "Testimonial",
    "SocialMediaPost",
    "SocialPlatformAccount",
    "SocialMediaDelivery",
    # Documents
    "Policy",
    "Document",
    # Alumni
    "Alumni",
    "AlumniAssociation",
    "AlumniAssociationMember",
    # Exchange
    "ExchangeProgramme",
    "UniversityInfo",
    "ABOUT_WORKFLOW_STATUSES",
    "FACT_KINDS",
    "AboutPageContent",
    "HistoryMilestone",
    "FactEdition",
    "FactGroup",
    "FactItem",
    "InstitutionalPage",
    "InstitutionalPageSection",
    "InstitutionalPageItem",
    "InstitutionalSectionDocument",
    "Setting",
    "UserPreference",
    "ApiKey",
    "Webhook",
    "AnalyticsEvent",
    "OutboxEvent",
    "UploadBatch",
    "UploadBatchFile",
    # Media
    "Media",
    "MediaFolder",
    "MediaLink",
    # Content
    "News",
    "Blog",
    "Announcement",
    "Event",
    "SliderGroup",
    "Slider",
    "ContentWorkflowLog",
    "CONTENT_WORKFLOW_ACTIONS",
    "CONTENT_WORKFLOW_STATUSES",
    "PAGE_SCOPE_TYPES",
    "PAGE_SECTION_LAYOUT_VARIANTS",
    "PAGE_SECTION_STATUSES",
    "SECTION_ITEM_TYPES",
    "PARTNERSHIP_CTA_SOURCES",
    "PageSection",
    "SectionItem",
    "PartnershipSpotlight",
    "PublicSitePage",
    # Support
    "FAQ",
    "ContactDirectory",
    "SupportTicket",
    "ContactInquiry",
    "ContactInquiryMessage",
    "Notification",
    "NotificationTemplate",
    "NotificationDelivery",
]
