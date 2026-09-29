/** Main-owned supporting workflows, always through the shared gateway client. */
import { mainApi } from "../client";
import { getRWCommandIdentity, setRWCommandIdentity, rwExpectedActorHeaders } from "./admin-journal";
import { rwData, rwEnvelope, rwId, rwObject, rwTextInput, RWInputError, RWContractError } from "./admin-contract";

const privateOptions = (signal?: AbortSignal, subject: string | null = getRWCommandIdentity()) => ({
  auth: "session" as const, cache: "no-store" as const, signal, headers: rwExpectedActorHeaders(subject),
});
function commandOptions(key: string, auth: "none" | "session" = "session", subject: string | null = getRWCommandIdentity()) {
  return { ...privateOptions(undefined, subject), auth, headers: { ...rwExpectedActorHeaders(subject), "Idempotency-Key": key } };
}
function optionalText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") throw new RWContractError();
  return value;
}
function count(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new RWContractError();
  return value;
}
export interface RWSupportRecord { id: string; label: string; detail: string; is_public: boolean | null }
function supportRecord(value: unknown, kind: "media" | "persons"): RWSupportRecord {
  const item = rwObject(value), id = rwId(item.id);
  if (item.is_public != null && typeof item.is_public !== "boolean") throw new RWContractError();
  const name = kind === "media" ? optionalText(item.original_filename) ?? optionalText(item.filename) :
    optionalText(item.full_name) ?? [optionalText(item.first_name), optionalText(item.last_name)].filter(Boolean).join(" ");
  return { id, label: name || id, detail: kind === "media" ? optionalText(item.mime_type) ?? "" : optionalText(item.email) ?? "",
    is_public: typeof item.is_public === "boolean" ? item.is_public : null };
}
function authAcknowledgement(value: unknown): void {
  // Main's logout and password endpoints return SuccessResponse, not arbitrary
  // JSON. A successful HTTP status alone cannot confirm a sensitive mutation.
  const envelope = rwObject(value);
  if (envelope.status !== "success" || typeof envelope.message !== "string" || !envelope.message.trim()) throw new RWContractError();
}
export const researchWorkspaceSupportApi = {
  list: async (kind: "media" | "persons", page: number, search: string, signal?: AbortSignal) => {
    if (!["media", "persons"].includes(kind) || !Number.isSafeInteger(page) || page < 1 || page > 100000 || typeof search !== "string" || search.length > 255) throw new RWInputError("Invalid supporting directory request.");
    const envelope = rwEnvelope(await mainApi.get<unknown>(`/api/v1/${kind}`, { page, per_page: 20, search: search || undefined }, privateOptions(signal)));
    if (!Array.isArray(envelope.data)) throw new RWContractError();
    const meta = rwObject(envelope.meta), total = count(meta.total), returnedPage = count(meta.page), perPage = count(meta.per_page);
    const data = envelope.data.map(value => supportRecord(value, kind));
    if (returnedPage !== page || perPage !== 20 || data.length > 20 || data.length > total || new Set(data.map(item => item.id)).size !== data.length) throw new RWContractError();
    return { data, total, page: returnedPage, pages: Math.ceil(total / perPage) };
  },
  upload: async (file: File, isPublic: boolean, commandKey: string) => {
    // A UI safety limit below the existing 25 MB gateway body limit. The Main
    // service still determines allowed types, ownership and storage policy.
    if (typeof isPublic !== "boolean") throw new RWInputError("Choose an explicit upload visibility.", "is_public");
    if (typeof File === "undefined" || !(file instanceof File) || file.size < 1 || file.size > 24 * 1024 * 1024) throw new RWInputError("Choose a non-empty file no larger than 24 MiB.", "file");
    const body = new FormData(); body.append("file", file); body.append("is_public", String(isPublic));
    const response = await mainApi.post<unknown>("/api/v1/media/upload", body, commandOptions(commandKey));
    const media = supportRecord(rwData(response), "media");
    if (media.is_public !== isPublic) throw new RWContractError("Upload visibility was not confirmed. Check the media record before sharing or submitting again.");
    return media;
  },
  me: async (signal?: AbortSignal, expectedActor: string | null = getRWCommandIdentity()) => {
    // Capture the displayed identity before dispatch; discovery alone never
    // activates a Research write identity.
    const item = rwObject(rwData(await mainApi.get<unknown>("/api/v1/auth/me", undefined, privateOptions(signal, expectedActor))));
    const email = optionalText(item.email), name = optionalText(item.full_name);
    if (!email || typeof item.must_change_password !== "boolean") throw new RWContractError();
    const id = rwId(item.id);
    if (expectedActor !== null && id !== rwId(expectedActor))
      throw new RWContractError("The account changed. Reload the workspace before continuing.");
    return { id, email, name: name || email, must_change_password: item.must_change_password };
  },
  mfa: async (signal?: AbortSignal) => {
    const item = rwObject(rwData(await mainApi.get<unknown>("/api/v1/auth/mfa/status", undefined, privateOptions(signal))));
    if (typeof item.enabled !== "boolean") throw new RWContractError();
    const verified = optionalText(item.verified_at);
    if (verified && !Number.isFinite(Date.parse(verified))) throw new RWContractError();
    return { enabled: item.enabled, verified_at: verified, recovery_codes_remaining: count(item.recovery_codes_remaining) };
  },
  stepUp: async (password: string, mfaCode: string, commandKey: string) => {
    // Match Main's StepUpRequest/FactorRequest before dispatch; keep the
    // password byte-for-byte while normalizing only surrounding factor spaces.
    rwTextInput(password, "password", "Password", 8, 255);
    const factor = rwTextInput(typeof mfaCode === "string" ? mfaCode.trim() : mfaCode, "mfa_code", "MFA code", 6, 64);
    const item = rwObject(rwData(await mainApi.post<unknown>("/api/v1/auth/mfa/step-up", { password, mfa_code: factor },
      commandOptions(commandKey, "none"))));
    const verified = optionalText(item.verified_at);
    if (!verified || !Number.isFinite(Date.parse(verified))) throw new RWContractError();
    return verified;
  },
  changePassword: async (oldPassword: string, newPassword: string, commandKey: string, expectedActor: string | null = getRWCommandIdentity()) => {
    if (typeof oldPassword !== "string" || !oldPassword) throw new RWInputError("Enter your current password.", "old_password");
    if (typeof newPassword !== "string" || !newPassword || oldPassword === newPassword)
      throw new RWInputError("Enter a different new password.", "new_password");
    authAcknowledgement(await mainApi.post<unknown>("/api/v1/auth/change-password",
      { old_password: oldPassword, new_password: newPassword }, commandOptions(commandKey, "session", expectedActor)));
    setRWCommandIdentity(null);
  },
  logout: async (commandKey: string) => {
    authAcknowledgement(await mainApi.post<unknown>("/api/v1/auth/logout", undefined,
      commandOptions(commandKey, "none")));
    setRWCommandIdentity(null);
  },
};
