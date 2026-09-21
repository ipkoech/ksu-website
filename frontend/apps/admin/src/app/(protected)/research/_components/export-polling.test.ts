import { describe, expect, it, vi } from "vitest";
import { waitForResearchExportPoll } from "./export-polling";

describe("waitForResearchExportPoll", () => {
  it("rejects promptly when the owning export is aborted", async () => {
    const controller = new AbortController();
    const pending = waitForResearchExportPoll(controller.signal, 10_000);

    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("resolves after the polling delay", async () => {
    vi.useFakeTimers();
    try {
      const controller = new AbortController();
      const pending = waitForResearchExportPoll(controller.signal, 500);

      await vi.advanceTimersByTimeAsync(500);

      await expect(pending).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
