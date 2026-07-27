import { expect, test } from "@playwright/test";

const adminUser = {
  id: "admin-1",
  email: "editor@heri.example",
  full_name: "HERI Editor",
  roles: ["admin"],
  permissions: ["admin:*"],
};

test.describe("HERI admin CRUD integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() =>
      window.sessionStorage.setItem(
        "ksu-auth-tokens",
        JSON.stringify({ accessToken: "e2e-token" }),
      ),
    );
    await page.route("**/api/v1/auth/me?*", (route) =>
      route.fulfill({ json: adminUser }),
    );
    await page.route("**/api/v1/heri/admin/dashboard", (route) =>
      route.fulfill({
        json: {
          published_articles: 3,
          drafts_awaiting_review: 1,
          scheduled_content: 0,
          upcoming_events: 2,
          new_submissions: 4,
          publications: 8,
          active_projects: 5,
          team_members: 6,
          partners: 4,
          social_failures: 0,
        },
      }),
    );
    await page.route("**/api/v1/heri/admin/news**", async (route) => {
      if (route.request().method() === "GET")
        return route.fulfill({
          json: {
            data: [
              {
                id: "news-1",
                title: "Reading study",
                slug: "reading-study",
                excerpt: "Evidence",
                body: "Full story",
                status: "draft",
              },
            ],
            meta: { page: 1, per_page: 8, total: 1, pages: 1 },
          },
        });
      return route.fulfill({
        status: 201,
        json: {
          id: "news-2",
          title: "Created story",
          slug: "created-story",
          status: "draft",
        },
      });
    });
    await page.route("**/api/v1/heri/admin/news/*/audit", (route) =>
      route.fulfill({
        json: [
          {
            id: "audit-1",
            action: "update",
            created_at: "2026-07-27T08:00:00Z",
            new_value: { status: "draft" },
          },
        ],
      }),
    );
  });

  test("filters records, creates content, and reads audit history", async ({
    page,
  }) => {
    await page.goto("/heri/content");
    await expect(
      page.getByRole("heading", { name: "Content management" }),
    ).toBeVisible();
    await expect(page.getByText("Reading study")).toBeVisible();
    await page.getByLabel("Filter records").fill("does-not-match");
    await expect(page.getByText("No records match this filter.")).toBeVisible();
    await page.getByLabel("Filter records").fill("reading");
    await page.getByRole("button", { name: "History" }).click();
    await expect(
      page.getByRole("heading", { name: "Revision history" }),
    ).toBeVisible();
    await expect(page.getByText("update")).toBeVisible();
    await page.getByRole("button", { name: "Back to editor" }).click();
    await page.getByRole("button", { name: "Create record" }).click();
    await page.getByLabel("Title").fill("Created story");
    await page.getByLabel("Slug").fill("created-story");
    await page.getByLabel("Body").fill("A new story from the admin workspace.");
    await page.getByLabel("Status").selectOption("draft");
    const create = page.waitForRequest(
      (request) =>
        request.url().endsWith("/admin/news") && request.method() === "POST",
    );
    await page.getByRole("button", { name: "Save changes" }).click();
    expect((await create).postDataJSON()).toMatchObject({
      title: "Created story",
      slug: "created-story",
      status: "draft",
    });
  });
});
