"""Publication endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import JournalCreate, JournalUpdate, PublicationCreate, PublicationUpdate
from ...services import JournalService, PublicationService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/publications", tag="Publications", service=PublicationService, create_schema=PublicationCreate, update_schema=PublicationUpdate, write_scope="publications.manage"))
router.include_router(build_crud_router(prefix="/journals", tag="Journals", service=JournalService, create_schema=JournalCreate, update_schema=JournalUpdate, write_scope="publications.manage"))

