import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import path from "node:path";

const [exportDirectory, outputFile] = process.argv.slice(2);
if (!exportDirectory || !outputFile) throw new Error("Usage: node scripts/snapshot-export.mjs EXPORT_DIRECTORY NEW_OUTPUT_JSON");
const root = path.resolve(exportDirectory);
async function htmlFiles(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const entry = path.join(directory, item.name);
    if (item.isDirectory()) files.push(...await htmlFiles(entry));
    else if (item.name.endsWith(".html")) files.push(path.relative(root, entry).replaceAll("\\", "/"));
  }
  return files.sort();
}
const routes = await htmlFiles(root);
const pages = [];
for (const route of ["login", "system/users", "system/roles", "system/settings/webhooks"]) {
  const html = await readFile(path.join(root, route, "index.html"), "utf8");
  const assets = [];
  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
    const url = new URL(match[1], "http://localhost");
    const file = path.resolve(root, "." + url.pathname);
    if (!file.startsWith(root + path.sep)) throw new Error("Asset escaped export root");
    const data = await readFile(file);
    assets.push({ path: url.pathname, bytes: (await stat(file)).size, gzipBytes: gzipSync(data).length, sha256: createHash("sha256").update(data).digest("hex") });
  }
  pages.push({ route: "/" + route, assets, scriptBytes: assets.reduce((sum, item) => sum + item.bytes, 0), gzipScriptBytes: assets.reduce((sum, item) => sum + item.gzipBytes, 0) });
}
await writeFile(outputFile, JSON.stringify({
  capturedAt: new Date().toISOString(),
  limitations: "Exported HTML/asset inventory. Script tags and gzip estimates do not measure runtime requests, field performance, authorization or deep-link rewrites.",
  routes, pages,
}, null, 2) + "\n", { flag: "wx" });
console.log(`Captured ${routes.length} HTML paths and ${pages.length} representative script sets.`);
