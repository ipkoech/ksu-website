import { expect, test } from "@playwright/test";

test("staff profile redesign presents synchronized data in order", async ({ page }) => {
  await page.goto("/staff/f56939bd-fea9-4184-b701-4de23896bb6e", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Dr. ERIC OMORI OMWENGA" })).toBeVisible();
  await expect(page.getByRole("status", { name: "Loading image" })).toHaveCount(0);
  await expect(page.locator('img[alt="Dr. ERIC OMORI OMWENGA"]')).toBeVisible();

  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveText([
    "Bio",
    "Research Interests",
    "Publications",
    "Grants/Funding",
  ]);

  await expect(page.getByRole("navigation", { name: "Profile overview" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Biography", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Skills" })).toBeVisible();
  await page.screenshot({ path: "test-results/profile-redesign.png", fullPage: true });

  await page.getByRole("button", { name: "Skills" }).click();
  await expect(page.getByRole("heading", { name: "Skills" })).toBeVisible();
  await expect(page.getByText("AMR, Quorum sensing", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Biography" })).toHaveCount(0);

  await page.getByRole("button", { name: "Biography", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Biography" })).toBeVisible();
  const readMore = page.getByRole("button", { name: "Read full biography" });
  if (await readMore.count()) {
    await readMore.click();
    await expect(page.getByRole("dialog", { name: "Full biography" })).toBeVisible();
  }
});

test("staff profile accepts readable slug and name URLs", async ({ page }) => {
  await page.goto("/staff/dr-eric-omori-omwenga", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Dr. ERIC OMORI OMWENGA" })).toBeVisible();

  await page.goto(`/staff/${encodeURIComponent("Dr. Eric Omori Omwenga")}`, {
    waitUntil: "networkidle",
  });
  await expect(page.getByRole("heading", { name: "Dr. ERIC OMORI OMWENGA" })).toBeVisible();
});
