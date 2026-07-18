import assert from "node:assert/strict";
import { readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, "permissions.ts");
const compiledPath = path.join(
  os.tmpdir(),
  `school-role-access-${process.pid}-${Date.now()}.mjs`,
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
  const { getAccessibleServices, getHighestRole, hasServiceAccess } =
    await import(pathToFileURL(compiledPath).href);

  for (const role of ["school_admin", "school-editor"]) {
    assert.deepEqual(
      getAccessibleServices([role]),
      ["main"],
      `${role} can complete login with Main service access`,
    );
    assert.equal(hasServiceAccess([role], "main"), true);
  }
  assert.equal(getHighestRole(["school_editor"], "main"), "school-editor");
} finally {
  await unlink(compiledPath).catch(() => {});
}
