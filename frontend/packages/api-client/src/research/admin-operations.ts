/** Validated adapters for native associations, attribution, exports and receipts. */
import { researchApi } from "../client";
import { readRWCatalog, readRWFields, readRWPage, rwRevisionHeaders, rwData, rwEnvelope, rwId, rwObject, rwResource, RWContractError } from "./admin-contract";
import type { RWField, RWModule, RWValue } from "./admin-contract";
import type { RWFilters } from "./admin";
import { trackRWCommand, rwExpectedActorHeaders } from "./admin-journal";

export interface RWRelationship { target: string; label: string; can_link: boolean; assignment: boolean; fields: RWField[] }
export interface RWChild { key: string; module: RWModule }
export interface RWOperations { relationships: RWRelationship[]; children: RWChild[] }
export interface RWReceipt { key: string; command: string; state: "pending" | "completed" | "failed"; status_code: number | null; created_at: string; outcome: "confirmed" | "recorded_failure" | "pending" }
export interface RWReceipts { data: RWReceipt[]; meta: { page: number; per_page: number; total: number; total_pages: number } }
const root = "/api/v1/research-portal/operations";
const options = (signal?: AbortSignal) => ({ auth: "session" as const, cache: "no-store" as const, signal, headers: rwExpectedActorHeaders() });
const base = (resource: string, id: string) => `${root}/${rwResource(resource)}/${rwId(id)}`;
const commandOptions = (key: string, revision?: string) => ({ ...options(), headers: { ...rwExpectedActorHeaders(), ...rwRevisionHeaders(revision), "Idempotency-Key": key } });
function text(value: unknown) { if (typeof value !== "string" || !value.trim()) throw new RWContractError(); return value; }
function bool(value: unknown) { if (typeof value !== "boolean") throw new RWContractError(); return value; }
function count(value: unknown, minimum = 0) { if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) throw new RWContractError(); return value; }
export function readRWOperations(payload: unknown): RWOperations {
  const raw = rwObject(rwData(payload));
  if (!Array.isArray(raw.relationships) || !Array.isArray(raw.children)) throw new RWContractError();
  const relationships = raw.relationships.map(value => { const row = rwObject(value); return { target: rwResource(text(row.target)), label: text(row.label), can_link: bool(row.can_link), assignment: bool(row.assignment), fields: readRWFields(row.fields) }; });
  const children = raw.children.map(value => { const row = rwObject(value); return { key: rwResource(text(row.key)), module: readRWCatalog({ data: [row.module] })[0] }; });
  if (new Set(relationships.map(row => row.target)).size !== relationships.length || new Set(children.map(row => row.key)).size !== children.length) throw new RWContractError();
  return { relationships, children };
}
export function readRWReceipts(payload: unknown, requested?: { page: number; per_page: number; key?: string }): RWReceipts {
  const raw = rwEnvelope(payload), meta = rwObject(raw.meta);
  if (!Array.isArray(raw.data)) throw new RWContractError();
  const data = raw.data.map((value): RWReceipt => {
    const row = rwObject(value), state = text(row.state), outcome = text(row.outcome);
    if (!["pending", "completed", "failed"].includes(state) || !["confirmed", "recorded_failure", "pending"].includes(outcome)) throw new RWContractError();
    const status = row.status_code === null ? null : count(row.status_code, 100);
    if (status !== null && status > 599 || (state === "pending") !== (status === null)) throw new RWContractError();
    const expected = state === "pending" ? "pending" : state === "completed" && status! >= 200 && status! < 300 ? "confirmed" : "recorded_failure";
    if (outcome !== expected) throw new RWContractError();
    const created = text(row.created_at), key = text(row.key);
    if (!Number.isFinite(Date.parse(created)) || key.length > 255) throw new RWContractError();
    return { key, command: text(row.command), state: state as RWReceipt["state"], status_code: status, created_at: created, outcome: outcome as RWReceipt["outcome"] };
  });
  const page = count(meta.page, 1), per_page = count(meta.per_page, 1), total = count(meta.total), total_pages = count(meta.total_pages);
  if (per_page > 100 || data.length > per_page || total_pages !== Math.ceil(total / per_page) || total < data.length) throw new RWContractError();
  if (requested && (page !== requested.page || per_page !== requested.per_page ||
      (requested.key !== undefined && data.some(receipt => receipt.key !== requested.key))))
    throw new RWContractError("The returned receipts do not match the requested page or command key.");
  return { data, meta: { page, per_page, total, total_pages } };
}
export const researchOperationsApi = {
  catalog: async (resource: string, id: string, signal?: AbortSignal) => readRWOperations(await researchApi.get<unknown>(base(resource, id), undefined, options(signal))),
  links: async (resource: string, id: string, target: string, page = 1, signal?: AbortSignal) => readRWPage(await researchApi.get<unknown>(`${base(resource, id)}/relationships/${rwResource(target)}`, { page, per_page: 20 }, options(signal)), { page, per_page: 20 }),
  link: async (resource: string, id: string, target: string, targetId: string, values: Record<string, RWValue>, key: string, linked = true) => {
    const path = `${base(resource, id)}/relationships/${rwResource(target)}/${rwId(targetId)}`;
    return trackRWCommand({ key, resource, record_id: id, operation: linked ? "Link record" : "Unlink record", command: `${linked ? "PUT" : "DELETE"} ${root}/{resource}/{item_id}/relationships/{target}/{target_id}` }, async () => {
      const result = rwObject(rwData(linked ? await researchApi.put<unknown>(path, { values }, commandOptions(key)) : await researchApi.delete<unknown>(path, commandOptions(key))));
      if (rwId(result.source_id) !== rwId(id) || rwId(result.target_id) !== rwId(targetId) || result.linked !== linked) throw new RWContractError();
      return targetId;
    });
  },
  children: async (resource: string, id: string, collection: string, page = 1, signal?: AbortSignal) => readRWPage(await researchApi.get<unknown>(`${base(resource, id)}/children/${rwResource(collection)}`, { page, per_page: 20 }, options(signal)), { page, per_page: 20 }),
  saveChild: async (resource: string, id: string, collection: string, values: Record<string, RWValue>, key: string, childId?: string, revision?: string) => {
    const path = `${base(resource, id)}/children/${rwResource(collection)}`;
    return trackRWCommand({ key, resource, record_id: id, operation: childId ? "Edit attribution" : "Add attribution", command: `${childId ? "PATCH" : "POST"} ${root}/{resource}/{item_id}/children/{collection}${childId ? "/{child_id}" : ""}` }, async () => {
      const result = rwObject(rwData(childId ? await researchApi.patch<unknown>(`${path}/${rwId(childId)}`, { values }, undefined, commandOptions(key, revision)) : await researchApi.post<unknown>(path, { values }, commandOptions(key))));
      const saved = rwId(result.id);
      if (childId && saved !== rwId(childId)) throw new RWContractError();
      return saved;
    });
  },
  removeChild: async (resource: string, id: string, collection: string, childId: string, key: string, revision?: string) => trackRWCommand({ key, resource, record_id: id, operation: "Remove attribution", command: `DELETE ${root}/{resource}/{item_id}/children/{collection}/{child_id}` }, async () => {
    const result = rwObject(rwData(await researchApi.delete<unknown>(`${base(resource, id)}/children/${rwResource(collection)}/${rwId(childId)}`, commandOptions(key, revision))));
    if (rwId(result.id) !== rwId(childId) || result.deleted !== true) throw new RWContractError();
    return childId;
  }),
  export: async (resource: string, filters: RWFilters, format: "csv" | "json", signal?: AbortSignal): Promise<Blob> => {
    if (!["csv", "json"].includes(format)) throw new RWContractError();
    const { page: _page, per_page: _perPage, ...matching } = filters;
    const blob = await researchApi.download(`/api/v1/research-portal/export/${rwResource(resource)}`, { ...matching, format }, { ...options(signal), timeoutMs: 120000 });
    const mime = format === "csv" ? "text/csv" : "application/json";
    if (!(blob instanceof Blob) || blob.type.toLowerCase().split(";")[0].trim() !== mime || blob.size === 0 || blob.size > 50 * 1024 * 1024) throw new RWContractError("The gateway did not return a valid export file.");
    if (format === "json") {
      let parsed: unknown; try { parsed = JSON.parse(await blob.text()); } catch { throw new RWContractError("The export file contains invalid JSON."); }
      if (!Array.isArray(parsed) || parsed.length > 100000) throw new RWContractError("The export did not contain a record array.");
      for (const row of parsed) rwId(rwObject(row).id);
    } else if (!(await blob.slice(0, 16).text()).replace(/^\uFEFF/, "").startsWith("id,")) throw new RWContractError("The export did not contain the expected CSV record header.");
    return blob;
  },
  reconcile: async (key: string, command: string, requestKey: string) => {
    const raw = rwObject(rwData(await researchApi.post<unknown>("/api/v1/research-portal/receipts/reconcile", { key, command }, commandOptions(requestKey))));
    const receipt = readRWReceipts({ data: [raw], meta: { page: 1, per_page: 1, total: 1, total_pages: 1 } }).data[0];
    if (receipt.key !== key || receipt.command !== command || typeof raw.cancelled_before_execution !== "boolean") throw new RWContractError();
    return { ...receipt, cancelled_before_execution: raw.cancelled_before_execution };
  },
  receipts: async (page = 1, key?: string, signal?: AbortSignal) => {
    if (key !== undefined && (!key.trim() || key.length > 255)) throw new RWContractError();
    return readRWReceipts(await researchApi.get<unknown>("/api/v1/research-portal/receipts", { page, per_page: 25, key }, options(signal)), { page, per_page: 25, key });
  },
};
