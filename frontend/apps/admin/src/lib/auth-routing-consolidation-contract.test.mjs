import assert from "node:assert/strict";
import { readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, "auth-routing.ts");
const compiledPath = path.join(
  os.tmpdir(),
  `auth-routing-${process.pid}-${Date.now()}.mjs`,
);

const source = await readFile(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});

await writeFile(compiledPath, compiled.outputText);

try {
  const { resolvePortalAccessDestination } = await import(pathToFileURL(compiledPath).href);

  const user = {
    id: "user-1",
    email: "staff@ksu.ac.ke",
    name: "Staff User",
    roles: [],
    permissions: [],
    services: [{ service: "main", roles: [], scopes: [] }],
  };

  function portal(key, href, service = "main") {
    return {
      key,
      label: key,
      service,
      href,
      scope_type: "university",
      scope_id: null,
      scope_label: "Kisii University",
      permissions: [],
      source: "role",
      locked_scope: false,
    };
  }

  assert.equal(
    resolvePortalAccessDestination([portal("cocms", "/cocms")], user).href,
    "/corporate-communication",
    "a legacy CoCMS portal record resolves to Corporate Communication",
  );

  assert.equal(
    resolvePortalAccessDestination([portal("publications", "/publications", "research")], user).href,
    "/research",
    "a legacy publications portal record resolves to Research",
  );

  assert.equal(
    resolvePortalAccessDestination([portal("student-clubs", "/student-clubs")], user).href,
    "/corporate-communication",
    "a legacy student-clubs portal record resolves to Corporate Communication",
  );

  assert.equal(
    resolvePortalAccessDestination(
      [
        portal("cocms", "/cocms"),
        portal("institutional-administration", "/institutional-administration"),
      ],
      user,
    ).href,
    "/admin",
    "canonical portal priority selects Admin over Corporate Communication",
  );
} finally {
  await unlink(compiledPath).catch(() => {});
}
