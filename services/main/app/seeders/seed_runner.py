"""Async seed runner for Kisii University Main service data."""

from __future__ import annotations

import asyncio

from app.core.database import AsyncSessionLocal

from ._shared import SeedContext
from .seed_admin_departments import seed_admin_departments
from .seed_about_content import seed_about_content
from .seed_admission_info import seed_admission_info
from .seed_admissions_catalog import seed_admissions_catalog
from .seed_content import seed_content
from .seed_cover_images import seed_cover_images
from .seed_divisions import seed_divisions
from .seed_featured_stories import seed_featured_stories
from .seed_homepage_admissions import seed_homepage_admissions
from .seed_student_life_stories import seed_student_life_stories
from .seed_governance import seed_governance
from .seed_management import seed_management
from .seed_leadership_media import seed_leadership_media
from .seed_page_cms import seed_page_cms
from .seed_programmes import seed_programmes
from .seed_public_records import seed_public_records
from .seed_public_site_pages import seed_public_site_pages
from .seed_portal_users import seed_portal_users
from .seed_rbac import seed_rbac
from .seed_schools import seed_schools
from .seed_staff_profiles import seed_staff_profiles
from .seed_staff_assignments import seed_staff_assignments
from .seed_system_settings import seed_system_settings
from .seed_test_user import seed_test_user
from .seed_university_info import seed_university_info
from .seed_vc_activities import seed_vc_activities
from .seed_vice_chancellor_hub import seed_vice_chancellor_hub


async def run() -> None:
    ctx = SeedContext()
    async with AsyncSessionLocal() as db:
        try:
            await seed_rbac(db, ctx)
            await seed_governance(db, ctx)
            await seed_management(db, ctx)
            await seed_divisions(db, ctx)
            await seed_schools(db, ctx)
            await seed_leadership_media(db, ctx)
            await seed_university_info(db, ctx)
            await seed_programmes(db, ctx)
            await seed_homepage_admissions(db, ctx)
            await seed_admission_info(db, ctx)
            await seed_admissions_catalog(db, ctx)
            await seed_content(db, ctx)
            await seed_featured_stories(db, ctx)
            await seed_student_life_stories(db, ctx)
            await seed_public_records(db, ctx)
            await seed_about_content(db, ctx)
            await seed_public_site_pages(db, ctx)
            await seed_page_cms(db, ctx)
            await seed_vc_activities(db, ctx)
            await seed_admin_departments(db, ctx)
            await seed_staff_profiles(db, ctx)
            await seed_cover_images(db, ctx)
            await seed_staff_assignments(db, ctx)
            await seed_vice_chancellor_hub(db, ctx)
            await seed_system_settings(db)
            await seed_portal_users(db, ctx)
            await seed_test_user(db, ctx)
            await db.commit()
        except Exception:
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(run())
