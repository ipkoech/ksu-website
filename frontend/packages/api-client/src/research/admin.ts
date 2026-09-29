import { researchApi } from "../client";
import { trackRWCommand, rwExpectedActorHeaders } from "./admin-journal";
import type { FetchCacheOptions } from "../transport";
import { buildRWPayload, readRWCatalog, readRWContext, readRWHistory, readRWPage,
  readRWRow, rwRevisionHeaders, rwData, rwId, rwObject, rwResource, RWContractError, RW_EDITORIAL_RESOURCES, RW_PATHWAY_RESOURCES } from "./admin-contract";
import type { RWDraft, RWModule, RWResource, RWState, RWTransition, RWValue } from "./admin-contract";

const root = "/api/v1/research-portal/workspace";
// Bootstrap has no active write identity yet. Bind its reads explicitly to the
// account Main just verified so a cookie switch cannot mix one account's
// context with another account's catalog. This header is only an expectation;
// the Research service still verifies authentication and authorization.
const privateOptions = (signal?: AbortSignal, expectedActor?: string): FetchCacheOptions => ({
  auth: "session", cache: "no-store", signal,
  headers: expectedActor === undefined ? rwExpectedActorHeaders() : { "X-KSU-Expected-Actor": rwId(expectedActor) },
});
export interface RWFilters { page?: number; per_page?: number; search?: string; state?: RWState; status?: string; center_id?: string; filter_field?: string; filter_value?: string; sort?: "updated_at" | "created_at" | "title" | "name" | "deadline" | "display_order"; order?: "asc" | "desc" }
const validatedId = (value: unknown) => encodeURIComponent(rwId(value));
export function workspaceWritePath(resource: RWResource): string {
  const key = rwResource(resource);
  // The shared gateway reserves bare /stories for Main. Research's alias
  // preserves that contract rather than silently writing the wrong service.
  return `/api/v1/${key === "stories" ? "research/" : ""}${key}`;
}
/** Verify native innovation outcomes, not merely a matching record ID.
 * Values match InnovationPathwayAdminActionService. Optional nulls are ignored
 * by its apply_updates method; they must not be represented as cleared fields.
 */
function pathwayExpectedValues(resource: string, action: string, payload: Record<string, RWValue>): Record<string, RWValue> {
  const common: Record<string, Record<string, RWValue>> = {
    approve: { status: "active", is_active: true },
    publish: { status: "active", is_active: true, is_public: true },
    unpublish: { is_public: false },
    archive: { status: "archived", is_active: false, is_public: false, is_featured: false },
    feature: { is_featured: true }, unfeature: { is_featured: false },
  };
  if (Object.hasOwn(common, action)) return common[action];
  const rejectInput = (): never => { throw Object.assign(new Error("Supply the required native action values."), { status: 422 }); };
  if (action === "assign-mentors") {
    // MentorAssignmentAction uses default_factory=list; an omitted list is
    // an explicit native replacement with no mentors, not a schema error.
    const mentors = payload.mentor_ids === undefined ? [] : payload.mentor_ids;
    if (!Array.isArray(mentors)) return rejectInput();
    try { return { mentor_ids: mentors.map(value => rwId(value)) }; }
    catch { return rejectInput(); }
  }
  const names = action === "stage" ? (resource === "startups" ? ["venture_stage", "registration_status", "status"] : ["stage", "status"]) :
    action === "entry-status" ? ["entry_status", "award", "position", "status"] : ["transfer_status", "case_type", "status"];
  const required = payload[names[0]];
  if (typeof required !== "string" || !required.trim()) return rejectInput();
  const expected: Record<string, RWValue> = {};
  for (const name of names) {
    const value = payload[name];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") return rejectInput();
    expected[name] = value.trim();
  }
  return expected;
}
function verifyPathwayValues(result: Record<string, unknown>, expected: Record<string, RWValue>) {
  for (const [field, value] of Object.entries(expected)) {
    if (field === "mentor_ids" && Array.isArray(value)) {
      const actual = result[field];
      if (!Array.isArray(actual) || actual.length !== value.length || actual.some((item, index) => rwId(item) !== value[index]))
        throw new RWContractError("The returned mentor assignment could not be verified. Check the original command receipt.");
    } else if (result[field] !== value) {
      throw new RWContractError("The returned innovation action state could not be verified. Check the original command receipt.");
    }
  }
}
const workspaceApi = {
  context: async (signal?: AbortSignal, expectedActor?: string) => {
    const options = privateOptions(signal, expectedActor);
    const context = readRWContext(await researchApi.get<unknown>(`${root}/context`, undefined, options));
    if (expectedActor !== undefined && context.subject !== rwId(expectedActor))
      throw new RWContractError("The workspace account changed. Reload before continuing.");
    return context;
  },
  catalog: async (signal?: AbortSignal, expectedActor?: string) => readRWCatalog(await researchApi.get<unknown>(
    `${root}/catalog`, undefined, privateOptions(signal, expectedActor))),
  list: async (resource: RWResource, filters: RWFilters = {}, signal?: AbortSignal) => readRWPage(await researchApi.get<unknown>(
    `${root}/${rwResource(resource)}`, { ...filters }, privateOptions(signal)), filters),
  get: async (resource: RWResource, id: string, signal?: AbortSignal) => {
    const requestedId = rwId(id);
    const row = readRWRow(rwData(await researchApi.get<unknown>(
      `${root}/${rwResource(resource)}/${encodeURIComponent(requestedId)}`, undefined, privateOptions(signal))));
    if (row.id !== requestedId)
      throw new RWContractError("The returned record does not match the requested record. No record was displayed.");
    return row;
  },
  save: async (resource: RWResource, payload: Record<string, RWValue>, commandKey: string, id?: string, revision?: string) => {
    const options = { ...privateOptions(), headers: { ...rwExpectedActorHeaders(), ...rwRevisionHeaders(revision), "Idempotency-Key": commandKey } };
    const path = workspaceWritePath(resource);
    const response = id ? await researchApi.patch<unknown>(`${path}/id/${validatedId(id)}`, payload, undefined, options) :
      await researchApi.post<unknown>(path, payload, options);
    const savedId = rwId(rwObject(rwData(response)).id);
    if (id && savedId !== rwId(id)) throw new RWContractError();
    return savedId;
  },
  transition: async (resource: RWResource, id: string, action: RWTransition, note: string, commandKey: string) => {
    if (!RW_EDITORIAL_RESOURCES.includes(resource) || !["submit", "approve", "reject", "unpublish"].includes(action)) throw new Error("Unsupported editorial command");
    if (note.length > 2000) throw new Error("Notes must be at most 2000 characters");
    const value = await researchApi.post<unknown>(`/api/v1/research-workflow/${rwResource(resource)}/${validatedId(id)}/${action}`,
      { note: note.trim() || null }, { ...privateOptions(), headers: { ...rwExpectedActorHeaders(), "Idempotency-Key": commandKey } });
    const record = rwObject(rwData(value));
    const expected = action === "submit" ? "pending" : action === "approve" ? "published" : "rejected";
    if (rwId(record.id) !== rwId(id) || record.resource !== resource || record.workflow_state !== expected) throw new RWContractError();
    return id;
  },
  remove: async (resource: RWResource, id: string, commandKey: string, revision?: string) => {
    const value = await researchApi.delete<unknown>(`${workspaceWritePath(resource)}/id/${validatedId(id)}`,
      { ...privateOptions(), headers: { ...rwExpectedActorHeaders(), ...rwRevisionHeaders(revision), "Idempotency-Key": commandKey } });
    const deleted = rwObject(rwData(value));
    if (rwId(deleted.id) !== rwId(id) || deleted.deleted !== true) throw new RWContractError();
    return id;
  },
  command: async (resource: RWResource, id: string, action: string, payload: Record<string, RWValue>, commandKey: string) => {
    const special: Record<string, string[]> = { startups: ["stage"], "incubation-records": ["stage", "assign-mentors"],
      "competition-entries": ["entry-status"], "technology-transfer-cases": ["transfer-status"] };
    if (!RW_PATHWAY_RESOURCES.includes(resource) || !["approve", "publish", "unpublish", "archive", "feature", "unfeature", ...(special[resource] ?? [])].includes(action))
      throw new RWContractError("Unsupported native pathway command.");
    const expected = pathwayExpectedValues(resource, action, payload);
    const result = rwObject(rwData(await researchApi.post<unknown>(`${workspaceWritePath(resource)}/id/${validatedId(id)}/${action}`,
      payload, { ...privateOptions(), headers: { ...rwExpectedActorHeaders(), "Idempotency-Key": commandKey } })));
    if (rwId(result.id) !== rwId(id)) throw new RWContractError();
    verifyPathwayValues(result, expected);
    return id;
  },
  history: async (resource: RWResource, id: string, page: number, signal?: AbortSignal) => readRWHistory(await researchApi.get<unknown>(
    `/api/v1/research-workflow/${rwResource(resource)}/${validatedId(id)}/history`,
    { page, per_page: 25 }, privateOptions(signal)), { resource, id, per_page: 25 }),
};

export const researchWorkspaceApi = {
  ...workspaceApi,
  save: async (resource: RWResource, payload: Record<string, RWValue>, key: string, id?: string, revision?: string) =>
    trackRWCommand({ key, resource, record_id: id, operation: id ? "Save record" : "Create record",
      command: `${id ? "PATCH" : "POST"} ${workspaceWritePath(resource)}${id ? "/id/{item_id}" : ""}` },
      () => workspaceApi.save(resource, payload, key, id, revision)),
  transition: async (resource: RWResource, id: string, action: RWTransition, note: string, key: string) =>
    trackRWCommand({ key, resource, record_id: id, operation: action,
      command: `POST /api/v1/research-workflow/{resource_key}/{item_id}/${action}` },
      () => workspaceApi.transition(resource, id, action, note, key)),
  remove: async (resource: RWResource, id: string, key: string, revision?: string) =>
    trackRWCommand({ key, resource, record_id: id, operation: "Delete record",
      command: `DELETE ${workspaceWritePath(resource)}/id/{item_id}` },
      () => workspaceApi.remove(resource, id, key, revision)),
  command: async (resource: RWResource, id: string, action: string, payload: Record<string, RWValue>, key: string) =>
    trackRWCommand({ key, resource, record_id: id, operation: action,
      command: `POST ${workspaceWritePath(resource)}/id/{item_id}/${action}` },
      () => workspaceApi.command(resource, id, action, payload, key)),
};

/** Payload extension uses only native create fields; never mutate editorial state via PATCH. */
export function researchWorkspacePayload(module: RWModule, draft: RWDraft, initial?: RWDraft) {
  const result = buildRWPayload(module, draft, initial);
  const title = result.payload[module.title_key ?? "title"];
  if (!initial && module.fields.some(field => field.key === "slug" && field.create) && !result.payload.slug && typeof title === "string") {
    const slug = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 128).replace(/-$/, "");
    if (slug) result.payload.slug = slug;
    else result.errors.slug = ["Enter a URL slug using lowercase letters, numbers and hyphens."];
  }
  if (!initial) {
    Object.assign(result.payload, module.create_defaults ?? {});
    // Compatible with the original three-module catalog during rolling deploys.
    if (module.key === "projects") result.payload.is_public = false;
    if (module.key === "publications") result.payload.status = "draft";
  }
  return result;
}
