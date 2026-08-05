import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BranchContactRow, DisclosureList, TabSet } from "./library-page-sections";

describe("library supporting page sections", () => {
  it("switches tab panels with accessible state", async () => {
    const user = userEvent.setup();
    render(
      <TabSet
        tabs={[
          { id: "mission", label: "Mission", content: <p>Mission text</p> },
          { id: "vision", label: "Vision", content: <p>Vision text</p> },
        ]}
      />,
    );

    expect(screen.getByText("Mission text")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Vision" }));
    expect(screen.getByRole("tab", { name: "Vision" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Vision text")).toBeVisible();
    expect(screen.queryByText("Mission text")).not.toBeInTheDocument();
  });

  it("opens one disclosure and closes the previously open item", async () => {
    const user = userEvent.setup();
    render(
      <DisclosureList
        items={[
          { id: "borrow", title: "Borrowing", content: <p>Borrowing details</p> },
          { id: "research", title: "Research support", content: <p>Research details</p> },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Borrowing" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Research support" }));
    expect(screen.getByText("Research details")).toBeVisible();
    expect(screen.getByRole("button", { name: "Borrowing" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("activates a branch row with a keyboard click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <BranchContactRow
        branch={{ id: "main", name: "Main Library" } as never}
        selected={false}
        onSelect={onSelect}
      />,
    );

    await user.tab();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("main");
  });
});
