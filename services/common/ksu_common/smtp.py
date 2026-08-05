"""Bounded, connection-reusing SMTP transport for service email adapters."""

from __future__ import annotations

import asyncio
import smtplib
import threading
from dataclasses import dataclass
from email.message import EmailMessage

from .observability import Metrics
from .reliability import CircuitBreaker, CircuitOpenError


@dataclass(frozen=True, slots=True)
class SmtpConfig:
    host: str
    port: int
    username: str
    password: str
    use_tls: bool = True
    timeout_seconds: float = 30.0

    def __post_init__(self) -> None:
        if not self.host.strip():
            raise ValueError("SMTP host must not be empty")
        if not 1 <= self.port <= 65535:
            raise ValueError("SMTP port must be between 1 and 65535")
        if not self.username.strip() or not self.password:
            raise ValueError("SMTP credentials are required")
        if not 0 < self.timeout_seconds <= 120:
            raise ValueError("SMTP timeout must be greater than 0 and at most 120 seconds")


class SmtpTransport:
    """Reuse one authenticated SMTP connection and never retry a send implicitly.

    SMTP delivery is not assumed idempotent: a timeout can occur after the server
    accepts a message. Callers must decide whether an application-level delivery
    record permits a retry.
    """

    def __init__(self, config: SmtpConfig, *, metrics: Metrics | None = None) -> None:
        self.config = config
        self.metrics = metrics or Metrics()
        self.circuit = CircuitBreaker(failure_exceptions=(Exception,))
        self._connection: smtplib.SMTP | None = None
        self._lock = threading.RLock()

    async def send(
        self,
        message: EmailMessage,
        *,
        request_id: str | None = None,
        correlation_id: str | None = None,
    ) -> str:
        if request_id and not message.get("X-Request-ID"):
            message["X-Request-ID"] = request_id
        if correlation_id and not message.get("X-Correlation-ID"):
            message["X-Correlation-ID"] = correlation_id
        async def operation() -> str:
            return await asyncio.to_thread(self._send_sync, message)

        try:
            return await self.circuit.call(operation)
        except CircuitOpenError as exc:
            self.metrics.increment(
                "integration_failures_total",
                tags={"integration": "smtp", "operation": "send", "error": type(exc).__name__},
            )
            raise

    def _connect_sync(self) -> smtplib.SMTP:
        connection = smtplib.SMTP(
            self.config.host,
            self.config.port,
            timeout=self.config.timeout_seconds,
        )
        try:
            connection.ehlo()
            if self.config.use_tls:
                connection.starttls()
                connection.ehlo()
            connection.login(self.config.username, self.config.password)
        except BaseException:
            try:
                connection.close()
            except OSError:
                pass
            raise
        return connection

    def _send_sync(self, message: EmailMessage) -> str:
        with self._lock:
            try:
                if self._connection is None:
                    self._connection = self._connect_sync()
                rejected = self._connection.send_message(message)
                if rejected:
                    raise smtplib.SMTPRecipientsRefused(rejected)
                return f"smtp:{self.config.host}:{message['To']}"
            except BaseException as exc:
                self.metrics.increment(
                    "integration_failures_total",
                    tags={"integration": "smtp", "operation": "send", "error": type(exc).__name__},
                )
                self._close_sync()
                raise

    async def close(self) -> None:
        await asyncio.to_thread(self._close_sync)

    def _close_sync(self) -> None:
        with self._lock:
            connection = self._connection
            self._connection = None
            if connection is not None:
                try:
                    connection.quit()
                except (OSError, smtplib.SMTPException):
                    try:
                        connection.close()
                    except OSError:
                        pass


__all__ = ["SmtpConfig", "SmtpTransport"]
