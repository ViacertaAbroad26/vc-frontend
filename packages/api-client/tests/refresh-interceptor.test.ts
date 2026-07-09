import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { authStorage } from "../src/auth-storage";
import { attachRefreshInterceptor } from "../src/refresh-interceptor";

function unauthorized(config: AxiosRequestConfig) {
  const error: unknown = Object.assign(new Error("Unauthorized"), {
    config,
    response: { status: 401, data: {}, headers: {}, config },
  });
  return Promise.reject(error);
}

function ok(config: AxiosRequestConfig): Promise<AxiosResponse> {
  return Promise.resolve({
    data: { ok: true },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  } as AxiosResponse);
}

describe("attachRefreshInterceptor", () => {
  afterEach(() => {
    authStorage.clear();
    vi.restoreAllMocks();
  });

  it("refreshes the token and retries the original request once on a 401", async () => {
    authStorage.setTokens({ accessToken: "old-access", refreshToken: "old-refresh" });

    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
      data: { tokens: { accessToken: "new-access", refreshToken: "new-refresh" } },
    });

    const instance = axios.create({ baseURL: "http://api.test" });
    attachRefreshInterceptor(instance);

    let calls = 0;
    instance.defaults.adapter = (config) => {
      calls += 1;
      return calls === 1 ? unauthorized(config) : ok(config);
    };

    const resp = await instance.get("/protected");

    expect(resp.data).toEqual({ ok: true });
    expect(calls).toBe(2);
    expect(postSpy).toHaveBeenCalledWith(
      "http://api.test/api/v1/auth/refresh",
      { refreshToken: "old-refresh" },
      { timeout: 10_000 },
    );
    expect(authStorage.getAccessToken()).toBe("new-access");
    expect(authStorage.getRefreshToken()).toBe("new-refresh");
  });

  it("clears tokens and dispatches session-expired when the refresh call fails", async () => {
    authStorage.setTokens({ accessToken: "old-access", refreshToken: "old-refresh" });

    vi.spyOn(axios, "post").mockRejectedValue(new Error("refresh failed"));
    const eventSpy = vi.fn();
    window.addEventListener("viacerta:session-expired", eventSpy);

    const instance = axios.create({ baseURL: "http://api.test" });
    attachRefreshInterceptor(instance);

    let calls = 0;
    instance.defaults.adapter = (config) => {
      calls += 1;
      return unauthorized(config);
    };

    await expect(instance.get("/protected")).rejects.toBeTruthy();

    expect(calls).toBe(1);
    expect(authStorage.getAccessToken()).toBeNull();
    expect(authStorage.getRefreshToken()).toBeNull();
    expect(eventSpy).toHaveBeenCalledTimes(1);

    window.removeEventListener("viacerta:session-expired", eventSpy);
  });

  it("does not retry 401s from the auth refresh or login endpoints", async () => {
    authStorage.setTokens({ accessToken: "old-access", refreshToken: "old-refresh" });

    const postSpy = vi.spyOn(axios, "post");

    const instance = axios.create({ baseURL: "http://api.test" });
    attachRefreshInterceptor(instance);

    let calls = 0;
    instance.defaults.adapter = (config) => {
      calls += 1;
      return unauthorized(config);
    };

    await expect(instance.post("/api/v1/auth/login", { email: "a", password: "b" })).rejects.toBeTruthy();

    expect(calls).toBe(1);
    expect(postSpy).not.toHaveBeenCalled();
  });
});
