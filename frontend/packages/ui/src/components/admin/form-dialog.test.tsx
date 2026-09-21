import "@testing-library/jest-dom/vitest";
import * as React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormDialog } from "./form-dialog";

afterEach(cleanup);

describe("FormDialog submission lifecycle", () => {
  it("submits once while a save is pending and preserves the form", async () => {
    let finish!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const onOpenChange = vi.fn();
    render(
      <FormDialog
        open
        title="Edit record"
        description="Save your changes"
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      >
        <input aria-label="Record name" defaultValue="Unsaved draft" />
      </FormDialog>,
    );
    const submit = screen.getByRole("button", { name: "Save" });
    const form = submit.closest("form")!;
    // Enter-key or programmatic submissions can arrive before an external
    // mutation flag has propagated back to the dialog.
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "Record name" })).toHaveValue(
      "Unsaved draft",
    );
    await act(async () => {
      finish();
    });
    expect(submit).toBeEnabled();
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledTimes(2);
    await act(async () => {
      finish();
    });
  });

  it("does not submit while its external pending flag is set", () => {
    const onSubmit = vi.fn(async () => {});
    render(
      <FormDialog
        open
        title="Edit record"
        description="Save your changes"
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        isSubmitting
      >
        <input aria-label="Record name" />
      </FormDialog>,
    );
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("preserves edits after a failed save and allows retry without exposing the error", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error("Private backend detail"))
      .mockResolvedValueOnce(undefined);
    render(
      <FormDialog
        open
        title="Edit record"
        description="Save your changes"
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      >
        <input aria-label="Record name" defaultValue="Unsaved draft" />
      </FormDialog>,
    );
    const submit = screen.getByRole("button", { name: "Save" });
    fireEvent.click(submit);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to save changes. Please try again.",
    );
    expect(
      screen.queryByText("Private backend detail"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Record name" })).toHaveValue(
      "Unsaved draft",
    );
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
