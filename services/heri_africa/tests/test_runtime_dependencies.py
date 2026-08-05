from pathlib import Path
import tomllib


def test_email_schema_runtime_dependency_is_declared():
    pyproject_path = Path(__file__).resolve().parents[1] / "pyproject.toml"
    project = tomllib.loads(pyproject_path.read_text())["project"]

    assert any(
        dependency.split("[", 1)[0].split(">", 1)[0].split("=", 1)[0]
        == "email-validator"
        for dependency in project["dependencies"]
    )
