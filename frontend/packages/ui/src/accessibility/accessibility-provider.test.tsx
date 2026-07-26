import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AccessibilityProvider,
  useAccessibility,
} from "./accessibility-provider";
import { AccessibilityShell } from "./accessibility-shell";
import { ACCESSIBILITY_STORAGE_KEY } from "./preferences";

function Harness() {
  const { preferences, setPreference, reset } = useAccessibility();

  return (
    <>
      <output aria-label="Text scale">{preferences.textScale}</output>
      <button onClick={() => setPreference("textScale", "larger")}>
        Larger
      </button>
      <button onClick={reset}>Reset</button>
    </>
  );
}

describe("AccessibilityProvider", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-a11y-text-scale");
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });

  it("persists and applies a preference", async () => {
    render(
      <AccessibilityProvider>
        <Harness />
      </AccessibilityProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Larger" }));

    expect(document.documentElement).toHaveAttribute(
      "data-a11y-text-scale",
      "larger",
    );
    expect(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)).toContain(
      '"textScale":"larger"',
    );
  });

  it("returns to defaults and removes owned attributes", async () => {
    render(
      <AccessibilityProvider>
        <Harness />
      </AccessibilityProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Larger" }));
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Text scale")).toHaveTextContent("default");
    expect(document.documentElement).not.toHaveAttribute(
      "data-a11y-text-scale",
    );
  });

  it("opens a labelled panel and applies the reading preset", async () => {
    render(
      <AccessibilityShell mainContentId="main">
        <main id="main">Page</main>
      </AccessibilityShell>,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Accessibility" }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Accessibility preferences",
      }),
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", { name: "Reading support" }),
    );

    expect(document.documentElement).toHaveAttribute(
      "data-a11y-readable-font",
      "true",
    );
  });
});
