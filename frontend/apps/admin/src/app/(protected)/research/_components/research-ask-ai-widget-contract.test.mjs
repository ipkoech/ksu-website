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
assert(
  source.includes("stripEchoedQuestion") && source.includes("/\\n#{2,3}\\s*Your question[\\s\\S]*$/i"),
  "Ask AI should hide legacy assistant echoes of the user's question",
);
assert(
  source.includes("const SCOPE_OPTIONS") &&
    source.includes("This page") &&
    source.includes("All research") &&
    source.includes("Mixed"),
  "Ask AI should expose page, global, and mixed research scope controls",
);
assert(
  source.includes("REFERENCE_OPTIONS") &&
    source.includes("/projects") &&
    source.includes("/grants") &&
    source.includes("/publications"),
  "Ask AI should expose slash-style research references",
);
assert(
  source.includes("scope: selectedScope") &&
    source.includes("intent_mode: selectedMode") &&
    source.includes("references: selectedReferences"),
  "Ask AI should send scope, intent mode, and selected references to the backend",
);
assert(
  source.includes("Using {scopeLabel}") && source.includes("SourceChips"),
  "Ask AI should show the active grounding scope and source chips in the chat UI",
);
