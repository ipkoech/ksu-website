import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PublicSectionDataDisplay } from "./section-data-display";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
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

it("renders section DTOs through the focused client display boundary", () => {
  const { container } = render(
    <PublicSectionDataDisplay
      currentHref="/about"
      hideContinue
      continueItems={[]}
      sections={[
        {
          eyebrow: "Mission",
          title: "A public mission",
          body: "A validated section body.",
          cards: [
            {
              title: "Research impact",
              body: "A server-projected card value.",
              icon: "book",
            },
          ],
        },
      ]}
    />,
  );

  expect(
    container.querySelector('[data-server-data-display="web-public-sections"]'),
  ).not.toBeNull();
  expect(container.textContent).toContain("A server-projected card value.");
});
