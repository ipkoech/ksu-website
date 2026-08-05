#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/commit-changes.sh -m "commit message" [options] [-- path ...]

Options:
  -m, --message TEXT   Commit message. Required.
  --all                Stage every non-ignored change in the repo.
  --run-checks         Run frontend lint and typecheck before committing.
  --run-full-checks    Run frontend lint, typecheck, and build before committing.
  --push               Push the current branch after committing.
  -h, --help           Show this help.

Without --all or explicit paths, the script stages the project source areas:
  .gitignore contracts docker-compose.yml frontend gateway packages services
USAGE
}

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT}" ]]; then
  echo "error: run this inside a git repository" >&2
  exit 1
fi

MESSAGE=""
STAGE_ALL=0
RUN_CHECKS=0
RUN_FULL_CHECKS=0
PUSH_AFTER=0
PATHS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message)
      MESSAGE="${2:-}"
      shift 2
      ;;
    --all)
      STAGE_ALL=1
      shift
      ;;
    --run-checks)
      RUN_CHECKS=1
      shift
      ;;
    --run-full-checks)
      RUN_FULL_CHECKS=1
      shift
      ;;
    --push)
      PUSH_AFTER=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      PATHS+=("$@")
      break
      ;;
    *)
      PATHS+=("$1")
      shift
      ;;
  esac
done

if [[ -z "${MESSAGE}" ]]; then
  echo "error: commit message is required" >&2
  usage >&2
  exit 1
fi

cd "${ROOT}"

echo "Running whitespace/conflict-marker check..."
git diff --check

if [[ "${RUN_CHECKS}" -eq 1 || "${RUN_FULL_CHECKS}" -eq 1 ]]; then
  if [[ -f frontend/package.json ]]; then
    echo "Running frontend lint..."
    (cd frontend && pnpm lint)
    echo "Running frontend typecheck..."
    (cd frontend && pnpm typecheck)
    if [[ "${RUN_FULL_CHECKS}" -eq 1 ]]; then
      echo "Running frontend build..."
      (cd frontend && pnpm build)
    fi
  else
    echo "warning: frontend/package.json not found; skipping frontend checks" >&2
  fi
fi

if [[ "${#PATHS[@]}" -gt 0 ]]; then
  echo "Staging explicit paths..."
  git add -A -- "${PATHS[@]}"
elif [[ "${STAGE_ALL}" -eq 1 ]]; then
  echo "Staging all non-ignored changes..."
  git add -A
else
  echo "Staging default project source paths..."
  DEFAULT_PATHS=(
    .gitignore
    contracts
    docker-compose.yml
    frontend
    gateway
    packages
    services
  )
  git add -A -- "${DEFAULT_PATHS[@]}"
fi

STAGED_FILES="$(git diff --cached --name-only)"
if [[ -z "${STAGED_FILES}" ]]; then
  echo "error: no staged changes to commit" >&2
  exit 1
fi

FORBIDDEN_STAGED="$(
  git diff --cached --name-only --diff-filter=AMCR \
    | awk '
        /(^|\/)(\.superpowers|\.playwright)(\/|$)/ || /\.test\.mjs$/ {
          print
        }
      '
)"

if [[ -n "${FORBIDDEN_STAGED}" ]]; then
  echo "error: refusing to commit forbidden agent/test artifacts:" >&2
  printf '%s\n' "${FORBIDDEN_STAGED}" >&2
  echo "Remove them from the commit; deletion-only cleanup remains allowed." >&2
  exit 1
fi

RISKY_STAGED="$(
  printf '%s\n' "${STAGED_FILES}" \
    | awk '
        /(^|\/)(node_modules|\.pnpm-store|\.next|out|dist|build|\.turbo|\.venv|venv|__pycache__|\.pytest_cache|\.ruff_cache|tmp|\.scratch|\.design-scratch|uploads|logs)(\/|$)/ || /\.(log|sqlite3?|db)$/ {
          print
          next
        }
        /(^|\/)(public|static|storage|uploads)\/media(\/|$)/ {
          print
          next
        }
        /(^|\/)\.env($|\.|\/)/ && !/\.example$/ {
          print
        }
      '
)"

if [[ -n "${RISKY_STAGED}" ]]; then
  echo "error: refusing to commit risky local/generated files:" >&2
  printf '%s\n' "${RISKY_STAGED}" >&2
  echo "Unstage them with: git restore --staged <path>" >&2
  exit 1
fi

echo
echo "Staged summary:"
git diff --cached --stat
echo

git commit -m "${MESSAGE}"

if [[ "${PUSH_AFTER}" -eq 1 ]]; then
  BRANCH="$(git branch --show-current)"
  if [[ -z "${BRANCH}" ]]; then
    echo "error: cannot push from detached HEAD" >&2
    exit 1
  fi
  git push -u origin "${BRANCH}"
fi
