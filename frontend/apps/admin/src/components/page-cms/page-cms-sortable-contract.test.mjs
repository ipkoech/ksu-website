import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readComponent(fileName) {
  const filePath = path.join(__dirname, fileName);
  assert(fs.existsSync(filePath), `Expected sortable component to exist: ${fileName}`);
  return fs.readFileSync(filePath, "utf8");
}

const itemListSource = readComponent("sortable-item-list.tsx");
const sectionOutlineSource = readComponent("sortable-section-outline.tsx");
const orderStateSource = readComponent("sortable-order-state.ts");

for (const requiredSnippet of [
  "PointerSensor",
  "TouchSensor",
  "KeyboardSensor",
  "sortableKeyboardCoordinates",
  "useSensors(",
  "closestCenter",
  "verticalListSortingStrategy",
  "accessibility={{",
  "announcements: announcements",
  "screenReaderInstructions:",
  "aria-label={`Reorder ${label}`}",
  "GripVertical",
  "min-h-16",
  "h-11 w-11",
  "Unsaved order",
  "Save Order",
  "Cancel Order",
  "arrayMove(",
  "onOrderChange: (items: T[]) => void | Promise<void>;",
  "const handleSaveOrder = async () => {",
  "await onOrderChange(normalizedItems);",
  "receiveServerOrder",
  "role=\"alert\"",
]) {
  assert(itemListSource.includes(requiredSnippet), `Expected sortable item list to include: ${requiredSnippet}`);
}

for (const requiredSnippet of [
  "normalizeDisplayOrders",
  "display_order: (index + 1) * 10",
  "orderSignature",
  "confirmOrderSave",
  "rejectOrderSave",
  "cancelOrderEdit",
  "receiveServerOrder",
]) {
  assert(orderStateSource.includes(requiredSnippet), `Expected sortable order state to include: ${requiredSnippet}`);
}

for (const requiredSnippet of [
  "export function SortableSectionOutline",
  "sections:",
  "selectedSectionId",
  "onSelect",
  "onOrderChange",
  "void | Promise<void>",
  "SortableOutlineList",
]) {
  assert(sectionOutlineSource.includes(requiredSnippet), `Expected sortable section outline to include: ${requiredSnippet}`);
}

for (const forbiddenSnippet of ["pageSectionsApi", "sectionItemsApi", "fetch(", ".post(", ".patch(", ".put(", ".mutate("]) {
  assert(!itemListSource.includes(forbiddenSnippet), `Sortable item list must not mutate data: ${forbiddenSnippet}`);
  assert(!sectionOutlineSource.includes(forbiddenSnippet), `Sortable section outline must not mutate data: ${forbiddenSnippet}`);
}

const onDragEndMatch = itemListSource.match(/const handleDragEnd[\s\S]*?\n  };/);
assert(onDragEndMatch, "Expected a local onDragEnd handler");
assert(
  !/(onOrderChange|pageSectionsApi|sectionItemsApi|fetch\(|\.post\(|\.patch\(|\.put\(|\.mutate\()/.test(onDragEndMatch[0]),
  "onDragEnd must only update local order state",
);

console.log("Page CMS sortable contract checks passed.");
