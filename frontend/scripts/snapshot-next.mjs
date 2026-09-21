import { readFile, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { resolve, join, sep } from "node:path";

const [directory, output] = process.argv.slice(2);
if (!directory || !output)
  throw new Error(
    "Usage: node scripts/snapshot-next.mjs NEXT_DIRECTORY NEW_OUTPUT_JSON",
  );
const root = resolve(directory);
const routes = Object.keys(
  JSON.parse(
    await readFile(join(root, "server/app-paths-manifest.json"), "utf8"),
  ),
).sort();
const pages = [];
for (const name of ["index", "stories", "stories/request-account"]) {
  const html = await readFile(join(root, "server/app", name + ".html"), "utf8");
  const assets = [];
  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
    const url = new URL(match[1], "http://localhost");
    if (
      url.origin !== "http://localhost" ||
      !url.pathname.startsWith("/_next/")
    )
      throw new Error(`Unexpected external script ${url}`);
    const filename = resolve(root, url.pathname.slice("/_next/".length));
    if (!filename.startsWith(root + sep))
      throw new Error("Script escaped Next output");
    const bytes = await readFile(filename);
    assets.push({
      path: url.pathname,
      bytes: bytes.length,
      gzipBytes: gzipSync(bytes).length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  pages.push({
    route: name === "index" ? "/" : "/" + name,
    htmlBytes: Buffer.byteLength(html),
    assets,
    scriptBytes: assets.reduce((total, item) => total + item.bytes, 0),
    gzipScriptBytes: assets.reduce((total, item) => total + item.gzipBytes, 0),
  });
}
await writeFile(
  output,
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      limitations:
        "Compiled route and script-tag asset inventory; gzip estimates do not prove runtime requests, field performance or standalone packaging.",
      routes,
      pages,
    },
    null,
    2,
  ) + "\n",
  { flag: "wx" },
);
console.log(
  `Recorded ${routes.length} app paths and ${pages.length} script sets.`,
);
