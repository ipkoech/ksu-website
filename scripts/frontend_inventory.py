"""Capture source evidence for frontend compatibility; does not prove runtime behavior."""

import argparse
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"
IMPORT = re.compile(r"(?:from\s+|import\s*)[\"']([^\"']+)[\"']")
SIGNALS = re.compile(
    r"\b(fetch\(|useQuery\(|useInfiniteQuery\(|useMutation\(|unstable_cache\(|"
    r"force-dynamic|force-static|revalidate|no-store|server-only|use client|"
    r"Promise\.race|AbortController|queryKey|invalidateQueries|/api/v1)"
)


def capture():
    packages = {}
    files = {}
    for group in ("apps", "packages"):
        for package in sorted((FRONTEND / group).iterdir()):
            manifest = package / "package.json"
            if not manifest.exists():
                continue
            info = json.loads(manifest.read_text(encoding="utf-8"))
            packages[info["name"]] = {
                "path": package.relative_to(ROOT).as_posix(),
                "scripts": info.get("scripts", {}),
                "dependencies": info.get("dependencies", {}),
                "exports": info.get("exports", {}),
            }
            for source in sorted((package / "src").rglob("*")):
                if source.suffix not in {".ts", ".tsx", ".js", ".jsx"}:
                    continue
                content = source.read_text(encoding="utf-8")
                relative = source.relative_to(ROOT).as_posix()
                imports = IMPORT.findall(content)
                files[relative] = {
                    "route_entry": source.stem in {"page", "layout", "route", "loading", "error", "not-found"},
                    "client_boundary": bool(re.match(r"\s*[\"']use client[\"']", content)),
                    "imports": imports,
                    "shared_consumers": [name for name in imports if name.startswith("@ksu/")],
                    "signals": [
                        {"line": number, "text": line.strip()}
                        for number, line in enumerate(content.splitlines(), 1)
                        if SIGNALS.search(line)
                    ],
                }
    return {
        "scope": "Source inventory only; endpoint ownership, transitive loading and runtime behavior require verification.",
        "revision": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(),
        "initial_worktree": subprocess.check_output(["git", "status", "--short"], cwd=ROOT, text=True).splitlines(),
        "packages": packages,
        "files": files,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Output exists; choose a new path to preserve earlier evidence.")
    snapshot = capture()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf-8")
    print(f"Captured {len(snapshot['packages'])} packages and {len(snapshot['files'])} source files.")
