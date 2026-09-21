import { expect, test } from "@playwright/test";

test.skip(
  process.env.KSU_AUTH_INTEGRATION !== "1" ||
    process.env.KSU_PUBLIC_REVALIDATION_INTEGRATION !== "1",
  "Requires the explicitly disposable backend and all public frontend runtimes",
);

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login/");
  await page.getByLabel("Email", { exact: true }).fill("admin@frontend.example.com");
  await page.getByLabel("Password", { exact: true }).fill("FrontendTestOnly!2026");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/?(?:\?.*)?$/);
}

test("an authenticated fixture session revalidates each public frontend", async ({
  page,
  context,
}) => {
  await login(page);
  const cookies = await context.cookies();
  const cookieHeader = cookies.map(({ name, value }) => `${name}=${value}`).join("; ");
  const libraryBasePath = process.env.LIBRARY_E2E_BASE_PATH ?? "";
  const heriBasePath = process.env.HERI_E2E_BASE_PATH ?? "/heri-africa";
  const cases = [
    ["web", "http://127.0.0.1:3000/api/revalidate"],
    ["research", "http://127.0.0.1:3002/api/revalidate"],
    ["library", `http://127.0.0.1:3003${libraryBasePath}/api/revalidate`],
    ["heri", `http://127.0.0.1:3004${heriBasePath}/api/revalidate`],
  ] as const;

  for (const [service, url] of cases) {
    const response = await context.request.post(url, {
      headers: {
        Cookie: cookieHeader,
        Origin: "http://127.0.0.1:3001",
      },
      data: { resource: service === "research" ? "projects" : "content" },
    });
    expect(response.status(), `${service} revalidation status`).toBe(200);
    const body = (await response.json()) as { revalidated?: boolean };
    expect(body.revalidated, `${service} revalidation result`).toBe(true);
  }
});
