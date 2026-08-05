"""Research service ORM models."""

from ksu_common.models import AuditLog
from ksu_common.models.base import SEOMixin, PolymorphicMixin

from .base import Base

from .ask_ai import ResearchAIConversation, ResearchAIMessage
from .media import PublicMedia

# Core Research
from .core import (
    ResearchCenter,
    ResearchFarm,
    ResearchProgram,
    ResearchProject,
    ProjectTeamMember,
    CenterTeamMember,
)

# Classification
from .classification import (
    ResearchTheme,
    FocusArea,
    ExpertiseTag,
    project_themes,
    publication_themes,
    program_themes,
    grant_themes,
    project_focus_areas,
    center_focus_areas,
    person_expertise,
)

# Funding & Grants
from .funding import (
    Grant,
    GrantGuideline,
    GrantApplication,
    GrantReview,
    GrantReport,
    Funding,
    EndowmentFund,
    project_funders,
    project_partners,
    center_funders,
    center_partners,
)

# Innovation & Output
from .innovation import (
    Innovation,
    StartupVenture,
    IncubationRecord,
    InnovationCompetitionEntry,
    TechnologyTransferCase,
    ResearchOutput,
    innovation_sponsors,
)

# Note: project_funders, project_partners, center_funders, center_partners
# are defined in funding.py but reference partners.id from partnership.py

# Publications
from .publication import (
    Publication,
    PublicationAuthor,
    Journal,
    EditorialBoardMember,
)

# Capacity Building
from .capacity import (
    TrainingProgram,
    MentorshipProgram,
    MentorshipApplication,
    MentorshipMatch,
    Scholarship,
    ScholarshipApplication,
)

# Partnerships
from .partnership import (
    Partner,
    Consultancy,
)

# Impact & Content
from .impact import (
    SuccessStory,
    ImpactMetric,
    Sustainability,
    sustainability_projects,
    sustainability_grants,
    sustainability_training,
    sustainability_partners,
    sustainability_stories,
)

# Donations
from .donation import (
    Donor,
    Donation,
    DonationSettings,
    DonationImpact,
    DonationStory,
)

# Support
from .support import (
    ResearchResource,
    ResearchService,
    ResearchGuideline,
)

__all__ = [
    # Base
    "Base",
    "ResearchAIConversation",
    "ResearchAIMessage",
    "AuditLog",
    "SEOMixin",
    "PolymorphicMixin",
    "PublicMedia",
    # Core
    "ResearchCenter",
    "ResearchFarm",
    "ResearchProgram",
    "ResearchProject",
    "ProjectTeamMember",
    "CenterTeamMember",
    # Classification
    "ResearchTheme",
    "FocusArea",
    "ExpertiseTag",
    "project_themes",
    "publication_themes",
    "program_themes",
    "grant_themes",
    "project_focus_areas",
    "center_focus_areas",
    "person_expertise",
    # Funding
    "Grant",
    "GrantGuideline",
    "GrantApplication",
    "GrantReview",
    "GrantReport",
    "Funding",
    "EndowmentFund",
    "project_funders",
    "project_partners",
    "center_funders",
    "center_partners",
    # Innovation
    "Innovation",
    "StartupVenture",
    "IncubationRecord",
    "InnovationCompetitionEntry",
    "TechnologyTransferCase",
    "ResearchOutput",
    "innovation_sponsors",
    # Publication
    "Publication",
    "PublicationAuthor",
    "Journal",
    "EditorialBoardMember",
    # Capacity
    "TrainingProgram",
    "MentorshipProgram",
    "MentorshipApplication",
    "MentorshipMatch",
    "Scholarship",
    "ScholarshipApplication",
    # Partnership
    "Partner",
    "Consultancy",
    # Impact
    "SuccessStory",
    "ImpactMetric",
    "Sustainability",
    "sustainability_projects",
    "sustainability_grants",
    "sustainability_training",
    "sustainability_partners",
    "sustainability_stories",
    # Donation
    "Donor",
    "Donation",
    "DonationSettings",
    "DonationImpact",
    "DonationStory",
    # Support
    "ResearchResource",
    "ResearchService",
    "ResearchGuideline",
]
