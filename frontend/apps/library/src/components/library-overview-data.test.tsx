import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LibraryOverviewData } from "./library-overview-data";

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("renders server-provided library DTOs through display markers", () => {
  const { container } = render(
    <LibraryOverviewData
      featuredResources={[]}
      branches={[{ id: "main", name: "Main Campus Library", address: "Kisii", location: null }]}
      updates={[]}
    />,
  );

  expect(container.querySelector('[data-server-data-display="library-branches"]')).not.toBeNull();
  expect(container.textContent).toContain("Main Campus Library");
});
