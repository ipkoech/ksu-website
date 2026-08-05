from __future__ import annotations

from email.message import EmailMessage

import pytest

from ksu_common.smtp import SmtpConfig, SmtpTransport


class _FakeSmtp:
    instances: list["_FakeSmtp"] = []

    def __init__(self, host: str, port: int, *, timeout: float) -> None:
        self.host = host
        self.port = port
        self.timeout = timeout
        self.messages: list[EmailMessage] = []
        self.closed = False
        self.__class__.instances.append(self)

    def ehlo(self) -> None:
        return None

    def starttls(self) -> None:
        return None

    def login(self, username: str, password: str) -> None:
        assert (username, password) == ("user", "password")

    def send_message(self, message: EmailMessage) -> dict[str, str]:
        self.messages.append(message)
        return {}

    def quit(self) -> None:
        self.closed = True

    def close(self) -> None:
        self.closed = True


@pytest.mark.asyncio
async def test_smtp_transport_reuses_connection_and_adds_correlation_headers(monkeypatch):
    _FakeSmtp.instances.clear()
    monkeypatch.setattr("ksu_common.smtp.smtplib.SMTP", _FakeSmtp)
    transport = SmtpTransport(
        SmtpConfig("smtp.example", 587, "user", "password")
    )

    first = EmailMessage()
    first["To"] = "one@example.com"
    first_result = await transport.send(first, request_id="req-1", correlation_id="corr-1")
    second = EmailMessage()
    second["To"] = "two@example.com"
    await transport.send(second)

    assert first_result == "smtp:smtp.example:one@example.com"
    assert len(_FakeSmtp.instances) == 1
    assert first["X-Request-ID"] == "req-1"
    assert first["X-Correlation-ID"] == "corr-1"
    assert len(_FakeSmtp.instances[0].messages) == 2
    await transport.close()
    assert _FakeSmtp.instances[0].closed
