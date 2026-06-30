import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "research-ask-ai-widget.tsx"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  source.includes("fixed bottom-4 right-4") && source.includes("sm:bottom-6 sm:right-6"),
  "Ask AI trigger should float at the bottom-right on research pages",
);
assert(
  source.includes("TypingIndicator") && source.includes("motion dots"),
  "Ask AI should show a three-dot loading indicator while waiting for the final answer",
);
assert(
  !source.includes("Streaming response"),
  "Ask AI should not show a visible streaming-response label",
);
assert(
  source.includes("assistantDraft += delta") &&
    !source.includes("content: `${item.content}${delta}`"),
  "Ask AI should buffer streamed deltas and only render the final assistant response",
);
