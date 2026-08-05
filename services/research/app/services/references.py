"""Cross-service reference validation helpers.

Research owns research records, but several fields intentionally reference
main-service records by UUID. Validation is application-level and configurable;
there are no cross-service database foreign keys.
"""

from __future__ import annotations

import logging
import uuid
from collections.abc import Mapping

from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings

logger = logging.getLogger(__name__)


class ReferenceValidationError(ValueError):
    """Raised when a referenced main-service record does not exist."""


class MainReferenceValidator:
    """Validate UUID references against the main service internal API."""

    @staticmethod
    async def validate(payload: Mapping[str, object], reference_fields: Mapping[str, str]) -> None:
        settings = get_settings()
        mode = settings.REFERENCE_VALIDATION_MODE.lower()
        if mode == "disabled" or not reference_fields:
            return

        references = [
            (field, kind, value)
            for field, kind in reference_fields.items()
            if (value := payload.get(field)) is not None
        ]
        if not references:
            return

        if not settings.MAIN_SERVICE_API_KEY:
            if mode == "strict":
                raise ReferenceValidationError("Main-service authentication is not configured")
            logger.warning("Reference validation skipped because Main-service authentication is not configured")
            return

        pool = get_integration_pool()
        for field, kind, value in references:
            try:
                ref_id = value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))
                response = await pool.request_internal(
                    "research-main-reference-validation",
                    settings.MAIN_SERVICE_URL.rstrip("/"),
                    "GET",
                    f"/api/v1/internal/references/{kind}/{ref_id}",
                    api_key=settings.MAIN_SERVICE_API_KEY,
                    timeout=settings.REFERENCE_VALIDATION_TIMEOUT_SECONDS,
                )
                if response.status_code == 404:
                    raise ReferenceValidationError(f"{field} references missing main {kind} record")
                response.raise_for_status()
            except ReferenceValidationError:
                if mode == "strict":
                    raise
                logger.warning("Reference validation failed for %s=%s kind=%s", field, value, kind)
            except Exception as exc:
                if mode == "strict":
                    raise ReferenceValidationError(f"Could not validate {field} against main service") from exc
                logger.warning("Reference validation skipped for %s=%s kind=%s: %s", field, value, kind, exc)

    @staticmethod
    async def validate_department_school(
        school_id: uuid.UUID,
        department_id: uuid.UUID | None,
    ) -> None:
        """Confirm a department is owned by the JWT-derived school."""
        if department_id is None:
            return
        settings = get_settings()
        mode = settings.REFERENCE_VALIDATION_MODE.lower()
        if mode == "disabled":
            return
        if not settings.MAIN_SERVICE_API_KEY:
            if mode == "strict":
                raise ReferenceValidationError("Main-service authentication is not configured")
            logger.warning("Department-school validation skipped because Main-service authentication is not configured")
            return
        try:
            response = await get_integration_pool().request_internal(
                "research-main-reference-validation",
                settings.MAIN_SERVICE_URL.rstrip("/"),
                "GET",
                f"/api/v1/internal/schools/{school_id}/departments/{department_id}",
                api_key=settings.MAIN_SERVICE_API_KEY,
                timeout=settings.REFERENCE_VALIDATION_TIMEOUT_SECONDS,
            )
            if response.status_code == 404:
                raise ReferenceValidationError(
                    "department_id does not belong to the assigned school"
                )
            response.raise_for_status()
        except ReferenceValidationError:
            if mode == "strict":
                raise
            logger.warning(
                "Department-school validation failed for school=%s department=%s",
                school_id,
                department_id,
            )
        except Exception as exc:
            if mode == "strict":
                raise ReferenceValidationError(
                    "Could not validate department ownership against main service"
                ) from exc
            logger.warning(
                "Department-school validation skipped for school=%s department=%s: %s",
                school_id,
                department_id,
                exc,
            )
