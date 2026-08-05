import { expect, test } from "@playwright/test";

import { verifyAccessibilityFoundation } from "../../../e2e/accessibility-helpers";

test("public web accessibility foundation @accessibility", async ({
  page,
}) => {
  await verifyAccessibilityFoundation(page, "/");

  const inquiryAction = page.getByRole("button", {
    name: "Send a message to Kisii University",
  });
  await inquiryAction.click();
  await expect(
    page.getByRole("dialog", {
      name: "Send a message to Kisii University",
    }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(inquiryAction).toBeFocused();
});
