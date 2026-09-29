"""Bounded, all-or-error CSV/JSON export formatting, including Excel safety."""
from __future__ import annotations

import csv
import io
import json
import re
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

MAX_EXPORT_ROWS = 100_000
MAX_EXPORT_BYTES = 50 * 1024 * 1024


class ExportTooLarge(ValueError):
    pass


def json_value(value):
    if isinstance(value, (Decimal, UUID)):
        return str(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    raise TypeError("Unsupported export value")


def csv_value(value) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        result = json.dumps(value, ensure_ascii=False, default=json_value, allow_nan=False)
    elif isinstance(value, bool):
        result = "true" if value else "false"
    else:
        result = str(value)
    if re.sub(r"^[\s\ufeff]+", "", result).startswith(("=", "+", "-", "@")):
        result = "'" + result
    return result


class ExportBuffer:
    """Do not offer a download until the complete bounded query has succeeded."""
    def __init__(self, fields: list[str], format: str, *, max_rows=MAX_EXPORT_ROWS, max_bytes=MAX_EXPORT_BYTES):
        if format not in {"csv", "json"}:
            raise ValueError("Unsupported export format")
        self.fields, self.format = fields, format
        self.max_rows, self.max_bytes = max_rows, max_bytes
        self.count = 0
        self.output = io.BytesIO()
        self.append("\ufeff" if format == "csv" else "[")
        if format == "csv":
            self.append(self.csv_line(fields))

    @staticmethod
    def csv_line(cells):
        out = io.StringIO(newline="")
        csv.writer(out, lineterminator="\r\n").writerow(cells)
        return out.getvalue()

    def append(self, text: str):
        data = text.encode("utf-8")
        if self.output.tell() + len(data) > self.max_bytes:
            raise ExportTooLarge("Export exceeds 50 MiB. Narrow the filters and try again.")
        self.output.write(data)

    def add(self, record: dict):
        if self.count >= self.max_rows:
            raise ExportTooLarge("Export exceeds 100,000 rows. Narrow the filters and try again.")
        if self.format == "csv":
            self.append(self.csv_line(csv_value(record.get(key)) for key in self.fields))
        else:
            self.append((",\n" if self.count else "") + json.dumps(record, ensure_ascii=False, default=json_value, allow_nan=False))
        self.count += 1

    def finish(self) -> bytes:
        if self.format == "json":
            self.append("]")
        return self.output.getvalue()
