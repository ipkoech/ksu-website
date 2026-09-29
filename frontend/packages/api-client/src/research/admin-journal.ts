/** Durable *metadata*, not a token/draft store. IndexedDB serializes tab claims.
 * Uncertain commands never expire automatically and cannot be overwritten by a
 * new key. Recovery checks the server receipt; it never replays a stored body.
 */
import { rwId, rwProblem, rwResource, RWContractError, RWUnconfirmedCommandError } from "./admin-contract";

export interface RWCommandMeta { key: string; resource: string; record_id?: string; operation: string; command: string }
export interface RWJournalEntry extends RWCommandMeta {
  subject: string; slot: string; created_at: string;
  state: "pending" | "uncertain" | "confirmed" | "failed";
  /** Optional for v1 entries. True when a prior reservation may have dispatched.
   * This is metadata only; no request contents or credentials are retained.
   */
  prior_unconfirmed?: boolean;
}
export interface RWJournalReceipt {
  key: string; command: string; outcome: "pending" | "confirmed" | "recorded_failure";
}
export class RWJournalError extends Error {
  readonly code = "JOURNAL_BLOCKED";
  constructor(message: string) { super(message); this.name = "RWJournalError"; }
}
let identity: string | null = null;
export function setRWCommandIdentity(subject: string | null) { identity = subject === null ? null : rwId(subject); }
export function getRWCommandIdentity() { return identity; }
/** Publish identity only after the complete, still-current bootstrap succeeds.
 * Context reads have no side effects: a late/aborted response from an older
 * shell must never overwrite the active account used by write headers.
 */
export function acceptRWWorkspaceIdentity(accountId: unknown, contextSubject: unknown, signal: AbortSignal): string {
  signal.throwIfAborted();
  const account = rwId(accountId), subject = rwId(contextSubject);
  if (account !== subject) throw new RWContractError("The workspace account changed. Reload before continuing.");
  identity = subject;
  return subject;
}

/** Explicit null is reserved for initial account discovery, never a verified workspace write. */
export function rwExpectedActorHeaders(subject: string | null = identity): Record<string, string> {
  return subject === null ? {} : { "X-KSU-Expected-Actor": rwId(subject) };
}
const databaseName = "ksu-research-command-journal-v1";
const unresolved = (state: string) => state === "pending" || state === "uncertain";
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new RWJournalError("Browser storage is unavailable. No command was sent.")); return; }
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("entries", { keyPath: "key" });
      db.createObjectStore("slots", { keyPath: "slot" });
    };
    let blocked = false;
    request.onerror = () => reject(new RWJournalError("The command journal could not be opened. No new command was sent."));
    request.onblocked = () => { blocked = true; reject(new RWJournalError("Close older workspace tabs before upgrading the command journal.")); };
    request.onsuccess = () => { if (blocked) { request.result.close(); return; } request.result.onversionchange = () => request.result.close(); resolve(request.result); };
  });
}
function validatedMeta(meta: RWCommandMeta): RWCommandMeta {
  if (!meta.key || meta.key.length > 255 || !meta.operation.trim() || meta.operation.length > 100 || !/^(POST|PATCH|PUT|DELETE) \/api\/v1\//.test(meta.command) || meta.command.length > 255) throw new RWJournalError("Invalid command metadata. Nothing was sent.");
  return { key: meta.key, operation: meta.operation, command: meta.command, resource: rwResource(meta.resource), record_id: meta.record_id ? rwId(meta.record_id) : undefined };
}
export async function reserveRWCommand(subject: string, info: RWCommandMeta): Promise<RWJournalEntry> {
  subject = rwId(subject);
  const meta = validatedMeta(info), slot = `${subject}:${meta.resource}:${meta.record_id ?? "new"}`, db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["entries", "slots"], "readwrite");
    const entries = transaction.objectStore("entries"), slots = transaction.objectStore("slots");
    let saved: RWJournalEntry, failure: Error | undefined;
    const abort = (message: string) => { failure = new RWJournalError(message); transaction.abort(); };
    const existingSlot = slots.get(slot);
    existingSlot.onsuccess = () => {
      if (existingSlot.result && existingSlot.result.key !== meta.key) { abort("Another tab or an interrupted command is unresolved for this record. Open Command recovery before submitting again."); return; }
      const existing = entries.get(meta.key);
      existing.onsuccess = () => {
        const prior = existing.result as RWJournalEntry | undefined;
        if (prior && (prior.subject !== subject || prior.slot !== slot || prior.command !== meta.command)) { abort("This command key belongs to a different request. No command was sent."); return; }
        if (prior && prior.state === "confirmed") { abort("This command already has a recorded outcome. Reload the record before starting a new command."); return; }
        // A pending legacy entry can have dispatched before the tab closed.
        // Preserve that fact even though this new attempt becomes "pending".
        saved = prior ? { ...prior, state: "pending", prior_unconfirmed: unresolved(prior.state) || prior.prior_unconfirmed === true } :
          { ...meta, subject, slot, state: "pending", prior_unconfirmed: false, created_at: new Date().toISOString() };
        entries.put(saved); slots.put({ slot, key: meta.key });
      };
    };
    transaction.oncomplete = () => { db.close(); resolve(saved); notify(); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(failure ?? new RWJournalError("The command could not be recorded on this device. Nothing was sent.")); };
  });
}
/** Settle the latest attempt, without erasing any earlier uncertainty. */
export async function settleRWCommand(subject: string, key: string, state: RWJournalEntry["state"]): Promise<void> {
  return writeRWSettlement(subject, key, state);
}
/** Invoke only with a receipt from the validated, account-bound server API.
 * The expected command is captured by the recovery dialog, not taken from the
 * incoming receipt. Matching also occurs against the stored entry atomically.
 */
export async function settleRWReceipt(subject: string, expected: RWCommandMeta, receipt: RWJournalReceipt): Promise<void> {
  const meta = validatedMeta(expected);
  subject = rwId(subject);
  if (!receipt || receipt.key !== meta.key || receipt.command !== meta.command ||
      !["pending", "confirmed", "recorded_failure"].includes(receipt.outcome))
    throw new RWJournalError("The receipt does not match the original command. Its reservation was preserved.");
  if (receipt.outcome === "pending") return;
  return writeRWSettlement(subject, meta.key, receipt.outcome === "confirmed" ? "confirmed" : "failed", meta.command);
}
async function writeRWSettlement(subject: string, key: string, state: RWJournalEntry["state"], receiptCommand?: string): Promise<void> {
  subject = rwId(subject);
  if (!["confirmed", "failed", "uncertain"].includes(state)) throw new RWJournalError("Invalid settlement state");
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["entries", "slots"], "readwrite"), entries = transaction.objectStore("entries"), slots = transaction.objectStore("slots");
    let failure: Error | undefined;
    const request = entries.get(key);
    request.onsuccess = () => {
      const record = request.result as RWJournalEntry | undefined;
      if (!record || record.subject !== subject) { failure = new RWJournalError("No matching command exists for this account."); transaction.abort(); return; }
      if (receiptCommand !== undefined && receiptCommand !== record.command) {
        failure = new RWJournalError("The receipt is for a different stored command. Its reservation was preserved.");
        transaction.abort(); return;
      }
      // Late completion cannot reopen a settled command or clear a newer slot.
      if (!unresolved(record.state)) return;
      const nextState = state === "failed" && receiptCommand === undefined &&
        (record.state === "uncertain" || record.prior_unconfirmed === true) ? "uncertain" : state;
      entries.put({ ...record, state: nextState, prior_unconfirmed: nextState === "uncertain" });
      if (!unresolved(nextState)) {
        const claim = slots.get(record.slot);
        claim.onsuccess = () => { if (claim.result?.key === key) slots.delete(record.slot); };
      }
    };
    transaction.oncomplete = () => { db.close(); resolve(); notify(); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(failure ?? new RWJournalError("The local acknowledgement could not be stored. Check the server receipt before another command.")); };
  });
}
export async function listRWJournal(subject: string): Promise<RWJournalEntry[]> {
  subject = rwId(subject);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("entries", "readonly"), request = transaction.objectStore("entries").getAll();
    transaction.oncomplete = () => { db.close(); resolve((request.result as RWJournalEntry[]).filter(row => row.subject === subject).sort((a, b) => b.created_at.localeCompare(a.created_at))); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(new RWJournalError("The local command journal could not be read.")); };
  });
}
function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("rw-journal-change"));
  if (typeof BroadcastChannel !== "undefined") { const channel = new BroadcastChannel(databaseName); channel.postMessage("changed"); channel.close(); }
}
export function subscribeRWJournal(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("rw-journal-change", listener);
  const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(databaseName);
  if (channel) channel.onmessage = listener;
  return () => { window.removeEventListener("rw-journal-change", listener); channel?.close(); };
}
export async function clearRWSettledJournal(subject: string): Promise<void> {
  subject = rwId(subject);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("entries", "readwrite"), store = transaction.objectStore("entries"), request = store.openCursor();
    request.onsuccess = () => { const cursor = request.result; if (!cursor) return; const value = cursor.value as RWJournalEntry; if (value.subject === subject && !unresolved(value.state)) cursor.delete(); cursor.continue(); };
    transaction.oncomplete = () => { db.close(); resolve(); notify(); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(new RWJournalError("Local history could not be cleared.")); };
  });
}
export async function trackRWCommand<T>(meta: RWCommandMeta, request: () => Promise<T>): Promise<T> {
  // Server-side/unit consumers do not use a browser journal. The workspace's
  // authenticated context installs identity before rendering its child views.
  const subject = identity;
  if (typeof window === "undefined") return request();
  if (!subject) throw new RWJournalError("Reload your workspace to verify the account before submitting.");
  const reservation = await reserveRWCommand(subject, meta);
  const preserveHistory = (error: unknown): unknown => reservation.prior_unconfirmed && !rwProblem(error, true).uncertain
    ? new RWUnconfirmedCommandError(error) : error;
  if (identity !== subject) {
    // This attempt did not dispatch. A prior unresolved attempt still may have
    // committed, so only a brand-new unsent reservation can be released here.
    try { await settleRWCommand(subject, meta.key, "failed"); } catch { /* Recovery remains available. */ }
    throw preserveHistory(new RWJournalError("The workspace account changed before this command was sent. Reload the workspace."));
  }
  let result: T;
  try { result = await request(); }
  catch (error) {
    const preserved = preserveHistory(error);
    try { await settleRWCommand(subject, meta.key, rwProblem(preserved, true).uncertain ? "uncertain" : "failed"); } catch { /* The reservation remains locked; recovery can check its server receipt. */ }
    throw preserved;
  }
  // A local acknowledgement failure must never turn a committed write into an
  // invitation to execute a replacement command. Keep its slot for recovery.
  try { await settleRWCommand(subject, meta.key, "confirmed"); } catch { /* Confirmed server success remains success. */ }
  return result;
}
