# Agent Workflow

## Commit After Verification

When an agent makes code or documentation edits, it should commit only after the requested work has been implemented and the relevant checks have passed.

Use the project commit helper instead of calling `git commit` directly:

```bash
scripts/commit-changes.sh -m "Describe the change" --run-full-checks
```

Use `--run-checks` for smaller changes where lint and typecheck are enough:

```bash
scripts/commit-changes.sh -m "Describe the change" --run-checks
```

Use explicit paths when the worktree has unrelated changes:

```bash
scripts/commit-changes.sh -m "Describe the change" --run-full-checks -- path/to/file path/to/dir
```

Do not add automatic commits to `scripts/deploy.sh` or `docker-compose.yml`. Deployment should consume committed changes, not create commits.

Do not commit real environment files, generated output, dependency directories, caches, uploads, logs, or local databases.

