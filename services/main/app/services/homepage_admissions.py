"""Aggregate configuration for an intake's homepage admissions panel."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Intake, IntakeMilestone, IntakePublicAction
from ..schemas.admissions import (
    HomepageActionConfig,
    HomepageReportingConfig,
    IntakeHomepageAdmissionRead,
    IntakeHomepageAdmissionUpdate,
)


ACTION_FIELDS = {
    "apply": "apply",
    "check_requirements": "check_requirements",
    "explore_programmes": "explore_programmes",
    "admission_letter": "download_admission_letter",
    "reporting_instructions": "reporting_instructions",
}

INTAKE_CONFIG_FIELDS = (
    "is_featured_on_homepage",
    "homepage_priority",
    "application_opens_at",
    "application_closes_at",
    "late_application_closes_at",
    "late_applications_enabled",
    "application_override",
    "override_expires_at",
    "timezone",
)


class IntakeHomepageAdmissionService:
    """Read and update the single aggregate used by the intake admin UI."""

    @staticmethod
    async def get_intake(db: AsyncSession, intake_id: uuid.UUID) -> Intake | None:
        result = await db.execute(
            select(Intake)
            .options(
                selectinload(Intake.public_actions),
                selectinload(Intake.milestones),
            )
            .where(Intake.id == intake_id, Intake.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    @classmethod
    async def get_config(
        cls, db: AsyncSession, intake_id: uuid.UUID
    ) -> IntakeHomepageAdmissionRead | None:
        intake = await cls.get_intake(db, intake_id)
        return cls.serialize_config(intake) if intake is not None else None

    @classmethod
    async def update_config(
        cls,
        db: AsyncSession,
        intake: Intake,
        payload: IntakeHomepageAdmissionUpdate,
        actor_id: uuid.UUID,
        *,
        now: datetime | None = None,
    ) -> IntakeHomepageAdmissionRead:
        published_at = now or datetime.now(timezone.utc)
        supplied_fields = payload.model_fields_set

        for field_name in INTAKE_CONFIG_FIELDS:
            if field_name in supplied_fields:
                setattr(intake, field_name, getattr(payload, field_name))

        for config_field, action_type in ACTION_FIELDS.items():
            if config_field not in supplied_fields:
                continue
            config = getattr(payload, config_field)
            if config is not None:
                cls._upsert_action(
                    db,
                    intake,
                    action_type,
                    config,
                    actor_id,
                    published_at,
                )

        if "reporting" in supplied_fields and payload.reporting is not None:
            cls._upsert_reporting(
                db,
                intake,
                payload.reporting,
                actor_id,
                published_at,
            )

        await db.flush()
        return cls.serialize_config(intake)

    @classmethod
    def serialize_config(cls, intake: Intake) -> IntakeHomepageAdmissionRead:
        actions = {
            action_type: cls._find_action(intake, action_type)
            for action_type in ACTION_FIELDS.values()
        }
        reporting = cls._find_reporting(intake)
        return IntakeHomepageAdmissionRead(
            intake_id=intake.id,
            intake_name=intake.name,
            intake_code=intake.code,
            is_featured_on_homepage=intake.is_featured_on_homepage,
            homepage_priority=intake.homepage_priority,
            application_opens_at=intake.application_opens_at,
            application_closes_at=intake.application_closes_at,
            late_application_closes_at=intake.late_application_closes_at,
            late_applications_enabled=intake.late_applications_enabled,
            application_override=intake.application_override,
            override_expires_at=intake.override_expires_at,
            timezone=intake.timezone,
            **{
                config_field: cls._action_config(actions[action_type])
                for config_field, action_type in ACTION_FIELDS.items()
            },
            reporting=cls._reporting_config(reporting),
        )

    @staticmethod
    def _find_action(intake: Intake, action_type: str) -> IntakePublicAction | None:
        return next(
            (
                action
                for action in intake.public_actions
                if action.action_type == action_type
                and action.deleted_at is None
                and action.workflow_status != "archived"
            ),
            None,
        )

    @staticmethod
    def _find_reporting(intake: Intake) -> IntakeMilestone | None:
        return next(
            (
                milestone
                for milestone in intake.milestones
                if milestone.milestone_type == "reporting"
                and milestone.deleted_at is None
                and milestone.workflow_status != "archived"
            ),
            None,
        )

    @classmethod
    def _upsert_action(
        cls,
        db: AsyncSession,
        intake: Intake,
        action_type: str,
        config: HomepageActionConfig,
        actor_id: uuid.UUID,
        published_at: datetime,
    ) -> None:
        action = cls._find_action(intake, action_type)
        if action is None and not config.enabled:
            return
        if action is None:
            action = IntakePublicAction(
                intake_id=intake.id,
                action_type=action_type,
                label=config.label or "",
                target_url=config.url or "",
                created_by_id=actor_id,
            )
            intake.public_actions.append(action)
            db.add(action)

        action.is_enabled = config.enabled
        action.updated_by_id = actor_id
        if config.enabled:
            action.label = config.label or action.label
            action.target_url = config.url or action.target_url
            action.starts_at = config.starts_at
            action.ends_at = config.ends_at
            action.status = "published"
            action.workflow_status = "published"
            action.published_at = published_at
            action.published_by_id = actor_id

    @classmethod
    def _upsert_reporting(
        cls,
        db: AsyncSession,
        intake: Intake,
        config: HomepageReportingConfig,
        actor_id: uuid.UUID,
        published_at: datetime,
    ) -> None:
        milestone = cls._find_reporting(intake)
        if milestone is None and not config.enabled:
            return
        if milestone is None:
            milestone = IntakeMilestone(
                intake_id=intake.id,
                milestone_type="reporting",
                title=config.title,
                starts_at=config.starts_at,
                created_by_id=actor_id,
            )
            intake.milestones.append(milestone)
            db.add(milestone)

        milestone.is_public = config.enabled
        milestone.updated_by_id = actor_id
        if config.enabled:
            milestone.title = config.title
            milestone.starts_at = config.starts_at
            milestone.ends_at = config.ends_at
            milestone.location = config.location
            milestone.instructions_url = config.instructions_url
            milestone.status = "published"
            milestone.workflow_status = "published"
            milestone.published_at = published_at
            milestone.published_by_id = actor_id

    @staticmethod
    def _action_config(action: IntakePublicAction | None) -> HomepageActionConfig:
        if action is None:
            return HomepageActionConfig()
        return HomepageActionConfig(
            enabled=action.is_enabled,
            label=action.label,
            url=action.target_url,
            starts_at=action.starts_at,
            ends_at=action.ends_at,
        )

    @staticmethod
    def _reporting_config(milestone: IntakeMilestone | None) -> HomepageReportingConfig:
        if milestone is None:
            return HomepageReportingConfig()
        return HomepageReportingConfig(
            enabled=milestone.is_public,
            title=milestone.title,
            starts_at=milestone.starts_at,
            ends_at=milestone.ends_at,
            location=milestone.location,
            instructions_url=milestone.instructions_url,
        )


__all__ = ["IntakeHomepageAdmissionService"]
