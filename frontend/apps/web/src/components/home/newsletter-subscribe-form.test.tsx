import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { publicBackendApi } from "@/lib/browser-api";
import { NewsletterSubscribeForm } from "./newsletter-subscribe-form";

vi.mock("@/lib/browser-api", () => ({ publicBackendApi: { post: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("locks concurrent submissions and reuses the command key after an uncertain response", async () => {
  let reject!: (error: Error) => void;
  const post = vi.mocked(publicBackendApi.post);
  post.mockImplementationOnce(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  render(<NewsletterSubscribeForm />);
  const input = screen.getByLabelText("Email address");
  fireEvent.change(input, { target: { value: "reader@example.com" } });
  const form = input.closest("form")!;
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(post).toHaveBeenCalledTimes(1);
  const firstKey = post.mock.calls[0]![2]!.headers!["Idempotency-Key"];
  expect(firstKey).toMatch(/^[a-f0-9-]{36}$/);
  await act(async () => reject(new Error("Response lost")));
  expect(screen.getByRole("alert")).toHaveTextContent("Subscription failed");
  expect(input).toHaveValue("reader@example.com");
  post.mockResolvedValueOnce({ data: {} });
  await act(async () => fireEvent.submit(form));
  expect(post.mock.calls[1]![2]!.headers!["Idempotency-Key"]).toBe(firstKey);
  expect(screen.getByRole("status")).toHaveTextContent("You are subscribed");
  expect(input).toHaveValue("");
  fireEvent.change(input, { target: { value: "reader@example.com" } });
  post.mockResolvedValueOnce({ data: {} });
  await act(async () => fireEvent.submit(form));
  expect(post.mock.calls[2]![2]!.headers!["Idempotency-Key"]).not.toBe(
    firstKey,
  );
});

it("uses a new key when the user changes a rejected payload", async () => {
  const post = vi
    .mocked(publicBackendApi.post)
    .mockRejectedValue(new Error("Unavailable"));
  render(<NewsletterSubscribeForm />);
  const input = screen.getByLabelText("Email address");
  fireEvent.change(input, { target: { value: "first@example.com" } });
  await act(async () => fireEvent.submit(input.closest("form")!));
  fireEvent.change(input, { target: { value: "second@example.com" } });
  await act(async () => fireEvent.submit(input.closest("form")!));
  expect(post.mock.calls[1]![2]!.headers!["Idempotency-Key"]).not.toBe(
    post.mock.calls[0]![2]!.headers!["Idempotency-Key"],
  );
});
