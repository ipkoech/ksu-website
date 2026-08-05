"""Authentication models: User and Session."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .notification import Notification
    from .person import Person
    from .rbac import UserRole


class User(Base):
    """
    Portal user account for authentication.

    Separate from Person - a Person can exist without a User account
    (e.g., staff listed on website but no login), and a User links to
    their Person profile via person_id.
    """

    __tablename__ = "users"

    # Auth credentials
    email: Mapped[str] = mapped_column(sa.String(320), unique=True, nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), unique=True, nullable=True, index=True)
    password_hash: Mapped[str] = mapped_column(sa.String(255), nullable=False)

    # Profile basics (denormalized for quick access)
    full_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    push_tokens: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    # Account status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_verified: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    # MFA
    mfa_enabled: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    mfa_secret: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Tracking
    last_login_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    failed_login_attempts: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    locked_until: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Password reset
    password_reset_token: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    password_reset_expires: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Email verification
    email_verification_token: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Relationships
    sessions: Mapped[list["Session"]] = relationship(
        "Session",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    role_assignments: Mapped[list["UserRole"]] = relationship(
        "UserRole",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
        foreign_keys="UserRole.user_id",
    )
    person: Mapped[Optional["Person"]] = relationship(
        "Person",
        back_populates="user",
        uselist=False,
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    @property
    def roles(self) -> list[str]:
        """Return active role names for this user."""
        return [
            assignment.role.name
            for assignment in self.role_assignments
            if assignment.is_active and assignment.role and assignment.role.is_active
        ]

    def has_role(self, role_name: str) -> bool:
        """Check if user has a specific role."""
        return role_name in self.roles

    @property
    def is_locked(self) -> bool:
        """Check if account is currently locked."""
        if self.locked_until is None:
            return False
        return datetime.now(timezone.utc) < self.locked_until

    def __repr__(self) -> str:
        return f"<User {self.email}>"


class Session(Base):
    """
    JWT session tracking for token revocation and device management.
    """

    __tablename__ = "sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # JWT identifier for revocation
    jti: Mapped[str] = mapped_column(sa.String(64), nullable=False, unique=True, index=True)

    # Token type
    token_type: Mapped[str] = mapped_column(
        sa.String(16),
        nullable=False,
        server_default="access",
    )  # access | refresh

    # Device/client info
    ip_address: Mapped[Optional[str]] = mapped_column(sa.String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    device_name: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    device_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)  # web | mobile | api

    # Lifecycle
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    revoked_reason: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)  # logout | password_change | admin | expired
    last_used_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="sessions")

    def is_valid(self) -> bool:
        """Check if session is still valid."""
        if not self.is_active or self.revoked_at:
            return False
        if self.expires_at:
            now = datetime.now(timezone.utc)
            if now >= self.expires_at:
                return False
        return True

    def revoke(self, reason: str = "logout") -> None:
        """Revoke this session."""
        self.revoked_at = datetime.now(timezone.utc)
        self.revoked_reason = reason
        self.is_active = False

    def touch(self) -> None:
        """Update last used timestamp."""
        self.last_used_at = datetime.now(timezone.utc)

    def __repr__(self) -> str:
        return f"<Session user_id={self.user_id} jti={self.jti[:8]}...>"


__all__ = ["User", "Session"]
