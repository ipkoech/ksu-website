"""Merge the command-idempotency branch with the portal-features branch.

The backend-hardening worktree applied 20260805_0040 to the shared
database while dev grew 20260805_0400..0600 from the same parent;
this empty merge revision reunifies the two heads.
"""

revision = "20260805_0700"
down_revision = ("20260805_0040", "20260805_0600")
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
