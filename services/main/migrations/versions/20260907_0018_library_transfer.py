"""Register explicit Library ownership transfer authority without granting access."""

import uuid

import sqlalchemy as sa
from alembic import op

revision = "20260907_0018"
down_revision = "20260907_0017"
branch_labels = None
depends_on = None


def upgrade():
    op.get_bind().execute(sa.text(
        "INSERT INTO permissions (id, name, description, resource, action, is_active) "
        "VALUES (:id, 'library.transfer', 'Transfer Library record ownership', 'library', 'transfer', true) "
        "ON CONFLICT (name) DO NOTHING"
    ), {"id": uuid.uuid4()})


def downgrade():
    # Preserve any subsequently reviewed assignments, as for other catalog migrations.
    pass
