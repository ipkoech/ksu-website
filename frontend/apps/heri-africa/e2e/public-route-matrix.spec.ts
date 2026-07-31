import { expect, test } from "@playwright/test";

const news = [
  {
    id: "news-1",
    slug: "reading-in-kisii",
    title: "New study explores early grade reading",
    excerpt: "Evidence for better classroom practice.",
  },
];

const heriRoute = (route: string) => `.${route}`;

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
            slug: "dr-amina",
            role: "Research Chair",
            biography: "Language education researcher",
          },
          {
            id: "team-2",
            name: "Dr. Baraka",
            slug: "dr-baraka",
            role: "Research Fellow",
            biography: "Early grade literacy researcher",
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
      ["/our-work", /Research that moves from evidence to action/i],
      ["/team", /African expertise/i],
      ["/partners", /Who we work with/i],
      ["/events", /^Events$/i],
      ["/research/projects", /Research projects/i],
      ["/research/publications", /Publications and resources/i],
      ["/news-insights", /Research, Events & Stories/i],
      ["/contact", /Connect With the Research Chair/i],
      ["/partner-with-us", /Partner With Us to/i],
    ] as const;
    for (const [route, heading] of routes) {
      await page.goto(heriRoute(route));
      await expect(
        page.getByRole("heading", { name: heading }).first(),
      ).toBeVisible();
    }
  });

  test("news detail route renders the selected story", async ({ page }) => {
    await page.route("**/api/v1/heri/news/reading-in-kisii", (route) =>
      route.fulfill({ json: { ...news[0], body: "Full story content." } }),
    );
    await page.goto("./news-insights/reading-in-kisii");
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
    await page.goto("./contact");
    await page.getByRole("button", { name: /send enquiry/i }).click();
    await expect(page.getByLabel(/Full name/)).toHaveJSProperty(
      "validity.valueMissing",
      true,
    );
    await page.getByLabel(/Full name/).fill("Amina Otieno");
    await page.getByLabel(/Email address/).fill("amina@example.org");
    await page
      .getByLabel(/Enquiry category/)
      .selectOption({ label: "Partnership enquiry" });
    await page
      .getByLabel(/Message/)
      .fill("I would like to collaborate on literacy research.");
    await page.getByLabel(/I consent/).check();
    await page.getByRole("button", { name: /send enquiry/i }).click();
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
    await page.goto("./news-insights");
    await expect(
      page.getByRole("heading", { name: /Research, Events & Stories/i }),
    ).toBeVisible();
  });

  test("partnership enquiry submits the backend contract", async ({ page }) => {
    let payload: Record<string, unknown> | undefined;
    await page.route(
      "**/api/v1/heri/partnership-applications",
      async (route) => {
        payload = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({
          status: 202,
          json: {
            status: "received",
            message: "Partnership enquiry received.",
          },
        });
      },
    );
    await page.goto("./partner-with-us");
    await page.getByLabel(/Full name/).fill("Amina Otieno");
    await page.getByLabel(/Email address/).fill("amina@example.org");
    await page.getByLabel(/Organisation/).fill("Kisii Literacy Network");
    await page.getByLabel(/Country/).fill("Kenya");
    await page
      .getByLabel(/Partnership interest/)
      .selectOption({ label: "Research collaboration" });
    await page
      .getByLabel(/Proposed collaboration/)
      .fill("Co-design an early grade literacy study.");
    await page.getByLabel(/I confirm this information/).check();
    await page
      .getByRole("button", { name: /submit partnership enquiry/i })
      .click();
    await expect(page.getByText("Partnership enquiry received.")).toBeVisible();
    expect(payload).toMatchObject({
      organisation: "Kisii Literacy Network",
      partnership_interest: "Research collaboration",
      consent: true,
    });
  });

  test("team and insights filters are interactive", async ({ page }) => {
    await page.goto("./team");
    await expect(
      page.getByRole("button", { name: "Leadership" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Research Fellows" }).click();
    await expect(
      page.getByText("No team members are currently published in this group."),
    ).not.toBeVisible();

    await page.goto("./news-insights");
    await page.getByRole("button", { name: "News", exact: true }).click();
    await expect(page.getByText(news[0].title)).toBeVisible();
    await page.getByPlaceholder(/Search news/).fill("does not exist");
    await expect(page.getByText("No stories match your search.")).toBeVisible();
  });

  test("public routes have no horizontal overflow on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of [
      "/",
      "/about",
      "/team",
      "/news-insights",
      "/partner-with-us",
      "/contact",
    ]) {
      await page.goto(heriRoute(route));
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow, `${route} should not overflow horizontally`).toBe(false);
    }
  });
});
