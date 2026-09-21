import { mkdir, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const frontend = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(frontend, "apps", "web");
const require = createRequire(join(web, "package.json"));
const next = require.resolve("next/dist/bin/next");
const fixtures = join(frontend, ".tmp");
await mkdir(fixtures, { recursive: true });
const fixture = await mkdtemp(join(fixtures, "server-boundary-"));
await symlink(
  join(web, "node_modules"),
  join(fixture, "node_modules"),
  "junction",
);
await mkdir(join(fixture, "app"));
await mkdir(join(fixture, "app", "probe"));
await mkdir(join(fixture, "app", "private"));
await writeFile(
  join(fixture, "package.json"),
  JSON.stringify({ name: "ksu-server-boundary-fixture", private: true }),
);
await writeFile(
  join(fixture, "next.config.mjs"),
  'export default { transpilePackages: ["@ksu/api-client"], experimental: { cpus: 1 } };\n',
);
await writeFile(
  join(fixture, "app", "layout.jsx"),
  'export default function Layout({ children }) { return <html lang="en"><body>{children}</body></html>; }\n',
);
await writeFile(
  join(fixture, "app", "display.jsx"),
  '"use client";\nexport default function Display({ items }) { return <ul>{items.map(item => <li key={item.id}>{item.title}</li>)}</ul>; }\n',
);
await writeFile(
  join(fixture, "app", "probe", "route.js"),
  'import { newsApi } from "@ksu/api-client/server";\nexport const dynamic = "force-static";\nexport async function GET() { return Response.json(await newsApi.list()); }\n',
);
await writeFile(
  join(fixture, "app", "private", "page.jsx"),
  'import { createServerApiClient } from "@ksu/api-client/server";\nimport Display from "../display";\nimport { headers } from "next/headers";\nexport default async function Page() { const client = createServerApiClient("main", { headers: await headers() }); const result = await client.get("/api/v1/private-fixture"); return <Display items={result.data} />; }\n',
);
const requests = [];
const backend = createServer((request, response) => {
  requests.push({ method: request.method, url: request.url });
  if (
    request.method !== "GET" ||
    (request.headers.cookie &&
      request.headers.cookie !== "ksu_access=boundary-cookie") ||
    request.headers["x-untrusted"] ||
    (request.headers.authorization &&
      !(
        request.url === "/api/v1/private-fixture" &&
        ["Bearer boundary-first", "Bearer boundary-second"].includes(
          request.headers.authorization,
        )
      ))
  ) {
    response.writeHead(400).end();
    return;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      data: [
        {
          id: "boundary-fixture",
          title:
            request.url === "/api/v1/private-fixture"
              ? `Private ${request.headers.authorization ?? "anonymous"}`
              : "Server data in client display",
        },
      ],
    }),
  );
});
await new Promise((resolveListen) =>
  backend.listen(0, "127.0.0.1", resolveListen),
);
const backendUrl = `http://127.0.0.1:${backend.address().port}`;

function build(name) {
  return new Promise((resolveBuild, reject) => {
    const child = spawn(process.execPath, [next, "build", fixture], {
      cwd: fixture,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
        KSU_MAIN_API_URL: backendUrl,
      },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (value) => {
      output += value;
    });
    child.stderr.on("data", (value) => {
      output += value;
    });
    child.once("error", reject);
    child.once("close", async (code) => {
      try {
        await writeFile(join(fixture, `${name}.log`), output);
        resolveBuild({ code, output });
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function verifyPrivateRuntime() {
  const child = spawn(
    process.execPath,
    [next, "start", fixture, "-H", "127.0.0.1", "-p", "0"],
    {
      cwd: fixture,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
        KSU_MAIN_API_URL: backendUrl,
      },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  child.stdout.on("data", (value) => {
    output += value;
  });
  child.stderr.on("data", (value) => {
    output += value;
  });
  const closed = new Promise((resolveClose) =>
    child.once("close", resolveClose),
  );
  try {
    const deadline = Date.now() + 30_000;
    while (!/http:\/\/127\.0\.0\.1:\d+/.test(output)) {
      if (child.exitCode !== null || Date.now() > deadline)
        throw new Error("Private runtime failed to start");
      await delay(100);
    }
    const origin = output.match(/http:\/\/127\.0\.0\.1:\d+/)[0];
    const identities = ["first", "second", "first", "second"];
    const pages = await Promise.all(
      identities.map(async (identity) => {
        const response = await fetch(`${origin}/private`, {
          headers: {
            Authorization: `Bearer boundary-${identity}`,
            Cookie: "ksu_access=boundary-cookie; ksu_refresh=must-not-forward",
            "X-Untrusted": "must-not-forward",
          },
          signal: AbortSignal.timeout(30_000),
        });
        const html = await response.text();
        const other = identity === "first" ? "second" : "first";
        if (
          !response.ok ||
          !html.includes(`<li>Private Bearer boundary-${identity}</li>`) ||
          html.includes(`Private Bearer boundary-${other}`)
        ) {
          throw new Error("Private server HTML mixed or lost request identity");
        }
        if (!/no-store/.test(response.headers.get("cache-control") ?? ""))
          throw new Error("Private HTML must not be cacheable");
        return {
          identity,
          status: response.status,
          cacheControl: response.headers.get("cache-control"),
        };
      }),
    );
    if (
      requests.filter((request) => request.url === "/api/v1/private-fixture")
        .length !== identities.length
    )
      throw new Error("Private responses were reused across HTTP requests");
    await writeFile(
      join(fixture, "private-runtime.json"),
      JSON.stringify(pages, null, 2),
    );
    console.log(
      "Concurrent private Server Components isolate identities, omit unrelated cookies/headers and return non-cacheable HTML.",
    );
  } finally {
    child.kill();
    await closed;
    await writeFile(join(fixture, "private-runtime.log"), output);
  }
}

const page =
  'import { newsApi } from "@ksu/api-client/server";\nimport Display from "./display";\nexport default async function Page() { const result = await newsApi.list(); return <Display items={result.data} />; }\n';
try {
  await writeFile(join(fixture, "app", "page.jsx"), page);
  const server = await build("server-build");
  if (server.code !== 0)
    throw new Error(
      `Server import failed. See ${join(fixture, "server-build.log")}`,
    );
  const html = await readFile(
    join(fixture, ".next", "server", "app", "index.html"),
    "utf8",
  );
  const route = await readFile(
    join(fixture, ".next", "server", "app", "probe.body"),
    "utf8",
  );
  const prerender = JSON.parse(
    await readFile(join(fixture, ".next", "prerender-manifest.json"), "utf8"),
  );
  if (
    prerender.routes["/private"] ||
    requests.some((request) => request.url === "/api/v1/private-fixture")
  )
    throw new Error(
      "Authenticated fetching must be deferred to request time, never embedded during prerendering.",
    );
  if (
    !html.includes("<li>Server data in client display</li>") ||
    !route.includes("boundary-fixture") ||
    requests.length < 1
  )
    throw new Error(
      "Server-fetched data missing from initial client-component HTML or route response.",
    );
  await verifyPrivateRuntime();
  await writeFile(
    join(fixture, "requests.json"),
    JSON.stringify(requests, null, 2),
  );
  console.log(
    "Server domain adapters fetch real HTTP data in Server Components and route handlers; client display is present in initial HTML.",
  );
  await writeFile(
    join(fixture, "app", "page.jsx"),
    '"use client";\nimport { createServerApiClient } from "@ksu/api-client/server";\nexport default function Page() { return <p>{typeof createServerApiClient}</p>; }\n',
  );
  const client = await build("client-build");
  if (
    client.code === 0 ||
    !/needs "server-only"/.test(client.output) ||
    !/only works in a Server Component|Client Component/.test(client.output)
  ) {
    throw new Error(
      `Expected a server-only Client Component error. See ${join(fixture, "client-build.log")}`,
    );
  }
  console.log("Next rejects the same entry in a Client Component.");
  console.log(`Build evidence: ${fixture}`);
} finally {
  await new Promise((resolveClose) => backend.close(resolveClose));
}
