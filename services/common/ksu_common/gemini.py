"""Shared Gemini transport; prompt and response policy remain service-owned."""

from __future__ import annotations

import asyncio
import inspect
import threading
from collections.abc import Callable
from typing import Any

from .observability import Metrics
from .reliability import CircuitBreaker, TimeoutConfig


class GeminiTransport:
    """Reuse a Gemini SDK client with bounded, non-retried generation calls."""

    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        timeout_seconds: float,
        metrics: Metrics | None = None,
        client_factory: Callable[[str], Any] | None = None,
    ) -> None:
        self.api_key = api_key
        self.model = model
        self.timeout = TimeoutConfig(total=timeout_seconds, maximum=120.0)
        self.metrics = metrics or Metrics()
        self.circuit = CircuitBreaker(
            failure_exceptions=(Exception,)
        )
        self._client_factory = client_factory or self._default_client_factory
        self._client: Any | None = None
        self._client_lock = threading.Lock()

    def _default_client_factory(self, api_key: str) -> Any:
        from google import genai
        from google.genai import types

        return genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=int(self.timeout.total * 1000),
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        )

    def _get_client(self) -> Any:
        if self._client is None:
            with self._client_lock:
                if self._client is None:
                    self._client = self._client_factory(self.api_key)
        return self._client

    async def generate(
        self,
        prompt: str,
        *,
        temperature: float,
        max_output_tokens: int,
        response_mime_type: str,
    ) -> str:
        async def operation() -> str:
            return await asyncio.wait_for(
                self._generate_async(
                    prompt,
                    temperature,
                    max_output_tokens,
                    response_mime_type,
                ),
                timeout=self.timeout.total,
            )

        try:
            return await self.circuit.call(operation)
        except Exception as exc:
            self.metrics.increment(
                "integration_failures_total",
                tags={"integration": "gemini", "operation": "generate", "error": type(exc).__name__},
            )
            raise

    async def _generate_async(
        self,
        prompt: str,
        temperature: float,
        max_output_tokens: int,
        response_mime_type: str,
    ) -> str:
        client = self._get_client()
        aio_models = getattr(getattr(client, "aio", None), "models", None)
        if aio_models is None or not callable(getattr(aio_models, "generate_content", None)):
            raise RuntimeError("Gemini async client is unavailable")

        from google.genai import types

        response = await aio_models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
                response_mime_type=response_mime_type,
            ),
        )
        text = getattr(response, "text", "")
        return text.strip() if isinstance(text, str) else ""

    async def close(self) -> None:
        client = self._client
        self._client = None
        if client is None:
            return
        aio_close = getattr(getattr(client, "aio", None), "aclose", None)
        aio_close = aio_close or getattr(getattr(client, "aio", None), "close", None)
        if callable(aio_close):
            result = aio_close()
            if inspect.isawaitable(result):
                await result
        close = getattr(client, "close", None)
        if callable(close):
            await asyncio.to_thread(close)


_transports: dict[tuple[str, str, float], GeminiTransport] = {}
_transports_lock = threading.Lock()


def get_gemini_transport(
    *,
    api_key: str,
    model: str,
    timeout_seconds: float,
) -> GeminiTransport:
    if not api_key.strip():
        raise ValueError("Gemini API key is required")
    key = (api_key, model, timeout_seconds)
    with _transports_lock:
        transport = _transports.get(key)
        if transport is None:
            transport = GeminiTransport(
                api_key=api_key,
                model=model,
                timeout_seconds=timeout_seconds,
            )
            _transports[key] = transport
        return transport


async def close_gemini_transports() -> None:
    with _transports_lock:
        transports = tuple(_transports.values())
        _transports.clear()
    if transports:
        await asyncio.gather(*(transport.close() for transport in transports))


__all__ = ["GeminiTransport", "close_gemini_transports", "get_gemini_transport"]
