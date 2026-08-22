#!/bin/sh
# Dev-only launcher for one Next.js app inside the frontend workspace container.
#
# Every frontend container shares a single node_modules volume, so the workspace
# install is serialized behind a lock directory: the first container installs and
# the rest wait. Reads FRONTEND_APP_DIR and FRONTEND_PORT from the environment.
set -e

app_dir="${FRONTEND_APP_DIR:?FRONTEND_APP_DIR is required}"
port="${FRONTEND_PORT:?FRONTEND_PORT is required}"
lock=/app/node_modules/.pnpm-install.lock
lock_wait_seconds="${FRONTEND_LOCK_WAIT_SECONDS:-900}"

corepack enable
corepack prepare pnpm@9.1.0 --activate

waited=0
until mkdir "$lock" 2>/dev/null; do
  if [ "$waited" -ge "$lock_wait_seconds" ]; then
    # A container that died mid-install leaves the lock behind forever. Break it
    # rather than hanging every frontend on a corpse.
    echo "frontend-dev: install lock held for ${waited}s, assuming it is stale and breaking it" >&2
    rmdir "$lock" 2>/dev/null || true
    continue
  fi
  if [ "$((waited % 15))" -eq 0 ]; then
    echo "frontend-dev: waiting for another container to finish pnpm install (${waited}s)"
  fi
  sleep 1
  waited=$((waited + 1))
done
trap 'rmdir "$lock" 2>/dev/null || true' EXIT INT TERM

pnpm install --frozen-lockfile

rmdir "$lock" 2>/dev/null || true
trap - EXIT INT TERM

echo "frontend-dev: starting ${app_dir} on port ${port}"
exec pnpm --dir "$app_dir" exec next dev -H 0.0.0.0 -p "$port"
