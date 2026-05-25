"""Main service layer exports."""

from .admissions import AdmissionInfoService, IntakeService, ProgrammeService
from .academic import CampusService, DepartmentService, SchoolService
from .alumni import AlumniAssociationService, AlumniService
from .audit import AuditService
from .analytics import AnalyticsService
from .auth import AuthService
from .content import (
    AnnouncementService,
    BlogService,
    EventService,
    NewsService,
    SliderGroupService,
    SliderService,
)
from .documents import DocumentService, PolicyService
from .exchange import ExchangeProgrammeService
from .governance import GovernanceService
from .imports import ImportService
from .marketing import (
    NewsletterService,
    NewsletterSubscriberService,
    SocialMediaPostService,
    SocialPlatformAccountService,
    TestimonialService,
)
from .media import MediaService
from .notification import NotificationService
from .organization import DivisionService, WingService
from .person import PersonService
from .rbac import RBACService
from .search import SearchService
from .staff import StaffService
from .student_life import AccommodationService, ArtsCultureService, ClubService, SportsFacilityService, StudentGovernanceService
from .support import ContactService, FAQService, SupportTicketService
from .system import ApiKeyService, SettingService, WebhookService
from .university import UniversityInfoService
from .user import UserService

__all__ = [
    "AuthService",
    "AuditService",
    "AnalyticsService",
    "UserService",
    "PersonService",
    "StaffService",
    "GovernanceService",
    "ImportService",
    "DivisionService",
    "WingService",
    "CampusService",
    "SchoolService",
    "DepartmentService",
    "ProgrammeService",
    "IntakeService",
    "AdmissionInfoService",
    "ClubService",
    "AccommodationService",
    "SportsFacilityService",
    "ArtsCultureService",
    "StudentGovernanceService",
    "NewsletterService",
    "NewsletterSubscriberService",
    "TestimonialService",
    "SocialMediaPostService",
    "SocialPlatformAccountService",
    "PolicyService",
    "DocumentService",
    "AlumniService",
    "AlumniAssociationService",
    "ExchangeProgrammeService",
    "UniversityInfoService",
    "SettingService",
    "ApiKeyService",
    "WebhookService",
    "MediaService",
    "RBACService",
    "SearchService",
    "NewsService",
    "BlogService",
    "AnnouncementService",
    "EventService",
    "SliderGroupService",
    "SliderService",
    "FAQService",
    "ContactService",
    "SupportTicketService",
    "NotificationService",
]
