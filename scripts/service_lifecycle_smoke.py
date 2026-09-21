#!/usr/bin/env python3
"""Verify actual service construction and lifespan cleanup without external calls."""

from __future__ import annotations

import subprocess
import sys

from ci_environment import REPO, SCHEMA_OF, service_environment

PROBE = r'''
import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock
import app.main as module

async def exercise(failure):
    names = ["close_gemini_transports", "close_integration_pool", "close_redis"]
    if hasattr(module, "close_email_transport"):
        names.append("close_email_transport")
    mocks = []
    for name in names:
        mock = AsyncMock()
        setattr(module, name, mock)
        mocks.append(mock)
    module.engine = SimpleNamespace(dispose=AsyncMock())
    mocks.append(module.engine.dispose)
    if hasattr(module, "subscriber"):
        module.subscriber.start = AsyncMock()
        module.subscriber.stop = AsyncMock()
        module.manager.close_all = AsyncMock()
        mocks.extend([module.subscriber.stop, module.manager.close_all])
    if failure:
        module.close_integration_pool.side_effect = RuntimeError("test close failure")
    app = module.create_app()
    try:
        async with module.lifespan(app):
            assert app.routes
    except ExceptionGroup as error:
        assert failure
        assert len(error.exceptions) == 1
        assert str(error.exceptions[0]) == "test close failure"
    else:
        assert not failure
    for mock in mocks:
        mock.assert_awaited_once()

asyncio.run(exercise(False))
asyncio.run(exercise(True))
print("lifecycle construction/cleanup: ok")
'''


def main() -> int:
    for service in SCHEMA_OF:
        environment = service_environment(service)
        environment["PYTHONPATH"] = str(REPO / "services" / service)
        result = subprocess.run(
            [sys.executable, "-c", PROBE], cwd=REPO / "services" / service,
            env=environment, capture_output=True, text=True, check=False,
        )
        if result.returncode:
            print(result.stdout)
            print(result.stderr, file=sys.stderr)
            return result.returncode
        print(f"{service}: lifecycle construction/cleanup passed", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
