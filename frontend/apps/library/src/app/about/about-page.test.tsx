import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AboutTabs } from "./about-tabs";

describe("AboutTabs", () => {
  it("switches from mission to vision content", async () => {
    const user = userEvent.setup();
    render(
      <AboutTabs
        items={[
          { label: "Mission", value: "Mission content" },
          { label: "Vision", value: "Vision content" },
        ]}
      />,
    );

    expect(screen.getByText("Mission content")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Vision" }));
    expect(screen.getByText("Vision content")).toBeVisible();
    expect(screen.queryByText("Mission content")).not.toBeInTheDocument();
  });

  it("renders no tabs when all content is empty", () => {
    const { container } = render(<AboutTabs items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
