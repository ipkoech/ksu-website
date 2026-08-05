from __future__ import annotations

import sys
from types import ModuleType, SimpleNamespace

import pytest

from ksu_common.gemini import GeminiTransport


class _Models:
    def __init__(self) -> None:
        self.calls = 0

    def generate_content(self, **kwargs):
        self.calls += 1
        assert kwargs["model"] == "test-model"
        assert kwargs["config"] == {
            "temperature": 0.2,
            "max_output_tokens": 10,
            "response_mime_type": "text/plain",
        }
        return type("Response", (), {"text": " grounded answer "})()


class _AsyncModels:
    def __init__(self, models: _Models) -> None:
        self.models = models

    async def generate_content(self, **kwargs):
        return self.models.generate_content(**kwargs)


class _Client:
    def __init__(self) -> None:
        self.models = _Models()
        self.aio = type("AsyncClient", (), {"models": _AsyncModels(self.models)})()
        self.closed = False

    def close(self) -> None:
        self.closed = True


@pytest.mark.asyncio
async def test_gemini_transport_reuses_client_and_is_bounded(monkeypatch: pytest.MonkeyPatch):
    google_module = ModuleType("google")
    genai_module = ModuleType("google.genai")
    genai_module.types = SimpleNamespace(GenerateContentConfig=lambda **kwargs: kwargs)
    google_module.genai = genai_module
    monkeypatch.setitem(sys.modules, "google", google_module)
    monkeypatch.setitem(sys.modules, "google.genai", genai_module)

    clients: list[_Client] = []

    def factory(_api_key: str) -> _Client:
        client = _Client()
        clients.append(client)
        return client

    transport = GeminiTransport(
        api_key="test-key",
        model="test-model",
        timeout_seconds=5,
        client_factory=factory,
    )
    assert await transport.generate(
        "one", temperature=0.2, max_output_tokens=10, response_mime_type="text/plain"
    ) == "grounded answer"
    assert await transport.generate(
        "two", temperature=0.2, max_output_tokens=10, response_mime_type="text/plain"
    ) == "grounded answer"

    assert len(clients) == 1
    assert clients[0].models.calls == 2
    await transport.close()
    assert clients[0].closed
