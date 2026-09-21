import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LibraryRecordsDisplay } from "./library-records-display";

afterEach(() => cleanup());

it("renders shared server-projected record DTOs through the requested marker", () => {
  const { container } = render(
    <LibraryRecordsDisplay
      marker="library-guides"
      records={[
        {
          id: "guide-1",
          icon: "book",
          eyebrow: "Subject guide",
          title: "Research methods",
          body: "A practical guide.",
          meta: ["Education"],
          href: "/guides/research-methods",
          action: "Open guide",
        },
      ]}
    />,
  );

  expect(container.querySelector('[data-server-data-display="library-guides"]')).not.toBeNull();
  expect(container.textContent).toContain("Research methods");
});
