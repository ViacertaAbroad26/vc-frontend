import { expect, test } from "@playwright/test";

// Runs in the "student" project, authenticated as the seeded STUDENT user (Aditya).
test.describe("student dashboard", () => {
  test("a student lands on their dashboard and sees journey progress", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText(/Current stage/)).toBeVisible();
  });

  test("a student is redirected away from an advisor-only route", async ({ page }) => {
    await page.goto("/cases");

    await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  });
});
