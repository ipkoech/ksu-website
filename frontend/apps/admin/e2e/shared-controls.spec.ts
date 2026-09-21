import { expect, test } from "@playwright/test";

// Explicit UI fixtures. Every v1 request is intercepted, including mutations;
// this suite does not establish real authentication or backend correctness.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("ksu-auth", JSON.stringify({ state: { activeService: "system" }, version: 0 }));
  });
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() !== "GET") {
      await route.fulfill({ status: 405, json: { detail: "UI fixture does not allow mutations" } });
      return;
    }
    if (url.pathname === "/api/v1/auth/me") {
      await route.fulfill({ json: { data: {
        id: "fixture-admin", email: "admin@example.invalid", full_name: "UI Test Administrator",
        roles: ["system-admin"], permissions: ["admin:*", "users:read", "roles:read"], service_memberships: ["system"],
      } } });
      return;
    }
    const allUsers = [
      { id: "fixture-alpha", email: "alpha@example.invalid", full_name: "Alpha Department Administrator", is_active: true, last_login_at: "2026-01-10T09:00:00Z", role_assignments: [] },
      { id: "fixture-beta", email: "beta@example.invalid", full_name: "Beta Research Administrator", is_active: true, last_login_at: null, role_assignments: [] },
    ];
    const data = url.pathname === "/api/v1/admin/users"
      ? allUsers.filter((user) => user.full_name.toLowerCase().includes((url.searchParams.get("search") ?? "").toLowerCase()))
      : [];
    await route.fulfill({ json: { data, meta: { page: 1, per_page: 10, total: data.length, pages: 1 } } });
  });
});

for (const width of [1440, 390]) {
  test(`shared user search and mobile fields at ${width}px @shared-ui`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/system/users/");
    await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
    await expect(page.getByText("Alpha Department Administrator").first()).toBeAttached();
    await page.screenshot({ path: testInfo.outputPath("initial.png"), fullPage: true });
    const external = page.getByRole("textbox", { name: "Search by name or email" });
    await external.fill("Alpha");
    await expect(page.getByRole("searchbox")).toHaveValue("Alpha");
    await page.getByRole("searchbox").fill("Beta");
    await expect(external).toHaveValue("Beta");
    if (width < 768) {
      await expect(page.getByRole("article").getByText("Last login", { exact: true })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
