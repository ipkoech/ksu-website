"""Role-Based Access Control models: Role, Permission, UserRole, RolePermission."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .auth import User


class Permission(Base):
    """
    Individual permission representing an action on a resource.

    Format: ``resource.action``; for example, ``academic.manage_programmes``.
    """

    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    resource: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)  # academic, library, admin
    action: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)  # read, write, delete, manage
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))

    # Relationships
    role_permissions: Mapped[list["RolePermission"]] = relationship(
        "RolePermission",
        back_populates="permission",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Permission {self.name}>"


class Role(Base):
    """
    Role that groups permissions together.

    Examples: admin, librarian, dean, hod, lecturer, student
    """

    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(sa.String(64), unique=True, nullable=False, index=True)
    display_name: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    is_system: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))

    # Relationships
    role_permissions: Mapped[list["RolePermission"]] = relationship(
        "RolePermission",
        back_populates="role",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    user_assignments: Mapped[list["UserRole"]] = relationship(
        "UserRole",
        back_populates="role",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    @property
    def permissions(self) -> list[str]:
        """Return all permission names granted to this role."""
        return [
            rp.permission.name
            for rp in self.role_permissions
            if rp.permission and rp.permission.is_active
        ]

    def has_permission(self, permission_name: str) -> bool:
        """Check if role has a specific permission."""
        return permission_name in self.permissions

    def __repr__(self) -> str:
        return f"<Role {self.name}>"


class RolePermission(Base):
    """
    Many-to-many link between Role and Permission.
    """

    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("permissions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    role: Mapped["Role"] = relationship("Role", back_populates="role_permissions")
    permission: Mapped["Permission"] = relationship("Permission", back_populates="role_permissions")

    __table_args__ = (
        sa.UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )

    def __repr__(self) -> str:
        return f"<RolePermission role_id={self.role_id} permission_id={self.permission_id}>"


class UserRole(Base):
    """
    Assignment of a Role to a User, optionally scoped to an entity.

    Supports:
    - Global roles: scope_type=None, scope_id=None (e.g., "admin" for entire system)
    - Scoped roles: scope_type="school", scope_id=<school_id> (e.g., "dean" for specific school)
    """

    __tablename__ = "user_roles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Optional scope for entity-level roles
    scope_type: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
        index=True,
    )  # university | division | wing | school | department | library
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Assignment metadata
    assigned_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    assigned_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    note: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="role_assignments",
        foreign_keys=[user_id],
    )
    role: Mapped["Role"] = relationship("Role", back_populates="user_assignments")
    assigned_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_by_id])

    __table_args__ = (
        sa.Index("ix_user_roles_scope", "scope_type", "scope_id"),
        sa.UniqueConstraint("user_id", "role_id", "scope_type", "scope_id", name="uq_user_role_scope"),
    )

    @property
    def is_global(self) -> bool:
        """Check if this is a global (non-scoped) role assignment."""
        return self.scope_type is None and self.scope_id is None

    def __repr__(self) -> str:
        scope = f" scope={self.scope_type}:{self.scope_id}" if self.scope_type else ""
        return f"<UserRole user_id={self.user_id} role_id={self.role_id}{scope}>"


__all__ = ["Permission", "Role", "RolePermission", "UserRole"]
