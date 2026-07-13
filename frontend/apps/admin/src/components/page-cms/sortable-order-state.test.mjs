import assert from "node:assert/strict";

import {
  beginOrderSave,
  cancelOrderEdit,
  confirmOrderSave,
  createOrderState,
  normalizeDisplayOrders,
  orderSignature,
  receiveServerOrder,
  rejectOrderSave,
  replaceDraftOrder,
} from "./sortable-order-state.ts";

const serverOrder = [
  { id: "section-b", display_order: 20 },
  { id: "section-a", display_order: 10 },
  { id: "section-c", display_order: 30 },
];

assert.deepEqual(
  normalizeDisplayOrders(serverOrder),
  [
    { id: "section-b", display_order: 10 },
    { id: "section-a", display_order: 20 },
    { id: "section-c", display_order: 30 },
  ],
  "normalization assigns deterministic display-order increments without mutating input",
);
assert.deepEqual(serverOrder.map((item) => item.display_order), [20, 10, 30], "normalization leaves source records unchanged");

assert.equal(
  orderSignature(serverOrder),
  orderSignature([...serverOrder].map((item) => ({ ...item }))),
  "a fresh array with the same identities and order has the same signature",
);
assert.notEqual(
  orderSignature(serverOrder),
  orderSignature([
    { ...serverOrder[1], display_order: 20 },
    { ...serverOrder[0], display_order: 10 },
    { ...serverOrder[2], display_order: 30 },
  ]),
  "a changed server order has a different signature",
);

const initial = createOrderState(serverOrder);
const localDraft = replaceDraftOrder(initial, [initial.orderedItems[1], initial.orderedItems[0], initial.orderedItems[2]]);
assert.equal(localDraft.isDirty, true, "a local reorder is dirty");

assert.strictEqual(
  receiveServerOrder(localDraft, [...serverOrder].map((item) => ({ ...item }))),
  localDraft,
  "a referentially new but semantically unchanged server order preserves the local draft",
);

const saving = beginOrderSave(localDraft);
assert.equal(saving.isSaving, true, "saving begins without accepting the draft as confirmed");
assert.equal(saving.isDirty, true, "saving keeps the draft dirty until confirmation");

const confirmed = confirmOrderSave(saving, localDraft.orderedItems);
assert.equal(confirmed.isSaving, false, "a resolved save stops saving");
assert.equal(confirmed.isDirty, false, "a resolved save confirms the draft");
assert.deepEqual(confirmed.confirmedItems, localDraft.orderedItems, "a resolved save updates the confirmed baseline");

const rejected = rejectOrderSave(saving, "Unable to save order.");
assert.equal(rejected.isSaving, false, "a rejected save stops saving");
assert.equal(rejected.isDirty, true, "a rejected save preserves the local draft");
assert.equal(rejected.saveError, "Unable to save order.", "a rejected save records an accessible error message");
assert.deepEqual(cancelOrderEdit(rejected).orderedItems, initial.confirmedItems, "cancel restores the last confirmed server order after rejection");

const serverUpdate = receiveServerOrder(localDraft, [
  { ...serverOrder[2], display_order: 10 },
  { ...serverOrder[0], display_order: 20 },
  { ...serverOrder[1], display_order: 30 },
]);
assert.equal(serverUpdate.isDirty, false, "a genuine server update clears the superseded local draft");
assert.deepEqual(
  serverUpdate.orderedItems.map((item) => item.id),
  ["section-c", "section-b", "section-a"],
  "a genuine server update deterministically replaces both baseline and draft",
);

console.log("Page CMS sortable order state checks passed.");
