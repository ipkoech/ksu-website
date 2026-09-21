"""Public relationship reads must not surface unpublished research rows."""

import asyncio
import uuid

from sqlalchemy.dialects import postgresql

from app.models import (
    Funding,
    Grant,
    Partner,
    ResearchProject,
    ResearchTheme,
    SuccessStory,
)
from app.schemas.core import ResearchProjectPublicDetail
from app.services._crud import apply_public_visibility
from app.services.core import CenterRelationshipService


def _sql(statement) -> str:
    return str(statement.compile(dialect=postgresql.dialect()))


def test_public_filter_requires_project_visibility_and_public_status():
    statement = apply_public_visibility(ResearchProject, ResearchProject.active_query())
    rendered = _sql(statement)

    assert "research_projects.deleted_at IS NULL" in rendered
    assert "research_projects.is_public IS true" in rendered
    assert "research_projects.is_active IS true" in rendered
    assert "research_projects.status IN" in rendered


def test_public_filter_is_reused_for_relationship_rows():
    statement = apply_public_visibility(
        SuccessStory,
        SuccessStory.active_query().where(SuccessStory.project_id == ResearchProject.id),
    )
    rendered = _sql(statement)

    assert "success_stories.deleted_at IS NULL" in rendered
    assert "success_stories.status IN" in rendered


def test_partner_public_filter_requires_active_public_record():
    statement = apply_public_visibility(Partner, Partner.active_query())
    rendered = _sql(statement)

    assert "partners.deleted_at IS NULL" in rendered
    assert "partners.status IN" in rendered


def test_center_partner_batch_relationships_use_one_bounded_query():
    center_id = uuid.uuid4()
    partner_id = uuid.uuid4()
    partner = Partner(
        id=partner_id,
        name="Climate Partner",
        slug="climate-partner",
        partner_type="academic",
        status="active",
        is_active=True,
        display_order=1,
    )

    class Result:
        def all(self):
            return [
                (
                    center_id,
                    "climate-center",
                    partner,
                    "technical",
                    None,
                    None,
                    None,
                    "active",
                    None,
                    None,
                )
            ]

    class Database:
        statement = None

        async def execute(self, statement):
            self.statement = statement
            return Result()

    db = Database()
    rows = asyncio.run(CenterRelationshipService.list_partner_links(db, [center_id]))

    assert rows[0]["center_id"] == center_id
    assert rows[0]["center_slug"] == "climate-center"
    assert rows[0]["id"] == partner_id
    rendered = _sql(db.statement)
    assert "research.center_partners.center_id IN" in rendered
    assert "research.partners.status IN" in rendered


def test_grant_public_filter_excludes_drafts():
    statement = apply_public_visibility(Grant, Grant.active_query())
    rendered = _sql(statement)

    assert "grants.deleted_at IS NULL" in rendered
    assert "grants.is_active IS true" in rendered
    assert "grants.status IN" in rendered


def test_funding_public_filter_requires_active_record():
    statement = apply_public_visibility(Funding, Funding.active_query())
    rendered = _sql(statement)

    assert "fundings.deleted_at IS NULL" in rendered
    assert "fundings.is_active IS true" in rendered


def test_theme_public_filter_requires_active_record():
    statement = apply_public_visibility(ResearchTheme, ResearchTheme.active_query())
    rendered = _sql(statement)

    assert "research_themes.deleted_at IS NULL" in rendered
    assert "research_themes.is_active IS true" in rendered


def test_public_project_schema_drops_orm_only_columns():
    payload = ResearchProjectPublicDetail.model_validate(
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "created_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:00:00Z",
            "title": "Visible project",
            "slug": "visible-project",
            "project_type": "applied",
            "status": "ongoing",
            "progress_percentage": 10,
            "is_active": True,
            "is_featured": False,
            "is_public": True,
            "display_order": 1,
            "currency": "KES",
            "deleted_at": "2026-01-02T00:00:00Z",
        }
    )

    assert not hasattr(payload, "deleted_at")
