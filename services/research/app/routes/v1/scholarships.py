"""Scholarship endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import ScholarshipApplicationCreate, ScholarshipApplicationUpdate, ScholarshipCreate, ScholarshipUpdate
from ...services import ScholarshipApplicationService, ScholarshipService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/scholarships", tag="Scholarships", service=ScholarshipService, create_schema=ScholarshipCreate, update_schema=ScholarshipUpdate, write_scope="scholarship.manage"))
router.include_router(build_crud_router(prefix="/scholarship-applications", tag="Scholarship Applications", service=ScholarshipApplicationService, create_schema=ScholarshipApplicationCreate, update_schema=ScholarshipApplicationUpdate, write_scope="scholarship_application.manage"))

