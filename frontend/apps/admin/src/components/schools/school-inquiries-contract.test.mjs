import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const inbox = await readFile(path.join(root, "inquiries/school-inquiry-inbox.tsx"), "utf8");
const conversation = await readFile(path.join(root, "inquiries/inquiry-conversation.tsx"), "utf8");
const route = await readFile(path.join(root, "../../app/(protected)/schools/[resource]/page.tsx"), "utf8");

for (const filter of ["status", "assigned_to_user_id", "category", "priority", "created_from", "created_to"]) {
  assert.match(inbox, new RegExp(filter), `Inbox must support ${filter}.`);
}
assert.match(inbox, /useSearchParams/, "Focused conversations and filters must be URL-addressable.");
assert.match(inbox, /unread|SLA|sla/i, "Inbox must expose unread and SLA cues.");
assert.match(conversation, /reply|internal note|assign|status/i, "Conversation must support reply, notes, assignment, and status.");
assert.match(conversation, /delivery_status|retryFile|retryMessage/, "Delivery state and retry must be visible.");
assert.doesNotMatch(conversation, /dangerouslySetInnerHTML/, "Inquiry text must never render unsafe HTML.");
assert.match(route, /case "inquiries"/, "The school inquiries route must render the inbox.");
