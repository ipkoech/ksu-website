import { test } from "@playwright/test";

import { verifyAccessibilityFoundation } from "../../../e2e/accessibility-helpers";

test("library accessibility foundation @accessibility", async ({
  page,
}) => {
  await verifyAccessibilityFoundation(page, "/");
});
