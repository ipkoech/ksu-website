"""Governance service."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Board, GovernancePageContent, GovernanceRole, Person, StaffAssignment
from .staff import StaffService

_COUNCIL_SLUG = "university-council"


class GovernanceService:
    """Board operations."""

    @staticmethod
    async def get_board(db: AsyncSession, board_id: uuid.UUID, *, load_options: Sequence = ()) -> Board | None:
        query = select(Board).where(Board.id == board_id, Board.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_board_by_slug(db: AsyncSession, slug: str, *, load_options: Sequence = ()) -> Board | None:
        query = select(Board).where(Board.slug == slug, Board.is_active.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_boards(
        db: AsyncSession,
        *,
        board_type: str | None = None,
        parent_entity_type: str | None = None,
        parent_entity_id: uuid.UUID | None = None,
        is_active: bool | None = True,
        load_options: Sequence = (),
    ) -> list[Board]:
        query = select(Board).order_by(Board.display_order.asc(), Board.name.asc())
        if load_options:
            query = query.options(*load_options)
        if board_type:
            query = query.where(Board.board_type == board_type)
        if parent_entity_type:
            query = query.where(Board.parent_entity_type == parent_entity_type)
        if parent_entity_id:
            query = query.where(Board.parent_entity_id == parent_entity_id)
        if is_active is not None:
            query = query.where(Board.is_active.is_(is_active))
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def create_board(db: AsyncSession, **data) -> Board:
        board = Board(**data)
        db.add(board)
        await db.flush()
        await db.refresh(board)
        return board

    @staticmethod
    async def update_board(db: AsyncSession, board: Board, **data) -> Board:
        for key, value in data.items():
            if hasattr(board, key):
                setattr(board, key, value)
        await db.flush()
        await db.refresh(board)
        return board

    @staticmethod
    async def soft_delete_board(db: AsyncSession, board: Board) -> None:
        board.is_active = False
        board.status = "dissolved"
        await db.flush()

    @staticmethod
    async def get_members(
        db: AsyncSession,
        board_id: uuid.UUID,
        *,
        public_only: bool = False,
    ) -> list[StaffAssignment]:
        query = (
            select(StaffAssignment)
            .join(StaffAssignment.person)
            .options(
                selectinload(StaffAssignment.person).selectinload(Person.photo),
                selectinload(StaffAssignment.reports_to).selectinload(StaffAssignment.person),
            )
            .where(
                StaffAssignment.entity_type == "board",
                StaffAssignment.entity_id == board_id,
                StaffAssignment.deleted_at.is_(None),
                StaffAssignment.status == "active",
            )
            .order_by(
                StaffAssignment.hierarchy_level.asc(),
                StaffAssignment.display_order.asc(),
                Person.full_name.asc(),
            )
        )
        if public_only:
            query = query.where(
                StaffAssignment.is_public.is_(True),
                StaffAssignment.workflow_status == "published",
                StaffAssignment.appointment_status == "published",
            )
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    def member_display_data(member: StaffAssignment) -> dict:
        """Return the stable, nested member shape used by public governance pages."""
        reports_to = member.reports_to
        return {
            "id": member.id,
            "display_label": member.person.display_name,
            "role": member.role,
            "role_label": StaffService.role_label(member.role),
            "title": member.title,
            "hierarchy_level": member.hierarchy_level,
            "reports_to": (
                {
                    "id": reports_to.id,
                    "display_label": reports_to.person.display_name,
                    "role_label": StaffService.role_label(reports_to.role),
                }
                if reports_to is not None
                else None
            ),
            "display_order": member.display_order,
            "is_acting": member.is_acting,
        }

    @staticmethod
    def public_board_data(board: Board, members: Sequence[StaffAssignment]) -> dict:
        """Return board and member display data without UUID-only relationships."""
        return {
            "id": board.id,
            "display_label": board.name,
            "name": board.name,
            "slug": board.slug,
            "board_type": board.board_type,
            "description": board.description,
            "mandate": board.mandate,
            "mission": board.mission,
            "vision": board.vision,
            "meeting_schedule": board.meeting_schedule,
            "display_order": board.display_order,
            "members": [GovernanceService.member_display_data(member) for member in members],
        }

    @staticmethod
    async def add_member(
        db: AsyncSession,
        board_id: uuid.UUID,
        person_id: uuid.UUID,
        role: str,
        **data,
    ) -> StaffAssignment:
        board = await GovernanceService.get_board(db, board_id)
        if board is None:
            raise ValueError("Board not found")

        duplicate = await db.execute(
            select(StaffAssignment).where(
                StaffAssignment.entity_type == "board",
                StaffAssignment.entity_id == board_id,
                StaffAssignment.person_id == person_id,
                StaffAssignment.status == "active",
                StaffAssignment.deleted_at.is_(None),
            )
        )
        if duplicate.scalars().first() is not None:
            raise ValueError("Person is already an active member of this board")

        conflict = await StaffService.check_position_conflict(db, "board", board_id, role)
        if conflict is not None:
            raise ValueError(f"{StaffService.role_label(role)} is already assigned on this board")

        assignment = await StaffService.assign(
            db,
            person_id=person_id,
            entity_type="board",
            entity_id=board_id,
            role=role,
            **data,
        )
        if role in {"chairperson", "council_chair"}:
            board.chairperson_id = person_id
        elif role == "vice_chairperson":
            board.vice_chairperson_id = person_id
        elif role in {"secretary", "board_secretary"}:
            board.secretary_id = person_id
        await db.flush()
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def remove_member(
        db: AsyncSession,
        board_id: uuid.UUID,
        person_id: uuid.UUID,
    ) -> None:
        result = await db.execute(
            select(StaffAssignment).where(
                StaffAssignment.entity_type == "board",
                StaffAssignment.entity_id == board_id,
                StaffAssignment.person_id == person_id,
                StaffAssignment.status == "active",
            )
        )
        assignment = result.scalar_one_or_none()
        if assignment is None:
            raise ValueError("Board member assignment not found")
        assignment.status = "ended"
        await db.flush()

    @staticmethod
    async def get_university_council_board(db: AsyncSession) -> Board | None:
        return await GovernanceService.get_board_by_slug(db, _COUNCIL_SLUG)

    @staticmethod
    async def council_dashboard(db: AsyncSession) -> dict:
        board = await GovernanceService.get_university_council_board(db)
        if board is None:
            raise ValueError("University Council not found")

        scope = (
            StaffAssignment.entity_type == "board",
            StaffAssignment.entity_id == board.id,
            StaffAssignment.deleted_at.is_(None),
        )
        result = await db.execute(
            select(
                func.count(StaffAssignment.id).filter(StaffAssignment.status == "active"),
                func.count(StaffAssignment.id).filter(StaffAssignment.workflow_status == "draft"),
                func.count(StaffAssignment.id).filter(StaffAssignment.workflow_status == "published"),
                func.count(StaffAssignment.id).filter(StaffAssignment.status != "active"),
                func.max(StaffAssignment.updated_at),
            ).where(*scope)
        )
        total_active, draft, published, inactive, last_updated = result.one()
        members = await GovernanceService.list_council_members(db)
        chairperson = next((member for member in members if GovernanceService._role_group(member) == "chairperson"), None)
        secretary = next((member for member in members if GovernanceService._role_group(member) == "secretary"), None)
        member_roles = [member for member in members if GovernanceService._role_group(member) == "member"]
        return {
            "total_active_members": int(total_active or 0),
            "chairperson": chairperson,
            "member_count": len(member_roles),
            "government_representative_count": sum(
                1 for member in member_roles if (member.appointment_category or "") == "government_representative"
            ),
            "other_representative_count": sum(
                1 for member in member_roles if (member.appointment_category or "") != "government_representative"
            ),
            "secretary": secretary,
            "draft_profile_count": int(draft or 0),
            "published_profile_count": int(published or 0),
            "inactive_profile_count": int(inactive or 0),
            "vacant_position_count": int(getattr(board, "member_count", 0) or 0) - int(total_active or 0),
            "last_updated_at": last_updated,
        }

    @staticmethod
    async def list_governance_roles(db: AsyncSession, active_only: bool = True) -> list[GovernanceRole]:
        query = select(GovernanceRole).order_by(
            GovernanceRole.display_group.asc(),
            GovernanceRole.default_display_order.asc(),
            GovernanceRole.name.asc(),
        )
        if active_only:
            query = query.where(GovernanceRole.is_active.is_(True))
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_governance_role(db: AsyncSession, role_id: uuid.UUID) -> GovernanceRole | None:
        result = await db.execute(select(GovernanceRole).where(GovernanceRole.id == role_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_governance_role(db: AsyncSession, data: dict, user_id: uuid.UUID) -> GovernanceRole:
        role = GovernanceRole(**data, created_by_id=user_id, updated_by_id=user_id)
        db.add(role)
        await db.flush()
        await db.refresh(role)
        return role

    @staticmethod
    async def update_governance_role(
        db: AsyncSession, role: GovernanceRole, data: dict, user_id: uuid.UUID
    ) -> GovernanceRole:
        for key, value in data.items():
            if hasattr(role, key):
                setattr(role, key, value)
        role.updated_by_id = user_id
        await db.flush()
        await db.refresh(role)
        return role

    @staticmethod
    async def get_council_page_content(
        db: AsyncSession, board_id: uuid.UUID
    ) -> GovernancePageContent | None:
        result = await db.execute(
            select(GovernancePageContent)
            .options(selectinload(GovernancePageContent.hero_image))
            .where(GovernancePageContent.board_id == board_id, GovernancePageContent.page_key == "overview")
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def upsert_council_page_content(
        db: AsyncSession, board_id: uuid.UUID, data: dict, user_id: uuid.UUID
    ) -> GovernancePageContent:
        page = await GovernanceService.get_council_page_content(db, board_id)
        if page is None:
            page = GovernancePageContent(board_id=board_id, page_key="overview", created_by_id=user_id, **data)
            db.add(page)
        else:
            for key, value in data.items():
                if hasattr(page, key):
                    setattr(page, key, value)
            page.updated_by_id = user_id
        await db.flush()
        await db.refresh(page)
        return page

    @staticmethod
    async def list_council_members(
        db: AsyncSession, public_only: bool = False, workflow_status: str | None = None
    ) -> list[StaffAssignment]:
        board = await GovernanceService.get_university_council_board(db)
        if board is None:
            raise ValueError("University Council not found")
        query = (
            select(StaffAssignment)
            .join(StaffAssignment.person)
            .options(
                selectinload(StaffAssignment.person).selectinload(Person.photo),
                selectinload(StaffAssignment.governance_role),
                selectinload(StaffAssignment.reports_to).selectinload(StaffAssignment.person),
            )
            .where(
                StaffAssignment.entity_type == "board",
                StaffAssignment.entity_id == board.id,
                StaffAssignment.deleted_at.is_(None),
            )
            .order_by(StaffAssignment.hierarchy_level.asc(), StaffAssignment.display_order.asc(), Person.full_name.asc())
        )
        if public_only:
            query = query.where(
                StaffAssignment.status == "active",
                StaffAssignment.is_public.is_(True),
                StaffAssignment.workflow_status == "published",
                StaffAssignment.appointment_status == "published",
            )
        if workflow_status is not None:
            query = query.where(StaffAssignment.workflow_status == workflow_status)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_council_member(db: AsyncSession, assignment_id: uuid.UUID) -> StaffAssignment | None:
        board = await GovernanceService.get_university_council_board(db)
        if board is None:
            return None
        result = await db.execute(
            select(StaffAssignment)
            .options(
                selectinload(StaffAssignment.person).selectinload(Person.photo),
                selectinload(StaffAssignment.governance_role),
                selectinload(StaffAssignment.reports_to).selectinload(StaffAssignment.person),
            )
            .where(
                StaffAssignment.id == assignment_id,
                StaffAssignment.entity_type == "board",
                StaffAssignment.entity_id == board.id,
                StaffAssignment.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_council_member(db: AsyncSession, data: dict, user_id: uuid.UUID) -> StaffAssignment:
        board = await GovernanceService.get_university_council_board(db)
        if board is None:
            raise ValueError("University Council not found")
        payload = dict(data)
        role_id = payload.pop("governance_role_id")
        role = await GovernanceService.get_governance_role(db, role_id)
        if role is None:
            raise ValueError("Governance role not found")
        payload.setdefault("role", role.slug.replace("-", "_"))
        payload.setdefault("appointment_category", role.category)
        payload.setdefault("hierarchy_level", role.default_hierarchy_level)
        payload.setdefault("display_order", role.default_display_order)
        assignment = StaffAssignment(
            entity_type="board",
            entity_id=board.id,
            governance_role_id=role.id,
            status="active",
            **payload,
        )
        db.add(assignment)
        await db.flush()
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def update_council_member(
        db: AsyncSession, assignment: StaffAssignment, data: dict, user_id: uuid.UUID
    ) -> StaffAssignment:
        payload = dict(data)
        role_id = payload.get("governance_role_id")
        if role_id is not None:
            role = await GovernanceService.get_governance_role(db, role_id)
            if role is None:
                raise ValueError("Governance role not found")
            assignment.role = role.slug.replace("-", "_")
        for key, value in payload.items():
            if hasattr(assignment, key):
                setattr(assignment, key, value)
        await db.flush()
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def validate_council_order_nodes(nodes, assignments_by_id: dict[uuid.UUID, StaffAssignment]) -> None:
        def field(node, name):
            return node[name] if isinstance(node, dict) else getattr(node, name)

        seen_orders: set[tuple[str, int]] = set()
        node_ids = {field(node, "assignment_id") for node in nodes}
        for node in nodes:
            key = (field(node, "display_group"), field(node, "display_order"))
            if key in seen_orders:
                raise ValueError("Duplicate display order within a display group")
            seen_orders.add(key)
        for assignment_id in node_ids:
            if assignment_id not in assignments_by_id:
                raise ValueError("Council order references a member outside this board")
        parents = {field(node, "assignment_id"): field(node, "reports_to_id") for node in nodes}
        for assignment_id, reports_to_id in parents.items():
            if reports_to_id is not None and reports_to_id not in assignments_by_id:
                raise ValueError("Council order references a member outside this board")
            visited: set[uuid.UUID] = set()
            current = assignment_id
            while current is not None:
                if current in visited:
                    raise ValueError("Council reporting relationships contain a cycle")
                visited.add(current)
                current = parents.get(current)

    @staticmethod
    async def update_council_order(db: AsyncSession, nodes, user_id: uuid.UUID) -> list[StaffAssignment]:
        members = await GovernanceService.list_council_members(db)
        assignments_by_id = {member.id: member for member in members}
        await GovernanceService.validate_council_order_nodes(nodes, assignments_by_id)
        for node in nodes:
            value = node if isinstance(node, dict) else node.model_dump()
            assignment = assignments_by_id[value["assignment_id"]]
            assignment.display_order = value["display_order"]
            assignment.hierarchy_level = value["hierarchy_level"]
            assignment.reports_to_id = value["reports_to_id"]
        await db.flush()
        return [assignments_by_id[node["assignment_id"] if isinstance(node, dict) else node.assignment_id] for node in nodes]

    @staticmethod
    async def transition_council_member(
        db: AsyncSession,
        assignment: StaffAssignment,
        action: str,
        user_id: uuid.UUID,
        comment: str | None = None,
    ) -> StaffAssignment:
        now = datetime.now(timezone.utc)
        current = assignment.workflow_status
        if action == "submit-review" and current == "draft":
            assignment.workflow_status = "submitted"
            assignment.submitted_by_id = user_id
            assignment.submitted_at = now
        elif action == "approve" and current == "submitted":
            assignment.workflow_status = "approved"
            assignment.approved_by_id = user_id
            assignment.approved_at = now
        elif action == "publish" and current == "approved":
            assignment.workflow_status = "published"
            assignment.appointment_status = "published"
            assignment.published_by_id = user_id
            assignment.published_at = now
        elif action == "unpublish" and current == "published":
            assignment.workflow_status = "approved"
            assignment.appointment_status = "approved"
            assignment.unpublished_at = now
        elif action == "archive" and current != "published":
            assignment.workflow_status = "archived"
            assignment.appointment_status = "archived"
            assignment.archived_at = now
            assignment.status = "ended"
        else:
            raise ValueError("Invalid workflow transition")
        if comment is not None:
            assignment.publication_notes = comment
        flush = getattr(db, "flush", None)
        if flush is not None:
            await flush()
        return assignment

    @staticmethod
    def _role_group(assignment: StaffAssignment) -> str:
        governance_role = getattr(assignment, "governance_role", None)
        group = getattr(governance_role, "display_group", None)
        if group:
            return group
        role_name = " ".join(
            str(value or "") for value in (getattr(assignment, "role", None), getattr(assignment, "title", None))
        ).lower()
        if "chair" in role_name:
            return "chairperson"
        if "secretary" in role_name:
            return "secretary"
        return "member"

    @staticmethod
    def _member_card(assignment: StaffAssignment) -> dict:
        person = assignment.person
        photo = getattr(person, "photo", None)
        photo_url = getattr(person, "photo_url", None) or getattr(photo, "url", None)
        role = getattr(assignment, "public_role_label", None) or getattr(assignment.governance_role, "public_label", None) or assignment.title or StaffService.role_label(assignment.role)
        return {
            "id": assignment.id,
            "name": person.display_name,
            "role": role,
            "slug": assignment.profile_slug,
            "portrait": (
                {"url": photo_url, "alt": f"{person.display_name}, {role}"}
                if photo_url
                else None
            ),
            "display_order": assignment.display_order,
            "is_acting": assignment.is_acting,
            "profile_summary": assignment.profile_summary,
        }

    @staticmethod
    async def public_university_council(db: AsyncSession) -> dict:
        board = await GovernanceService.get_university_council_board(db)
        if board is None:
            raise ValueError("University Council not found")
        page = await GovernanceService.get_council_page_content(db, board.id)
        members = await GovernanceService.list_council_members(db, public_only=True)
        grouped = {"chairperson": [], "member": [], "secretary": []}
        for member in members:
            grouped[GovernanceService._role_group(member)].append(GovernanceService._member_card(member))
        hero_image = getattr(page, "hero_image", None) if page else None
        hero_url = getattr(hero_image, "url", None)
        return {
            "page": {
                "title": getattr(page, "title", None) or board.name,
                "description": getattr(page, "intro", None) or board.description,
                "hero_image": {"url": hero_url, "alt": getattr(hero_image, "alt_text", None) or board.name} if hero_url else None,
                "breadcrumb": ["Home", "About KSU", getattr(page, "title", None) or board.name],
            },
            "mandate": {
                "label": getattr(page, "mandate_label", None) or "Our Mandate",
                "heading": getattr(page, "mandate_heading", None) or "Our Mandate",
                "description": getattr(page, "mandate_body", None) or board.description,
                "document_cta": {
                    "label": getattr(page, "document_cta_label", None),
                    "href": getattr(page, "document_cta_url", None),
                },
            },
            "chairperson": grouped["chairperson"][0] if grouped["chairperson"] else None,
            "members": grouped["member"],
            "secretary": grouped["secretary"][0] if grouped["secretary"] else None,
        }

    @staticmethod
    async def public_university_council_profile(db: AsyncSession, slug: str) -> dict | None:
        members = await GovernanceService.list_council_members(db, public_only=True)
        assignment = next((member for member in members if member.profile_slug == slug), None)
        if assignment is None:
            return None
        profile = GovernanceService._member_card(assignment)
        profile.update(
            {
                "official_designation": assignment.official_designation,
                "represented_institution": assignment.represented_institution,
                "current_office": assignment.current_office,
                "appointment_category": assignment.appointment_category,
                "is_ex_officio": assignment.is_ex_officio,
                "is_voting_member": assignment.is_voting_member,
            }
        )
        return profile
