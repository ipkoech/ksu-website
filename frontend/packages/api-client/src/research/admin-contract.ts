/** Strict boundaries for private Research data. No authorization from defaults. */
export type RWResource = string; // Values are validated and resolved against the server catalog.
export type RWTransition = "submit" | "approve" | "reject" | "unpublish";
export type RWAction = RWTransition | "edit" | "history" | "delete";
export type RWState = "draft" | "pending" | "published" | "rejected";
export type RWValue = string | number | boolean | null | RWValue[] | { [key: string]: RWValue };
export type RWDraft = Record<string, string | boolean>;
export interface RWField {
  key: string; label: string; section: string;
  kind: "string" | "text" | "uuid" | "uri" | "email" | "date" | "date-time" |
        "integer" | "number" | "boolean" | "decimal" | "json";
  required: boolean; nullable: boolean; create: boolean; update: boolean;
  max_length: number | null; minimum: number | null; maximum: number | null;
  default: RWValue;
  min_length?: number | null; pattern?: string | null; max_digits?: number | null; decimal_places?: number | null;
  enum_values?: Array<string | number | boolean>;
  json_shape?: "array" | "object" | null; item_kind?: string | null;
  reference_resource?: RWResource | null; help?: string;
  update_constraints?: { nullable: boolean; max_length: number | null; min_length?: number | null;
    minimum: number | null; maximum: number | null; pattern?: string | null; max_digits?: number | null; decimal_places?: number | null };
}
export interface RWModule {
  key: RWResource; label: string; singular: string;
  workflow: boolean; can_create: boolean; fields: RWField[];
  group?: string; description?: string; title_key?: string;
  columns?: string[]; filter_fields?: string[]; create_defaults?: Record<string, RWValue>;
  commands?: RWNativeCommand[];
}
export interface RWNativeCommand {
  key: string; label: string; description: string; destructive: boolean; fields: RWField[];
}
export interface RWRow {
  id: string; title: string; workflow_state: RWState | null; revision?: string;
  record: Record<string, unknown>; actions: Record<RWAction, boolean>; commands?: string[];
}
export interface RWPage {
  data: RWRow[];
  meta: { page: number; per_page: number; total: number; total_pages: number };
}
export interface RWContext {
  subject?: string;
  capabilities: Record<string, boolean>; allowed_navigation: string[];
  domains: string[]; is_global: boolean; can_review: boolean; can_publish: boolean;
}
export interface RWHistory {
  id: string; actor_id: string; previous_state: string; target_state: string;
  note: string | null; created_at: string;
}
export interface RWProblem {
  kind: "session" | "forbidden" | "validation" | "conflict" | "gateway" | "contract" | "cancelled" | "unexpected";
  title: string; message: string; fields: Record<string, string[]>;
  uncertain: boolean; retryable: boolean;
}
export class RWContractError extends Error {
  readonly code = "INVALID_RESPONSE";
  constructor(message = "The server response does not match the Research workspace contract.") {
    super(message); this.name = "RWContractError";
  }
}
/** A validation failure proven to occur BEFORE transport or journal reservation.
 * Never wrap a response or a transport failure in this type: those outcomes may
 * be uncertain. Values (especially credentials) must not appear in messages.
 */
export class RWInputError extends Error {
  readonly code = "LOCAL_VALIDATION_ERROR";
  readonly errors: Record<string, string[]>;
  constructor(message: string, field = "_form") {
    super(message);
    this.name = "RWInputError";
    this.errors = { [field]: [message] };
  }
}
/** Validate raw text without trimming passwords or echoing entered values. */
export function rwTextInput(value: unknown, field: string, label: string, minimum = 1, maximum = 255): string {
  if (typeof value !== "string" || value.length < minimum || value.length > maximum)
    throw new RWInputError(`${label} must be between ${minimum} and ${maximum} characters.`, field);
  return value;
}
export const RW_EDITORIAL_RESOURCES: readonly string[] = ["projects", "publications", "farms", "sustainability", "partners", "stories", "focus-areas", "impact-metrics"];
export const RW_PATHWAY_RESOURCES: readonly string[] = ["startups", "incubation-records", "competition-entries", "technology-transfer-cases"];
const actions: readonly RWAction[] = ["edit", "submit", "approve", "reject", "unpublish", "history"];
const states: readonly string[] = ["draft", "pending", "published", "rejected"];
const kinds: readonly string[] = ["string", "text", "uuid", "uri", "email", "date", "date-time", "integer", "number", "boolean", "decimal", "json"];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function rwObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RWContractError();
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new RWContractError();
  return value;
}
function boolean(value: unknown): boolean {
  if (typeof value !== "boolean") throw new RWContractError();
  return value;
}
function strings(value: unknown): string[] {
  if (!Array.isArray(value)) throw new RWContractError();
  return value.map(text);
}
function integer(value: unknown, min: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min) throw new RWContractError();
  return value;
}
function optionalNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new RWContractError();
  return value;
}
export function rwResource(value: string): RWResource {
  if (typeof value !== "string" || value.length > 64 || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value) || ["internal", "auth", "catalog", "context"].includes(value)) throw new RWContractError("Unsupported Research resource.");
  return value;
}
export function rwId(value: unknown): string {
  const id = text(value);
  if (!uuid.test(id)) throw new RWContractError("The server returned an invalid record identifier.");
  return id.toLowerCase();
}
/** Native KSU envelopes declare success explicitly. Legacy data-only envelopes
 * remain readable, but an explicit error/pending status can never be treated as
 * an acknowledgement merely because its data happens to have a valid shape.
 */
export function rwEnvelope(value: unknown): Record<string, unknown> {
  const envelope = rwObject(value);
  if (envelope.status !== undefined && envelope.status !== "success")
    throw new RWContractError("The service did not return a successful response envelope.");
  return envelope;
}
export function rwData(value: unknown): unknown { return rwEnvelope(value).data; }
export function readRWContext(value: unknown): RWContext {
  const raw = rwObject(rwData(value));
  const capabilities = Object.fromEntries(Object.entries(rwObject(raw.capabilities)).map(([key, enabled]) => [key, boolean(enabled)]));
  return { subject: raw.subject == null ? undefined : rwId(raw.subject), capabilities, allowed_navigation: strings(raw.allowed_navigation), domains: strings(raw.domains),
    is_global: boolean(raw.is_global), can_review: boolean(raw.can_review), can_publish: boolean(raw.can_publish) };
}
/** Reject prototype keys, excessive nesting, non-finite numbers and non-JSON values. */
export function rwJson(value: unknown, depth = 0): RWValue {
  if (depth > 20) throw new RWContractError("JSON nesting exceeds 20 levels.");
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map(item => rwJson(item, depth + 1));
  const record = rwObject(value);
  const prototype = Object.getPrototypeOf(record);
  if (prototype !== Object.prototype && prototype !== null) throw new RWContractError("Expected a plain JSON object.");
  if (Object.keys(record).some(key => ["__proto__", "constructor", "prototype"].includes(key)))
    throw new RWContractError("Unsafe JSON property name.");
  return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, rwJson(item, depth + 1)]));
}
export function readRWFields(value: unknown): RWField[] {
  if (!Array.isArray(value)) throw new RWContractError();
  const result = value.map((entry): RWField => {
    const field = rwObject(entry), key = text(field.key), kind = text(field.kind);
    if (!/^[a-z][a-z0-9_]*$/.test(key) || ["constructor", "prototype"].includes(key) || !kinds.includes(kind)) throw new RWContractError();
    const enums = field.enum_values ?? [];
    if (!Array.isArray(enums) || enums.some(item => !["string", "number", "boolean"].includes(typeof item) || (typeof item === "number" && !Number.isFinite(item)))) throw new RWContractError();
    if (new Set(enums.map(String)).size !== enums.length) throw new RWContractError();
    const limits = (v: unknown) => {
      const c = rwObject(v);
      if (c.pattern != null && typeof c.pattern !== "string") throw new RWContractError();
      for (const name of ["min_length", "max_length", "max_digits", "decimal_places"]) {
        const value = c[name];
        if (value != null && (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)) throw new RWContractError();
      }
      if (typeof c.minimum === "number" && typeof c.maximum === "number" && c.minimum > c.maximum) throw new RWContractError();
      return { nullable: boolean(c.nullable), max_length: optionalNumber(c.max_length), min_length: optionalNumber(c.min_length),
        minimum: optionalNumber(c.minimum), maximum: optionalNumber(c.maximum), pattern: c.pattern as string | null | undefined, max_digits: optionalNumber(c.max_digits), decimal_places: optionalNumber(c.decimal_places) };
    };
    if (field.json_shape != null && !["array", "object"].includes(String(field.json_shape))) throw new RWContractError();
    return { key, kind: kind as RWField["kind"], label: text(field.label), section: text(field.section),
      required: boolean(field.required), create: boolean(field.create), update: boolean(field.update), ...limits(field),
      default: rwJson(field.default ?? null), enum_values: enums as Array<string | number | boolean>,
      json_shape: (field.json_shape ?? null) as RWField["json_shape"], item_kind: typeof field.item_kind === "string" ? field.item_kind : null,
      reference_resource: field.reference_resource == null ? null : rwResource(text(field.reference_resource)),
      help: typeof field.help === "string" ? field.help : "",
      update_constraints: field.update_constraints == null ? undefined : limits(field.update_constraints) };
  });
  if (new Set(result.map(field => field.key)).size !== result.length) throw new RWContractError();
  return result;
}
export function readRWCatalog(value: unknown): RWModule[] {
  const raw = rwData(value);
  if (!Array.isArray(raw)) throw new RWContractError();
  const modules = raw.map((entry): RWModule => {
    const item = rwObject(entry), fields = readRWFields(item.fields);
    const defaults = rwObject(item.create_defaults ?? {});
    for (const [name, value] of Object.entries(defaults)) {
      if (!["is_active", "is_public", "status"].includes(name) || (name === "status" ? value !== "draft" : value !== false)) throw new RWContractError();
    }
    const commands = item.commands ?? [];
    if (!Array.isArray(commands)) throw new RWContractError();
    return { key: rwResource(text(item.key)), label: text(item.label), singular: text(item.singular),
      workflow: boolean(item.workflow), can_create: boolean(item.can_create), fields,
      group: typeof item.group === "string" ? item.group : "Research records",
      description: typeof item.description === "string" ? item.description : "",
      title_key: typeof item.title_key === "string" ? item.title_key : "title",
      columns: item.columns == null ? [] : strings(item.columns), filter_fields: item.filter_fields == null ? [] : strings(item.filter_fields),
      create_defaults: defaults as Record<string, RWValue>, commands: commands.map(entry => {
        const command = rwObject(entry);
        return { key: rwResource(text(command.key)), label: text(command.label), description: text(command.description),
          destructive: boolean(command.destructive), fields: readRWFields(command.fields) };
      }) };
  });
  if (new Set(modules.map(item => item.key)).size !== modules.length) throw new RWContractError();
  return modules;
}
export function readRWRow(value: unknown): RWRow {
  const item = rwObject(value), state = item.workflow_state;
  if (state !== null && (typeof state !== "string" || !states.includes(state))) throw new RWContractError();
  const grants = rwObject(item.actions), record = rwObject(item.record);
  if (item.revision != null && (typeof item.revision !== "string" || !/^"rw-[0-9a-f]{64}"$/.test(item.revision))) throw new RWContractError();
  // Missing/ill-typed permission flags are a contract failure, not truthy values.
  const allowed = Object.fromEntries(actions.map(key => [key, boolean(grants[key])])) as Record<RWAction, boolean>;
  if ((typeof record.title === "string" && record.title && record.title !== item.title) || rwId(record.id) !== rwId(item.id)) throw new RWContractError();
  allowed.delete = grants.delete == null ? false : boolean(grants.delete);
  return { id: rwId(item.id), title: text(item.title), workflow_state: state as RWState | null, revision: item.revision == null ? undefined : item.revision as string, record, actions: allowed,
    commands: item.commands == null ? [] : strings(item.commands) };
}
export function readRWPage(value: unknown, requested?: { page?: number; per_page?: number }): RWPage {
  const envelope = rwEnvelope(value), meta = rwObject(envelope.meta);
  if (!Array.isArray(envelope.data)) throw new RWContractError();
  const page = integer(meta.page, 1), per_page = integer(meta.per_page, 1), total = integer(meta.total, 0);
  const total_pages = integer(meta.total_pages, 0), data = envelope.data.map(readRWRow);
  if (per_page > 100 || total_pages !== Math.ceil(total / per_page) || data.length > per_page ||
      data.length > total || new Set(data.map(row => row.id)).size !== data.length) throw new RWContractError();
  if (requested && (page !== (requested.page ?? 1) || per_page !== (requested.per_page ?? 20)))
    throw new RWContractError("The returned page does not match the requested page. Reload before continuing.");
  return { data, meta: { page, per_page, total, total_pages } };
}
export function readRWHistory(value: unknown, requested?: { resource: string; id: string; per_page?: number }): RWHistory[] {
  const raw = rwData(value);
  if (!Array.isArray(raw) || (requested && raw.length > (requested.per_page ?? 25))) throw new RWContractError();
  const resource = requested ? rwResource(requested.resource) : undefined;
  const recordId = requested ? rwId(requested.id) : undefined;
  const entries = raw.map(entry => {
    const item = rwObject(entry), date = text(item.created_at);
    if (!Number.isFinite(Date.parse(date)) || (item.note !== null && (typeof item.note !== "string" || item.note.length > 2000))) throw new RWContractError();
    // WorkflowEventRead already includes both fields. Never attach events from
    // another record/resource to the displayed record's audit trail.
    if (requested && (item.resource_key !== resource || rwId(item.resource_id) !== recordId))
      throw new RWContractError("The returned workflow history belongs to a different record or resource.");
    return { id: rwId(item.id), actor_id: text(item.actor_id), previous_state: text(item.previous_state),
      target_state: text(item.target_state), created_at: date, note: item.note as string | null };
  });
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new RWContractError("Duplicate workflow events were returned.");
  return entries;
}
export function rwDraft(module: RWModule, row?: RWRow): RWDraft {
  return Object.fromEntries(module.fields.map(field => {
    const raw = row ? row.record[field.key] : field.default;
    let value: string | boolean = raw == null ? "" : typeof raw === "boolean" ? raw : field.kind === "json" ? JSON.stringify(raw, null, 2) : String(raw);
    if (field.kind === "date-time" && typeof value === "string" && value && Number.isFinite(Date.parse(value)))
      value = new Date(value).toISOString().slice(0, 16);
    if (field.kind === "boolean") value = raw == null ? "" : raw === true;
    return [field.key, value];
  }));
}
function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
export function buildRWPayload(module: RWModule, draft: RWDraft, initial?: RWDraft):
  { payload: Record<string, RWValue>; errors: Record<string, string[]> } {
  const payload: Record<string, RWValue> = {}, errors: Record<string, string[]> = {};
  for (const declared of module.fields) {
    const field = initial && declared.update_constraints ? { ...declared, ...declared.update_constraints } : declared;
    if (!(initial ? field.update : field.create) || (initial && draft[field.key] === initial[field.key])) continue;
    const raw = draft[field.key];
    // Omission is not a request to clear a nullable field, including partial edits.
    if (raw === undefined && (initial || !field.required)) continue;
    const fail = (message: string) => { errors[field.key] = [message]; };
    if (field.kind === "boolean") {
      if (raw === "" && field.nullable) { if (initial) payload[field.key] = null; }
      else if (typeof raw !== "boolean") fail("Choose a boolean value.");
      else payload[field.key] = raw;
      continue;
    }
    if (typeof raw !== "string") { fail("Enter a value."); continue; }
    const value = raw.trim();
    if (!value) {
      if (field.required || (initial && !field.nullable)) fail(`${field.label} cannot be empty.`);
      else if (initial) payload[field.key] = null;
      continue;
    }
    if (field.max_length !== null && [...value].length > field.max_length) { fail(`Use at most ${field.max_length} characters.`); continue; }
    if (field.min_length != null && [...value].length < field.min_length) { fail(`Use at least ${field.min_length} characters.`); continue; }
    if (field.enum_values?.length) {
      const match = field.enum_values.find(item => String(item) === value);
      if (match === undefined) fail("Choose one of the service's supported values."); else payload[field.key] = match;
      continue;
    }
    if (field.kind === "json") {
      if (value.length > 1_000_000) { fail("Use a smaller JSON value (maximum 1 MB in this editor)."); continue; }
      try {
        const parsed = rwJson(JSON.parse(value));
        if (field.json_shape === "array" && !Array.isArray(parsed)) throw new Error();
        if (field.json_shape === "object" && (!parsed || Array.isArray(parsed) || typeof parsed !== "object")) throw new Error();
        if (Array.isArray(parsed) && field.item_kind === "uuid" && parsed.some(item => typeof item !== "string" || !uuid.test(item))) throw new Error();
        if (Array.isArray(parsed) && field.item_kind === "string" && parsed.some(item => typeof item !== "string")) throw new Error();
        payload[field.key] = parsed;
      } catch { fail(`Enter valid ${field.json_shape ?? "structured"} JSON with the native item types. Unsafe keys and excessive nesting are not accepted.`); }
      continue;
    }
    if (field.key === "slug" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) { fail("Use lowercase letters, numbers and single hyphens."); continue; }
    if (field.kind === "uuid" && !uuid.test(value)) { fail("Enter a valid UUID, or leave this optional reference empty."); continue; }
    if (field.kind === "date" && !validDate(value)) { fail("Enter a valid calendar date."); continue; }
    if (field.kind === "date-time") {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !validDate(value.slice(0, 10)) ||
          (!Number.isFinite(Date.parse(`${value}:00Z`)) || Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59)) { fail("Enter a valid date and time in UTC."); continue; }
      payload[field.key] = `${value}:00Z`; continue;
    }
    if (field.kind === "uri") {
      try { const url = new URL(value); if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error(); }
      catch { fail("Enter an HTTP or HTTPS URL without embedded credentials."); continue; }
    }
    if (field.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { fail("Enter a valid email address."); continue; }
    if (field.kind === "decimal") {
      if (!/^-?\d+(?:\.\d+)?$/.test(value)) { fail("Enter an exact decimal amount, without commas or exponent notation."); continue; }
      const [whole, fraction = ""] = value.replace(/^-/, "").split(".");
      if (field.decimal_places != null && fraction.length > field.decimal_places) {
        fail(`Use at most ${field.decimal_places} decimal places; this field's storage does not preserve more.`); continue;
      }
      if (field.max_digits != null && field.decimal_places != null && whole.replace(/^0+/, "").length > field.max_digits - field.decimal_places) {
        fail("This amount exceeds the existing database field's precision."); continue;
      }
      payload[field.key] = value; continue; // Never round money through Number().
    }
    if (field.kind === "integer" || field.kind === "number") {
      const number = Number(value);
      if (!Number.isFinite(number) || (field.kind === "integer" && !Number.isSafeInteger(number)) ||
          (field.minimum !== null && number < field.minimum) || (field.maximum !== null && number > field.maximum)) {
        fail(`Enter a valid ${field.kind}${field.minimum !== null ? ` ≥ ${field.minimum}` : ""}${field.maximum !== null ? ` ≤ ${field.maximum}` : ""}.`); continue;
      }
      payload[field.key] = number; continue;
    }
    payload[field.key] = value;
  }
  const dates = module.key === "projects" ? [["start_date", "end_date"]] :
    module.key === "grants" ? [["project_start_date", "project_end_date"]] : [];
  for (const [start, end] of dates) {
    const a = draft[start], b = draft[end];
    if (typeof a === "string" && typeof b === "string" && validDate(a) && validDate(b) && b < a)
      errors[end] = ["End date must be on or after the start date."];
  }
  return { payload, errors };
}
/** A failed retry cannot prove that an earlier attempt did not commit.
 * This nominal local error carries sanitized display state across the journal
 * boundary. Never infer it from a server-supplied error-code string alone.
 */
export class RWUnconfirmedCommandError extends Error {
  readonly code = "PRIOR_OUTCOME_UNCONFIRMED";
  readonly problem: RWProblem;
  constructor(error: unknown) {
    const problem = rwAttemptProblem(error, true);
    super(problem.message);
    this.name = "RWUnconfirmedCommandError";
    this.problem = problem;
  }
}

export function rwProblem(error: unknown, write = false): RWProblem {
  if (error instanceof RWUnconfirmedCommandError) return error.problem;
  const raw = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const status = typeof raw.status === "number" ? raw.status : undefined, code = raw.code;
  const fields: Record<string, string[]> = {};
  if (raw.errors && typeof raw.errors === "object") for (const [key, value] of Object.entries(raw.errors))
    if (Array.isArray(value) && value.every(item => typeof item === "string")) fields[key] = value;
  const base = { fields, uncertain: false, retryable: false };
  // Only an in-process instance is proof of a local preflight rejection. A
  // server/transport code string must not downgrade an uncertain write.
  if (error instanceof RWInputError) return { ...base, kind: "validation", title: "Check the entered values",
    message: `${error.message} No request was sent. Correct the input and submit again.` };
  if (code === "JOURNAL_BLOCKED") return { ...base, kind: "conflict", title: "Command recovery required", message: typeof raw.message === "string" ? raw.message : "Open Command recovery before submitting another request." };
  // Cancelling the browser's wait is not a server-side rollback. A write may
  // have committed before its response was interrupted; preserve its key/slot.
  if (code === "CANCELLED" || raw.name === "AbortError") return write ? {
    ...base, kind: "cancelled", title: "Command acknowledgement interrupted", uncertain: true, retryable: true,
    message: "The request was cancelled locally, but the server outcome is unknown. Retry only the captured command key or check its receipt before starting another command.",
  } : { ...base, kind: "cancelled", title: "Request cancelled", message: "No new data was loaded." };
  if (status === 401) return { ...base, kind: "session", title: "Session needs attention", retryable: true,
    message: code === "AUTH_RETRY_REQUIRED" ? "Your session was refreshed. Submit this same command again." : "Sign in through the existing KSU sign-in page, then retry. Your form remains in memory." };
  if (status === 403) return { ...base, kind: "forbidden", title: "Action not permitted", message: "Your assignment or authentication assurance does not permit this action. Check your access or complete the required MFA step in the existing sign-in flow." };
  if (write && status === 409 && (raw.message === "Command is already in progress" ||
      raw.message === "The command with this Idempotency-Key is still being processed" ||
      code === "IDEMPOTENCY_IN_PROGRESS" || code === "idempotency_in_progress")) return {
    ...base, kind: "conflict", title: "The original command is still processing", uncertain: true, retryable: true,
    message: "Keep this form open. An explicit retry uses the original idempotency key; do not start a replacement command.",
  };
  if (status === 413 || status === 415) return { ...base, kind: "validation", title: "Upload or content rejected", message: "Reduce the file or structured-content size, or choose a file type supported by the service. The rejected request has not been reported as saved." };
  if (status === 400 || status === 422) return { ...base, kind: "validation", title: "Review the submitted values", message: "The server rejected the input. Correct the highlighted fields; nothing has been reported as saved." };
  if (status === 404) return { ...base, kind: "conflict", title: "Record or endpoint unavailable", message: "No accessible record was returned. Check your scope and confirm the workspace backend and gateway patch are installed." };
  if (status === 412 || status === 428) return { ...base, kind: "conflict", title: "Reload the latest record",
    message: "This record changed after you opened it, or its revision was not supplied. Your edits have not been applied. Reload and review the latest values before saving." };
  if (status === 409 && raw.message === "The signed-in account changed. Reload this workspace before continuing.")
    return { ...base, kind: "conflict", title: "The signed-in account changed",
      message: "This page belongs to a different account from the current session. Refresh access or reload this page to verify the account before submitting again. This rejected action has not been reported as saved." };
  if (status === 409) return { ...base, kind: "conflict", title: "Record or command conflict", message: "Reload the current record before making another change. A workflow transition or another editor may have changed it." };
  if (code === "INVALID_RESPONSE" || error instanceof RWContractError) return { ...base, kind: "contract", title: "Unexpected server response", retryable: true, uncertain: write,
    message: write ? "The command may have completed, but its response could not be verified. Retry the same command key or reconcile the record; do not create a second command." : "The response could not be validated. No substitute or mock data has been displayed." };
  if (status === 0 || (status !== undefined && (status >= 500 || [408, 429].includes(status)))) return { ...base, kind: "gateway", title: "Service temporarily unavailable", retryable: true, uncertain: write,
    message: write ? "Delivery could not be confirmed. The form is locked to this command; an explicit retry reuses its idempotency key." : "The gateway or service could not complete the request. Retry when it is reachable." };
  return { ...base, kind: "unexpected", title: "Request could not be completed", uncertain: write,
    message: "The outcome is not verified. Reload the record before starting another change." };
}
/** Combine the latest attempt with the captured command's unresolved history.
 * An authentication, validation or revision failure may occur before the
 * server reaches its idempotency receipt. Only a validated acknowledgement or
 * explicit receipt reconciliation resolves a previously uncertain command.
 */
export function rwAttemptProblem(error: unknown, unconfirmedBeforeAttempt = false): RWProblem {
  const problem = rwProblem(error, true);
  if (!unconfirmedBeforeAttempt || problem.uncertain) return problem;
  return { ...problem, uncertain: true, title: "Original command still unconfirmed",
    message: "This retry did not confirm the original command. An earlier attempt with the same key may already have completed. Resolve the current session or input issue, then retry only the captured key when available, or reconcile the original receipt. Do not start a replacement command." };
}

export function rwDisplay(value: unknown): string {
  if (value == null || value === "") return "Not recorded";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  try { return JSON.stringify(rwJson(value), null, 2); } catch { return "Unsupported value"; }
}
export function rwMoney(value: unknown, currency: unknown): string {
  if (value == null || value === "") return "Not recorded";
  const amount = String(value);
  if (!/^-?\d+(?:\.\d+)?$/.test(amount)) return "Invalid amount";
  const [whole, fraction] = amount.split(".");
  return `${typeof currency === "string" ? currency : "Currency not recorded"} ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${fraction === undefined ? "" : `.${fraction}`}`;
}


export interface RWCommandSnapshot { pending: boolean; error: RWProblem | null }
/** A tested, framework-independent write state machine. No automatic retries. */
export class RWCommandController {
  private snapshot: RWCommandSnapshot = { pending: false, error: null };
  private listeners = new Set<() => void>();
  private retryRequest: (() => Promise<void>) | null = null;
  private active = true;
  constructor(private readonly newKey: () => string = () => globalThis.crypto.randomUUID()) {}
  getSnapshot = (): RWCommandSnapshot => this.snapshot;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  setActive = (active: boolean) => { this.active = active; };
  private publish(snapshot: RWCommandSnapshot) { this.snapshot = snapshot; this.listeners.forEach(listener => listener()); }
  execute = async <T>(request: (key: string) => Promise<T>, confirmed: (result: T) => void): Promise<void> => {
    if (this.snapshot.pending || this.snapshot.error?.uncertain) return;
    let key: string;
    try { key = this.newKey(); }
    catch {
      this.publish({ pending: false, error: { kind: "unexpected", title: "Secure browser context required",
        message: "Open the workspace using HTTPS (or localhost). No command was sent.", fields: {}, uncertain: false, retryable: false } });
      return;
    }
    await this.attempt(request, confirmed, key);
  };
  private async attempt<T>(request: (key: string) => Promise<T>, confirmed: (result: T) => void, key: string): Promise<void> {
    if (this.snapshot.pending) return;
    const unconfirmedBeforeAttempt = this.snapshot.error?.uncertain === true;
    this.publish({ pending: true, error: null });
    let result: T;
    try { result = await request(key); }
    catch (error) {
      this.retryRequest = () => this.attempt(request, confirmed, key);
      this.publish({ pending: false, error: rwAttemptProblem(error, unconfirmedBeforeAttempt) });
      return;
    }
    this.retryRequest = null;
    this.publish({ pending: false, error: null });
    // A refresh/navigation failure after this point cannot turn into a write retry.
    if (this.active) confirmed(result);
  }
  retry = async (): Promise<void> => {
    if (!this.snapshot.pending && this.snapshot.error?.retryable) await this.retryRequest?.();
  };
  reset = () => {
    if (this.snapshot.pending || this.snapshot.error?.uncertain) return;
    this.retryRequest = null; this.publish({ pending: false, error: null });
  };
}

/** Export only records already returned in this scoped page, never a hidden full-data fetch. */
export function rwPageCsv(module: RWModule, rows: RWRow[]): string {
  const keys = ["id", ...module.fields.map(field => field.key)];
  const escape = (value: unknown) => {
    let text = value == null ? "" : typeof value === "object" ? JSON.stringify(rwJson(value)) : String(value);
    // Spreadsheet formula injection includes whitespace before a formula marker.
    if (/^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  return "\uFEFF" + [keys.map(escape).join(","), ...rows.map(row => keys.map(key => escape(row.record[key])).join(","))].join("\r\n") + "\r\n";
}

export interface RWListFilters {
  page?: number; per_page?: number; search?: string; state?: RWState; status?: string;
  filter_field?: string; filter_value?: string;
  sort?: "updated_at" | "created_at" | "title" | "name" | "deadline" | "display_order"; order?: "asc" | "desc";
}
export function rwListFilters(params: URLSearchParams, review = false): RWListFilters {
  const bounded = (key: string, fallback: number, max: number) => {
    const value = Number(params.get(key));
    return Number.isSafeInteger(value) && value >= 1 && value <= max ? value : fallback;
  };
  const state = params.get("state"), sort = params.get("sort");
  const field = params.get("filter_field"), value = params.get("filter_value");
  return { page: bounded("page", 1, 100000), per_page: bounded("per_page", 20, 100),
    search: params.get("search")?.trim().slice(0, 255) || undefined,
    status: params.get("status")?.trim().slice(0, 32) || undefined,
    state: review ? "pending" : state && states.includes(state) ? state as RWState : undefined,
    sort: sort && ["updated_at", "created_at", "title", "name", "deadline", "display_order"].includes(sort) ? sort as RWListFilters["sort"] : "updated_at",
    order: params.get("order") === "asc" ? "asc" : "desc",
    ...(field && value && /^[a-z][a-z0-9_]*$/.test(field) ? { filter_field: field.slice(0, 64), filter_value: value.slice(0, 255) } : {}),
  };
}
export function rwListQuery(filters: RWListFilters): string {
  const params = new URLSearchParams();
  for (const key of ["page", "per_page", "search", "state", "status", "filter_field", "filter_value", "sort", "order"] as const) {
    const value = filters[key];
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

/** Keep nested Pydantic item errors attached to the actual editable control. */
export function rwFieldErrors(fields: readonly { key: string }[], errors: Record<string, string[]>): Record<string, string[]> {
  const keys = new Set(fields.map(field => field.key)), result: Record<string, string[]> = {};
  for (const [path, messages] of Object.entries(errors)) {
    const fieldPath = path.replace(/^body\./, "").replace(/^values\./, "");
    const root = fieldPath.split(/[.\[]/, 1)[0], key = keys.has(root) ? root : "_form";
    const values = key === path ? messages : messages.map(message => `${path}: ${message}`);
    result[key] = [...(result[key] ?? []), ...values];
  }
  return result;
}

/** Only server-issued strong record revisions are valid edit preconditions. */
export function rwRevisionHeaders(revision?: string): Record<string, string> {
  if (revision === undefined) return {};
  if (!/^"rw-[0-9a-f]{64}"$/.test(revision)) {
    throw Object.assign(new Error("Reload the record to obtain a valid edit revision."), { status: 428 });
  }
  return { "If-Match": revision };
}
