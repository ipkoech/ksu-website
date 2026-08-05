#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT}" ]]; then
  echo "error: run this inside a git repository" >&2
  exit 1
fi

cd "${ROOT}"

echo "Repository: ${ROOT}"
echo

echo "Branch and worktree status"
git status --short --branch
echo

echo "Commit candidates"
git status --short --untracked-files=all \
  | awk '
      $1 !~ /^!!/ {
        path=$0
        sub(/^.../, "", path)
        if (path ~ /^(\.gitignore|contracts\/|docker-compose\.yml|frontend\/|gateway\/|packages\/|services\/)/) {
          print "  " path
        }
      }
    '
echo

echo "Working/reference changes normally left uncommitted"
git status --short --untracked-files=all \
  | awk '
      $1 !~ /^!!/ {
        path=$0
        sub(/^.../, "", path)
        if (path ~ /^(ADMIN_|designs\/|docs\/|scripts\/)/) {
          print "  " path
        }
      }
    '
echo

echo "Should normally stay uncommitted"
git status --ignored --short \
  | awk '
      $1 == "!!" {
        path=$2
        if (path ~ /(^|\/)(node_modules|\.pnpm-store|\.next|out|dist|build|\.turbo|\.venv|venv|__pycache__|\.pytest_cache|\.ruff_cache|tmp|\.scratch|\.design-scratch|uploads|media|logs)(\/|$)/ || path ~ /(^|\/)\.env($|\.|\/)/ || path ~ /\.(log|sqlite3?|db)$/) {
          print "  " path
        }
      }
    '
echo

echo "Tracked files that look risky"
git ls-files \
  | awk '
      /(^|\/)(node_modules|\.next|out|dist|build|\.turbo|\.venv|venv|__pycache__|\.pytest_cache|tmp|\.scratch|\.design-scratch)(\/|$)/ || /\.(log|sqlite3?|db)$/ {
        print "  " $0
        next
      }
      /(^|\/)\.env($|\.|\/)/ && !/\.example$/ {
        print "  " $0
      }
    ' \
  | sed '/^$/d' || true

echo
echo "Notes"
echo "  Commit source, migrations, tests, contracts, lockfiles, Dockerfiles, and example env files."
echo "  Leave docs, ADMIN_PORTAL_*.md, designs, scripts, local secrets, dependency folders, build output, caches, runtime uploads/media/logs, local databases, and scratch folders uncommitted."
