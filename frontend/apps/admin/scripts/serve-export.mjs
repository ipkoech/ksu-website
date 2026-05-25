import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../out", import.meta.url)));
const port = Number(process.argv[2] || process.env.PORT || 3001);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
]);

const rewrites = [
  {
    pattern: /^\/people\/persons\/[^/]+\/assignments\/?$/,
    target: "/people/persons/_static/assignments/index.html",
  },
];

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return normalized.startsWith("/") ? normalized.slice(1) : normalized;
}

function candidateFiles(pathname) {
  const clean = safePath(pathname);
  const base = join(root, clean);
  return [
    base,
    join(base, "index.html"),
    join(root, `${clean}.html`),
  ];
}

function resolveFile(pathname) {
  for (const rewrite of rewrites) {
    if (rewrite.pattern.test(pathname)) {
      return join(root, safePath(rewrite.target));
    }
  }

  for (const candidate of candidateFiles(pathname)) {
    if (candidate.startsWith(root) && existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return join(root, "404.html");
}

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const filePath = resolveFile(url.pathname);
  const status = filePath.endsWith("404.html") ? 404 : 200;
  const type = contentTypes.get(extname(filePath)) || "application/octet-stream";

  response.writeHead(status, { "Content-Type": type });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Serving ${root} on http://localhost:${port}`);
});
