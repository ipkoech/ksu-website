import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AskLibrarianForm } from "./ask-librarian-form";

const createInquiry = vi.hoisted(() => vi.fn());
vi.mock("@ksu/api-client", () => ({
  ApiClientError: class ApiClientError extends Error {},
  libraryServiceApi: { inquiries: { create: createInquiry } },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AskLibrarianForm", () => {
  it("aborts an in-flight inquiry when the form unmounts", async () => {
    let requestSignal: AbortSignal | undefined;
    createInquiry.mockImplementationOnce((_payload, options) => {
      requestSignal = options?.signal;
      return new Promise<void>((resolve) => options?.signal?.addEventListener("abort", () => resolve(), { once: true }));
    });
    const view = render(<AskLibrarianForm branches={[]} />);
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: "Library reader" } });
    fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "reader@example.com" } });
    fireEvent.change(screen.getByLabelText(/Topic/), { target: { value: "Catalog help" } });
    fireEvent.change(screen.getByLabelText(/Question/), { target: { value: "Where can I find this book?" } });
    fireEvent.submit(screen.getByRole("button", { name: "Send question" }).closest("form")!);
    await waitFor(() => expect(requestSignal).toBeDefined());

    view.unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
