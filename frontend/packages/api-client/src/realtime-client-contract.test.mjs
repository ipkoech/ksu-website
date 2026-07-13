import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "realtime.ts"), "utf8");

assert(
  source.includes("getResearchApiBaseUrl"),
  "Realtime research config must use the research service base URL.",
);
assert(
  source.includes('"/api/v1/realtime/research/config"'),
  "Realtime research config must call the research service config endpoint.",
);
assert(
  !source.includes('new URL("/api/v1/realtime/research/config", getMainApiBaseUrl())'),
  "Realtime research config should not be coupled to the main service base URL.",
);
assert(
  !source.includes('url.searchParams.set("access_token"'),
  "Realtime websocket client must rely on the HttpOnly auth cookie instead of exposing JWTs in URLs.",
);
assert(
  source.includes("this.buildUrl()"),
  "Realtime websocket URL construction must not receive an access token.",
);
