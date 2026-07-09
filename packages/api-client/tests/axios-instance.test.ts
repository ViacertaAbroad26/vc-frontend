import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios, { AxiosError } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { authStorage } from "../src/auth-storage";
import { createAxios } from "../src/axios-instance";
import { ApiError } from "../src/errors";

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

describe("createAxios interceptor ordering", () => {
  afterEach(() => {
    authStorage.clear();
    vi.restoreAllMocks();
  });

  it("refreshes the token and retries the original request on a 401, returning the successful response", async () => {
    authStorage.setTokens({ accessToken: "old-access", refreshToken: "old-refresh" });

    vi.spyOn(axios, "post").mockResolvedValue({
      data: { tokens: { accessToken: "new-access", refreshToken: "new-refresh" } },
    });

    const instance = createAxios({ baseURL: "http://api.test" });

    let calls = 0;
    instance.defaults.adapter = (config) => {
      calls += 1;
      return calls === 1 ? unauthorized(config) : ok(config);
    };

    const resp = await instance.get("/protected");

    expect(resp.data).toEqual({ ok: true });
    expect(calls).toBe(2);
    expect(authStorage.getAccessToken()).toBe("new-access");
  });

  it("normalizes a non-401 error into an ApiError", async () => {
    const instance = createAxios({ baseURL: "http://api.test" });

    instance.defaults.adapter = (config) =>
      Promise.reject(
        new AxiosError("Not found", "404", config, undefined, {
          status: 404,
          data: { title: "Not found" },
          headers: {},
          config,
        } as AxiosResponse),
      );

    await expect(instance.get("/missing")).rejects.toBeInstanceOf(ApiError);
  });
});
