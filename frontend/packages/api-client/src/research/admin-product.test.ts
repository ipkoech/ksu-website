import { beforeEach, describe, expect, it, vi } from "vitest";
import { researchWorkspaceApi, researchWorkspacePayload } from "./admin";
import { researchWorkspaceSupportApi } from "./admin-support";
import { RWCommandController, RWContractError, buildRWPayload, readRWCatalog, rwJson, rwListFilters } from "./admin-contract";
import type { RWField, RWModule } from "./admin-contract";

const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("../client", () => ({ researchApi: client, mainApi: client }));
const id = "12345678-1234-4234-8234-123456789abc";
const resources = ["projects","centers","programs","themes","focus-areas","expertise-tags","grants","grant-applications","grant-reviews","grant-reports","grant-guidelines","funders","endowments","publications","journals","outputs","innovations","startups","incubation-records","competition-entries","technology-transfer-cases","training","mentorship","mentorship-applications","mentorship-matches","scholarships","scholarship-applications","partners","consultancies","farms","sustainability","stories","impact-metrics","donors","donations","donation-impacts","donation-stories","donation-settings","resources","services","guidelines"];
const field = (key: string, extra: Partial<RWField> = {}): RWField => ({ key, label: key, section: "Details", kind: "string", required: false, nullable: true, create: true, update: true, max_length: null, minimum: null, maximum: null, default: null, ...extra });
const mod = (fields: RWField[]): RWModule => ({ key: "centers", label: "Centers", singular: "center", workflow: false, can_create: true, fields, title_key: "name" });
beforeEach(() => { vi.resetAllMocks(); client.post.mockResolvedValue({ data: { id } }); });
describe("native Research product adapters", () => {
  it.each(resources)("routes %s writes through the owning gateway prefix", async key => {
    await researchWorkspaceApi.save(key, { name: "Fixture" }, "fixed-key");
    expect(client.post).toHaveBeenCalledWith(`/api/v1/${key === "stories" ? "research/" : ""}${key}`, { name: "Fixture" }, expect.objectContaining({ headers: { "Idempotency-Key": "fixed-key" }, auth: "session", cache: "no-store" }));
  });
  it("supports the complete native catalog without hardcoded three-module parsing", () => expect(readRWCatalog({ data: resources.map(key => ({ ...mod([]), key })) })).toHaveLength(41));
  it.each([401,403,409,422,502,0])("does not replay a failed %s mutation automatically", async status => {
    client.post.mockRejectedValue({ status });
    await expect(researchWorkspaceApi.command("startups", id, "approve", {}, "key")).rejects.toEqual({ status });
    expect(client.post).toHaveBeenCalledTimes(1);
  });
  it("rejects fabricated grant commands before transport", async () => {
    await expect(researchWorkspaceApi.command("grants", id, "disburse", {}, "key")).rejects.toThrow(RWContractError);
    expect(client.post).not.toHaveBeenCalled();
  });
  it("derives a slug from a native name field", () => expect(researchWorkspacePayload(mod([field("name"),field("slug")]), { name: "Test Centre" }).payload.slug).toBe("test-centre"));
  it("preserves UUID lists as native JSON", () => expect(buildRWPayload(mod([field("ids", { kind: "json", json_shape: "array", item_kind: "uuid" })]), { ids: JSON.stringify([id]) }).payload.ids).toEqual([id]));
  it("rejects unsafe nested JSON", () => expect(() => rwJson(JSON.parse('{"__proto__":{}}'))).toThrow(RWContractError));
  it("does not round excessive decimal scale", () => expect(buildRWPayload(mod([field("amount", { kind: "decimal", max_digits: 8, decimal_places: 2 })]), { amount: "1.234" }).errors.amount).toBeDefined());
  it("keeps the pending review filter authoritative", () => expect(rwListFilters(new URLSearchParams("state=published"), true).state).toBe("pending"));
  it("never turns in-progress 409 into permission to replace a command", async () => {
    let count = 0; const keys: string[] = [];
    const controller = new RWCommandController(() => "captured");
    const request = async (key: string) => { keys.push(key); if (++count === 1) throw { status: 409, message: "Command is already in progress" }; return id; };
    await controller.execute(request, () => undefined); controller.reset();
    expect(controller.getSnapshot().error?.uncertain).toBe(true);
    await controller.retry(); expect(keys).toEqual(["captured", "captured"]);
  });
  it("rejects an invalid MFA acknowledgement", async () => {
    client.post.mockResolvedValue({ data: { verified_at: "bad" } });
    await expect(researchWorkspaceSupportApi.stepUp("test fixture", "123456", "mfa")).rejects.toThrow(RWContractError);
  });
});
