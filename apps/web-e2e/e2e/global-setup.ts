import { chromium, type FullConfig } from "@playwright/test";

const BACKEND_URL = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://localhost:8000";

type Credentials = { email: string; password: string };

const SEEDED_USERS: Record<"student" | "advisor", Credentials> = {
  student: { email: "aditya@student.dev", password: "Password123!" },
  advisor: { email: "advisor@viacerta.dev", password: "Password123!" },
};

async function login(credentials: Credentials) {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${credentials.email}: ${res.status} ${await res.text()}`);
  }
  const body = (await res.json()) as { tokens: { accessToken: string; refreshToken: string } };
  return body.tokens;
}

// Logs in as each seeded test user against the backend directly (no UI), then
// seeds the frontend's localStorage token namespace and saves the resulting
// storage state for the "student"/"advisor" Playwright projects to reuse.
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:5173";
  const browser = await chromium.launch();

  for (const [role, credentials] of Object.entries(SEEDED_USERS) as [keyof typeof SEEDED_USERS, Credentials][]) {
    const tokens = await login(credentials);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(baseURL);
    await page.evaluate(
      ({ accessToken, refreshToken }) => {
        localStorage.setItem("viacerta:access", accessToken);
        localStorage.setItem("viacerta:refresh", refreshToken);
      },
      { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    );
    await context.storageState({ path: `e2e/.auth/${role}.json` });
    await context.close();
  }

  await browser.close();
}
