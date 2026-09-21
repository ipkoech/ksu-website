import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(scriptDirectory, "..");

const applications = [
  ["web", join(frontendRoot, "apps", "web", "src")],
  ["research", join(frontendRoot, "apps", "research", "src")],
  ["library", join(frontendRoot, "apps", "library", "src")],
  ["heri-africa", join(frontendRoot, "apps", "heri-africa", "src")],
];

const sourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
const importPattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
// Include awaited member calls such as `await Promise.all(...)`; route data is
// often loaded through a parallel aggregate rather than a single function.
const dataPattern = /@ksu\/api-client\/server|\bawait\s+(?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*\s*\(|from\s+["']@\/lib\//;
const serverOnlyImportPattern = /@ksu\/api-client\/server|["']server-only["']/;
// Filter controls prove a client boundary exists, but they do not prove that
// server-fetched DTOs are rendered by a focused client display component.
// Shared site chrome remains a valid display boundary for routes whose only
// backend data is the global navigation/footer payload.
const nonDisplayMarkers = new Set([
  "library-filter-controls",
  "research-filter-controls",
]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const pathname = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(pathname)));
    else if (sourceExtensions.includes(extname(entry.name))) files.push(pathname);
  }
  return files;
}

function isClientModule(source) {
  return /^\s*["']use client["'];?/m.test(source);
}

function isPage(pathname) {
  return /^page\.(?:ts|tsx|js|jsx|mjs)$/.test(pathname.split(/[\\/]/).pop());
}

function hasMeaningfulDisplayMarker(source) {
  if (!isClientModule(source) || !source.includes("data-server-data-display")) return false;
  const markers = [...source.matchAll(/data-server-data-display\s*=\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  // A dynamic marker is valid when the component owns the display list and
  // receives the marker as a prop (for example, a reusable records grid).
  if (/data-server-data-display\s*=\s*\{/.test(source)) return true;
  return markers.some((marker) => !nonDisplayMarkers.has(marker));
}

async function readSources(files) {
  const sources = new Map();
  await Promise.all(files.map(async (pathname) => sources.set(pathname, await readFile(pathname, "utf8"))));
  return sources;
}

function resolveImport(specifier, importer, sourceRoot, sourceFiles) {
  let base;
  if (specifier.startsWith("@/")) base = join(sourceRoot, specifier.slice(2));
  else if (specifier.startsWith(".")) base = resolve(dirname(importer), specifier);
  else return null;
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

function reachesClientBoundary(page, sources, sourceRoot, sourceFiles) {
  const visited = new Set();
  const pending = [page];
  while (pending.length) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    const source = sources.get(current) ?? "";
    if (isClientModule(source)) return true;
    for (const match of source.matchAll(importPattern)) {
      const dependency = resolveImport(match[1], current, sourceRoot, sourceFiles);
      if (dependency) pending.push(dependency);
    }
  }
  return false;
}

function reachesDisplayMarker(page, sources, sourceRoot, sourceFiles) {
  const visited = new Set();
  const pending = [page];
  while (pending.length) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    const source = sources.get(current) ?? "";
    if (hasMeaningfulDisplayMarker(source)) return true;
    for (const match of source.matchAll(importPattern)) {
      const dependency = resolveImport(match[1], current, sourceRoot, sourceFiles);
      if (dependency) pending.push(dependency);
    }
  }
  return false;
}

function reachesServerData(page, sources, sourceRoot, sourceFiles) {
  const visited = new Set();
  const pending = [page];
  while (pending.length) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    const source = sources.get(current) ?? "";
    // Client modules may await browser interactions or query-library work;
    // those are not proof that the Server Component fetched initial data.
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
  const sources = await readSources(files);
  const sourceFiles = new Set(files);
  const pages = files.filter(isPage);
  const dataPages = pages.filter((pathname) =>
    reachesServerData(pathname, sources, sourceRoot, sourceFiles),
  );
  const missing = dataPages.filter((pathname) => !reachesClientBoundary(pathname, sources, sourceRoot, sourceFiles));
  const marked = dataPages.filter((pathname) => reachesDisplayMarker(pathname, sources, sourceRoot, sourceFiles));
  const missingDisplay = dataPages.filter((pathname) => !reachesDisplayMarker(pathname, sources, sourceRoot, sourceFiles));
  const clientServerImports = files.filter((pathname) => {
    const source = sources.get(pathname) ?? "";
    return isClientModule(source) && serverOnlyImportPattern.test(source);
  });
  const display = `${application}: data-ish=${dataPages.length} client-boundary=${dataPages.length - missing.length} display-marker=${marked.length} missing=${missing.length} missing-display=${missingDisplay.length}`;
  console.log(display);
  for (const pathname of missing) console.log(`  missing ${relative(sourceRoot, pathname).replaceAll("\\", "/")}`);
  for (const pathname of missingDisplay) console.log(`  missing display marker ${relative(sourceRoot, pathname).replaceAll("\\", "/")}`);
  for (const pathname of clientServerImports) {
    console.log(`  client imports server-only entry: ${relative(sourceRoot, pathname).replaceAll("\\", "/")}`);
  }
  if (missing.length || missingDisplay.length || clientServerImports.length) process.exitCode = 1;
}
