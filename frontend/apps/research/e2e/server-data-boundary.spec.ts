import { expect, test } from "@playwright/test";

test("projects renders server data without an initial browser API fetch", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/")) apiRequests.push(request.url());
  });
  await page.goto("/projects");
  await expect(page.getByText("Climate-Smart Agriculture for Smallholder Food Security").first()).toBeVisible();
  await expect(page.locator('[data-server-data-display="research-projects"]')).toBeVisible();
  expect(apiRequests, "initial Research data must come from the server loader").toEqual([]);
});

test("team directory renders the server DTO through a client display boundary", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/")) apiRequests.push(request.url());
  });
  await page.goto("/team");
  await expect(page.locator('[data-server-data-display="research-team"]')).toBeVisible();
  expect(apiRequests, "initial Research team data must come from the server loader").toEqual([]);
});
