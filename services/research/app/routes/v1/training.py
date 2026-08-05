"""Training and mentorship endpoints."""

from fastapi import APIRouter

from ...schemas import (
    MentorshipApplicationCreate,
    MentorshipApplicationUpdate,
    MentorshipMatchCreate,
    MentorshipMatchUpdate,
    MentorshipProgramCreate,
    MentorshipProgramUpdate,
    TrainingProgramCreate,
    TrainingProgramUpdate,
)
from ...services import MentorshipApplicationService, MentorshipMatchService, MentorshipService, TrainingService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/training", tag="Training Programs", service=TrainingService, create_schema=TrainingProgramCreate, update_schema=TrainingProgramUpdate, write_scope="training_program.manage"))
router.include_router(build_crud_router(prefix="/mentorship", tag="Mentorship Programs", service=MentorshipService, create_schema=MentorshipProgramCreate, update_schema=MentorshipProgramUpdate, write_scope="training_program.manage"))
router.include_router(build_crud_router(prefix="/mentorship-applications", tag="Mentorship Applications", service=MentorshipApplicationService, create_schema=MentorshipApplicationCreate, update_schema=MentorshipApplicationUpdate, write_scope="training_program.manage", public_read=False))
router.include_router(build_crud_router(prefix="/mentorship-matches", tag="Mentorship Matches", service=MentorshipMatchService, create_schema=MentorshipMatchCreate, update_schema=MentorshipMatchUpdate, write_scope="training_program.manage", public_read=False))
