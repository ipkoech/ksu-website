"""Research test process defaults."""

from __future__ import annotations

import os
import sys
from pathlib import Path

SERVICE_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = SERVICE_DIR.parents[1]

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

os.environ.setdefault("LOG_DIR", "/tmp/ksu-research-test-logs")
os.environ.setdefault("EXPORT_DIR", "/tmp/ksu-research-test-exports")
