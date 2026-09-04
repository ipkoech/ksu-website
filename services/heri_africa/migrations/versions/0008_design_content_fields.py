"""Add structured content and presentation fields for the Chair website."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0008_design_content_fields"
down_revision = "0007_chair_profile"
branch_labels = None
depends_on = None


def _add(table: str, column: sa.Column) -> None:
    op.add_column(table, column, schema="heri")


def upgrade() -> None:
    for name, typ in (("title", sa.String(255)), ("eyebrow", sa.String(160)), ("description", sa.Text()), ("background_variant", sa.String(40),), ("image_url", sa.String(500)), ("cta_label", sa.String(120)), ("cta_href", sa.String(500))):
        _add("page_sections", sa.Column(name, typ, nullable=False, server_default="default" if name == "background_variant" else None))
    for name, typ in (("title", sa.String(120)), ("education", sa.Text()), ("research_interests", sa.Text()), ("email", sa.String(320))):
        _add("team_members", sa.Column(name, typ, nullable=True))
    for name in ("expertise", "social_links"):
        _add("team_members", sa.Column(name, postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    _add("team_members", sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    for table, fields in {
        "research_projects": [("cover_image_url", sa.String(500)), ("start_date", sa.DateTime(timezone=True)), ("end_date", sa.DateTime(timezone=True)), ("objectives", sa.Text()), ("methodology", sa.Text())],
        "research_publications": [("cover_image_url", sa.String(500)), ("publication_date", sa.DateTime(timezone=True)), ("publication_type", sa.String(80)), ("theme_id", sa.UUID())],
        "events": [("event_type", sa.String(80)), ("featured_image_url", sa.String(500)), ("virtual_url", sa.String(500))],
        "opportunities": [("description", sa.Text()), ("eligibility", sa.Text()), ("application_instructions", sa.Text()), ("opportunity_type", sa.String(80)), ("featured_image_url", sa.String(500))],
    }.items():
        for name, typ in fields:
            _add(table, sa.Column(name, typ, nullable=True))
    for table in ("research_projects", "research_publications", "events", "opportunities"):
        _add(table, sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")))
        _add(table, sa.Column("position", sa.Integer(), nullable=False, server_default="0"))
    _add("events", sa.Column("is_virtual", sa.Boolean(), nullable=False, server_default=sa.text("false")))


def downgrade() -> None:
    for table, names in {
        "page_sections": ["title", "eyebrow", "description", "background_variant", "image_url", "cta_label", "cta_href"],
        "team_members": ["title", "expertise", "education", "research_interests", "email", "social_links", "is_featured"],
        "research_projects": ["cover_image_url", "start_date", "end_date", "objectives", "methodology", "is_featured", "position"],
        "research_publications": ["cover_image_url", "publication_date", "publication_type", "theme_id", "is_featured", "position"],
        "events": ["event_type", "featured_image_url", "is_virtual", "virtual_url", "is_featured", "position"],
        "opportunities": ["description", "eligibility", "application_instructions", "opportunity_type", "featured_image_url", "is_featured", "position"],
    }.items():
        for name in reversed(names):
            op.drop_column(table, name, schema="heri")
