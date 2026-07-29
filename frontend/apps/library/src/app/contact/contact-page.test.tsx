import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ContactBranchSelector } from "./contact-branch-selector";

const branches = [
  { id: "main", name: "Main Library", address: "Main Campus", phone: "+254700000001", email: "main@example.com" },
  { id: "town", name: "Town Library", address: "Town Campus", phone: "+254700000002", email: "town@example.com" },
];

describe("ContactBranchSelector", () => {
  afterEach(() => cleanup());

  it("shows the first branch and updates details when another branch is selected", async () => {
    const user = userEvent.setup();
    render(<ContactBranchSelector branches={branches as never} />);

    expect(screen.getByText("+254700000001")).toBeVisible();
    await user.selectOptions(screen.getByLabelText("Select a library branch"), "town");
    expect(screen.getByText("+254700000002")).toBeVisible();
    expect(screen.queryByText("+254700000001")).not.toBeInTheDocument();
  });

  it("renders a general library fallback without branches", () => {
    render(<ContactBranchSelector branches={[]} />);
    expect(screen.getByRole("heading", { name: "General library desk" })).toBeVisible();
    expect(screen.getByText("Branch contact details are being updated.")).toBeVisible();
  });
});
