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
  source.includes("MAX_WEBSOCKET_QUERY_TOKEN_LENGTH"),
  "Realtime websocket client must cap query-token size and rely on the auth cookie for oversized JWTs.",
);
assert(
  source.includes("token.length <= MAX_WEBSOCKET_QUERY_TOKEN_LENGTH"),
  "Realtime websocket client must not append oversized JWTs to the websocket URL.",
);
