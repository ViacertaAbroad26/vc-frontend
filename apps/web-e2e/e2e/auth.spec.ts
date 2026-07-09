import { expect, test } from "@playwright/test";

test.describe("authentication", () => {
  // The dev backend has no anonymous state: a request without an access token
  // resolves to a fallback dev STUDENT user, so an advisor-only route renders
  // the role-gated "Access denied" page rather than redirecting to /login.
  test("blocks a session with no access token from an advisor-only route", async ({ page }) => {
    await page.goto("/cases");

    await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  });

  test("/login is reachable directly and shows the sign-in form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Sign in to your account")).toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("nobody@viacerta.dev");
    await page.getByLabel("Password").fill("WrongPassword1!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText(/could not sign in/i)).toBeVisible();
  });

  test("signs in a seeded advisor and lands on the case queue", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("advisor@viacerta.dev");
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/cases/);
    await expect(page.getByRole("heading", { name: "Case queue" })).toBeVisible();
  });
});
