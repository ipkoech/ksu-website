// @vitest-environment node
// Repository-native equivalents of the executed standalone regressions.
import { describe, expect, it, vi } from "vitest";
import { RWCommandController, RWInputError } from "./admin-contract";
import { RWBatchController } from "./admin-batch";
import type { RWRow } from "./admin-contract";
const id = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const row = (value: string): RWRow => ({ id: value, title: "Fixture", record: { id: value },
  workflow_state: "draft", actions: { edit: true, submit: true, approve: false,
    reject: false, unpublish: false, history: false, delete: false } });
describe("unresolved history across explicit retries", () => {
  it.each([401, 403, 409, 412, 422])("does not unlock a command when retry returns %s", async status => {
    const key = vi.fn(() => "captured-key"), confirmed = vi.fn();
    const command = new RWCommandController(key);
    const request = vi.fn().mockRejectedValueOnce({ status: 0, code: "TIMEOUT" }).mockRejectedValue({ status });
    await command.execute(request, confirmed);
    await command.retry();
    expect(command.getSnapshot().error?.uncertain).toBe(true);
    command.reset();
    const replacement = vi.fn();
    await command.execute(replacement, confirmed);
    expect(replacement).not.toHaveBeenCalled();
    expect(confirmed).not.toHaveBeenCalled();
    expect(key).toHaveBeenCalledTimes(1);
    expect(request.mock.calls.map(call => call[0])).toEqual(["captured-key", "captured-key"]);
  });
  it("keeps the batch paused until the original uncertain item is confirmed", async () => {
    const batch = new RWBatchController(), request = vi.fn()
      .mockRejectedValueOnce({ status: 0 }).mockRejectedValueOnce({ status: 401 }).mockResolvedValue(undefined);
    await batch.start("projects", "submit", [row(id), row(other)], request);
    await batch.resume();
    expect(batch.getSnapshot().items.map(item => item.status)).toEqual(["uncertain", "waiting"]);
    await batch.resume();
    expect(batch.getSnapshot().items.map(item => item.status)).toEqual(["confirmed", "confirmed"]);
    expect(request.mock.calls.slice(0, 3).map(call => call[1])).toEqual(Array(3).fill(request.mock.calls[0][1]));
  });
  it("still allows correction when the first attempt fails local validation", async () => {
    const command = new RWCommandController(() => "key");
    await command.execute(async () => { throw new RWInputError("Title is required.", "title"); }, () => {});
    expect(command.getSnapshot().error?.uncertain).toBe(false);
    command.reset();
    expect(command.getSnapshot().error).toBeNull();
  });
});
