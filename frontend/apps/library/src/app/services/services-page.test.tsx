import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ServiceAccordion } from "./service-accordion";

describe("ServiceAccordion", () => {
  it("opens the first service and switches to another service", async () => {
    const user = userEvent.setup();
    render(
      <ServiceAccordion
        items={[
          { id: "borrow", title: "Borrowing", content: "Borrowing guidance" },
          { id: "research", title: "Research support", content: "Research guidance" },
        ]}
      />,
    );

    expect(screen.getByText("Borrowing guidance")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Research support" }));
    expect(screen.getByText("Research guidance")).toBeVisible();
    expect(screen.queryByText("Borrowing guidance")).not.toBeInTheDocument();
  });

  it("renders a useful empty state", () => {
    render(<ServiceAccordion items={[]} />);
    expect(screen.getByText("No public services are available yet.")).toBeVisible();
  });
});
