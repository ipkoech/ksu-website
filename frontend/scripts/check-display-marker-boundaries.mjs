import { readdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const applications = ["web", "research", "library", "heri-africa"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const pathname = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(pathname)));
    else if (extensions.has(extname(entry.name))) files.push(pathname);
  }
  return files;
}

const violations = [];
for (const application of applications) {
  const sourceRoot = join(root, "apps", application, "src");
  for (const pathname of await walk(sourceRoot)) {
    if (pathname.includes(".test.") || pathname.includes(".spec.")) continue;
    const source = await readFile(pathname, "utf8");
    if (
      source.includes("data-server-data-display") &&
      !/^\s*["']use client["'];?/m.test(source)
    ) {
      violations.push(pathname);
    }
  }
}

if (violations.length) {
  console.error("Server-data display markers must be declared in Client Components:");
  for (const pathname of violations) console.error(`  ${pathname}`);
  process.exitCode = 1;
} else {
  console.log("All non-test server-data display markers are inside Client Components.");
}
