import { describe, expect, it, vi, beforeEach } from "vitest";
import { readRWHistory, readRWPage, rwData, RWCommandController, RWContractError } from "./admin-contract";

const transport = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("../client", () => ({ researchApi: transport }));
import { researchWorkspaceApi } from "./admin";

const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const other = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const row = (identifier = id) => ({ id: identifier, title: "Study", workflow_state: "draft",
  record: { id: identifier, title: "Study" },
  actions: { edit: true, submit: true, approve: false, reject: false, unpublish: false, history: true, delete: true } });
const event = () => ({ id: other, resource_key: "projects", resource_id: id,
  actor_id: other, previous_state: "absent", target_state: "draft", note: null, created_at: "2026-09-28T00:00:00Z" });
beforeEach(() => transport.get.mockReset());

describe("Research request/response integrity", () => {
  it("does not display a valid row returned for a different requested record", async () => {
    transport.get.mockResolvedValue({ data: row(other) });
    await expect(researchWorkspaceApi.get("projects", id)).rejects.toThrow(RWContractError);
    expect(transport.get).toHaveBeenCalledTimes(1);
  });
  it("accepts the requested record with normalized UUID case", async () => {
    transport.get.mockResolvedValue({ data: row() });
    expect((await researchWorkspaceApi.get("projects", id.toUpperCase())).id).toBe(id);
  });
  it.each(["error", "failed", "pending", null, 200])("rejects explicit non-success envelope status %s", status => {
    expect(() => rwData({ status, data: { id } })).toThrow(RWContractError);
  });
  it("preserves data-only envelope compatibility without accepting an explicit error", () => {
    expect(rwData({ data: { id } })).toEqual({ id });
  });
  it("does not confirm a write when its envelope declares an error", async () => {
    const controller = new RWCommandController(() => "key"), confirmed = vi.fn();
    await controller.execute(async () => rwData({ status: "error", data: { id } }), confirmed);
    expect(confirmed).not.toHaveBeenCalled();
    expect(controller.getSnapshot().error?.uncertain).toBe(true);
  });
  it("matches pagination to the requested page, not only internally consistent metadata", () => {
    const response = { data: [row()], meta: { page: 1, per_page: 20, total: 100, total_pages: 5 } };
    expect(() => readRWPage(response, { page: 2, per_page: 20 })).toThrow(RWContractError);
    expect(readRWPage(response, { page: 1, per_page: 20 }).data).toHaveLength(1);
  });
  it("requires history to belong to the selected resource and record", () => {
    const requested = { resource: "projects", id, per_page: 25 };
    expect(() => readRWHistory({ data: [{ ...event(), resource_id: other }] }, requested)).toThrow(RWContractError);
    expect(() => readRWHistory({ data: [{ ...event(), resource_key: "publications" }] }, requested)).toThrow(RWContractError);
    expect(readRWHistory({ data: [event()] }, requested)[0].previous_state).toBe("absent");
  });
  it("rejects duplicate history IDs rather than rendering duplicate audit events", () => {
    expect(() => readRWHistory({ data: [event(), event()] })).toThrow(RWContractError);
  });
});
