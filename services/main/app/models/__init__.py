"""Main service ORM models."""

from ksu_common.models import AuditLog
from ksu_common.models.base import Base  # noqa: F401

# Auth
from .auth import Session, User

# RBAC
from .rbac import Permission, Role, RolePermission, UserRole

# Person & Staff
from .person import Person
from .staff import ACADEMIC_RANK_ORDER, ENTITY_ROLES, ROLE_HIERARCHY, HierarchyLevel, StaffAssignment

# Governance
from .governance import Board

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
from .admissions import AdmissionInfo, Intake, Programme, ProgrammeIntake, ProgrammeTutor

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

# System
from .system import ApiKey, Setting, UserPreference, Webhook
from .analytics import AnalyticsEvent

# Media
from .media import Media, MediaFolder, MediaLink

# Content
from .content import Announcement, Blog, Event, News, Slider, SliderGroup

# Support and notifications
from .support import ContactDirectory, FAQ, SupportTicket
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
    "HierarchyLevel",
    "ROLE_HIERARCHY",
    "ENTITY_ROLES",
    "ACADEMIC_RANK_ORDER",
    # Governance
    "Board",
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
    "Setting",
    "UserPreference",
    "ApiKey",
    "Webhook",
    "AnalyticsEvent",
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
    # Support
    "FAQ",
    "ContactDirectory",
    "SupportTicket",
    "Notification",
    "NotificationTemplate",
    "NotificationDelivery",
]
