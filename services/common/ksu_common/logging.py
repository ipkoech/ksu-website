"""Shared service logging configuration."""

from __future__ import annotations

import json
import logging
import logging.config
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class JsonFormatter(logging.Formatter):
    """Format log records as compact JSON lines."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        if record.stack_info:
            payload["stack"] = self.formatStack(record.stack_info)
        return json.dumps(payload, default=str, separators=(",", ":"))


def configure_service_logging(
    *,
    service_name: str,
    log_dir: str | Path = "/app/logs",
    log_level: str = "INFO",
    log_format: str = "json",
    max_bytes: int = 10 * 1024 * 1024,
    backup_count: int = 5,
) -> Path:
    """Configure root, uvicorn, and audit logging for one service.

    Returns the created service log file path.
    """

    resolved_log_dir = Path(log_dir).expanduser()
    resolved_log_dir.mkdir(parents=True, exist_ok=True)
    log_file = resolved_log_dir / f"{service_name}.log"
    level = getattr(logging, log_level.upper(), logging.INFO)
    formatter = "json" if log_format.lower() == "json" else "text"

    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "json": {"()": JsonFormatter},
                "text": {
                    "format": "%(asctime)s %(levelname)s [%(name)s] %(message)s",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": formatter,
                    "level": level,
                },
                "file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "formatter": formatter,
                    "filename": str(log_file),
                    "maxBytes": max_bytes,
                    "backupCount": backup_count,
                    "encoding": "utf-8",
                    "level": level,
                },
            },
            "root": {
                "level": level,
                "handlers": ["console", "file"],
            },
            "loggers": {
                "uvicorn": {"level": level, "handlers": ["console", "file"], "propagate": False},
                "uvicorn.error": {"level": level, "handlers": ["console", "file"], "propagate": False},
                "uvicorn.access": {"level": level, "handlers": ["console", "file"], "propagate": False},
                "audit": {"level": level, "handlers": ["console", "file"], "propagate": False},
            },
        },
    )

    logging.getLogger(service_name).info("Logging initialized for %s at %s", service_name, log_file)
    return log_file
