import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const baseUrl =
  process.env.PAGE_CMS_AUDIT_BASE_URL ??
  process.env.PLAYWRIGHT_BASE_URL ??
  "http://127.0.0.1:3000";

const apiBaseUrl =
  process.env.PAGE_CMS_AUDIT_API_URL ??
  process.env.KSU_MAIN_API_URL ??
  process.env.NEXT_PUBLIC_MAIN_API_URL ??
  null;

const viewports = [
  { width: 1440, height: 1100 },
  { width: 1280, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 740 },
];

type CompositionSection = {
  section_key?: string | null;
  layout_variant?: string | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
};

type CompositionSpotlight = {
  headline?: string | null;
  summary?: string | null;
  primary_cta?: {
    label?: string | null;
    href?: string | null;
  } | null;
};

type Composition = {
  sections: CompositionSection[];
  partnership_spotlights: CompositionSpotlight[];
};

test.describe("page CMS homepage visual audit", () => {
  for (const viewport of viewports) {
    test(`renders without layout regressions at ${viewport.width}x${viewport.height}`, async ({
      page,
      request,
    }) => {
      const consoleErrors: string[] = [];
      const image400s: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });

      page.on("response", (response) => {
        if (response.url().includes("/_next/image") && response.status() === 400) {
          image400s.push(response.url());
        }
      });

      await page.setViewportSize(viewport);
      const composition = await getPublishedComposition(request);

      await page.goto(baseUrl, { waitUntil: "networkidle" });
      await expect(page.locator("main")).toBeVisible();
      await scrollThroughPage(page);
      await page.waitForLoadState("networkidle");

      expect(
        await hasHorizontalOverflow(page),
        `homepage should not horizontally overflow at ${viewport.width}x${viewport.height}`,
      ).toBe(false);
      expect(consoleErrors, "homepage should not emit browser console errors").toEqual([]);
      expect(image400s, "Next image optimizer should not return 400 responses").toEqual([]);

      await expectRenderedContent(page, composition);
      await expectFeaturedPartnership(page, composition);
      await expectAccessibleSectionLinks(page);

      if (viewport.width <= 768) {
        await expectIndependentMobileSections(page);
      }
    });
  }
});

async function getPublishedComposition(
  request: APIRequestContext,
): Promise<Composition | null> {
  if (!apiBaseUrl) {
    return null;
  }

  try {
    const response = await request.get(new URL("/api/v1/homepage", apiBaseUrl).toString(), {
      timeout: 4_000,
    });
    if (!response.ok()) {
      return null;
    }

    const payload = await response.json();
    const composition = payload?.data ?? payload;
    if (!Array.isArray(composition?.sections)) {
      return null;
    }

    return {
      sections: composition.sections,
      partnership_spotlights: Array.isArray(composition.partnership_spotlights)
        ? composition.partnership_spotlights
        : [],
    };
  } catch {
    return null;
  }
}

async function expectRenderedContent(page: Page, composition: Composition | null) {
  const composedSections = composition?.sections ?? [];
  if (composedSections.length > 0) {
    const renderableSection = composedSections.find((section) =>
      Boolean(section.section_key || section.title || section.subtitle),
    );

    expect(renderableSection, "published composition should contain a renderable section").toBeTruthy();

    const sectionLocator = renderableSection?.section_key
      ? page.locator(`main section#${cssEscape(renderableSection.section_key)}`)
      : page
          .locator("main section")
          .filter({
            hasText:
              renderableSection?.title ??
              renderableSection?.subtitle ??
              renderableSection?.description ??
              "",
          })
          .first();

    await expect(sectionLocator).toBeVisible();
    return;
  }

  await expect(
    page.getByRole("main").getByRole("link", {
      name: /apply|programme|admission|campus|research|library/i,
    }).first(),
  ).toBeVisible();
}

async function expectFeaturedPartnership(page: Page, composition: Composition | null) {
  const featuredSection = composition?.sections.find(
    (section) => section.layout_variant === "featured_partnership",
  );
  const spotlight = composition?.partnership_spotlights[0];

  if (featuredSection) {
    const section = featuredSection.section_key
      ? page.locator(`main section#${cssEscape(featuredSection.section_key)}`)
      : page.locator("main section").filter({ hasText: /partnership|heri/i }).first();

    await expect(section).toBeVisible();

    const expectedText =
      spotlight?.headline ??
      featuredSection.title ??
      spotlight?.summary ??
      featuredSection.description;
    if (expectedText) {
      await expect(section).toContainText(trimForTextMatch(expectedText), { ignoreCase: true });
    }

    await expect(
      section.getByRole("link", {
        name: new RegExp(nonEmptyText(spotlight?.primary_cta?.label) ?? ".+", "i"),
      }).first(),
    ).toBeVisible();
    return;
  }

  const fallbackPartnership = page
    .locator("main section")
    .filter({ hasText: /heri|featured partnership|partnership spotlight|partnership/i })
    .first();

  if ((await fallbackPartnership.count()) > 0 && (await fallbackPartnership.isVisible())) {
    await expect(fallbackPartnership.getByRole("link").first()).toBeVisible();
  }
}

async function expectAccessibleSectionLinks(page: Page) {
  const sectionLinks = page.locator("main section a[href]");
  const count = await sectionLinks.count();
  expect(count, "homepage sections should expose CTA or navigation links").toBeGreaterThan(0);

  for (let index = 0; index < Math.min(count, 30); index += 1) {
    const link = sectionLinks.nth(index);
    if (!(await link.isVisible())) {
      continue;
    }

    const accessibleName = await link.evaluate((node) => {
      const label = node.getAttribute("aria-label") || node.textContent || "";
      return label.replace(/\s+/g, " ").trim();
    });
    expect(accessibleName, `section link ${index + 1} should have an accessible name`).not.toBe("");
  }
}

async function expectIndependentMobileSections(page: Page) {
  const boxes = await page.locator("main > section").evaluateAll((sections) =>
    sections
      .map((section) => {
        const rect = section.getBoundingClientRect();
        return {
          top: Math.round(rect.top + window.scrollY),
          bottom: Math.round(rect.bottom + window.scrollY),
          height: Math.round(rect.height),
        };
      })
      .filter((box) => box.height > 0),
  );

  expect(boxes.length, "mobile homepage should render multiple independent sections").toBeGreaterThan(1);

  for (let index = 1; index < boxes.length; index += 1) {
    expect(
      boxes[index].top,
      `mobile section ${index + 1} should not overlap the previous section`,
    ).toBeGreaterThanOrEqual(boxes[index - 1].bottom - 1);
  }
}

async function scrollThroughPage(page: Page) {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = page.viewportSize()?.height ?? 900;
  for (let y = 0; y < pageHeight; y += Math.max(240, Math.floor(viewportHeight * 0.75))) {
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function hasHorizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const viewportWidth = root.clientWidth;
    const tolerancePx = 8;
    return Math.max(root.scrollWidth, body.scrollWidth) > viewportWidth + tolerancePx;
  });
}

function cssEscape(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

function nonEmptyText(value: string | null | undefined) {
  const text = value?.replace(/\s+/g, " ").trim();
  return text && text.length > 0 ? text : null;
}

function trimForTextMatch(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 80);
}
