import { expect, test } from "@playwright/test";

test.describe("HERI public API integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/heri/site", (route) =>
      route.fulfill({
        json: {
          name: "HERI Africa",
          tagline: "Evidence-led language education for every learner.",
        },
      }),
    );
    await page.route("**/api/v1/heri/news", (route) =>
      route.fulfill({
        json: [
          {
            id: "news-1",
            slug: "reading-in-kisii",
            title: "New study explores early grade reading",
            excerpt:
              "A community-led study is shaping practical classroom policy.",
          },
        ],
      }),
    );
  });

  test("renders the public shell and contact integration surface", async ({
    page,
  }) => {
    await page.goto("./contact");
    await expect(
      page.getByRole("heading", { name: /Connect With the Research Chair/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: "Our Work" }),
    ).toHaveAttribute("href", "/heri-africa/our-work");
  });

  test("submits a contact enquiry to the HERI API", async ({ page }) => {
    let payload: Record<string, unknown> | undefined;
    await page.route("**/api/v1/heri/contact", async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 202,
        json: {
          status: "received",
          message: "Thank you. The HERI Africa team will respond soon.",
        },
      });
    });
    await page.goto("./contact");
    await page.getByLabel(/Full name/).fill("Amina Otieno");
    await page.getByLabel(/Email address/).fill("amina@example.org");
    await page
      .getByLabel(/Enquiry category/)
      .selectOption({ label: "Partnership enquiry" });
    await page
      .getByLabel(/Message/)
      .fill("I would like to discuss a literacy research collaboration.");
    await page.getByLabel(/I consent/).check();
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(
      page.getByText("Thank you. The HERI Africa team will respond soon."),
    ).toBeVisible();
    expect(payload).toMatchObject({
      name: "Amina Otieno",
      email: "amina@example.org",
      consent: true,
    });
  });
});
