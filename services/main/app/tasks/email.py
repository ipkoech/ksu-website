"""Celery tasks for auth and transactional emails."""

from __future__ import annotations

import asyncio
import smtplib

from ..helpers.email import send_account_created_email, send_password_reset, send_verification_email
from .celery_app import celery_app


@celery_app.task(
    bind=True,
    name="main.email.send_password_reset",
    autoretry_for=(smtplib.SMTPException, TimeoutError, OSError, ConnectionError),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    max_retries=5,
)
def queue_password_reset_email(self, email: str, token: str, frontend_service: str | None = None) -> str:
    return asyncio.run(send_password_reset(email, token, frontend_service=frontend_service))


@celery_app.task(
    bind=True,
    name="main.email.send_verification",
    autoretry_for=(smtplib.SMTPException, TimeoutError, OSError, ConnectionError),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    max_retries=5,
)
def queue_verification_email(self, email: str, token: str) -> str:
    return asyncio.run(send_verification_email(email, token))


@celery_app.task(
    bind=True,
    name="main.email.send_account_created",
    autoretry_for=(smtplib.SMTPException, TimeoutError, OSError, ConnectionError),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    max_retries=5,
)
def queue_account_created_email(self, email: str, full_name: str, temporary_password: str | None = None) -> str:
    return asyncio.run(send_account_created_email(email, full_name, temporary_password))
