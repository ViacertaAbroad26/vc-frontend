import { expect, test } from "@playwright/test";

// Runs in the "advisor" project, authenticated as the seeded ADVISOR user.
test.describe("role-gated routing (advisor)", () => {
  test("an advisor can reach the case queue", async ({ page }) => {
    await page.goto("/cases");

    await expect(page.getByRole("heading", { name: "Case queue" })).toBeVisible();
  });

  test("an advisor is redirected away from an admin-only route", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  });
});
