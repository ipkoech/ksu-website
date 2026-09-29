// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import { researchWorkspaceSupportApi } from "./admin-support";
import { researchAuthApi } from "./admin-auth";
import { setRWCommandIdentity } from "./admin-journal";
import { RWContractError } from "./admin-contract";
const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("../client", () => ({ mainApi: client, researchApi: client }));
beforeEach(() => { vi.resetAllMocks(); setRWCommandIdentity(A); });
it("binds Main-service security changes to the displayed account", async () => {
  client.post.mockResolvedValue({ status: "success", message: "Changed" });
  await researchWorkspaceSupportApi.changePassword("old-fixture-password", "new-fixture-password", "key");
  expect(client.post).toHaveBeenCalledWith("/api/v1/auth/change-password", expect.any(Object), expect.objectContaining({
    headers: { "Idempotency-Key": "key", "X-KSU-Expected-Actor": A },
  }));
});
it("rejects a profile for another account without activating it", async () => {
  client.get.mockResolvedValue({ status: "success", data: { id: B, email: "fixture@example.test", full_name: "Fixture", must_change_password: false } });
  await expect(researchWorkspaceSupportApi.me()).rejects.toThrow(RWContractError);
});
it("binds MFA setup but does not carry that expectation into forgotten-password", async () => {
  client.post.mockResolvedValueOnce({ status: "success", data: { secret: "JBSWY3DPEHPK3PXP", otpauth_uri: "otpauth://totp/KSU:fixture?secret=JBSWY3DPEHPK3PXP" } });
  await researchAuthApi.enroll("fixture-password", "enroll");
  expect(client.post.mock.calls[0][2].headers["X-KSU-Expected-Actor"]).toBe(A);
  client.post.mockResolvedValue({ status: "success", message: "Queued" });
  await researchAuthApi.forgot("fixture@example.test", "forgot");
  expect(client.post.mock.calls[1][2].headers["X-KSU-Expected-Actor"]).toBeUndefined();
});
it("keeps Main's native in-progress reply uncertain", async () => {
  const { RWCommandController } = await import("./admin-contract");
  client.post.mockRejectedValue(Object.assign(new Error("The command with this Idempotency-Key is still being processed"), {
    status: 409, code: "idempotency_in_progress",
  }));
  const controller = new RWCommandController(() => "same-key"), confirmed = vi.fn();
  await controller.execute(key => researchWorkspaceSupportApi.logout(key), confirmed);
  expect(controller.getSnapshot().error).toMatchObject({ uncertain: true, retryable: true });
  controller.reset();
  await controller.execute(async () => { throw new Error("Do not send a replacement"); }, confirmed);
  expect(client.post).toHaveBeenCalledTimes(1);
  expect(confirmed).not.toHaveBeenCalled();
});
