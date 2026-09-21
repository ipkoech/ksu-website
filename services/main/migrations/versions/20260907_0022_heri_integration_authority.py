"""Register HERI synchronization authority without expanding assignments."""

import uuid

import sqlalchemy as sa
from alembic import op

revision = "20260907_0022"
down_revision = "20260907_0021"
branch_labels = None
depends_on = None


def upgrade():
    op.get_bind().execute(sa.text(
        "INSERT INTO permissions (id, name, description, resource, action, is_active) "
        "VALUES (:id, 'heri.integrations.sync', 'Synchronize HERI Research projections', "
        "'heri.integrations', 'sync', true) ON CONFLICT (name) DO NOTHING"
    ), {"id": uuid.uuid4()})


def downgrade():
    # Retain catalog entries that may be referenced by deliberate assignments.
    pass
