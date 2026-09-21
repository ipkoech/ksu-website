import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CatalogResultsDisplay } from "./catalog-results-display";

afterEach(() => cleanup());

it("renders server-projected catalog DTOs through a client display marker", () => {
  const { container } = render(
    <CatalogResultsDisplay
      resources={[
        {
          id: "resource-1",
          title: "Evidence-led teaching",
          eyebrow: "Book",
          body: "A catalog record.",
          meta: ["Main Campus", "Available"],
        },
      ]}
    />,
  );

  expect(container.querySelector('[data-server-data-display="library-catalog-results"]')).not.toBeNull();
  expect(container.textContent).toContain("Evidence-led teaching");
});
