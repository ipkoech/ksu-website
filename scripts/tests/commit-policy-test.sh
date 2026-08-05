#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP_DIR="$(mktemp -d)"

cleanup() {
  find "${TMP_DIR}" -depth -delete
}
trap cleanup EXIT

mkdir -p "${TMP_DIR}/scripts"
cp "${ROOT}/.gitignore" "${TMP_DIR}/.gitignore"
cp "${ROOT}/scripts/commit-changes.sh" "${TMP_DIR}/scripts/commit-changes.sh"
chmod +x "${TMP_DIR}/scripts/commit-changes.sh"

git -C "${TMP_DIR}" init -q
git -C "${TMP_DIR}" config user.name "Commit Policy Test"
git -C "${TMP_DIR}" config user.email "commit-policy@example.invalid"
git -C "${TMP_DIR}" add .gitignore scripts/commit-changes.sh
git -C "${TMP_DIR}" commit -qm "Initialize policy fixture"

for ignored_path in \
  ".superpowers/brainstorm/.last-port" \
  ".playwright/browser-state.json" \
  "frontend/example.test.mjs"
do
  if ! git -C "${TMP_DIR}" check-ignore -q "${ignored_path}"; then
    echo "expected ignore rule for ${ignored_path}" >&2
    exit 1
  fi
done

assert_forbidden_addition() {
  local path="$1"
  local output="${TMP_DIR}/policy-output.txt"

  mkdir -p "${TMP_DIR}/$(dirname "${path}")"
  printf 'forbidden\n' > "${TMP_DIR}/${path}"
  git -C "${TMP_DIR}" add -f -- "${path}"

  if (
    cd "${TMP_DIR}"
    scripts/commit-changes.sh -m "Attempt forbidden commit" --all
  ) >"${output}" 2>&1; then
    echo "expected commit helper to reject ${path}" >&2
    exit 1
  fi

  if ! grep -q "refusing to commit forbidden agent/test artifacts" "${output}"; then
    echo "expected forbidden-artifact error for ${path}" >&2
    cat "${output}" >&2
    exit 1
  fi

  git -C "${TMP_DIR}" restore --staged -- "${path}"
  find "${TMP_DIR}/${path}" -depth -delete
}

assert_forbidden_addition ".superpowers/report.md"
assert_forbidden_addition ".playwright/state.json"
assert_forbidden_addition "frontend/example.test.mjs"

printf 'legacy test\n' > "${TMP_DIR}/legacy.test.mjs"
git -C "${TMP_DIR}" add -f legacy.test.mjs
git -C "${TMP_DIR}" commit -qm "Track legacy test fixture"
find "${TMP_DIR}/legacy.test.mjs" -depth -delete

(
  cd "${TMP_DIR}"
  scripts/commit-changes.sh -m "Remove legacy test fixture" -- legacy.test.mjs
) >/dev/null

if git -C "${TMP_DIR}" ls-files --error-unmatch legacy.test.mjs >/dev/null 2>&1; then
  echo "expected deletion-only cleanup to remain allowed" >&2
  exit 1
fi

echo "commit policy checks passed"
