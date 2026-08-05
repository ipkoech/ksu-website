import { expect, test } from "@playwright/test";

test.describe("Ask the Library journeys", () => {
  test("opens the dedicated assistant and preserves source context", async ({ page }) => {
    await page.goto("/services");
    const launcher = page.getByRole("link", { name: "Ask the Library about this page" });
    await expect(launcher).toBeVisible();
    await launcher.click();

    await expect(page).toHaveURL(/\/ask\?source_url=%2Fservices/);
    await expect(page.getByRole("heading", { name: "Ask the Library" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Your question" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ask the Library" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ask the Library about this page" })).toBeHidden();
  });

  test("keeps the conversation form usable on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ask");
    await expect(page.getByRole("heading", { name: "Ask the Library" })).toBeVisible();
    const question = page.getByRole("textbox", { name: "Your question" });
    await question.fill("How do I access MyLOFT?");
    await expect(question).toHaveValue("How do I access MyLOFT?");
    await expect(page.getByRole("button", { name: "Ask the Library" })).toBeEnabled();
  });
});
