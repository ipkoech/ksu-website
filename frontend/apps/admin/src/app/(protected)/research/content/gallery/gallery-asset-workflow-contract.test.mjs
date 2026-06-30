import { readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const source = readFileSync(
  join(process.cwd(), "src/app/(protected)/research/content/gallery/page.tsx"),
  "utf8",
);

assert(source.includes("useUpdateMedia"), "Gallery workflow must support in-place media metadata updates.");
assert(source.includes("useDeleteMedia"), "Gallery workflow must support asset delete/archive actions when the media API allows it.");
assert(source.includes("AssetUsageDrawer"), "Gallery workflow must expose a usage drawer for selected media assets.");
assert(source.includes("handleUpdateMedia"), "Gallery workflow must submit explicit media update payloads.");
assert(source.includes("handleDeleteMedia"), "Gallery workflow must call the real media delete endpoint for asset removal.");
assert(source.includes("useMediaLinks"), "Gallery workflow must use the real media links endpoint for usage preview.");
