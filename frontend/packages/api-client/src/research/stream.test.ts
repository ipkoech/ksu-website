import { afterEach, expect, it, vi } from "vitest";
import { researchServiceApi as backend } from "./index";

afterEach(() => vi.unstubAllGlobals());

it("decodes fragmented UTF-8 events and CRLF records without losing the final record", async () => {
  const bytes = new TextEncoder().encode(
    'event: token\r\ndata: {"text":"Café"}\r\n\r\nevent: done\r\ndata: {}',
  );
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    },
  });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
  const events: unknown[] = [];
  await backend.streamAskAI({ message: "Example question" }, (event) =>
    events.push(event),
  );
  expect(events).toEqual([
    { event: "token", data: { text: "Café" } },
    { event: "done", data: {} },
  ]);
});
