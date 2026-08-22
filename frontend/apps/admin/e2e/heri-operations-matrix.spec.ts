import { expect, test, type Page } from "@playwright/test";

const adminUser = {
  id: "admin-1",
  email: "editor@heri.example",
  full_name: "HERI Editor",
  roles: ["admin"],
  permissions: ["admin:*"],
};

const rows = [
  {
    id: "news-1",
    title: "Reading study",
    slug: "reading-study",
    status: "draft",
  },
];

async function setupAdmin(page: Page, permissions = ["admin:*"]) {
  await page.route("**/api/v1/auth/me**", (route) =>
    route.fulfill({ json: { ...adminUser, permissions } }),
  );
  await page.route("**/api/v1/heri/admin/dashboard**", (route) =>
    route.fulfill({
      json: {
        published_articles: 3,
        drafts_awaiting_review: 1,
        upcoming_events: 2,
        new_submissions: 4,
      },
    }),
  );
  await page.route("**/api/v1/heri/admin/news**", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        json: {
          data: rows,
          meta: { page: 1, per_page: 8, total: rows.length, pages: 1 },
        },
      });
    }
    return route.fulfill({
      status: 201,
      json: { ...rows[0], id: "news-created" },
    });
  });
  await page.route("**/api/v1/heri/admin/navigation**", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        json: {
          data: [
            {
              id: "nav-1",
              label: "About",
              href: "/about",
              position: 0,
              is_visible: true,
            },
            {
              id: "nav-2",
              label: "Research",
              href: "/research",
              position: 1,
              is_visible: true,
            },
          ],
          meta: { page: 1, per_page: 100, total: 2, pages: 1 },
        },
      });
    }
    if (route.request().method() === "DELETE")
      return route.fulfill({ status: 204 });
    return route.fulfill({
      status: 201,
      json: {
        id: "nav-3",
        label: "Contact",
        href: "/contact",
        position: 2,
        is_visible: true,
      },
    });
  });
  await page.route("**/api/v1/heri/admin/site-settings**", (route) =>
    route.fulfill({
      json: {
        data: [
          {
            id: "settings-1",
            name: "HERI Africa",
            tagline: "Evidence-led research",
            contact: {},
            social_links: {},
            seo_defaults: {},
          },
        ],
        meta: { page: 1, per_page: 8, total: 1, pages: 1 },
      },
    }),
  );
  await page.route("**/api/v1/heri/admin/media**", (route) =>
    route.fulfill({
      json: { data: [], meta: { page: 1, per_page: 8, total: 0, pages: 1 } },
    }),
  );
}

test.describe("HERI admin browser matrix", () => {
  test("dashboard exposes every operational module", async ({ page }) => {
    await setupAdmin(page);
    await page.goto("/heri");
    for (const label of [
      "Content & pages",
      "Research",
      "Team & partners",
      "Submissions",
      "Media library",
      "Analytics",
      "Site settings",
    ]) {
      await expect(
        page.getByRole("link", { name: label }).first(),
      ).toBeVisible();
    }
  });

  test("bulk select and CSV export work from the content table", async ({
    page,
  }) => {
    await setupAdmin(page);
    await page.goto("/heri/content");
    await expect(page.getByText("Reading study")).toBeVisible();
    await page.getByLabel("Select Reading study").check();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export selected" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(
      /^heri-news-\d{4}-\d{2}-\d{2}\.csv$/,
    );
  });

  test("settings editor adds and reorders navigation items", async ({
    page,
  }) => {
    await setupAdmin(page);
    await page.goto("/heri/settings");
    await expect(
      page.getByRole("heading", { name: "Public site navigation" }),
    ).toBeVisible();
    await page.getByLabel("Label").fill("Contact");
    await page.getByLabel("Destination").fill("/contact");
    const create = page.waitForRequest(
      (request) =>
        request.url().endsWith("/admin/navigation") &&
        request.method() === "POST",
    );
    await page.getByRole("button", { name: "Add item" }).click();
    expect((await create).postDataJSON()).toMatchObject({
      label: "Contact",
      href: "/contact",
      is_visible: true,
    });
    await page.getByRole("button", { name: "Move Research down" }).click();
    await expect(
      page.getByRole("button", { name: "Save order" }),
    ).toBeEnabled();
  });

  test("API authorization failures are surfaced to the operator", async ({
    page,
  }) => {
    await setupAdmin(page, ["heri.content.read"]);
    await page.route("**/api/v1/heri/admin/news**", (route) =>
      route.fulfill({ status: 403, json: { detail: "Permission denied" } }),
    );
    await page.goto("/heri/content");
    await expect(page.getByRole("alert")).toContainText("Permission denied");
  });
});
