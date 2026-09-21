import { expect, test } from "@playwright/test";

test.skip(
  process.env.KSU_WEB_INTEGRATION !== "1",
  "Requires a local Web server and real public Main backend",
);

test("story data arrives in server HTML and survives hydration and reload without browser API duplication @backend-web", async ({
  page,
  request,
  baseURL,
}) => {
  const backend = new URL(
    process.env.KSU_WEB_TEST_BACKEND ?? "http://localhost:8080",
  );
  const local = (url: URL) =>
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  expect(local(backend) && Boolean(baseURL && local(new URL(baseURL)))).toBe(
    true,
  );
  const response = await request.get(
    `${backend.origin}/api/v1/stories?per_page=1&fields=id,title,slug`,
  );
  expect(response.ok()).toBe(true);
  const story = (await response.json()).data?.[0];
  expect(
    story?.slug,
    "A published real story is required; no placeholder fallback",
  ).toBeTruthy();
  const route = `/stories/${encodeURIComponent(story.slug)}`;
  const document = await request.get(`${baseURL}${route}`);
  expect(document.status()).toBe(200);
  const html = await document.text();
  const escapedTitle = String(story.title)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
  expect(html).toContain(escapedTitle);
  expect(html).not.toMatch(/127\.0\.0\.1:1809[01]|private-backend:8000|host\.docker\.internal/);
  const apiRequests: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", async (intercept) => {
    const incoming = intercept.request();
    if (!["GET", "HEAD", "OPTIONS"].includes(incoming.method()))
      return intercept.abort("blockedbyclient");
    if (
      ["fetch", "xhr"].includes(incoming.resourceType()) &&
      new URL(incoming.url()).pathname.startsWith("/api/v1/")
    )
      apiRequests.push(incoming.url());
    await intercept.continue();
  });
  await page.goto("/stories");
  await expect(page.locator('[data-server-data-display="web-site-chrome"]')).toBeVisible();
  await expect(page.locator('[data-server-data-display="web-stories"]')).toBeVisible();
  await page.goto(`/search?q=${encodeURIComponent(String(story.title).slice(0, 24))}`);
  await expect(page.locator('[data-server-data-display="web-search-results"]')).toBeVisible();
  await page.goto("/conferences");
  await expect(page.locator('[data-server-data-display="web-conferences"]')).toBeVisible();
  await page.goto("/live");
  await expect(page.locator('[data-server-data-display="web-live-broadcast"]')).toBeVisible();
  await page.goto(route);
  await expect(
    page.getByRole("heading", { level: 1, name: story.title, exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: story.title, exact: true }),
  ).toBeVisible();
  expect(apiRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("a missing story is a real 404 @backend-web", async ({
  request,
  baseURL,
}) => {
  expect(
    baseURL &&
      ["localhost", "127.0.0.1", "[::1]"].includes(new URL(baseURL).hostname),
  ).toBeTruthy();
  const response = await request.get(
    `${baseURL}/stories/frontend-transformation-nonexistent-story-7d307f0b`,
  );
  expect(response.status()).toBe(404);
});
