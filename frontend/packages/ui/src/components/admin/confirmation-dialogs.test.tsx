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
import { ConfirmDialog } from "./confirm-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

afterEach(cleanup);

describe.each(["confirm", "delete"] as const)("%s dialog", (kind) => {
  const renderDialog = (action: () => Promise<void>, onOpenChange = vi.fn()) =>
    render(
      kind === "confirm" ? (
        <ConfirmDialog
          open
          title="Confirm change"
          description="Review this change"
          onOpenChange={onOpenChange}
          onConfirm={action}
        />
      ) : (
        <DeleteConfirmDialog
          open
          onOpenChange={onOpenChange}
          onConfirm={action}
        />
      ),
    );

  it("runs one action and blocks dismissal while the returned promise is pending", async () => {
    let finish!: () => void;
    const action = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const onOpenChange = vi.fn();
    renderDialog(action, onOpenChange);
    const button = screen.getByRole("button", {
      name: kind === "confirm" ? "Confirm" : "Delete",
    });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(action).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).not.toHaveBeenCalled();
    await act(async () => {
      finish();
    });
    expect(button).toBeEnabled();
  });

  it("allows a retry after rejection without reporting success or exposing backend details", async () => {
    const action = vi
      .fn()
      .mockRejectedValueOnce(new Error("Private backend detail"))
      .mockResolvedValueOnce(undefined);
    const onOpenChange = vi.fn();
    renderDialog(action, onOpenChange);
    const button = screen.getByRole("button", {
      name: kind === "confirm" ? "Confirm" : "Delete",
    });
    fireEvent.click(button);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please try again.",
    );
    expect(
      screen.queryByText("Private backend detail"),
    ).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(button);
    await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

it("requires the typed deletion confirmation before invoking the action", () => {
  const action = vi.fn(async () => {});
  render(
    <DeleteConfirmDialog
      open
      itemCount={2}
      onOpenChange={vi.fn()}
      onConfirm={action}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(action).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "DELETE" },
  });
  expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
});
