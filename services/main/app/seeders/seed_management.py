"""Seed Management Board data."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models import Board, StaffAssignment

from ._shared import LEADERSHIP_PEOPLE, SeedContext, get_or_create_person, upsert_board


async def deactivate_reirm_membership(db: AsyncSession):
    """Keep the inactive office unoccupied; preserve former appointments as history."""
    board = await db.scalar(select(Board).where(Board.slug == 'management-board', Board.deleted_at.is_(None)))
    if board is None:
        raise ValueError('Management Board not found')
    appointments = (await db.scalars(select(StaffAssignment).where(
        StaffAssignment.entity_type == 'board', StaffAssignment.entity_id == board.id,
        StaffAssignment.deleted_at.is_(None),
        or_(StaffAssignment.title.ilike('%REIRM%'),
            StaffAssignment.official_designation.ilike('%REIRM%')),
    ).with_for_update())).all()
    changes = []
    fields = ('status', 'is_public', 'appointment_status', 'workflow_status')
    for appointment in appointments:
        before = {field: getattr(appointment, field) for field in fields}
        appointment.status = 'inactive'
        appointment.is_public = False
        appointment.appointment_status = 'archived'
        appointment.workflow_status = 'archived'
        changes.append(dict(id=str(appointment.id), person_id=str(appointment.person_id), before=before,
                            after={field: getattr(appointment, field) for field in fields}))
    await db.flush()
    return changes


async def seed_management(db: AsyncSession, ctx: SeedContext) -> None:
    for key in (
        "vice_chancellor",
        "dvc_apf",
        "dvc_arsa",
        "registrar_admin",
        "registrar_academic",
        "finance_officer",
    ):
        await get_or_create_person(db, ctx, key, **LEADERSHIP_PEOPLE[key])

    vc = ctx.people["vice_chancellor"]

    await upsert_board(
        db,
        ctx,
        "MANAGEMENT",
        name="Management Board",
        slug="management-board",
        board_type="management_board",
        chairperson_id=vc.id,
        secretary_id=vc.id,
        mandate="Executive management forum coordinating university administration, academic affairs, finance, student affairs, research, and institutional operations.",
        meeting_schedule=None,
        description="Management Board leadership structure sourced from Kisii University public management pages.",
        is_public=True,
        is_active=True,
        status="active",
        display_order=2,
    )
    await deactivate_reirm_membership(db)
