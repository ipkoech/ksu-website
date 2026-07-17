import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = await readFile(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "realtime-provider.tsx"),
  "utf8",
);

assert.match(
  source,
  /setTimeout\(\(\) => client\.connect\(\), 0\)/,
  "RealtimeProvider must defer opening the socket so React effect cleanup can cancel speculative development mounts.",
);
assert.match(
  source,
  /clearTimeout\(connectTimer\)/,
  "RealtimeProvider must cancel a deferred socket connection during effect cleanup.",
);
assert.match(
  source,
  /event\.type === "event"/,
  "RealtimeProvider must process scoped domain events.",
);
assert.match(
  source,
  /event\.type === "sync\.required"/,
  "RealtimeProvider must recover from an expired resume cursor.",
);
assert.match(
  source,
  /schoolPortalQueryKeys/,
  "School events must invalidate exact scoped School Portal query roots.",
);
assert.match(
  source,
  /seenNotificationIds/,
  "Notification inserts must be deduplicated by event ID.",
);
