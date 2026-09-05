import { expect, test } from "@playwright/test";

test("creator can find a campaign, apply, and sees a useful duplicate error", async ({ page }) => {
  const uniqueHandle = `@e2e_creator_${Date.now()}`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Open calls" })).toBeVisible();

  await page.getByLabel("Filter by category").selectOption("Beauty");
  await page.getByLabel("Filter by platform").selectOption("Instagram");

  await expect(page.getByText("1 opportunities")).toBeVisible();
  const campaign = page.getByRole("link", { name: /Summer Skin, Naturally/ });
  await expect(campaign).toBeVisible();
  await expect(page.getByRole("link", { name: /Cold Coffee, City Stories/ })).toHaveCount(0);

  await campaign.click();
  await expect(page.getByRole("heading", { name: "Summer Skin, Naturally" })).toBeVisible();

  await page.getByRole("button", { name: "Send pitch" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Fill in every field so the brand can get a clear picture."
  );

  await page.getByLabel("Your name").fill("Browser Test Creator");
  await page.getByLabel("Social handle").fill(uniqueHandle);
  await page.getByLabel("Your pitch").fill("A sun-safe morning routine filmed in natural light.");
  await page.getByLabel("Proposed rate (₹)").fill("25000");
  await page.getByRole("button", { name: "Send pitch" }).click();

  await expect(page).toHaveURL(/\/applications\/success$/);
  await expect(page.getByRole("heading", { name: "You’re in the mix." })).toBeVisible();

  await page.goto("/campaigns/earthkind-summer");
  await page.getByLabel("Your name").fill("Browser Test Creator");
  await page.getByLabel("Social handle").fill(uniqueHandle);
  await page.getByLabel("Your pitch").fill("Submitting the same campaign pitch again.");
  await page.getByLabel("Proposed rate (₹)").fill("25000");
  await page.getByRole("button", { name: "Send pitch" }).click();

  await expect(page.getByRole("alert")).toHaveText("You have already applied to this campaign.");
  await expect(page).toHaveURL(/\/campaigns\/earthkind-summer$/);
});