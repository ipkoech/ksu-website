import { expect, test, type Page } from "@playwright/test";

const backend = "http://127.0.0.1:18080";
test.skip(
  process.env.KSU_AUTH_INTEGRATION !== "1",
  "Requires the explicitly disposable frontend backend",
);

test.beforeEach(async ({ page, request }) => {
  const keys = await request.get(`${backend}/api/v1/auth/jwks`);
  expect(keys.ok()).toBe(true);
  expect((await keys.json()).keys[0].kid).toBe("frontend-disposable-test");
  await page.route("**/api/v1/**", async (route) => {
    // Fail closed if Admin was started with a different backend URL.
    if (new URL(route.request().url()).origin !== backend) {
      await route.abort("blockedbyclient");
      throw new Error("Real auth check attempted a non-fixture backend");
    }
    await route.continue();
  });
});

async function login(page: Page, name: "admin" | "viewer" | "temporary") {
  await page.goto("/login/");
  await page
    .getByLabel("Email", { exact: true })
    .fill(`${name}@frontend.example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("FrontendTestOnly!2026");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/?(?:\?.*)?$/);
}

test("real cookie login, access-cookie refresh, private data and logout @backend-auth", async ({
  page,
  context,
}) => {
  await login(page, "admin");
  const cookies = await context.cookies();
  expect(cookies.find((cookie) => cookie.name === "ksu_access")?.httpOnly).toBe(
    true,
  );
  expect(
    cookies.find((cookie) => cookie.name === "ksu_refresh")?.httpOnly,
  ).toBe(true);
  expect(
    await page.evaluate(() => sessionStorage.getItem("ksu-auth-tokens")),
  ).toBeNull();
  await page.goto("/system/users/");
  await expect(
    page.getByText("Frontend Test Admin", { exact: true }).first(),
  ).toBeVisible({ timeout: 15_000 });
  const retained = (await context.cookies()).filter(
    (cookie) => cookie.name !== "ksu_access",
  );
  await context.clearCookies();
  await context.addCookies(retained);
  let refreshes = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/api/v1/auth/refresh") refreshes++;
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Users", exact: true }),
  ).toBeVisible({ timeout: 30_000 });
  expect(refreshes).toBe(1);
  await page
    .getByRole("button", {
      name: /Frontend Test Admin admin@frontend\.example\.com/,
    })
    .click();
  await page.getByRole("menuitem", { name: "Logout", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Sign out", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login\/?(?:\?.*)?$/);
  expect(
    (await context.cookies()).filter((cookie) =>
      ["ksu_access", "ksu_refresh"].includes(cookie.name),
    ),
  ).toEqual([]);
  const response = await context.request.get(`${backend}/api/v1/auth/me`);
  expect(response.status()).toBe(401);
});

test("real restricted account is sent to password change @backend-auth", async ({
  page,
}) => {
  await login(page, "temporary");
  await expect(page).toHaveURL(/\/change-password\/?$/);
  await expect(
    page.getByRole("button", { name: "Change password", exact: true }),
  ).toBeVisible();
});

test("real viewer permission prevents user creation @backend-auth", async ({
  page,
  context,
}) => {
  await login(page, "viewer");
  await page.goto("/system/users/");
  await expect(
    page.getByRole("heading", { name: "Users", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("link", { name: "Add user", exact: true }),
  ).toHaveCount(0);
  const denied = await context.request.post(`${backend}/api/v1/admin/users`, {
    headers: { Origin: "http://127.0.0.1:3001" },
    data: {
      email: "denied@frontend.example.com",
      full_name: "Denied Fixture",
      password: "FrontendTestOnly!2026",
    },
  });
  expect(denied.status()).toBe(403);
});
