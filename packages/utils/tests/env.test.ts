import { describe, expect, it } from "vitest";

import { baseEnvSchema, createEnv } from "../src/env";

describe("env", () => {
  it("parses a valid env object", () => {
    const env = createEnv(baseEnvSchema, {
      VITE_API_BASE_URL: "http://localhost:8000",
      VITE_APP_NAME: "ViaCerta Portal",
    });
    expect(env.VITE_APP_NAME).toBe("ViaCerta Portal");
  });

  it("throws with a readable message on invalid env", () => {
    expect(() =>
      createEnv(baseEnvSchema, { VITE_API_BASE_URL: "not-a-url", VITE_APP_NAME: "" }),
    ).toThrow(/Invalid environment configuration/);
  });
});
