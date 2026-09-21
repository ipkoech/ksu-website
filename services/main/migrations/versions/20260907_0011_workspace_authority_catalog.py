"""Register explicit workspace authorities without granting account access.

Existing assignments must be reviewed before granting research.oversight or
platform.admin. A role name or unrelated management capability is insufficient.
"""

import uuid

from alembic import op
import sqlalchemy as sa

revision = "20260907_0011"
down_revision = "20260906_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("SET LOCAL lock_timeout = '5s'")
    for name, description in (
        ("platform.admin", "Explicit platform-wide workspace authority"),
        ("research.oversight", "Explicit oversight across Research domains"),
    ):
        resource, action = name.split(".")
        op.get_bind().execute(sa.text(
            "INSERT INTO permissions (id, name, description, resource, action, is_active) "
            "VALUES (:id, :name, :description, :resource, :action, true) "
            "ON CONFLICT (name) DO NOTHING"
        ), {"id": uuid.uuid4(), "name": name, "description": description,
            "resource": resource, "action": action})


def downgrade() -> None:
    # Preserve any reviewed assignments made after upgrade. Catalog additions
    # are harmless when the older application does not understand these names.
    pass
