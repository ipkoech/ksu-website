"""School-scoped profile mutations for the School Portal."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Person, School
from ..schemas.school_portal import (
    SchoolPortalDeanUpdate,
    SchoolPortalMediaLinkCreate,
    SchoolPortalProfileUpdate,
)
from ..schemas.school_portal_audit import SchoolPortalAuditCreate
from .audit import record_school_portal_audit
from .domain_events import enqueue_domain_event
from .media import MediaService
from .school_portal_context import SchoolPortalContext
from .staff import StaffService

PROFILE_MANAGE_PERMISSION = "school.profile.manage"
SINGLETON_MEDIA_FIELDS = {
    "logo": "logo_image_id",
    "cover": "cover_image_id",
    "brochure": "brochure_id",
}


def _require_manage(context: SchoolPortalContext) -> None:
    if PROFILE_MANAGE_PERMISSION not in context.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="School profile management permission is required",
        )


async def _audit_profile_change(
    db: AsyncSession,
    context: SchoolPortalContext,
    *,
    action: str,
    changes: dict[str, Any],
    request_method: str,
    request_path: str,
) -> None:
    await record_school_portal_audit(
        db,
        SchoolPortalAuditCreate(
            school_id=context.school.id,
            action=action,
            resource_type="school",
            resource_id=context.school.id,
            actor_id=context.user.id,
            changed_fields=jsonable_encoder(changes),
            request_method=request_method,
            request_path=request_path,
        ),
    )


def _enqueue_profile_event(
    db: AsyncSession,
    context: SchoolPortalContext,
    changes: dict[str, Any],
) -> None:
    enqueue_domain_event(
        db,
        event_type="school.profile.updated",
        scope_type="school",
        scope_id=context.school.id,
        actor_id=context.user.id,
        resource_type="school",
        resource_id=context.school.id,
        data={"changes": jsonable_encoder(changes)},
    )


async def update_school_profile(
    db: AsyncSession,
    context: SchoolPortalContext,
    data: SchoolPortalProfileUpdate,
) -> tuple[School, dict[str, Any]]:
    """Apply only explicitly supplied editable fields to the current school."""
    _require_manage(context)
    changes: dict[str, Any] = {}
    for field, new_value in data.model_dump(exclude_unset=True).items():
        old_value = getattr(context.school, field)
        if old_value != new_value:
            setattr(context.school, field, new_value)
            changes[field] = {"old": old_value, "new": new_value}

    if changes:
        _enqueue_profile_event(db, context, changes)
        await _audit_profile_change(
            db,
            context,
            action="school.profile.updated",
            changes=changes,
            request_method="PATCH",
            request_path="/api/v1/school-portal/profile",
        )
    return context.school, changes


async def set_school_dean(
    db: AsyncSession,
    context: SchoolPortalContext,
    data: SchoolPortalDeanUpdate,
) -> School:
    """Set the dean while keeping the staff assignment lifecycle consistent."""
    _require_manage(context)
    person = await Person.get_by_id(db, data.person_id)
    if person is None or not getattr(person, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Person not found"
        )

    assignments = await StaffService.get_assignments_for_person(db, data.person_id)
    conflicting = [
        assignment
        for assignment in assignments
        if assignment.entity_type == "school"
        and assignment.entity_id != context.school.id
        and assignment.status == "active"
    ]
    if conflicting and not data.reassign_existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Person already has an active assignment in another school",
        )
    for assignment in conflicting:
        await StaffService.end_assignment(
            db,
            assignment.id,
            notes="Ended by explicit School Portal dean reassignment",
        )

    current_deans = await StaffService.get_assignments_for_entity(
        db,
        "school",
        context.school.id,
        role="dean",
    )
    for assignment in current_deans:
        if assignment.person_id != data.person_id:
            await StaffService.end_assignment(
                db,
                assignment.id,
                notes="Superseded by School Portal dean assignment",
            )

    if not any(assignment.person_id == data.person_id for assignment in current_deans):
        await StaffService.assign(
            db,
            person_id=data.person_id,
            user_id=getattr(person, "user_id", None),
            entity_type="school",
            entity_id=context.school.id,
            role="dean",
            title="Dean",
            is_primary=True,
            is_public=True,
        )

    old_dean_id = context.school.dean_id
    context.school.dean_id = data.person_id
    changes = {
        "dean_id": {
            "old": old_dean_id,
            "new": data.person_id,
        }
    }
    _enqueue_profile_event(db, context, changes)
    await _audit_profile_change(
        db,
        context,
        action="school.dean.assigned",
        changes=changes,
        request_method="PUT",
        request_path="/api/v1/school-portal/profile/dean",
    )
    return context.school


async def link_school_profile_media(
    db: AsyncSession,
    context: SchoolPortalContext,
    data: SchoolPortalMediaLinkCreate,
) -> School:
    """Link media owned by the current school's folder to its public profile."""
    _require_manage(context)
    media = await MediaService.get_by_id(db, data.media_id)
    existing_link = (
        await MediaService.get_link_for_media(
            db,
            media_id=media.id,
            entity_type="school",
            entity_id=context.school.id,
            role=data.role,
        )
        if media is not None
        else None
    )
    if media is None or (
        not MediaService.is_owned_by_school(media, context.school.id)
        and existing_link is None
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Media not found"
        )
    try:
        MediaService.validate_profile_media(media, data.role)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    folder = (
        media.folder
        if MediaService.is_owned_by_school(media, context.school.id)
        else await MediaService.ensure_school_media_folder(db, context.school.id)
    )
    media.folder_id = folder.id
    media.folder = folder

    field = SINGLETON_MEDIA_FIELDS.get(data.role)
    old_value = getattr(context.school, field) if field else None
    replacing_singleton = bool(field and old_value and old_value != media.id)
    if replacing_singleton:
        old_link = await MediaService.get_link_for_media(
            db,
            media_id=old_value,
            entity_type="school",
            entity_id=context.school.id,
            role=data.role,
        )
        if old_link is not None:
            await MediaService.delete_link(db, old_link)
    if existing_link is None:
        await MediaService.link_media(
            db,
            media_id=media.id,
            entity_type="school",
            entity_id=context.school.id,
            role=data.role,
            folder_id=media.folder_id,
            display_order=data.display_order,
            is_public=True,
        )
    else:
        await MediaService.update_link(
            db,
            existing_link,
            folder_id=folder.id,
            display_order=data.display_order,
            is_public=True,
        )
    changes: dict[str, Any]
    if field:
        setattr(context.school, field, media.id)
        changes = {field: {"old": old_value, "new": media.id}}
    else:
        changes = {
            "gallery": {
                "added": media.id,
                "display_order": data.display_order,
            }
        }

    _enqueue_profile_event(db, context, changes)
    await _audit_profile_change(
        db,
        context,
        action="school.profile.media.linked",
        changes=changes,
        request_method="POST",
        request_path="/api/v1/school-portal/profile/media",
    )
    return context.school


async def unlink_school_profile_media(
    db: AsyncSession,
    context: SchoolPortalContext,
    link_id: uuid.UUID,
) -> School:
    """Remove a media link owned by the current school profile."""
    _require_manage(context)
    link = await MediaService.get_link_by_id(db, link_id)
    if (
        link is None
        or link.entity_type != "school"
        or link.entity_id != context.school.id
        or link.role not in {"logo", "cover", "brochure", "gallery"}
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile media link not found"
        )

    await MediaService.delete_link(db, link)
    field = SINGLETON_MEDIA_FIELDS.get(link.role)
    changes: dict[str, Any]
    if field and getattr(context.school, field) == link.media_id:
        setattr(context.school, field, None)
        changes = {field: {"old": link.media_id, "new": None}}
    else:
        changes = {"gallery": {"removed": link.media_id}}

    _enqueue_profile_event(db, context, changes)
    await _audit_profile_change(
        db,
        context,
        action="school.profile.media.unlinked",
        changes=changes,
        request_method="DELETE",
        request_path=f"/api/v1/school-portal/profile/media/{link_id}",
    )
    return context.school


__all__ = [
    "link_school_profile_media",
    "set_school_dean",
    "unlink_school_profile_media",
    "update_school_profile",
]
