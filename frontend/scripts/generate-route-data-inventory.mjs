import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(scriptDirectory, "..");
const outputPath = join(frontendRoot, "ROUTE-DATA-INVENTORY.generated.md");

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
  if (/data-server-data-display\s*=\s*\{/.test(source)) return true;
  const markers = [...source.matchAll(/data-server-data-display\s*=\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  return markers.some((marker) => !nonDisplayMarkers.has(marker));
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

function traceGraph(page, sources, sourceRoot, sourceFiles) {
  const visited = new Set();
  const pending = [page];
  while (pending.length) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    const source = sources.get(current) ?? "";
    for (const match of source.matchAll(importPattern)) {
      const dependency = resolveImport(match[1], current, sourceRoot, sourceFiles);
      if (dependency) pending.push(dependency);
    }
  }
  return [...visited];
}

function reachesServerData(page, sources, sourceRoot, sourceFiles) {
  const visited = new Set();
  const pending = [page];
  while (pending.length) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    const source = sources.get(current) ?? "";
    // Do not treat browser-only query or event handlers as server fetching.
    if (!isClientModule(source) && dataPattern.test(source)) return true;
    for (const match of source.matchAll(importPattern)) {
      const dependency = resolveImport(match[1], current, sourceRoot, sourceFiles);
      if (dependency) pending.push(dependency);
    }
  }
  return false;
}

function routeFromPage(page, sourceRoot) {
  const appDirectory = join(sourceRoot, "app");
  const directory = relative(appDirectory, dirname(page)).replaceAll("\\", "/");
  if (!directory || directory === ".") return "/";
  const segments = directory
    .split("/")
    .filter((segment) => segment && !/^\([^/]+\)$/.test(segment) && !segment.startsWith("@"))
    .map((segment) => {
      if (segment.startsWith("[[...") && segment.endsWith("]]")) return `*${segment.slice(5, -2)}`;
      if (segment.startsWith("[...") && segment.endsWith("]")) return `*${segment.slice(4, -1)}`;
      if (segment.startsWith("[") && segment.endsWith("]")) return `:${segment.slice(1, -1)}`;
      return segment;
    });
  return `/${segments.join("/")}`;
}

function relativeSource(pathname, sourceRoot) {
  return relative(sourceRoot, pathname).replaceAll("\\", "/");
}

function findClientBoundary(graph, sources, sourceRoot) {
  return graph
    .filter((pathname) => isClientModule(sources.get(pathname) ?? ""))
    .sort((a, b) => {
      const aMarked = hasMeaningfulDisplayMarker(sources.get(a) ?? "");
      const bMarked = hasMeaningfulDisplayMarker(sources.get(b) ?? "");
      return Number(bMarked) - Number(aMarked) || a.localeCompare(b);
    })
    .map((pathname) => relativeSource(pathname, sourceRoot))[0] ?? "—";
}

function extractMarkers(graph, sources) {
  const markers = new Set();
  let hasDynamicMarker = false;
  for (const pathname of graph) {
    const source = sources.get(pathname) ?? "";
    if (source.includes("data-server-data-display")) hasDynamicMarker = true;
    for (const match of source.matchAll(/data-server-data-display["']?\s*[:=]\s*["']([^"']+)["']/g)) {
      markers.add(match[1]);
    }
    for (const match of source.matchAll(/data-server-data-display=["']([^"']+)["']/g)) {
      markers.add(match[1]);
    }
  }
  if (hasDynamicMarker) markers.add("dynamic marker");
  return [...markers].sort();
}

function hasMeaningfulDisplayBoundary(graph, sources) {
  return graph.some((pathname) => hasMeaningfulDisplayMarker(sources.get(pathname) ?? ""));
}

function extractEndpoints(graph, sources) {
  const endpoints = new Set();
  for (const pathname of graph) {
    const source = sources.get(pathname) ?? "";
    for (const match of source.matchAll(/["'`](\/(?:api\/v1|public|content|search|news|projects|publications|events|teams?|partners?|resources|library)[^"'`\\\s]*)["'`]/g)) {
      endpoints.add(match[1]);
    }
  }
  return [...endpoints].sort().slice(0, 8);
}

function policyFor(pageSource, graphSources) {
  const allSource = [pageSource, ...graphSources].join("\n");
  const revalidate = pageSource.match(/export\s+const\s+revalidate\s*=\s*([^;\n]+)/)?.[1]?.trim();
  const dynamic = pageSource.match(/export\s+const\s+dynamic\s*=\s*["']([^"']+)["']/)?.[1];
  if (dynamic) return `dynamic:${dynamic}`;
  if (revalidate) return `revalidate:${revalidate}`;
  if (/unstable_noStore|noStore\s*\(/.test(allSource)) return "request-scoped/no-store on failure";
  return "declared in route or shared loader";
}

function authFor(pageSource) {
  // Keep the signal route-local. Shared transport modules necessarily mention
  // headers and session handling even when the page is public and anonymous.
  if (/(?:\bcookies?\s*\(|\bheaders?\s*\(|\bgetSession\b|\buseAuth\b|\bauth(?:enticated|orization)?\b|\bpermissions?\b|\bprivate\b)/i.test(pageSource)) {
    return "request/session-aware (inspect loader)";
  }
  return "anonymous/public";
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

async function buildInventory() {
  const rows = [];
  for (const [application, sourceRoot] of applications) {
    const files = await walk(sourceRoot);
    const sources = new Map();
    await Promise.all(files.map(async (pathname) => sources.set(pathname, await readFile(pathname, "utf8"))));
    const sourceFiles = new Set(files);
    const pages = files.filter(isPage);
    const dataPages = pages.filter((pathname) =>
      reachesServerData(pathname, sources, sourceRoot, sourceFiles),
    );
    for (const page of dataPages) {
      const graph = traceGraph(page, sources, sourceRoot, sourceFiles);
      const graphSources = graph.map((pathname) => sources.get(pathname) ?? "");
      const hasServerTransport = graphSources.some((source) => source.includes("@ksu/api-client/server") || source.includes('"server-only"') || source.includes("'server-only'"));
      const markers = extractMarkers(graph, sources);
      const hasDisplayBoundary = hasMeaningfulDisplayBoundary(graph, sources);
      const endpoints = extractEndpoints(graph, sources);
      rows.push({
        application,
        route: routeFromPage(page, sourceRoot),
        page: relativeSource(page, sourceRoot),
        fetchOwner: hasServerTransport ? "Server Component/domain loader" : "route-owned client/static exception",
        endpoint: endpoints.length ? endpoints.join(", ") : "domain adapter (endpoint not literal in route graph)",
        auth: authFor(sources.get(page) ?? ""),
        cache: policyFor(sources.get(page) ?? "", graphSources),
        client: findClientBoundary(graph, sources, sourceRoot),
        markers: markers.length ? markers.join(", ") : "source boundary only",
        verification: hasDisplayBoundary
          ? "source audit + data display marker"
          : "source audit; runtime evidence recorded in frontend/contracts/",
      });
    }
  }
  rows.sort((a, b) => a.application.localeCompare(b.application) || a.route.localeCompare(b.route) || a.page.localeCompare(b.page));
  const lines = [
    "# Generated route and data-flow inventory",
    "",
    "Generated by `scripts/generate-route-data-inventory.mjs`. This source-derived inventory is checked in so route additions or changes remain reviewable. It complements the representative evidence and runtime limitations in `ROUTE-DATA-INVENTORY.md` and the runtime evidence under `frontend/contracts/`.",
    "",
    `Data-bearing server route entries: **${rows.length}**.`,
    "",
    "| App | Route | Page | Fetch owner | Reachable backend endpoint literals or adapter | Auth signal | Cache/failure policy | Client display boundary | Marker | Verification status |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const row of rows) {
    lines.push(`| ${Object.values(row).map(escapeCell).join(" | ")} |`);
  }
  lines.push("", "The generator reports source evidence only. Browser network, real-backend permissions, mutation persistence and freshness claims remain valid only where the corresponding runtime checks under `frontend/contracts/` have passed.", "");
  return lines.join("\n");
}

const inventory = await buildInventory();
if (process.argv.includes("--check")) {
  let existing;
  try {
    existing = await readFile(outputPath, "utf8");
  } catch {
    console.error(`Missing generated inventory: ${outputPath}`);
    process.exitCode = 1;
  }
  if (existing !== inventory) {
    console.error(`Generated route inventory is stale: ${outputPath}`);
    process.exitCode = 1;
  }
} else {
  await writeFile(outputPath, inventory, "utf8");
  console.log(`Wrote ${outputPath}`);
}
