import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SearchResults } from "./search-results";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
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

it("renders server-provided search DTOs through the client display boundary", () => {
  const { container } = render(
    <SearchResults
      query="research"
      status="available"
      results={[
        {
          kind: "news",
          label: "News",
          title: "Research update",
          excerpt: "A published research record.",
          href: "/media/news/research-update",
        },
      ]}
    />,
  );

  expect(container.querySelector('[data-server-data-display="web-search-results"]')).not.toBeNull();
  expect(container.textContent).toContain("Research update");
});
