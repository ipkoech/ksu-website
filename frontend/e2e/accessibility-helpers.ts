import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const SERIOUS_IMPACTS = new Set(["serious", "critical"]);

export async function verifyAccessibilityFoundation(
  page: Page,
  path: string,
) {
  await page.goto(path);

  const main = page.getByRole("main");
  await expect(main).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-a11y-ready",
    "true",
  );

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", {
    name: "Skip to main content",
  });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(main).toBeFocused();

  const accessibilityAction = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await accessibilityAction.click();
  await expect(
    page.getByRole("dialog", {
      name: "Accessibility preferences",
    }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Reading support" })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-a11y-readable-font",
    "true",
  );

  await page.keyboard.press("Escape");
  await expect(accessibilityAction).toBeFocused();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-a11y-ready",
    "true",
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-a11y-readable-font",
    "true",
  );

  await page
    .getByRole("button", { name: "Accessibility", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Reset accessibility settings",
    })
    .click();
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-a11y-readable-font",
  );
  await page.keyboard.press("Escape");
  await main.focus();

  const results = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
    ])
    .analyze();
  const violations = results.violations
    .filter((violation) =>
      SERIOUS_IMPACTS.has(violation.impact ?? ""),
    )
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.map((node) => node.html),
    }));

  expect(
    violations,
    JSON.stringify(violations, null, 2),
  ).toHaveLength(0);
}
