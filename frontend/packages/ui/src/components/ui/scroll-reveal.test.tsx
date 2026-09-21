import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ScrollReveal } from "./scroll-reveal";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("preserves server-data display markers on the rendered element", () => {
  const props = {
    as: "section" as const,
    "data-server-data-display": "research-search-results",
    children: "Search results",
  };
  const { container } = render(
    createElement(ScrollReveal, props),
  );

  expect(container.querySelector("section")?.getAttribute("data-server-data-display")).toBe(
    "research-search-results",
  );
});
