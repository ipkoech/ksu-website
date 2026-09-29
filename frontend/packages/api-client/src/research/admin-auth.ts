/** Main-owned cookie authentication. Credentials never enter the command journal. */
import { mainApi } from "../client";
import { rwData, rwObject, rwTextInput, RWInputError, RWContractError } from "./admin-contract";
import { setRWCommandIdentity, rwExpectedActorHeaders } from "./admin-journal";
import { researchWorkspaceSupportApi } from "./admin-support";
const options = (key: string, signal?: AbortSignal) => ({ auth: "none" as const, cache: "no-store" as const, signal, headers: { "Idempotency-Key": key } });
// Only already-authenticated MFA operations are bound to the open workspace.
// Login, forgotten-password and token reset deliberately do not use this.
const authenticatedOptions = (key: string) => ({ ...options(key), headers: { ...rwExpectedActorHeaders(), "Idempotency-Key": key } });
function emailAddress(email: string) {
  if (typeof email !== "string" || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new RWInputError("Enter a valid email address.", "email");
}
function factor(value: unknown, optional = false): string {
  if (typeof value !== "string") throw new RWInputError("Enter an authenticator or recovery code.", "mfa_code");
  const normalized = value.trim();
  return optional && !normalized ? "" : rwTextInput(normalized, "mfa_code", "MFA code", 6, 64);
}
function acknowledgement(value: unknown) { const result = rwObject(value); if (result.status !== "success" || typeof result.message !== "string" || !result.message) throw new RWContractError(); }
export function safeRWReturnTo(value: string | null): string {
  if (!value || value.length > 2048 || /[\\\x00-\x20]/.test(value) || /%2f|%5c|%0[0-9a-f]|%25/i.test(value) || !/^\/admin(?:\/|\?|$)/.test(value)) return "/admin";
  const url = new URL(value, "https://workspace.invalid");
  if (url.origin !== "https://workspace.invalid" || !/^\/admin(?:\/|$)/.test(url.pathname) || /^\/admin\/(login|forgot-password|reset-password|password-required)(?:\/|$)/.test(url.pathname)) return "/admin";
  return `${url.pathname}${url.search}${url.hash}`;
}
export function readRWEnrollment(value: unknown): { secret: string; otpauth_uri: string } {
  const data = rwObject(rwData(value));
  if (typeof data.secret !== "string" || !/^[A-Z2-7]+=*$/.test(data.secret) || data.secret.length > 256 || typeof data.otpauth_uri !== "string" || data.otpauth_uri.length > 2048) throw new RWContractError();
  let uri: URL; try { uri = new URL(data.otpauth_uri); } catch { throw new RWContractError(); }
  if (uri.protocol !== "otpauth:" || uri.hostname !== "totp" || uri.username || uri.password || uri.searchParams.get("secret") !== data.secret) throw new RWContractError();
  return { secret: data.secret, otpauth_uri: data.otpauth_uri };
}
export function readRWRecoveryCodes(value: unknown): string[] {
  const data = rwObject(rwData(value));
  if (!Array.isArray(data.recovery_codes) || data.recovery_codes.length < 1 || data.recovery_codes.length > 100 || data.recovery_codes.some(code => typeof code !== "string" || !code || code.length > 128) || new Set(data.recovery_codes).size !== data.recovery_codes.length) throw new RWContractError();
  return data.recovery_codes as string[];
}
export const researchAuthApi = {
  login: async (email: string, password: string, code: string, key: string) => {
    emailAddress(email); rwTextInput(password, "password", "Password");
    const mfaCode = factor(code, true);
    setRWCommandIdentity(null);
    const data = rwObject(rwData(await mainApi.post<unknown>("/api/v1/auth/login", { email, password, token_transport: "cookie", ...(mfaCode ? { mfa_code: mfaCode } : {}) }, options(key))));
    if (data.authenticated !== true || data.token_type !== "cookie") throw new RWContractError("The service did not confirm cookie authentication. Check your session before retrying.");
    return researchWorkspaceSupportApi.me();
  },
  forgot: async (email: string, key: string) => { emailAddress(email); acknowledgement(await mainApi.post<unknown>("/api/v1/auth/forgot-password", { email, frontend_service: "research" }, options(key))); },
  reset: async (token: string, password: string, key: string) => { rwTextInput(token, "token", "Reset token", 1, 4096); rwTextInput(password, "new_password", "New password", 8); acknowledgement(await mainApi.post<unknown>("/api/v1/auth/reset-password", { token, new_password: password }, options(key))); setRWCommandIdentity(null); },
  enroll: async (password: string, key: string, previousCode?: string) => {
    rwTextInput(password, "password", "Password", 8);
    const currentCode = previousCode === undefined ? undefined : factor(previousCode);
    return readRWEnrollment(await mainApi.post<unknown>(`/api/v1/auth/mfa/${previousCode === undefined ? "enroll" : "replace"}`, { password, ...(currentCode === undefined ? {} : { mfa_code: currentCode }) }, authenticatedOptions(key)));
  },
  confirmEnrollment: async (code: string, key: string) => { const mfaCode = factor(code); return readRWRecoveryCodes(await mainApi.post<unknown>("/api/v1/auth/mfa/confirm", { mfa_code: mfaCode }, authenticatedOptions(key))); },
};
