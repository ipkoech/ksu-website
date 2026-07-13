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
  SortableOrderController,
} from "./sortable-order-state.ts";

const serverOrder = [
  { id: "section-b", display_order: 20, revision: 2 },
  { id: "section-a", display_order: 10, revision: 4 },
  { id: "section-c", display_order: 30, revision: 6 },
];

assert.deepEqual(
  normalizeDisplayOrders(serverOrder),
  [
    { id: "section-b", display_order: 10, revision: 2 },
    { id: "section-a", display_order: 20, revision: 4 },
    { id: "section-c", display_order: 30, revision: 6 },
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
assert.notEqual(
  orderSignature(serverOrder),
  orderSignature(serverOrder.map((item) => ({ ...item, revision: item.revision + 1 }))),
  "a same-order revision update has a different server signature",
);

const initial = createOrderState(serverOrder);
const cleanServerUpdate = receiveServerOrder(
  initial,
  serverOrder.map((item) => ({ ...item, revision: item.revision + 10 })),
);
assert.notStrictEqual(cleanServerUpdate, initial, "a clean revision update replaces the confirmed state");
assert.equal(cleanServerUpdate.isDirty, false, "a clean revision update remains clean");
assert.deepEqual(
  cleanServerUpdate.orderedItems.map((item) => item.revision),
  [14, 12, 16],
  "a clean revision update replaces draft records with fresh server revisions",
);

const localDraft = replaceDraftOrder(initial, [initial.orderedItems[1], initial.orderedItems[0], initial.orderedItems[2]]);
assert.equal(localDraft.isDirty, true, "a local reorder is dirty");

assert.strictEqual(
  receiveServerOrder(localDraft, [...serverOrder].map((item) => ({ ...item }))),
  localDraft,
  "a referentially new but semantically unchanged server order preserves the local draft",
);

const rebasedDraft = receiveServerOrder(
  localDraft,
  serverOrder.map((item) => ({ ...item, revision: item.revision + 10 })),
);
assert.equal(rebasedDraft.isDirty, true, "a dirty revision update remains dirty");
assert.deepEqual(
  rebasedDraft.orderedItems.map((item) => item.id),
  ["section-b", "section-a", "section-c"],
  "a dirty revision update preserves the local ID order",
);
assert.deepEqual(
  rebasedDraft.orderedItems.map((item) => item.revision),
  [12, 14, 16],
  "a dirty revision update rebases the local draft onto fresh server revisions",
);

const rebasedWithAddedAndRemovedIds = receiveServerOrder(localDraft, [
  { id: "section-a", display_order: 10, revision: 14 },
  { id: "section-b", display_order: 20, revision: 12 },
  { id: "section-d", display_order: 30, revision: 1 },
]);
assert.deepEqual(
  rebasedWithAddedAndRemovedIds.orderedItems.map((item) => item.id),
  ["section-b", "section-a", "section-d"],
  "a dirty rebase removes deleted IDs and appends new IDs in server order",
);

const resetController = new SortableOrderController(serverOrder);
resetController.replaceDraftOrder([resetController.state.orderedItems[1], resetController.state.orderedItems[0], resetController.state.orderedItems[2]]);
resetController.resetServerOrder([
  { id: "section-c", display_order: 10, revision: 9 },
  { id: "section-a", display_order: 20, revision: 8 },
  { id: "section-b", display_order: 30, revision: 7 },
]);
assert.equal(resetController.state.isDirty, false, "an explicit reset discards a dirty local draft");
assert.deepEqual(
  resetController.state.orderedItems.map((item) => [item.id, item.revision]),
  [["section-c", 9], ["section-a", 8], ["section-b", 7]],
  "an explicit reset adopts the reloaded server order and revisions instead of rebasing",
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
  { ...serverOrder[2], display_order: 10, revision: 7 },
  { ...serverOrder[0], display_order: 20, revision: 3 },
  { ...serverOrder[1], display_order: 30, revision: 5 },
]);
assert.equal(serverUpdate.isDirty, true, "a genuine server update preserves a dirty local draft");
assert.deepEqual(
  serverUpdate.orderedItems.map((item) => item.id),
  ["section-b", "section-a", "section-c"],
  "a genuine server update keeps the local ID order after rebasing fresh records",
);

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const controller = new SortableOrderController(serverOrder);
controller.replaceDraftOrder([controller.state.orderedItems[1], controller.state.orderedItems[0], controller.state.orderedItems[2]]);
const pendingSave = deferred();
const savingPromise = controller.save(() => pendingSave.promise);
assert.equal(controller.state.isSaving, true, "a deferred save exposes loading state");
assert.equal(controller.state.isDirty, true, "a deferred save keeps the draft dirty");
pendingSave.resolve();
await savingPromise;
assert.equal(controller.state.isSaving, false, "a resolved deferred save clears loading state");
assert.equal(controller.state.isDirty, false, "a resolved deferred save confirms the draft");

controller.replaceDraftOrder([controller.state.orderedItems[1], controller.state.orderedItems[0], controller.state.orderedItems[2]]);
const rejectedSave = deferred();
const rejectedSavePromise = controller.save(() => rejectedSave.promise);
assert.equal(controller.state.isSaving, true, "a deferred rejection exposes loading state before it settles");
rejectedSave.reject(new Error("request failed"));
await rejectedSavePromise;
assert.equal(controller.state.isSaving, false, "a rejected save clears loading state");
assert.equal(controller.state.isDirty, true, "a rejected save keeps the draft dirty");
assert.equal(controller.state.saveError, "Unable to save order. Try again or cancel to restore the saved order.", "a rejected save exposes an error");
controller.cancelOrderEdit();
assert.equal(controller.state.isDirty, false, "cancel clears the dirty draft after a rejection");
assert.equal(controller.state.saveError, null, "cancel clears a rejected-save error");

controller.replaceDraftOrder([controller.state.orderedItems[2], controller.state.orderedItems[0], controller.state.orderedItems[1]]);
const staleSave = deferred();
const staleSavePromise = controller.save(() => staleSave.promise);
controller.receiveServerOrder(serverOrder.map((item) => ({ ...item, revision: item.revision + 20 })));
assert.equal(controller.state.isSaving, false, "a server rerender supersedes an in-flight stale save");
assert.equal(controller.state.isDirty, true, "a server rerender keeps the local draft dirty");
assert.deepEqual(
  controller.state.orderedItems.map((item) => item.revision),
  [26, 22, 24],
  "a server rerender refreshes the local draft revisions",
);
staleSave.resolve();
await staleSavePromise;
assert.equal(controller.state.isDirty, true, "a stale save resolution cannot confirm a rebased draft");

let resentItems = null;
await controller.save(async (items) => {
  resentItems = items;
});
assert.deepEqual(
  resentItems.map((item) => item.revision),
  [26, 22, 24],
  "a save after rerender sends the rebased revisions",
);

console.log("Page CMS sortable order state checks passed.");
