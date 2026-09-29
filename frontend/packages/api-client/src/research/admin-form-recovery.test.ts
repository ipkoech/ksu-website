// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RWCommandController, RWContractError, RWInputError, rwProblem, rwTextInput } from "./admin-contract";
import { researchAuthApi } from "./admin-auth";
import { researchWorkspaceSupportApi } from "./admin-support";

const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("../client", () => ({ mainApi: client, researchApi: client }));
beforeEach(() => vi.resetAllMocks());

describe("pre-dispatch form validation", () => {
  it("marks local validation as editable, without offering a command retry", () => {
    const problem = rwProblem(new RWInputError("Enter a complete code.", "mfa_code"), true);
    expect(problem).toMatchObject({ kind: "validation", uncertain: false, retryable: false,
      fields: { mfa_code: ["Enter a complete code."] } });
    expect(problem.message).toContain("No request was sent");
  });
  it("does not trust a server error code as proof that no request was sent", () => {
    expect(rwProblem({ code: "LOCAL_VALIDATION_ERROR" }, true).uncertain).toBe(true);
    expect(rwProblem(new RWContractError(), true).uncertain).toBe(true);
  });
  it("does not trim a password or echo its value", () => {
    expect(rwTextInput(" password ", "password", "Password", 8)).toBe(" password ");
    expect(() => rwTextInput("secret", "password", "Password", 8)).toThrow(RWInputError);
    try { rwTextInput("secret", "password", "Password", 8); }
    catch (error) { expect(String(error)).not.toContain("secret"); }
  });
  it("allows a corrected login after an invalid MFA code without reloading", async () => {
    let key = 0;
    const controller = new RWCommandController(() => `key-${++key}`), confirmed = vi.fn();
    await controller.execute(k => researchAuthApi.login("fixture@example.test", "fixture-password", "12345", k), confirmed);
    expect(client.post).not.toHaveBeenCalled();
    expect(controller.getSnapshot().error?.uncertain).toBe(false);
    client.post.mockResolvedValue({ status: "success", data: { authenticated: true, token_type: "cookie" } });
    client.get.mockResolvedValue({ data: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", email: "fixture@example.test", full_name: "Fixture", must_change_password: false } });
    await controller.execute(k => researchAuthApi.login("fixture@example.test", "fixture-password", "123456", k), confirmed);
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(confirmed).toHaveBeenCalledTimes(1);
  });
  it("rejects an unchanged password locally while keeping the form editable", async () => {
    const controller = new RWCommandController(() => "key");
    await controller.execute(k => researchWorkspaceSupportApi.changePassword("fixture-password", "fixture-password", k), vi.fn());
    expect(client.post).not.toHaveBeenCalled();
    expect(controller.getSnapshot().error).toMatchObject({ kind: "validation", uncertain: false });
  });
  it("validates normalized MFA lengths before dispatch", async () => {
    await expect(researchAuthApi.confirmEnrollment(" 12345 ", "key")).rejects.toThrow(RWInputError);
    await expect(researchWorkspaceSupportApi.stepUp("fixture-password", "     ", "key")).rejects.toThrow(RWInputError);
    expect(client.post).not.toHaveBeenCalled();
  });
  it("preserves uncertainty after malformed success from an actual dispatch", async () => {
    client.post.mockResolvedValue({ data: {} });
    const controller = new RWCommandController(() => "captured-key"), confirmed = vi.fn();
    await controller.execute(k => researchAuthApi.confirmEnrollment("123456", k), confirmed);
    expect(controller.getSnapshot().error?.uncertain).toBe(true);
    controller.reset();
    await controller.execute(async () => { throw new Error("replacement must not run"); }, confirmed);
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(confirmed).not.toHaveBeenCalled();
  });
  it.each(["media", "persons"] as const)("rejects explicit error envelopes for %s", async kind => {
    client.get.mockResolvedValue({ status: "error", data: [], meta: { page: 1, per_page: 20, total: 0 } });
    await expect(researchWorkspaceSupportApi.list(kind, 1, "")).rejects.toThrow(RWContractError);
  });
});
