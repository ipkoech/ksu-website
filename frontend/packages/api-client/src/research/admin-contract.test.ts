import { describe, expect, it } from "vitest";
import { buildRWPayload, readRWPage, readRWRow, RWCommandController, RWContractError, rwMoney, rwProblem } from "./admin-contract";
import type { RWField, RWModule } from "./admin-contract";

const id = "12345678-1234-4234-8234-123456789abc";
const row = { id, title: "Research record", workflow_state: "draft", record: { id, title: "Research record" },
  actions: { edit: true, submit: true, approve: false, reject: false, unpublish: false, history: true } };
function moduleWith(key: string, patch: Partial<RWField> = {}): RWModule {
  return { key: "projects", label: "Projects", singular: "project", workflow: true, can_create: true,
    fields: [{ key, label: key, section: "Details", kind: "string", required: false, nullable: true,
      create: true, update: true, max_length: null, minimum: null, maximum: null, default: null, ...patch }] };
}
describe("private Research contract", () => {
  it("rejects missing data instead of showing an empty list", () => expect(() => readRWPage({})).toThrow(RWContractError));
  it("fails closed on truthy permission strings", () => expect(() => readRWRow({ ...row, actions: { ...row.actions, approve: "true" } })).toThrow(RWContractError));
  it("does not round decimal strings or erase zero", () => {
    expect(rwMoney("9007199254740993.12", "KES")).toBe("KES 9,007,199,254,740,993.12");
    expect(rwMoney("0.00", "KES")).toBe("KES 0.00");
  });
  it("sends only changed fields", () => expect(buildRWPayload(moduleWith("code"), { code: "ABC" }, { code: "ABC" }).payload).toEqual({}));
  it("clears an explicitly changed nullable field", () => expect(buildRWPayload(moduleWith("code"), { code: "" }, { code: "ABC" }).payload).toEqual({ code: null }));
  it("rejects impossible calendar dates", () => expect(buildRWPayload(moduleWith("start_date", { kind: "date" }), { start_date: "2026-02-31" }).errors.start_date).toBeDefined());
  it("rejects non-finite integer inputs", () => expect(buildRWPayload(moduleWith("year", { kind: "integer" }), { year: "Infinity" }).errors.year).toBeDefined());
  it("marks uncertain write outcomes without claiming failure or success", () => expect(rwProblem({ status: 0, code: "TIMEOUT" }, true).uncertain).toBe(true));
  it("preserves field-level validation errors", () => expect(rwProblem({ status: 422, errors: { title: ["Required"] } }).fields.title).toEqual(["Required"]));
});
describe("Research write state machine", () => {
  it("requires explicit retry with the same idempotency key", async () => {
    const keys: string[] = []; let attempts = 0; let confirmations = 0;
    const command = new RWCommandController(() => "same-key");
    const request = async (key: string) => { keys.push(key); if (++attempts === 1) throw { status: 502 }; return id; };
    await command.execute(request, () => { confirmations++; });
    expect(keys).toEqual(["same-key"]); expect(command.getSnapshot().error?.uncertain).toBe(true);
    await command.retry(); expect(keys).toEqual(["same-key", "same-key"]); expect(confirmations).toBe(1);
  });
  it("does not replace an uncertain command", async () => {
    let sent = 0; const command = new RWCommandController(() => "key");
    await command.execute(async () => { sent++; throw { status: 0 }; }, () => undefined);
    command.reset(); await command.execute(async () => { sent++; }, () => undefined);
    expect(sent).toBe(1);
  });
  it("allows correction after a definitive 422 rejection", async () => {
    const command = new RWCommandController(() => "key");
    await command.execute(async () => { throw { status: 422 }; }, () => undefined);
    command.reset(); expect(command.getSnapshot()).toEqual({ pending: false, error: null });
  });
});
