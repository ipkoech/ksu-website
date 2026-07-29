import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(
  resolve(process.cwd(), "src/globals.css"),
  "utf8",
);

describe("shared accessibility styles", () => {
  it("defines bounded text scaling and display preferences", () => {
    expect(stylesheet).toContain(
      'html[data-a11y-text-scale="larger"]',
    );
    expect(stylesheet).toContain("--a11y-text-scale: 1.25");
    expect(stylesheet).toContain(
      'html[data-a11y-readable-font="true"] body',
    );
    expect(stylesheet).toContain(
      'html[data-a11y-emphasize-links="true"]',
    );
  });

  it("defines safe floating actions and user-controlled motion", () => {
    expect(stylesheet).toContain(".ksu-floating-action-dock");
    expect(stylesheet).toContain("env(safe-area-inset-bottom)");
    expect(stylesheet).toContain(
      'html[data-a11y-reduce-motion="true"]',
    );
    expect(stylesheet).toContain("@media (forced-colors: active)");
  });
});
