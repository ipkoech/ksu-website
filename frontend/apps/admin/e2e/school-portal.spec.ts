import { expect, test, type Page } from "@playwright/test";

type Persona = "ADMIN" | "EDITOR" | "COCMS";

function credentials(persona: Persona) {
  const email = process.env[`SCHOOL_PORTAL_E2E_${persona}_EMAIL`];
  const password = process.env[`SCHOOL_PORTAL_E2E_${persona}_PASSWORD`];
  return email && password ? { email, password } : null;
}

async function signIn(page: Page, persona: Persona, destination: string) {
  const account = credentials(persona);
  test.skip(!account, `${persona} staging credentials are required`);
  await page.goto(`/login?redirect=${encodeURIComponent(destination)}`);
  await page.getByLabel("Email").fill(account!.email);
  await page.getByLabel("Password").fill(account!.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(new RegExp(destination.replaceAll("/", "\\/")));
}

test.describe("School Portal release journeys", () => {
  test("full admin can navigate every school workspace", async ({ page }) => {
    await signIn(page, "ADMIN", "/schools");
    await expect(page.getByRole("heading", { name: /school dashboard/i })).toBeVisible();

    const workspaces = [
      ["School Profile", /school profile/i],
      ["Team", /school team/i],
      ["Departments", /departments/i],
      ["Programmes", /programmes/i],
      ["Publications", /publications/i],
      ["Content Studio", /content studio/i],
      ["Media", /media batch uploader/i],
      ["Inquiries", /inquiry inbox/i],
      ["Audit Log", /audit trail/i],
    ] as const;
    for (const [link, heading] of workspaces) {
      await page.getByRole("link", { name: link, exact: true }).click();
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  test("restricted editor sees editorial actions but not school structure mutation", async ({ page }) => {
    await signIn(page, "EDITOR", "/schools/departments");
    await expect(page.getByRole("button", { name: "Add department" })).toBeHidden();
    await page.goto("/schools/content");
    await expect(page.getByRole("heading", { name: "Content Studio" })).toBeVisible();
    await expect(page.getByRole("button", { name: /new news/i })).toBeVisible();
  });

  test("CoCMS reviewer reaches the shared review queue", async ({ page }) => {
    await signIn(page, "COCMS", "/cocms/review-queue");
    await expect(page).toHaveURL(/corporate-communication\/review-queue/);
    await expect(page.getByRole("heading", { name: /review queue/i })).toBeVisible();
  });

  test("another school's record is denied by the API", async ({ page }) => {
    const otherDepartmentId = process.env.SCHOOL_PORTAL_E2E_OTHER_SCHOOL_DEPARTMENT_ID;
    test.skip(!otherDepartmentId, "An out-of-scope department fixture ID is required");
    await signIn(page, "ADMIN", "/schools/departments");
    const response = await page.request.get(
      `${process.env.SCHOOL_PORTAL_E2E_MAIN_API_URL ?? "http://localhost:8000"}/api/v1/school-portal/departments/${otherDepartmentId}`,
    );
    expect([403, 404]).toContain(response.status());
  });

  test("team bulk import previews and reports live progress", async ({ page }) => {
    await signIn(page, "ADMIN", "/schools/team");
    await page.getByRole("button", { name: "Import" }).click();
    await page.getByLabel("Completed template").setInputFiles({
      name: "school-team.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(
        `full_name,email,employee_number,role\nPortal E2E User,portal-e2e-${Date.now()}@example.test,E2E-${Date.now()},staff\n`,
      ),
    });
    await expect(page.getByRole("cell", { name: "valid" })).toBeVisible();
    await page.getByRole("button", { name: "Queue import" }).click();
    await expect(page.getByLabel("Team import progress")).toBeVisible();
  });

  test("media upload exposes per-file and overall progress", async ({ page }) => {
    await signIn(page, "ADMIN", "/schools/media");
    await page.locator('input[type="file"]').setInputFiles({
      name: "portal-e2e.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("School Portal upload verification"),
    });
    await expect(page.getByText("Overall batch progress")).toBeVisible();
    await page.getByRole("button", { name: "Upload all" }).click();
    await expect(page.getByLabel("portal-e2e.txt progress")).toHaveAttribute("aria-valuenow", "100");
  });

  test("inquiry reply remains observable through delivery state", async ({ page }) => {
    const inquiryId = process.env.SCHOOL_PORTAL_E2E_INQUIRY_ID;
    test.skip(!inquiryId, "A seeded school inquiry is required");
    await signIn(page, "ADMIN", `/schools/inquiries?inquiry=${inquiryId}`);
    await page.getByPlaceholder("Write a plain-text reply to the requester").fill(
      `Playwright delivery check ${Date.now()}`,
    );
    await page.getByRole("button", { name: "Queue reply" }).click();
    await expect(page.getByText(/queued|sending|sent|failed|dead_lettered/).last()).toBeVisible();
  });

  test("notification receipt and WebSocket reconnect are visible", async ({ page, context }) => {
    await signIn(page, "ADMIN", "/schools");
    await page.getByRole("button", { name: "Notifications" }).click();
    await expect(page.getByText(/Live|Connecting/).first()).toBeVisible();
    await context.setOffline(true);
    await expect(page.getByText("Offline").first()).toBeVisible();
    await context.setOffline(false);
    await expect(page.getByText("Live").first()).toBeVisible({ timeout: 10_000 });
  });

  test("mobile layout keeps navigation and content reachable", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await signIn(page, "ADMIN", "/schools");
    await expect(page.getByRole("heading", { name: /school dashboard/i })).toBeVisible();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("link", { name: "Team", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Team", exact: true }).click();
    await expect(page.getByRole("heading", { name: /school team/i })).toBeVisible();
  });
});
