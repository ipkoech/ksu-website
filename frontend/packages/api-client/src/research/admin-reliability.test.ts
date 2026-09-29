// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RWCommandController, RWContractError, rwProblem, RW_PATHWAY_RESOURCES } from "./admin-contract";
import { researchWorkspaceApi } from "./admin";

const client = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("../client", () => ({ researchApi: client }));
const id = "12345678-1234-4234-8234-123456789abc";
beforeEach(() => vi.resetAllMocks());

describe("mutation delivery assurance", () => {
  it.each([{ code: "CANCELLED", status: 0 }, { name: "AbortError" }])("retains uncertainty for aborted mutations: %j", error => {
    expect(rwProblem(error, true)).toMatchObject({ uncertain: true, retryable: true });
    expect(rwProblem(error)).toMatchObject({ kind: "cancelled", uncertain: false, retryable: false });
  });
  it("never replaces the key after a cancelled acknowledgement", async () => {
    const keys: string[] = [];
    const machine = new RWCommandController(() => "captured-key");
    const request = async (key: string) => { keys.push(key); if (keys.length === 1) throw { code: "CANCELLED", status: 0 }; return id; };
    await machine.execute(request, () => undefined);
    machine.reset();
    await machine.execute(async () => { throw new Error("must not run"); }, () => undefined);
    await machine.retry();
    expect(keys).toEqual(["captured-key", "captured-key"]);
  });
  it.each(RW_PATHWAY_RESOURCES)("%s cannot publish successfully without the native state acknowledgement", async resource => {
    client.post.mockResolvedValue({ data: { id } });
    await expect(researchWorkspaceApi.command(resource, id, "publish", {}, "key")).rejects.toThrow(RWContractError);
    client.post.mockResolvedValue({ data: { id, status: "active", is_active: true, is_public: true } });
    await expect(researchWorkspaceApi.command(resource, id, "publish", {}, "key")).resolves.toBe(id);
  });
  it("validates a native stage result", async () => {
    client.post.mockResolvedValue({ data: { id, venture_stage: "idea" } });
    await expect(researchWorkspaceApi.command("startups", id, "stage", { venture_stage: "growth" }, "key")).rejects.toThrow(RWContractError);
  });
  it("respects native omitted-mentor default_factory=list", async () => {
    client.post.mockResolvedValue({ data: { id, mentor_ids: [] } });
    await expect(researchWorkspaceApi.command("incubation-records", id, "assign-mentors", {}, "key")).resolves.toBe(id);
  });
});
