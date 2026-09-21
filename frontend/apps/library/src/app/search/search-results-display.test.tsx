import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LibrarySearchResultsDisplay } from "./search-results-display";

afterEach(() => cleanup());

it("renders grouped server search DTOs through a client display marker", () => {
  const { container } = render(
    <LibrarySearchResultsDisplay
      panels={[
        {
          title: "Catalog records",
          href: "/catalog",
          results: [
            {
              id: "record-1",
              type: "catalog",
              title: "Library record",
              description: "A projected result.",
              libraryName: "Main Campus",
              url: null,
              metadata: { resourceType: "book", status: "available", slug: null, workflowType: null },
            },
          ],
        },
      ]}
    />,
  );

  expect(container.querySelector('[data-server-data-display="library-search-results"]')).not.toBeNull();
  expect(container.textContent).toContain("Library record");
});
