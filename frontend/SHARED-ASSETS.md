# Shared frontend assets

All five apps serve assets from `frontend/public/`. Add or update images,
icons and videos there; do not create independent app public directories.
Browser URLs remain `/images/...`, `/logos/...`, etc., with the application's
base path where required. `frontend/public/` is a filesystem path, not a URL.

Each Next config calls `scripts/shared-public.cjs`, which creates an ignored
app `public` link to the shared directory: a Windows junction or a relative
directory symlink on Linux. Existing unrelated directories are rejected so
local assets cannot be silently overwritten. No Windows symlink privilege is
needed. The old tracked app public directories/symlink are replaced by this
setup; commit their removals together with the shared assets and configuration.

App-specific manifests live in `public/manifests/` and are referenced by each
app's layout. Web's robots response remains in Web's route tree to avoid a
shared static file conflicting with HERI's generated robots route.

Docker excludes local public links, explicitly includes the shared directory
and setup helper after pruning, and materializes assets in the final runtime
image. Turbo includes shared assets and the helper in its cache dependencies.
