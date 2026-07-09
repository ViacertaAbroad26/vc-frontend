import { afterEach, describe, expect, it } from "vitest";

import { authStorage } from "../src/auth-storage";

describe("authStorage", () => {
  afterEach(() => {
    authStorage.clear();
  });

  it("stores and retrieves tokens", () => {
    authStorage.setTokens({ accessToken: "a1", refreshToken: "r1" });

    expect(authStorage.getAccessToken()).toBe("a1");
    expect(authStorage.getRefreshToken()).toBe("r1");
  });

  it("clear() removes both tokens", () => {
    authStorage.setTokens({ accessToken: "a1", refreshToken: "r1" });

    authStorage.clear();

    expect(authStorage.getAccessToken()).toBeNull();
    expect(authStorage.getRefreshToken()).toBeNull();
  });
});
