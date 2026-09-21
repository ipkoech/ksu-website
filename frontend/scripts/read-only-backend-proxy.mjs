import { createServer } from "node:http";
import { open, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// Measurement only: keeps the real public backend response and records server
// requests. Never forwards browser credentials or permits backend mutations.
const [upstreamValue, portValue, output] = process.argv.slice(2);
if (!upstreamValue || !portValue || !output)
  throw new Error(
    "Usage: node scripts/read-only-backend-proxy.mjs LOOPBACK_UPSTREAM PORT NEW_JSONL_FILE",
  );
const upstream = new URL(upstreamValue);
const port = Number(portValue);
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(upstream.hostname) ||
  upstream.protocol !== "http:" ||
  upstream.username ||
  upstream.password ||
  !Number.isInteger(port) ||
  port < 1024 ||
  port > 65535
)
  throw new Error(
    "A credential-free local HTTP upstream and unprivileged port are required",
  );
const logPath = resolve(output);
await mkdir(dirname(logPath), { recursive: true });
const log = await open(logPath, "wx");
let pendingLog = Promise.resolve();
const server = createServer(async (request, response) => {
  const target = new URL(request.url, upstream);
  if (
    !["GET", "HEAD"].includes(request.method) ||
    target.origin !== upstream.origin ||
    !target.pathname.startsWith("/api/v1/") ||
    /\/api\/v1\/(admin|auth)(\/|$)/.test(target.pathname) ||
    request.headers.authorization ||
    request.headers.cookie
  ) {
    response.writeHead(403).end("Only anonymous public reads are allowed");
    return;
  }
  const startedAt = Date.now();
  let status = 502;
  let bytes = 0;
  try {
    const result = await fetch(target, {
      method: request.method,
      headers: { Accept: "application/json" },
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
    // Public routes can canonicalize trailing slashes. Keep redirects inside
    // this recorder so a follow-up remains guarded and counted.
    const headers = {
      "Content-Type": result.headers.get("content-type") || "application/json",
    };
    const location = result.headers.get("location");
    if (location) {
      const redirect = new URL(location, target);
      if (redirect.origin !== upstream.origin)
        throw new Error("External redirect refused");
      headers.Location = redirect.pathname + redirect.search;
    }
    const body = Buffer.from(await result.arrayBuffer());
    status = result.status;
    bytes = body.length;
    response.writeHead(status, headers).end(body);
  } catch {
    response.writeHead(status).end("Local measurement upstream unavailable");
  } finally {
    const entry = {
      at: new Date(startedAt).toISOString(),
      method: request.method,
      path: target.pathname + target.search,
      status,
      bytes,
      durationMs: Date.now() - startedAt,
    };
    pendingLog = pendingLog.then(() =>
      log.appendFile(JSON.stringify(entry) + "\n"),
    );
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Read-only recorder listening on http://127.0.0.1:${port}; log ${logPath}`,
  ),
);
async function stop() {
  await new Promise((resolveClose) => {
    server.close(resolveClose);
    server.closeIdleConnections();
  });
  await pendingLog;
  await log.close();
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
