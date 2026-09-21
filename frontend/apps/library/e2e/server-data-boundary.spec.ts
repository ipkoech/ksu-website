import { expect, test } from "@playwright/test";

test("home renders server data without an initial browser API fetch", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/")) apiRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByText("Main Campus Library").first()).toBeVisible();
  await expect(page.locator('[data-server-data-display="library-branches"]')).toBeVisible();
  expect(apiRequests, "initial Library data must come from the server loader").toEqual([]);
});
