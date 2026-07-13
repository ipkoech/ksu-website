import assert from "node:assert/strict";
import {
  formatInstantInTimeZone,
  zonedDateTimeToIso,
} from "./homepage-admission-timezone.ts";

assert.equal(
  formatInstantInTimeZone("2026-08-01T00:00:00Z", "Africa/Nairobi"),
  "2026-08-01T03:00",
);
assert.equal(
  zonedDateTimeToIso("2026-08-01T08:00", "Africa/Nairobi"),
  "2026-08-01T05:00:00.000Z",
);
assert.equal(zonedDateTimeToIso("", "Africa/Nairobi"), null);

assert.throws(
  () => zonedDateTimeToIso("2026-08-01T08:00", "Invalid/Timezone"),
  /Invalid time zone/,
);
