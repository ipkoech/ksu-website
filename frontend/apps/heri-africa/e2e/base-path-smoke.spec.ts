import { expect, test } from "@playwright/test";

test.describe("HERI deployment smoke", () => {
  test("serves the public home page under the configured base path", async ({
    page,
  }) => {
    const browserApiRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/v1/heri/")) browserApiRequests.push(request.url());
    });
    await page.goto("./");
    await expect(page).toHaveURL(/\/heri-africa\/?$/);
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText("HERI Africa").first()).toBeVisible();
    expect(browserApiRequests, "initial HERI data must come from the server loader").toEqual([]);
  });

  test("preserves the contact deep link by redirecting to the enquiry section", async ({
    page,
  }) => {
    await page.goto("./contact");
    await expect(page).toHaveURL(/\/heri-africa\/partner-with-us#partnership-enquiry$/);
    await expect(page.locator("#partnership-enquiry")).toBeVisible();
  });

  test("passes server-loaded research data into a client display boundary", async ({
    page,
  }) => {
    const browserApiRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/v1/heri/")) browserApiRequests.push(request.url());
    });
    await page.goto("./research/projects");
    await expect(page.getByRole("heading", { name: "Research projects" })).toBeVisible();
    await expect(page.locator('[data-server-data-display="heri-projects"]')).toBeVisible();
    expect(browserApiRequests, "HERI project data must be loaded by the server page").toEqual([]);
  });
});
