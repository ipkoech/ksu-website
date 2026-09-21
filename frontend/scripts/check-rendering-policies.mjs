import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const applications = [
  ["web", join(frontendRoot, "apps", "web", "src")],
  ["research", join(frontendRoot, "apps", "research", "src")],
  ["library", join(frontendRoot, "apps", "library", "src")],
  ["heri-africa", join(frontendRoot, "apps", "heri-africa", "src")],
];
const sourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
const importPattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
const dataPattern = /@ksu\/api-client\/server|\bawait\s+(?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*\s*\(|from\s+["']@\/lib\//;
const policyPattern = /export\s+const\s+(?:revalidate|dynamic|fetchCache|dynamicParams|runtime)\s*=/;

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".next"].includes(entry.name)) continue;
    const pathname = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(pathname)));
    else if (sourceExtensions.includes(extname(entry.name))) files.push(pathname);
  }
  return files;
}

function isPage(pathname) {
  return /^page\.(?:ts|tsx|js|jsx|mjs)$/.test(pathname.split(/[\\/]/).pop());
}

function routeName(sourceRoot, pathname) {
  const page = relative(sourceRoot, pathname).replaceAll("\\", "/");
  const route = page
    .replace(/^app\//, "")
    .replace(/(?:^|\/)page\.(?:ts|tsx|js|jsx|mjs)$/, "")
    .replace(/\[([^\]]+)\]/g, ":$1");
  return `/${route}`.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function resolveImport(specifier, importer, sourceRoot, sourceFiles) {
  let base;
  if (specifier.startsWith("@/")) base = join(sourceRoot, specifier.slice(2));
  else if (specifier.startsWith(".")) {
    base = resolve(dirname(importer), specifier);
  } else return null;
  for (const extension of ["", ...sourceExtensions]) {
    const candidate = `${base}${extension}`;
    if (sourceFiles.has(candidate)) return candidate;
  }
  for (const extension of sourceExtensions) {
    const candidate = join(base, `index${extension}`);
    if (sourceFiles.has(candidate)) return candidate;
  }
  return null;
}

function isClientModule(source) {
  return /^\s*["']use client["'];?/m.test(source);
}

function reachesServerData(page, sources, sourceRoot, sourceFiles) {
  const visited = new Set();
  const pending = [page];
  while (pending.length) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    const source = sources.get(current) ?? "";
    if (!isClientModule(source) && dataPattern.test(source)) return true;
    for (const match of source.matchAll(importPattern)) {
      const dependency = resolveImport(match[1], current, sourceRoot, sourceFiles);
      if (dependency) pending.push(dependency);
    }
  }
  return false;
}

for (const [application, sourceRoot] of applications) {
  const files = await walk(sourceRoot);
  const sourceFiles = new Set(files);
  const sources = new Map();
  await Promise.all(
    files.map(async (pathname) => sources.set(pathname, await readFile(pathname, "utf8"))),
  );
  const pages = [];
  for (const pathname of files.filter(isPage)) {
    const source = sources.get(pathname) ?? "";
    if (reachesServerData(pathname, sources, sourceRoot, sourceFiles))
      pages.push({ pathname, source });
  }
  const missing = pages.filter(({ source }) => !policyPattern.test(source));
  console.log(`${application}: data-routes=${pages.length} explicit-policy=${pages.length - missing.length} missing=${missing.length}`);
  for (const { pathname } of missing) console.log(`  missing ${routeName(sourceRoot, pathname)} (${relative(sourceRoot, pathname).replaceAll("\\", "/")})`);
  if (missing.length) process.exitCode = 1;
}
