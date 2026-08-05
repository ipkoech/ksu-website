"""Admin API router."""

from fastapi import APIRouter

from .audit import router as audit_router
from .inquiries import router as inquiries_router
from .notifications import router as notifications_router
from .permissions import router as permissions_router
from .reports import router as reports_router
from .roles import router as roles_router
from .system import router as system_router
from .users import router as users_router

router = APIRouter()
router.include_router(users_router, prefix="/users")
router.include_router(roles_router, prefix="/roles")
router.include_router(permissions_router, prefix="/permissions")
router.include_router(notifications_router, prefix="/notifications")
router.include_router(audit_router, prefix="/audit")
router.include_router(inquiries_router, prefix="/inquiries")
router.include_router(reports_router, prefix="/reports")
router.include_router(system_router, prefix="/system")
