"""Celery tasks for auth and transactional emails."""

from __future__ import annotations

from ksu_common.task_queue import run_worker_async
from ..helpers.email import send_account_created_email, send_password_reset, send_verification_email
from .celery_app import celery_app


@celery_app.task(
    name="main.email.send_password_reset",
)
def queue_password_reset_email(email: str, token: str, frontend_service: str | None = None) -> str:
    return run_worker_async(send_password_reset(email, token, frontend_service=frontend_service))


@celery_app.task(
    name="main.email.send_verification",
)
def queue_verification_email(email: str, token: str) -> str:
    return run_worker_async(send_verification_email(email, token))


@celery_app.task(
    name="main.email.send_account_created",
)
def queue_account_created_email(email: str, full_name: str, temporary_password: str | None = None) -> str:
    return run_worker_async(send_account_created_email(email, full_name, temporary_password))
