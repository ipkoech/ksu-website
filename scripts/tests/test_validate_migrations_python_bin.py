from __future__ import annotations

import os
import subprocess
from pathlib import Path


ROOT = Path(__file__).parents[2]


def test_migration_validation_uses_configured_python_interpreter(tmp_path: Path) -> None:
    invocation_log = tmp_path / "python-invocations.log"
    python_bin = tmp_path / "migration-python"
    python_bin.write_text(
        "#!/usr/bin/env bash\n"
        "printf '%s\\n' \"$*\" >> \"${PYTHON_BIN_LOG}\"\n"
        "if [[ \"$2\" == \"alembic\" ]]; then\n"
        "  echo 'revision (head)'\n"
        "fi\n"
    )
    python_bin.chmod(0o755)

    result = subprocess.run(
        ["bash", "scripts/validate_migrations.sh", "main"],
        cwd=ROOT,
        env=os.environ
        | {
            "PYTHON_BIN": os.path.relpath(python_bin, ROOT),
            "PYTHON_BIN_LOG": str(invocation_log),
        },
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
    assert "migration source validation passed" in result.stdout
    assert "-m compileall -q services/main/migrations/versions" in invocation_log.read_text()
    assert "-m alembic heads" in invocation_log.read_text()
