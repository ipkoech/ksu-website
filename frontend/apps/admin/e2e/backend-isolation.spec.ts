import { expect, test, type Page, type Route } from "@playwright/test";

const backend = "http://127.0.0.1:18080";

test.skip(
  process.env.KSU_AUTH_INTEGRATION !== "1",
  "Requires the explicitly disposable frontend backend",
);

async function login(page: Page, name: "admin" | "viewer") {
  await page.goto("/login/");
  await page.getByLabel("Email", { exact: true }).fill(`${name}@frontend.example.com`);
  await page.getByLabel("Password", { exact: true }).fill("FrontendTestOnly!2026");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/?(?:\?.*)?$/, { timeout: 30_000 });
}

async function allowFixtureOnly(route: Route) {
  if (new URL(route.request().url()).origin !== backend) {
    await route.abort("blockedbyclient");
    throw new Error("Real isolation check attempted a non-fixture backend");
  }
  await route.continue();
}

test("real private session data stays isolated across authenticated users @backend-auth", async ({
  browser,
  request,
}) => {
  const keys = await request.get(`${backend}/api/v1/auth/jwks`);
  expect(keys.ok()).toBe(true);
  expect((await keys.json()).keys[0].kid).toBe("frontend-disposable-test");

  const baseURL = process.env.ADMIN_E2E_BASE_URL ?? "http://127.0.0.1:3001";
  const adminContext = await browser.newContext({ baseURL });
  const viewerContext = await browser.newContext({ baseURL });
  const adminPage = await adminContext.newPage();
  const viewerPage = await viewerContext.newPage();
  await adminPage.route("**/api/v1/**", allowFixtureOnly);
  await viewerPage.route("**/api/v1/**", allowFixtureOnly);

  try {
    await login(adminPage, "admin");
    await login(viewerPage, "viewer");
    const [adminResponse, viewerResponse] = await Promise.all([
      adminContext.request.get(`${backend}/api/v1/auth/me`),
      viewerContext.request.get(`${backend}/api/v1/auth/me`),
    ]);
    expect(adminResponse.ok()).toBe(true);
    expect(viewerResponse.ok()).toBe(true);

    const admin = (await adminResponse.json()).data as {
      id?: string;
      email?: string;
      permissions?: string[];
    };
    const viewer = (await viewerResponse.json()).data as {
      id?: string;
      email?: string;
      permissions?: string[];
    };

    expect(admin.id).toBeTruthy();
    expect(viewer.id).toBeTruthy();
    expect(admin.id).not.toBe(viewer.id);
    expect(admin.email).toBe("admin@frontend.example.com");
    expect(viewer.email).toBe("viewer@frontend.example.com");
    expect(admin.permissions).toContain("users.create");
    expect(viewer.permissions).not.toContain("users.create");
  } finally {
    await Promise.all([adminContext.close(), viewerContext.close()]);
  }
});
