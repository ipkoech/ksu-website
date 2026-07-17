import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = await readFile(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "realtime.ts"),
  "utf8",
);

assert.match(source, /\/api\/v1\/realtime\/ticket/, "WebSocket auth must use a short-lived HTTP ticket.");
assert.match(source, /ticket/, "The ticket must be attached to the socket URL.");
assert.doesNotMatch(source, /searchParams\.set\(["']access_token/, "Long-lived access tokens must never enter the socket URL.");
assert.match(source, /last_event_id|lastEventId/, "Reconnect must resume from the last acknowledged cursor.");
assert.match(source, /type:\s*"ack"/, "Processed domain events must be acknowledged.");
assert.match(source, /type:\s*"resume"/, "Open sockets must explicitly request resume.");
assert.match(source, /sync\.required/, "Expired cursors must surface a controlled sync request.");
assert.match(source, /Math\.random\(\)/, "Reconnect backoff must include jitter.");
assert.match(source, /seenEventIds/, "Duplicate event delivery must be suppressed.");
