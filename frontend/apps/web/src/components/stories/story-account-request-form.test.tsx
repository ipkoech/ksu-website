import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { storiesApi } from "@ksu/api-client";
import { StoryAccountRequestForm } from "./story-account-request-form";

vi.mock("@ksu/api-client", () => ({
  storiesApi: { requestContributorAccount: vi.fn() },
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function fill() {
  render(<StoryAccountRequestForm />);
  fireEvent.change(screen.getByLabelText("Full name"), {
    target: { value: "Test Contributor" },
  });
  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: "contributor@example.com" },
  });
  return screen
    .getByRole("button", { name: "Request account" })
    .closest("form")!;
}

it("reports confirmed success and resets the form after an asynchronous response", async () => {
  let resolve!: (value: never) => void;
  vi.mocked(storiesApi.requestContributorAccount).mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const form = fill();
  fireEvent.submit(form);
  expect(screen.getByLabelText("Full name")).toHaveValue("Test Contributor");
  await act(async () => resolve({ data: { id: "request-fixture" } } as never));
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Your request has been submitted",
  );
  expect(screen.getByLabelText("Full name")).toHaveValue("");
});

it("prevents concurrent submissions and keeps input available after rejection", async () => {
  let reject!: (error: Error) => void;
  vi.mocked(storiesApi.requestContributorAccount).mockImplementation(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  const form = fill();
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(storiesApi.requestContributorAccount).toHaveBeenCalledTimes(1);
  await act(async () => reject(new Error("Temporary outage")));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "could not submit",
  );
  expect(screen.getByLabelText("Full name")).toHaveValue("Test Contributor");
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Request account" }),
    ).toBeEnabled(),
  );
});
