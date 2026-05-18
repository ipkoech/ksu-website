"""Student life services."""

from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import Accommodation, ArtsCulture, Club, ClubActivity, SportsFacility, StudentGovernance
from ._base import apply_updates, ilike_any, paginate_query


class ClubService:
    @staticmethod
    async def get_by_id(db: AsyncSession, club_id: uuid.UUID, *, load_options: Sequence = ()) -> Club | None:
        query = select(Club).options(selectinload(Club.activities)).where(Club.id == club_id, Club.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, public_only: bool = True, load_options: Sequence = ()) -> Club | None:
        query = select(Club).options(selectinload(Club.activities)).where(Club.slug == slug, Club.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        if public_only:
            query = query.where(Club.is_public.is_(True))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Club:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, Club, data["name"])
        item = Club(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Club, **data) -> Club:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Club, data["name"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: Club) -> None:
        item.is_active = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        q: str | None = None,
        club_type: str | None = None,
        school_id: uuid.UUID | None = None,
        department_id: uuid.UUID | None = None,
        is_public: bool | None = True,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Club).options(selectinload(Club.activities)).order_by(Club.display_order.asc(), Club.name.asc())
        if load_options:
            query = query.options(*load_options)
        if club_type:
            query = query.where(Club.club_type == club_type)
        if school_id:
            query = query.where(Club.school_id == school_id)
        if department_id:
            query = query.where(Club.department_id == department_id)
        if is_public is not None:
            query = query.where(Club.is_public.is_(is_public))
        if is_active is not None:
            query = query.where(Club.is_active.is_(is_active))
        if q:
            query = query.where(ilike_any(q, Club.name, Club.about, Club.mission, Club.objectives))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_activities(
        db: AsyncSession,
        club_id: uuid.UUID,
        *,
        public_only: bool = True,
    ) -> list[ClubActivity]:
        query = select(ClubActivity).where(ClubActivity.club_id == club_id).order_by(ClubActivity.start_datetime.desc())
        if public_only:
            query = query.where(ClubActivity.is_public.is_(True))
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def add_activity(db: AsyncSession, club_id: uuid.UUID, **data) -> ClubActivity:
        if not data.get("slug") and data.get("title"):
            data["slug"] = await unique_slug(db, ClubActivity, data["title"])
        item = ClubActivity(club_id=club_id, **data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def get_activity(db: AsyncSession, activity_id: uuid.UUID) -> ClubActivity | None:
        result = await db.execute(select(ClubActivity).where(ClubActivity.id == activity_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_activity(db: AsyncSession, item: ClubActivity, **data) -> ClubActivity:
        if data.get("title") and not data.get("slug"):
            data["slug"] = await unique_slug(db, ClubActivity, data["title"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete_activity(db: AsyncSession, item: ClubActivity) -> None:
        await db.delete(item)
        await db.flush()


class AccommodationService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> Accommodation | None:
        query = select(Accommodation).where(Accommodation.id == item_id, Accommodation.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> Accommodation | None:
        query = select(Accommodation).where(Accommodation.slug == slug, Accommodation.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> Accommodation:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, Accommodation, data["name"])
        item = Accommodation(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Accommodation, **data) -> Accommodation:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, Accommodation, data["name"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: Accommodation) -> None:
        item.is_active = False
        item.is_accepting_applications = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        campus_id: uuid.UUID | None = None,
        accommodation_type: str | None = None,
        gender: str | None = None,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Accommodation).order_by(Accommodation.name.asc())
        if load_options:
            query = query.options(*load_options)
        if campus_id:
            query = query.where(Accommodation.campus_id == campus_id)
        if accommodation_type:
            query = query.where(Accommodation.accommodation_type == accommodation_type)
        if gender:
            query = query.where(Accommodation.gender == gender)
        if is_active is not None:
            query = query.where(Accommodation.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)


class SportsFacilityService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> SportsFacility | None:
        query = select(SportsFacility).where(SportsFacility.id == item_id, SportsFacility.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> SportsFacility | None:
        query = select(SportsFacility).where(SportsFacility.slug == slug, SportsFacility.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> SportsFacility:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, SportsFacility, data["name"])
        item = SportsFacility(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: SportsFacility, **data) -> SportsFacility:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, SportsFacility, data["name"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: SportsFacility) -> None:
        item.is_active = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        campus_id: uuid.UUID | None = None,
        facility_type: str | None = None,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(SportsFacility).order_by(SportsFacility.name.asc())
        if load_options:
            query = query.options(*load_options)
        if campus_id:
            query = query.where(SportsFacility.campus_id == campus_id)
        if facility_type:
            query = query.where(SportsFacility.facility_type == facility_type)
        if is_active is not None:
            query = query.where(SportsFacility.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)


class ArtsCultureService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> ArtsCulture | None:
        query = select(ArtsCulture).where(ArtsCulture.id == item_id, ArtsCulture.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> ArtsCulture | None:
        query = select(ArtsCulture).where(ArtsCulture.slug == slug, ArtsCulture.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> ArtsCulture:
        if not data.get("slug") and data.get("title"):
            data["slug"] = await unique_slug(db, ArtsCulture, data["title"])
        item = ArtsCulture(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: ArtsCulture, **data) -> ArtsCulture:
        if data.get("title") and not data.get("slug"):
            data["slug"] = await unique_slug(db, ArtsCulture, data["title"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: ArtsCulture) -> None:
        item.is_active = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        category: str | None = None,
        school_id: uuid.UUID | None = None,
        club_id: uuid.UUID | None = None,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(ArtsCulture).order_by(ArtsCulture.title.asc())
        if load_options:
            query = query.options(*load_options)
        if category:
            query = query.where(ArtsCulture.category == category)
        if school_id:
            query = query.where(ArtsCulture.school_id == school_id)
        if club_id:
            query = query.where(ArtsCulture.club_id == club_id)
        if is_active is not None:
            query = query.where(ArtsCulture.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)


class StudentGovernanceService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> StudentGovernance | None:
        query = select(StudentGovernance).where(StudentGovernance.id == item_id, StudentGovernance.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> StudentGovernance | None:
        query = select(StudentGovernance).where(StudentGovernance.slug == slug, StudentGovernance.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, **data) -> StudentGovernance:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, StudentGovernance, data["name"])
        item = StudentGovernance(**data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: StudentGovernance, **data) -> StudentGovernance:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, StudentGovernance, data["name"], exclude_id=item.id)
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: StudentGovernance) -> None:
        item.is_active = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        governance_type: str | None = None,
        school_id: uuid.UUID | None = None,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(StudentGovernance).order_by(StudentGovernance.name.asc())
        if load_options:
            query = query.options(*load_options)
        if governance_type:
            query = query.where(StudentGovernance.governance_type == governance_type)
        if school_id:
            query = query.where(StudentGovernance.school_id == school_id)
        if is_active is not None:
            query = query.where(StudentGovernance.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)


__all__ = [
    "ClubService",
    "AccommodationService",
    "SportsFacilityService",
    "ArtsCultureService",
    "StudentGovernanceService",
]
