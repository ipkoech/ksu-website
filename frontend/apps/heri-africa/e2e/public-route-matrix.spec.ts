import { expect, test } from "@playwright/test";

const news = [
  {
    id: "news-1",
    slug: "reading-in-kisii",
    title: "New study explores early grade reading",
    excerpt: "Evidence for better classroom practice.",
  },
];

test.describe("HERI public browser matrix", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/heri/site", (route) =>
      route.fulfill({
        json: {
          name: "HERI Africa",
          tagline: "Evidence-led language education.",
        },
      }),
    );
    await page.route("**/api/v1/heri/navigation", (route) =>
      route.fulfill({
        json: [
          {
            id: "nav-1",
            label: "Our Work",
            href: "/our-work",
            position: 0,
            is_visible: true,
          },
        ],
      }),
    );
    await page.route("**/api/v1/heri/news**", (route) =>
      route.fulfill({ json: news }),
    );
    await page.route("**/api/v1/heri/events**", (route) =>
      route.fulfill({
        json: [
          {
            id: "event-1",
            title: "Research symposium",
            summary: "Evidence exchange",
            location: "Kisii",
          },
        ],
      }),
    );
    await page.route("**/api/v1/heri/projects**", (route) =>
      route.fulfill({
        json: [
          {
            id: "project-1",
            title: "Reading study",
            summary: "Early grade literacy",
          },
        ],
      }),
    );
    await page.route("**/api/v1/heri/publications**", (route) =>
      route.fulfill({
        json: [
          {
            id: "publication-1",
            title: "Language policy evidence",
            summary: "Research output",
          },
        ],
      }),
    );
    await page.route("**/api/v1/heri/team**", (route) =>
      route.fulfill({
        json: [
          {
            id: "team-1",
            name: "Dr. Amina",
            role: "Research Chair",
            biography: "Language education researcher",
          },
        ],
      }),
    );
    await page.route("**/api/v1/heri/partners**", (route) =>
      route.fulfill({
        json: [
          {
            id: "partner-1",
            name: "Kisii University",
            description: "Host institution",
          },
        ],
      }),
    );
  });

  test("all primary public routes render meaningful headings", async ({
    page,
  }) => {
    const routes = [
      ["/", /Africa-led language research/i],
      ["/about", /Africa-led research/i],
      ["/our-work", /Our work/i],
      ["/team", /African expertise/i],
      ["/partners", /Who we work with/i],
      ["/events", /^Events$/i],
      ["/research/projects", /Research projects/i],
      ["/research/publications", /Publications and resources/i],
      ["/news-insights", /Research, events, and stories/i],
      ["/contact", /We’d be glad to hear from you/i],
      ["/partner-with-us", /Partner with HERI Africa/i],
    ] as const;
    for (const [route, heading] of routes) {
      await page.goto(route);
      await expect(
        page.getByRole("heading", { name: heading }).first(),
      ).toBeVisible();
    }
  });

  test("news detail route renders the selected story", async ({ page }) => {
    await page.goto("/news-insights/reading-in-kisii");
    await expect(
      page.getByRole("heading", { name: news[0].title }),
    ).toBeVisible();
  });

  test("contact form validates required consent and submits successfully", async ({
    page,
  }) => {
    await page.route("**/api/v1/heri/contact", (route) =>
      route.fulfill({
        status: 202,
        json: {
          status: "received",
          message: "Thank you for contacting HERI Africa.",
        },
      }),
    );
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByLabel("Full name")).toHaveJSProperty(
      "validity.valueMissing",
      true,
    );
    await page.getByLabel("Full name").fill("Amina Otieno");
    await page.getByLabel("Email address").fill("amina@example.org");
    await page.getByLabel("Subject").fill("Research partnership");
    await page
      .getByLabel("Message")
      .fill("I would like to collaborate on literacy research.");
    await page.getByLabel(/I consent/).check();
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(
      page.getByText("Thank you for contacting HERI Africa."),
    ).toBeVisible();
  });

  test("public API failure renders an empty, non-crashing state", async ({
    page,
  }) => {
    await page.route("**/api/v1/heri/news**", (route) =>
      route.fulfill({ status: 503, json: { detail: "Unavailable" } }),
    );
    await page.goto("/news-insights");
    await expect(
      page.getByRole("heading", { name: /Research, events, and stories/i }),
    ).toBeVisible();
  });
});
