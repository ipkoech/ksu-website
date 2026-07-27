import { test } from "@playwright/test";

import { verifyAccessibilityFoundation } from "../../../e2e/accessibility-helpers";

test("research accessibility foundation @accessibility", async ({
  page,
}) => {
  await verifyAccessibilityFoundation(page, "/");
});
