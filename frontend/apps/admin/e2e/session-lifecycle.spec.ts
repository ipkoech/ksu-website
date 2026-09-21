import { expect, test } from "@playwright/test";

// Browser lifecycle fixtures only: every backend request is intercepted.
const user = {
  id: "session-fixture",
  email: "session@example.invalid",
  full_name: "Session Fixture",
  roles: ["system-admin"],
  permissions: ["admin:*", "users:read"],
  service_memberships: ["system"],
  must_change_password: false,
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem(
      "ksu-auth",
      JSON.stringify({ state: { activeService: "system" }, version: 0 }),
    ),
  );
});

test("verification outage stays on the deep link and supports retry @auth", async ({
  page,
}) => {
  let unavailable = true;
  let refreshRequests = 0;
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/auth/refresh")) refreshRequests++;
    if (route.request().method() !== "GET") {
      await route.fulfill({
        status: 405,
        json: { detail: "Fixture denies mutations" },
      });
    } else if (path.endsWith("/auth/me")) {
      await route.fulfill(
        unavailable
          ? { status: 503, json: { detail: "Fixture unavailable" } }
          : { json: { data: user } },
      );
    } else {
      await route.fulfill({
        json: { data: [], meta: { total: 0, pages: 1, page: 1, per_page: 10 } },
      });
    }
  });
  await page.goto("/system/users/");
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/system\/users\/?$/);
  expect(refreshRequests).toBe(0);
  unavailable = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Users", exact: true }),
  ).toBeVisible();
});

test("expired session makes one refresh attempt and returns to login @auth", async ({
  page,
}) => {
  let refreshRequests = 0;
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/auth/refresh")) refreshRequests++;
    await route.fulfill({ status: 401, json: { detail: "Fixture expired" } });
  });
  await page.goto("/system/users/");
  await expect(page).toHaveURL(/\/login\/?(?:\?.*)?$/);
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  expect(refreshRequests).toBe(1);
});

test("temporary-password accounts reach the change-password form from a direct link @auth", async ({
  page,
}) => {
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== "GET") {
      await route.fulfill({
        status: 405,
        json: { detail: "Fixture denies mutations" },
      });
    } else if (path.endsWith("/auth/me")) {
      await route.fulfill({
        json: { data: { ...user, must_change_password: true } },
      });
    } else {
      await route.fulfill({ json: { data: [] } });
    }
  });
  await page.goto("/system/users/");
  await expect(page).toHaveURL(/\/change-password\/?$/);
  await expect(
    page.getByRole("button", { name: "Change password", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Current password", { exact: true }),
  ).toBeVisible();
});
