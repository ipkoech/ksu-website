import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const frontendRoot = resolve(process.cwd(), "../..");

function read(relativePath: string) {
  return readFileSync(resolve(frontendRoot, relativePath), "utf8");
}

describe("frontend accessibility shells", () => {
  it.each([
    "apps/web/src/app/layout.tsx",
    "apps/library/src/app/layout.tsx",
    "apps/research/src/app/layout.tsx",
    "apps/admin/src/app/layout.tsx",
  ])("installs the shared shell in %s", (layoutPath) => {
    const layout = read(layoutPath);
    expect(layout).toContain("AccessibilityInitScript");
    expect(layout).toContain("AccessibilityShell");
  });

  it("uses one research skip-link source", () => {
    expect(
      read("apps/research/src/components/research-header.tsx"),
    ).not.toContain("Skip to research content");
  });

  it("uses one public-web skip-link source", () => {
    expect(read("apps/web/src/app/page.tsx")).not.toContain(
      "Skip to main content",
    );
    expect(
      read("apps/web/src/components/site-shell.tsx"),
    ).not.toContain("Skip to main content");
  });

  it("provides stable admin main targets", () => {
    expect(
      read("apps/admin/src/components/layout/dashboard-shell.tsx"),
    ).toContain('id="admin-main"');
    expect(
      read("apps/admin/src/components/portals/portal-shell.tsx"),
    ).toContain('id="admin-main"');
    expect(read("apps/admin/src/app/(auth)/layout.tsx")).toContain(
      'id="admin-main"',
    );
  });
});
